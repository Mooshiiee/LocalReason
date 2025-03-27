from typing import Annotated

from fastapi import Depends
from sqlmodel import Field, Session, SQLModel, create_engine, select # Added select


class Library(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field()
    content: str | None = Field()
    url: str | None = Field(default=None)
    isContent: bool = Field(default=True)

sqlite_url = f"sqlite:///database.db"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args, echo=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine) # Creates tables if they don't exist

    # Insert sample data only if the table is empty
    with Session(engine) as session:
        # Check if any libraries already exist
        statement = select(Library).limit(1) # Efficiently check for at least one row
        existing_library = session.exec(statement).first()

        if not existing_library:
            print("Database is empty, adding sample data...")
            library1 = Library(
                name="FastAPI",
                content="FastAPI framework, high performance, easy to learn, fast to code, ready for production",
            url="https://fastapi.tiangolo.com/",
            )
            library2 = Library(
                name="SQLModel",
                content="SQLModel, databases in Python, designed for simplicity, compatibility, and robustness.",
                url="https://sqlmodel.tiangolo.com/",
            )
            session.add(library1)
            session.add(library2)
            session.commit()
            print("Sample data added.")
        else:
            print("Database already contains data, skipping sample data insertion.")


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
