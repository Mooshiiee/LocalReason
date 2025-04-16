from fastapi import APIRouter, HTTPException, status
from database import Library, SessionDep, LibraryUpdate # Import LibraryUpdate
from sqlmodel import select
# Import RAG service functions
from rag_service import add_or_update_library, delete_library as rag_delete_library


db_router = APIRouter()

@db_router.post('/libraries/')
def post_new_libary(
    library: Library,
    session: SessionDep
    ) -> Library: # Corrected type hint
    session.add(library)
    session.commit()
    session.refresh(library)
    # Index the new library content in the RAG service
    try:
        add_or_update_library(library)
    except Exception as e:
        # Log the error, but don't fail the request
        # Alternatively, could raise an HTTP exception if indexing is critical
        print(f"Error indexing library {library.id} after creation: {e}")
    return library

@db_router.get('/libraries/')
def get_libraries(
    session: SessionDep
    ) -> list[Library]:
    libraries = session.exec(select(Library)).all()
    return libraries

# for single library
@db_router.get('/libraries/{library_id}')
def get_library(library_id: int, session: SessionDep):
    library = session.get(Library, library_id)
    if not library:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Library not found")
    return library

@db_router.put('/libraries/{library_id}')
def update_library(
    library_id: int,
    library_update: LibraryUpdate, # Use the update model for the request body
    session: SessionDep
    ) -> Library:
    db_library = session.get(Library, library_id)
    if not db_library:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Library not found")

    # Get the data from the request body, excluding unset fields
    update_data = library_update.model_dump(exclude_unset=True)

    # Update the database object fields
    for key, value in update_data.items():
        setattr(db_library, key, value)

    # Add, commit, and refresh
    session.add(db_library)
    session.commit()
    session.refresh(db_library)

    # If content was updated, re-index in the RAG service
    if "content" in update_data:
        try:
            add_or_update_library(db_library)
        except Exception as e:
            # Log the error, but don't fail the request
            print(f"Error re-indexing library {library_id} after update: {e}")

    return db_library


@db_router.delete('/libraries/{library_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_library(library_id: int, session: SessionDep):
    library = session.get(Library, library_id)
    if not library:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Library not found")

    # Delete from RAG service first
    try:
        rag_delete_library(library_id)
    except Exception as e:
        # Log the error, but proceed with DB deletion
        print(f"Error deleting library {library_id} from RAG service: {e}")

    # Delete from SQLite
    session.delete(library)
    session.commit()
    return None # Return None for 204 No Content
