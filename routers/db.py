from fastapi import APIRouter, HTTPException, status
from database import Library, SessionDep
from sqlmodel import select

db_router = APIRouter()

@db_router.post('/libraries/')
def post_new_libary(
    library: Library,
    session: SessionDep
    ) -> Library: # Corrected type hint
    session.add(library)
    session.commit()
    session.refresh(library)
    # Return the newly created library instead of the full list
    return library
    # return get_libraries(session=session) # Original behavior if needed

@db_router.get('/libraries/')
def get_libraries(
    session: SessionDep
    ) -> list[Library]:
    libraries = session.exec(select(Library)).all()
    return libraries

@db_router.delete('/libraries/{library_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_library(library_id: int, session: SessionDep):
    library = session.get(Library, library_id)
    if not library:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Library not found")
    session.delete(library)
    session.commit()
    return None # Return None for 204 No Content
