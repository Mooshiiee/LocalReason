from typing import Annotated

from fastapi import Depends
from sqlmodel import Field, Session, SQLModel, create_engine, select # Added select

# Removed the first, simpler duplicate Library definition

class Library(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str | None = Field(default=None)
    content: str | None = Field(default=None)   # blob of text
    file_path: str | None = Field(default=None) # local file path
    content_type: str = Field(default="text")  # "text", "file", "url"
    isContent: bool = Field(default=True)
    url: str | None = Field(default=None)

# Model for updating libraries (all fields optional)
class LibraryUpdate(SQLModel):
    name: str | None = None
    description: str | None = None
    content: str | None = None
    file_path: str | None = None
    content_type: str | None = None
    url: str | None = None
    isContent: bool = Field(default=True)
    # Re-adding isContent based on frontend usage
    isContent: bool | None = None


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

# takes in list of integers (IDs), returns list of text retrieved from SQLite
def get_libraries(selected_libraries):
    with Session(engine) as session:
        statement = select(Library).where(Library.id.in_(selected_libraries))
        libraries = session.exec(statement).all()
        res = []
        for library in libraries:
            description = library.description or "No description"
            content = library.content or "No content"
            full = "## " + description + " \n" + " - content: " + content 
            res.append(full)
            print("Library Loaded: ", description)
        print("Libraries have been returned")
        return res
    


SessionDep = Annotated[Session, Depends(get_session)]
