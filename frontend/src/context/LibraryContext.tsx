import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';

// Define the shape of a single library item
interface Library {
  id: number;
  name: string;
  description: string;
  url: string;
  content: string;
  isContent: boolean;
}

// Define the shape of the context data
interface LibraryContextType {
  libraries: Library[];
  selectedLibraries: number[];
  fetchLibraries: () => void;
  setSelectedLibraries: React.Dispatch<React.SetStateAction<number[]>>;
  deleteLibrary: (id: number) => Promise<void>;
  addLibrary: (libraryData: Omit<Library, 'id'>) => Promise<void>;
  updateLibrary: (id: number, libraryData: Partial<Omit<Library, 'id'>>) => Promise<void>;
  getLibraryById: (id: number) => Promise<Library | null>;
}

// Create the context with a default undefined value
const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

// Define props for the provider component
interface LibraryProviderProps {
  children: ReactNode;
}

// Create the provider component
export const LibraryProvider: React.FC<LibraryProviderProps> = ({ children }) => {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibraries, setSelectedLibraries] = useState<number[]>([]);
  const API_BASE_URL = "http://localhost:8000/db/libraries";

  // Fetch libraries from the API
  const fetchLibraries = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Library[] = await response.json();
      setLibraries(data);
    } catch (error) {
      console.error("Error fetching libraries:", error);
      // Handle error state appropriately in a real app (e.g., show a notification)
    }
  }, []);

  // Fetch libraries on initial mount
  useEffect(() => {
    fetchLibraries();
  }, [fetchLibraries]);

  // Function to add a new library
  const addLibrary = async (libraryData: Omit<Library, 'id'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(libraryData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchLibraries(); // Refresh list
    } catch (error) {
      console.error("Error adding library:", error);
      throw error; // Re-throw error to be handled by the caller
    }
  };

  // Function to update an existing library
  const updateLibrary = async (id: number, libraryData: Partial<Omit<Library, 'id'>>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(libraryData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchLibraries(); // Refresh list
    } catch (error) {
      console.error("Error updating library:", error);
      throw error; // Re-throw error
    }
  };

  // Function to delete a library
  const deleteLibrary = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });
      // Allow 404 if it was already deleted
      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Optimistic update or refetch
      setLibraries(prev => prev.filter(lib => lib.id !== id));
      setSelectedLibraries(prev => prev.filter(selId => selId !== id));
      // Optionally refetch to ensure consistency, though optimistic update is faster UI-wise
      // await fetchLibraries();
    } catch (error) {
      console.error("Error deleting library:", error);
      throw error; // Re-throw error
    }
  };

   // Function to get a single library by ID (useful for editing)
   const getLibraryById = async (id: number): Promise<Library | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null; // Not found
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching library by ID:", error);
      return null;
    }
  };


  // Value provided by the context
  const value = {
    libraries,
    selectedLibraries,
    fetchLibraries,
    setSelectedLibraries,
    deleteLibrary,
    addLibrary,
    updateLibrary,
    getLibraryById,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

// Custom hook to use the Library context
export const useLibrary = (): LibraryContextType => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
