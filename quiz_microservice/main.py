"""
FastAPI Quiz Microservice
=========================
Accepts PDF files, extracts text, generates embeddings via ChromaDB,
and uses Ollama LLM to generate MCQ quiz questions.

Endpoints (matching quiz_client.py contract):
  POST /api/train                – upload PDF → embeddings → embedding_id
  POST /api/generate-questions   – embedding_id + params → MCQ questions
  POST /api/save-questions       – (no-op, best effort)
  DELETE /api/embedding/{id}     – delete ChromaDB collection
"""

import uuid
import json
import re
import textwrap
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import chromadb
from PyPDF2 import PdfReader
from decouple import config
import io

# ── Config ──────────────────────────────────────────────────────────────

OLLAMA_BASE_URL = config("OLLAMA_BASE_URL", default="http://localhost:11434")
OLLAMA_MODEL = config("OLLAMA_MODEL", default="llama3")

# ── ChromaDB (persistent, survives restart) ─────────────────────────────

chroma_client = chromadb.Client()  # in-memory; swap to PersistentClient if desired

# ── FastAPI App ─────────────────────────────────────────────────────────

app = FastAPI(title="Quiz Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Helpers ─────────────────────────────────────────────────────────────

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file."""
    reader = PdfReader(io.BytesIO(file_bytes))
    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)
    return "\n".join(text_parts)


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Split text into overlapping chunks for embedding."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return [c.strip() for c in chunks if c.strip()]


def call_ollama(prompt: str, system_prompt: str = "") -> str:
    """Call Ollama chat API and return the response text."""
    url = f"{OLLAMA_BASE_URL}/api/chat"
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_predict": 4096,
        },
    }

    try:
        resp = requests.post(url, json=payload, timeout=300)
        resp.raise_for_status()
        data = resp.json()
        return data.get("message", {}).get("content", "")
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail=f"Cannot connect to Ollama at {OLLAMA_BASE_URL}. Make sure Ollama is running.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")


def parse_questions_from_llm(raw_text: str) -> list[dict]:
    """
    Parse the LLM output to extract structured MCQ questions.
    Expects JSON array in the response.
    """
    # Try to find a JSON array in the response
    # First try: direct JSON parse
    try:
        questions = json.loads(raw_text)
        if isinstance(questions, list):
            return _normalize_questions(questions)
    except json.JSONDecodeError:
        pass

    # Second try: find JSON array in text
    json_match = re.search(r'\[[\s\S]*\]', raw_text)
    if json_match:
        try:
            questions = json.loads(json_match.group())
            if isinstance(questions, list):
                return _normalize_questions(questions)
        except json.JSONDecodeError:
            pass

    # Third try: find JSON within code block
    code_block_match = re.search(r'```(?:json)?\s*(\[[\s\S]*?\])\s*```', raw_text)
    if code_block_match:
        try:
            questions = json.loads(code_block_match.group(1))
            if isinstance(questions, list):
                return _normalize_questions(questions)
        except json.JSONDecodeError:
            pass

    raise HTTPException(
        status_code=500,
        detail="Failed to parse questions from LLM response. Please try again.",
    )


def _normalize_questions(questions: list[dict]) -> list[dict]:
    """Normalize question format to match what the frontend expects."""
    normalized = []
    for q in questions:
        normalized.append({
            "question": q.get("question", ""),
            "option1": q.get("option1", q.get("option_1", q.get("optionA", q.get("option_a", "")))),
            "option2": q.get("option2", q.get("option_2", q.get("optionB", q.get("option_b", "")))),
            "option3": q.get("option3", q.get("option_3", q.get("optionC", q.get("option_c", "")))),
            "option4": q.get("option4", q.get("option_4", q.get("optionD", q.get("option_d", "")))),
            "correct_option": str(q.get("correct_option", q.get("correct_answer", q.get("answer", "1")))),
        })
    return normalized


# ── Pydantic Models ─────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    embedding_id: str
    num_questions: int = 5
    difficulty: str = "easy"


class SaveRequest(BaseModel):
    embedding_id: str
    questions: list


# ── Endpoints ───────────────────────────────────────────────────────────

@app.post("/api/train")
async def train_pdf(
    file: UploadFile = File(...),
    embedding_id: Optional[str] = Form(None),
):
    """
    Upload PDF → extract text → chunk → store in ChromaDB.
    Returns an embedding_id that can be used for question generation.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    file_bytes = await file.read()
    text = extract_text_from_pdf(file_bytes)

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")

    # Generate or reuse embedding_id
    eid = embedding_id or f"quiz_{uuid.uuid4().hex[:16]}"

    # Delete existing collection if retraining
    try:
        chroma_client.delete_collection(name=eid)
    except Exception:
        pass

    # Chunk and store
    chunks = chunk_text(text)
    collection = chroma_client.get_or_create_collection(name=eid)

    collection.add(
        documents=chunks,
        ids=[f"{eid}_chunk_{i}" for i in range(len(chunks))],
        metadatas=[{"chunk_index": i} for i in range(len(chunks))],
    )

    return {"embedding_id": eid, "chunks_stored": len(chunks)}


@app.post("/api/generate-questions")
async def generate_questions(req: GenerateRequest):
    """
    Retrieve relevant chunks from ChromaDB → build prompt → call Ollama → return MCQs.
    """
    try:
        collection = chroma_client.get_collection(name=req.embedding_id)
    except Exception:
        raise HTTPException(
            status_code=404,
            detail=f"Embedding '{req.embedding_id}' not found. Train a PDF first.",
        )

    # Retrieve all documents (for small PDFs this is fine)
    results = collection.get(include=["documents"])
    all_docs = results.get("documents", [])

    if not all_docs:
        raise HTTPException(status_code=400, detail="No content found for this embedding.")

    # Combine chunks as context (limit to ~8000 chars for prompt)
    context = "\n\n".join(all_docs[:15])[:8000]

    system_prompt = textwrap.dedent("""\
        You are a quiz question generator. You create multiple choice questions (MCQs) 
        based on provided study material. You MUST respond with ONLY a valid JSON array.
        No explanations, no markdown, no extra text. Just the JSON array.
    """)

    user_prompt = textwrap.dedent(f"""\
        Based on the following study material, generate exactly {req.num_questions} 
        multiple choice questions at {req.difficulty} difficulty level.

        STUDY MATERIAL:
        {context}

        Generate exactly {req.num_questions} questions. Respond with ONLY a JSON array 
        in this exact format (no other text):
        [
          {{
            "question": "What is ...?",
            "option1": "First option",
            "option2": "Second option",
            "option3": "Third option",
            "option4": "Fourth option",
            "correct_option": "1"
          }}
        ]

        Rules:
        - correct_option must be "1", "2", "3", or "4" (string)
        - Each question must have exactly 4 options
        - Questions should be at {req.difficulty} difficulty
        - Questions must be relevant to the study material
        - Return ONLY the JSON array, nothing else
    """)

    raw_response = call_ollama(user_prompt, system_prompt)
    questions = parse_questions_from_llm(raw_response)

    return {"questions": questions}


@app.post("/api/save-questions")
async def save_questions(req: SaveRequest):
    """Best-effort save (no-op in this implementation)."""
    return {"status": "ok", "message": "Questions acknowledged."}


@app.delete("/api/embedding/{embedding_id}")
async def delete_embedding(embedding_id: str):
    """Delete a ChromaDB collection."""
    try:
        chroma_client.delete_collection(name=embedding_id)
        return {"status": "deleted", "embedding_id": embedding_id}
    except Exception:
        return {"status": "not_found", "embedding_id": embedding_id}


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    # Check Ollama connectivity
    try:
        resp = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        ollama_status = "connected" if resp.status_code == 200 else "error"
    except Exception:
        ollama_status = "unreachable"

    return {
        "status": "running",
        "ollama": ollama_status,
        "model": OLLAMA_MODEL,
    }


# ── Entry point ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8008, reload=True)
