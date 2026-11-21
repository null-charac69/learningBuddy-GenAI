# LearningBuddy Architecture (v0.2-alpha WIP)

```mermaid
flowchart TD
    User["👤 Student / User"]
    Frontend["⚛️ React 18 Frontend\n(Tailwind CSS, React Router, Vite/CRA)"]
    FastAPI["⚡ FastAPI Backend\n(REST API /api/v1)"]
    DocParser["📄 Document Parser\n(PyPDF2, python-docx, csv, txt)"]
    Chroma["🔍 ChromaDB Vector Store\n(Semantic Embeddings)"]
    Gemini["🤖 Google Gemini Pro\n(RAG Reasoning & Quiz Generation)"]

    User <-->|HTTP / JSON| Frontend
    Frontend <-->|REST API| FastAPI
    FastAPI -->|Extract Content| DocParser
    DocParser -->|Index Embeddings| Chroma
    FastAPI <-->|Query Context| Chroma
    FastAPI <-->|Prompt + Context| Gemini
```

## Core Modules
1. **Frontend**: Multi-page application with Chat, File Upload, Interactive Quizzes, and Progress Dashboard.
2. **Document Processing**: Extracts raw text from diverse formats (PDF, DOCX, CSV, TXT) and chunks for embedding.
3. **RAG Pipeline**: Retrieves top-k matching study chunks from ChromaDB and augments prompts to Google Gemini Pro.
4. **Quiz Generator**: Dynamically crafts structured 3-question retention checks based on uploaded subjects.
