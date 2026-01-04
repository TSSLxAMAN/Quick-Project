import os
import uuid
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from django.conf import settings
from textwrap import wrap
import json

def normalize_questions(questions):
    # Case 1: stringified JSON
    if isinstance(questions, str):
        try:
            questions = json.loads(questions)
        except json.JSONDecodeError:
            questions = [{"question": questions}]

    # Case 2: list with single stringified JSON
    if (
        isinstance(questions, list)
        and len(questions) == 1
        and isinstance(questions[0], str)
    ):
        try:
            questions = json.loads(questions[0])
        except json.JSONDecodeError:
            questions = [{"question": questions[0]}]

    # Case 3: nested list
    if (
        isinstance(questions, list)
        and len(questions) == 1
        and isinstance(questions[0], list)
    ):
        questions = questions[0]

    return questions


def generate_questions_pdf(questions, title):
    questions = normalize_questions(questions)

    filename = f"questions_{uuid.uuid4()}.pdf"
    temp_dir = os.path.join(settings.MEDIA_ROOT, "temp")
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, filename)

    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    y = height - 1.5 * inch
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, y, title)
    y -= 1 * inch

    c.setFont("Helvetica", 11)

    LEFT_MARGIN = 1 * inch
    NUMBER_WIDTH = 0.4 * inch      # space for "1."
    TEXT_START = LEFT_MARGIN + NUMBER_WIDTH
    MAX_CHARS = 85                 # tweak if needed

    for idx, q in enumerate(questions, start=1):
        if isinstance(q, dict):
            question_text = q.get("question", "").strip()
        else:
            question_text = str(q).strip()

        wrapped_lines = wrap(question_text, MAX_CHARS)

        # Draw question number
        c.drawString(LEFT_MARGIN, y, f"{idx}.")

        # Draw first line on SAME line as number
        if wrapped_lines:
            c.drawString(TEXT_START, y, wrapped_lines[0])
            y -= 0.3 * inch

        # Draw remaining wrapped lines aligned to text start
        for line in wrapped_lines[1:]:
            c.drawString(TEXT_START, y, line)
            y -= 0.25 * inch

            if y < 1 * inch:
                c.showPage()
                c.setFont("Helvetica", 11)
                y = height - 1 * inch

        y -= 0.4 * inch  

    c.save()
    return file_path

