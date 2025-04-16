import chromadb
from chromadb.utils import embedding_functions
from langchain.text_splitter import RecursiveCharacterTextSplitter
from database import Library # Assuming Library model is accessible

# --- Configuration ---
CHROMA_DB_PATH = "./chroma_db"
COLLECTION_NAME = "library_docs"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_SIZE = 1000 # Characters per chunk
CHUNK_OVERLAP = 150 # Overlap between chunks

# --- Initialization ---
try:
    # Initialize ChromaDB client (persistent)
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)

    # Initialize Sentence Transformer embedding function
    # Langchain integration might be cleaner, but this works directly with ChromaDB
    sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=EMBEDDING_MODEL_NAME
    )

    # Get or create the collection with the specified embedding function
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=sentence_transformer_ef,
        metadata={"hnsw:space": "cosine"} # Use cosine distance for similarity
    )

    # Initialize Langchain text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
    )

    print(f"ChromaDB collection '{COLLECTION_NAME}' initialized successfully at {CHROMA_DB_PATH}.")

except Exception as e:
    print(f"Error initializing RAG service: {e}")
    # Depending on the application, you might want to raise this exception
    # or handle it gracefully (e.g., disable RAG features)
    client = None
    collection = None
    text_splitter = None

# --- Core Functions ---

def add_or_update_library(library: Library):
    """Chunks, embeds, and stores/updates a library's content in ChromaDB."""
    if not collection or not text_splitter:
        print("RAG service not initialized. Skipping indexing.")
        return

    if not library.content or not library.id:
        print(f"Library {library.id or library.name} has no content. Skipping indexing.")
        return

    print(f"Indexing library ID: {library.id}, Name: {library.name}")

    # 1. Delete existing chunks for this library ID to ensure clean update
    try:
        collection.delete(where={"library_id": library.id})
        print(f"Deleted existing chunks for library ID: {library.id}")
    except Exception as e:
        # Might fail if no chunks exist, which is okay
        print(f"Note: Could not delete existing chunks for library ID {library.id} (may not exist): {e}")


    # 2. Chunk the text
    chunks = text_splitter.split_text(library.content)
    print(f"Split content into {len(chunks)} chunks.")

    if not chunks:
        print(f"No chunks generated for library ID: {library.id}. Skipping storage.")
        return

    # 3. Prepare data for ChromaDB
    ids = [f"lib_{library.id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"library_id": library.id, "chunk_index": i, "library_name": library.name} for i in range(len(chunks))]
    documents = chunks # The actual text chunks

    # 4. Add to ChromaDB (handles embedding automatically via collection's embedding_function)
    try:
        collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )
        print(f"Successfully added/updated {len(chunks)} chunks for library ID: {library.id}")
    except Exception as e:
        print(f"Error adding chunks to ChromaDB for library ID {library.id}: {e}")


def delete_library(library_id: int):
    """Deletes all chunks associated with a library_id from ChromaDB."""
    if not collection:
        print("RAG service not initialized. Skipping deletion.")
        return

    if not library_id:
        print("Invalid library_id provided for deletion.")
        return

    try:
        print(f"Attempting to delete chunks for library ID: {library_id}")
        # Use 'where' filter to target specific library ID
        collection.delete(where={"library_id": library_id})
        print(f"Successfully deleted chunks for library ID: {library_id}")
    except Exception as e:
        print(f"Error deleting chunks from ChromaDB for library ID {library_id}: {e}")


def retrieve_relevant_chunks(query: str, selected_library_ids: list[int], k: int = 5) -> list[str]:
    """Retrieves the top k relevant chunks for a query, filtered by selected libraries."""
    if not collection:
        print("RAG service not initialized. Returning empty list.")
        return []

    if not selected_library_ids:
        print("No libraries selected for retrieval. Returning empty list.")
        return []

    print(f"Retrieving top {k} chunks for query, filtered by library IDs: {selected_library_ids}")

    # Construct the 'where' filter for ChromaDB
    # Needs to match any of the selected library IDs
    where_filter = {"library_id": {"$in": selected_library_ids}}

    try:
        results = collection.query(
            query_texts=[query],
            n_results=k,
            where=where_filter,
            include=['documents'] # Only need the document text
        )

        # Extract the document texts from the results
        # Results is a dict, 'documents' is a list containing one list (for the one query)
        retrieved_docs = results.get('documents', [[]])[0]

        print(f"Retrieved {len(retrieved_docs)} chunks.")
        return retrieved_docs

    except Exception as e:
        print(f"Error querying ChromaDB: {e}")
        return []
