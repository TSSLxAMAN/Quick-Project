import requests
from requests.exceptions import RequestException
from decouple import config
OCR_PATH = config("OCR_PATH")
OCR_URL = f"{OCR_PATH}/pdf"
def extract_text_from_pdf_file(file_path, timeout=60):
    try:
        with open(file_path, "rb") as fp:
            files = {"file": (file_path, fp, "application/pdf")}
            resp = requests.post(OCR_URL, files=files, timeout=timeout)
            resp.raise_for_status()
            data = resp.json()
    except RequestException as e:
        raise

    pages = data.get("pages", [])
    extracted_text = "\n\n".join([p.get("extracted_text", "") for p in pages])
    return extracted_text, data
