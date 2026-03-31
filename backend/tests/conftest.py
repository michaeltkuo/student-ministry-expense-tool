import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))

from database import Base, SessionLocal, engine
from main import app
import routers.submissions as submissions_router


@pytest.fixture(autouse=True)
def reset_db_and_uploads(tmp_path, monkeypatch):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(submissions_router, "UPLOAD_DIR", str(upload_dir))

    yield

    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def auth_headers(client):
    response = client.post("/api/auth/login", json={"password": os.getenv("ADMIN_PASSWORD", "changeme")})
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def first_ministry_id(client):
    response = client.get("/api/ministries")
    assert response.status_code == 200
    ministries = response.json()
    assert ministries
    return ministries[0]["id"]


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
