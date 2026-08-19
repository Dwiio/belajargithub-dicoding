from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / ".env")

import os
import logging
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from database import ensure_indexes
from auth import auth_router, seed_admin
from routes import api as app_router

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("clapclip")

app = FastAPI(title="ClapClip API")


@app.get("/api/")
async def root():
    return {"message": "ClapClip API", "status": "ok"}


app.include_router(auth_router)
app.include_router(app_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await ensure_indexes()
    await seed_admin()
    logger.info("ClapClip API started")
