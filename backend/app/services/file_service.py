

import PyPDF2
import docx
import csv

def extract_text_from_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def extract_text_from_docx(file):
    doc = docx.Document(file)
    text = ""
    for para in doc.paragraphs:
        text += para.text
    return text

def extract_text_from_txt(file):
    return file.read().decode("utf-8")

def extract_text_from_csv(file):
    text = ""
    decoded_file = file.read().decode("utf-8").splitlines()
    reader = csv.reader(decoded_file)
    for row in reader:
        text += ",".join(row) + "\n"
    return text
