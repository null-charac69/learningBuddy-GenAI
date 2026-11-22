import os
import tempfile

import pytest

# Point the app at throwaway storage *before* it is imported.
_tmp = tempfile.mkdtemp(prefix="lb-test-")
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp}/test.db"
os.environ["CHROMA_DIR"] = f"{_tmp}/chroma"
os.environ["GEMINI_API_KEY"] = "test-key"
os.environ["SECRET_KEY"] = "test-secret-key-that-is-at-least-32-bytes-long"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


def _register(client, username):
    r = client.post(
        "/api/v1/auth/register",
        json={"username": username, "email": f"{username}@example.com", "password": "secret123"},
    )
    assert r.status_code == 201, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture
def make_user(client):
    counter = {"n": 0}

    def _make():
        counter["n"] += 1
        return _register(client, f"user_{os.getpid()}_{id(counter)}_{counter['n']}")

    return _make
