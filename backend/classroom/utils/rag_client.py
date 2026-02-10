import requests
import hashlib
from requests.exceptions import RequestException
from decouple import config

RAG_PATH = config("RAG_PATH")
TRAIN_URL = f"{RAG_PATH}/train"
SCORE_URL = f"{RAG_PATH}/score"

def generate_rag_collection_name(assignment_id):
    """
    Generates a ChromaDB-safe collection name (<=63 chars)
    """
    hash_digest = hashlib.sha256(str(assignment_id).encode()).hexdigest()[:16]
    return f"assign_{hash_digest}"

def train_rag_from_pdf(file_path, collection_name, timeout=120):
    """
    Sends a PDF to RAG microservice for training.
    Returns raw response JSON if successful.
    """

    try:
        with open(file_path, "rb") as fp:
            files = {
                "file": (file_path, fp, "application/pdf")
            }   
            data = {
                "collection_name": collection_name
            }

            resp = requests.post(
                TRAIN_URL,
                files=files,
                data=data,
                timeout=timeout
            )
            resp.raise_for_status()
            return resp.json()

    except RequestException as e:
        # Let caller decide how to handle failure
        raise RuntimeError(f"RAG training failed: {str(e)}")

def delete_rag_collection(collection_name: str):
    resp = requests.delete(
        f"{RAG_PATH}/collection/{collection_name}",
        timeout=30
    )
    resp.raise_for_status()
    return resp.json()

def generate_questions_from_rag(
    collection_name: str,
    num_questions: int,
    difficulty: str
):
    """
    Generate questions from trained RAG.
    """

    payload = {
        "collection_name": collection_name,
        "num_questions": num_questions,
        "difficulty": difficulty
    }
    print(payload)
    resp = requests.post(
        f"{RAG_PATH}/generate-questions",
        json=payload,
        timeout=120
    )

    resp.raise_for_status()
    return resp.json()

def score_assignment_text(
    collection_name: str,
    extracted_text: str,
    timeout: int = 420
):
    try:
        resp = requests.post(
            SCORE_URL,
            data={
                "collection_name": collection_name,
                "extracted_text": extracted_text
            },
            timeout=timeout
        )
        resp.raise_for_status()
        return resp.json()

    except RequestException as e:
        raise RuntimeError(f"RAG scoring failed: {str(e)}")
