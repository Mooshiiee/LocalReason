from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from routers.chat import router
from sqlmodel import Field, Session, SQLModel, create_engine, select
from typing import Annotated

class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field()
    content: str = Field()
    url: str | None = Field(default=None)
    isContent: bool = Field(default=True)

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session



app = FastAPI()

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
    
app.include_router(router, prefix="/api")

app.mount("/", SPAStaticFiles(directory="frontend/dist", html=True), name="spa")

@app.get('/hello')
def read_root():
    return {'Hello': 'World'}
