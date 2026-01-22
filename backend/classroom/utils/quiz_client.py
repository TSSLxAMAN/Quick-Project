import requests
from decouple import config

QUIZ_BASE = config("QUIZ_PATH", default="").rstrip("/")

TRAIN_URL = f"{QUIZ_BASE}/train" if QUIZ_BASE else ""
GENERATE_URL = f"{QUIZ_BASE}/generate-questions" if QUIZ_BASE else ""
SAVE_URL = f"{QUIZ_BASE}/save-questions" if QUIZ_BASE else ""
DELETE_URL = f"{QUIZ_BASE}/embedding" if QUIZ_BASE else ""


def train_quiz_from_pdf(pdf_file, embedding_id=None):
    if not TRAIN_URL:
        raise RuntimeError("QUIZ_PATH is not set")

    files = {"file": (pdf_file.name, pdf_file, pdf_file.content_type)}
    data = {}
    if embedding_id:
        data["embedding_id"] = embedding_id

    r = requests.post(TRAIN_URL, files=files, data=data, timeout=120)
    r.raise_for_status()
    return r.json()["embedding_id"]


def generate_quiz_questions(embedding_id, num_questions=5, difficulty="easy"):
    if not GENERATE_URL:
        raise RuntimeError("QUIZ_PATH is not set")

    payload = {
        "embedding_id": embedding_id,
        "num_questions": int(num_questions),
        "difficulty": difficulty.lower(),
    }
    r = requests.post(GENERATE_URL, json=payload, timeout=180)
    r.raise_for_status()
    return r.json()["questions"]


def save_quiz_questions(embedding_id, questions):
    if not SAVE_URL:
        return

    payload = {"embedding_id": embedding_id, "questions": questions}
    r = requests.post(SAVE_URL, json=payload, timeout=60)
    r.raise_for_status()
    return r.json()


def delete_quiz_embedding(embedding_id):
    if not DELETE_URL:
        return
    r = requests.delete(f"{DELETE_URL}/{embedding_id}", timeout=30)
    return r.status_code
