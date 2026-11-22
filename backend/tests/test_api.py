import io

from app.api.v1.endpoints.quiz import _LLMQuestion as QuizQuestion
from app.services import llm_service
from app.services.file_service import chunk_text


def test_health(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_register_login_me(client):
    r = client.post("/api/v1/auth/register", json={"username": "alice", "email": "alice@example.com", "password": "secret123"})
    assert r.status_code == 201
    dup = client.post("/api/v1/auth/register", json={"username": "alice", "email": "x@example.com", "password": "secret123"})
    assert dup.status_code == 400

    bad = client.post("/api/v1/auth/login", data={"username": "alice", "password": "wrong"})
    assert bad.status_code == 401
    ok = client.post("/api/v1/auth/login", data={"username": "alice", "password": "secret123"})
    assert ok.status_code == 200
    headers = {"Authorization": f"Bearer {ok.json()['access_token']}"}

    me = client.get("/api/v1/auth/me", headers=headers).json()
    assert me["username"] == "alice" and me["learning_goals"] == ""

    upd = client.patch("/api/v1/auth/me", headers=headers, json={"learning_goals": "Pass biology"})
    assert upd.json()["learning_goals"] == "Pass biology"


def test_protected_routes_require_auth(client):
    for method, path in [("get", "/api/v1/files"), ("post", "/api/v1/chat"), ("post", "/api/v1/quiz"), ("get", "/api/v1/progress")]:
        assert getattr(client, method)(path).status_code == 401, path


def test_upload_list_delete_and_isolation(client, make_user):
    a, b = make_user(), make_user()
    content = b"Mitochondria are the powerhouse of the cell. They produce ATP via cellular respiration."
    r = client.post("/api/v1/files/upload", headers=a, files={"file": ("bio.txt", io.BytesIO(content), "text/plain")})
    assert r.status_code == 201, r.text
    doc = r.json()
    assert doc["chunk_count"] == 1

    # Re-upload with the same name replaces rather than duplicates.
    client.post("/api/v1/files/upload", headers=a, files={"file": ("bio.txt", io.BytesIO(content), "text/plain")})
    assert len(client.get("/api/v1/files", headers=a).json()) == 1
    assert client.get("/api/v1/files", headers=b).json() == []

    bad = client.post("/api/v1/files/upload", headers=a, files={"file": ("x.exe", io.BytesIO(b"abc"), "application/octet-stream")})
    assert bad.status_code == 400

    doc_id = client.get("/api/v1/files", headers=a).json()[0]["id"]
    assert client.delete(f"/api/v1/files/{doc_id}", headers=b).status_code == 404
    assert client.delete(f"/api/v1/files/{doc_id}", headers=a).status_code == 204


def test_chat_uses_only_own_documents(client, make_user, monkeypatch):
    a, b = make_user(), make_user()
    client.post("/api/v1/files/upload", headers=a, files={"file": ("cells.txt", io.BytesIO(b"Mitochondria produce ATP for the cell."), "text/plain")})

    captured = {}

    def fake_generate(prompt, system=None, history=None):
        captured["prompt"] = prompt
        return "ATP comes from mitochondria [1]."

    monkeypatch.setattr(llm_service, "generate_text", fake_generate)

    r = client.post("/api/v1/chat", headers=a, json={"message": "What produces ATP?"})
    assert r.status_code == 200, r.text
    assert r.json()["sources"][0]["filename"] == "cells.txt"
    assert "Mitochondria" in captured["prompt"]

    r = client.post("/api/v1/chat", headers=b, json={"message": "What produces ATP?"})
    assert r.json()["sources"] == []
    assert "Mitochondria" not in captured["prompt"]


def test_llm_errors_become_http_errors(client, make_user, monkeypatch):
    h = make_user()

    def boom(*a, **k):
        raise llm_service.LLMError("Gemini rejected the API key.", 503)

    monkeypatch.setattr(llm_service, "generate_text", boom)
    r = client.post("/api/v1/chat", headers=h, json={"message": "hi"})
    assert r.status_code == 503
    assert "API key" in r.json()["detail"]


def test_quiz_generation_and_cleanup(client, make_user, monkeypatch):
    h = make_user()

    def fake_structured(prompt, schema, system=None):
        return schema(questions=[
            QuizQuestion(question="2+2?", options=["3", "4", "5", "6"], answer="4", explanation="Basic addition."),
            QuizQuestion(question="Letter answer?", options=["a", "b", "c", "d"], answer="B", explanation=""),
            QuizQuestion(question="Invalid", options=["x", "y"], answer="z", explanation=""),
        ])

    monkeypatch.setattr(llm_service, "generate_structured", fake_structured)
    r = client.post("/api/v1/quiz", headers=h, json={"topic": "math", "num_questions": 5})
    assert r.status_code == 200, r.text
    qs = r.json()["questions"]
    assert len(qs) == 2
    assert qs[1]["answer"] == "b"
    assert r.json()["grounded"] is False


def test_progress_aggregates(client, make_user):
    h = make_user()
    for topic, score in [("Biology", 40), ("biology", 80), ("History", 100)]:
        assert client.post("/api/v1/progress/quiz-result", headers=h, json={"topic": topic, "score": score}).status_code == 201
    assert client.post("/api/v1/progress/quiz-result", headers=h, json={"topic": "x", "score": 101}).status_code == 422

    p = client.get("/api/v1/progress", headers=h).json()
    assert p["session_count"] == 3
    bio = next(t for t in p["topics"] if t["topic"].lower() == "biology")
    assert bio["attempts"] == 2 and bio["average"] == 60 and bio["last"] == 80
    assert p["topics"][0]["topic"].lower() == "biology"  # weakest topic first


def test_chunk_text_overlaps_and_covers():
    text = ". ".join(f"Sentence number {i}" for i in range(300))
    chunks = chunk_text(text, size=500, overlap=100)
    assert len(chunks) > 1
    assert all(len(c) <= 500 for c in chunks)
    assert "Sentence number 299" in chunks[-1]
