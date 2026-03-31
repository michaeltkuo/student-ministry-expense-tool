import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

load_dotenv()

from database import SessionLocal, init_db
from models import Ministry

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    init_db()
    _seed_ministries()
    yield


def _seed_ministries():
    default_ministries = [
        "College Ministry",
        "High School Ministry",
        "Middle School Ministry",
        "Young Adults",
    ]
    db = SessionLocal()
    try:
        count = db.query(Ministry).count()
        if count == 0:
            for name in default_ministries:
                db.add(Ministry(name=name))
            db.commit()
    finally:
        db.close()


app = FastAPI(title="Student Ministry Expense Tool", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import auth as auth_router
from routers import ministries as ministries_router
from routers import process as process_router
from routers import submissions as submissions_router

app.include_router(auth_router.router, prefix="/api")
app.include_router(ministries_router.router, prefix="/api")
app.include_router(process_router.router, prefix="/api")
app.include_router(submissions_router.router, prefix="/api")

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/api/health")
def health():
    return {"status": "ok"}
