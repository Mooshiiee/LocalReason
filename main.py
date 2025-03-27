from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from routers.chat import chat_router
from routers.db import db_router
from sqlmodel import Field, Session, SQLModel, create_engine, select
from typing import Annotated
from database import Library, SessionDep, create_db_and_tables

app = FastAPI()

@app.on_event("startup")
def on_startup():
    create_db_and_tables()


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten for production
    allow_methods=["*"],
    allow_headers=["*"]
)

# SPA Serving (Modified from open-webui approach) that handles 404s in the frontend
class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        if response.status_code == 404:
            response = await super().get_response(".", scope)
        return response
    
app.include_router(chat_router, prefix="/api")
app.include_router(db_router, prefix="/db")

app.mount("/", SPAStaticFiles(directory="frontend/dist", html=True), name="spa")

@app.get('/hello')
def read_root():
    return {'Hello': 'World'}
