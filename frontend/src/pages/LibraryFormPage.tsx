import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import routing hooks
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { useLibrary } from "../context/LibraryContext"; // Import context hook

// Type for the form data
interface NewLibraryData {
  name: string;
  url?: string;
  content?: string;
}

export function LibraryFormPage() {
  const { id } = useParams<{ id?: string }>(); // Get ID from URL params (optional)
  const navigate = useNavigate(); // Hook for navigation
  const { addLibrary, updateLibrary, getLibraryById } = useLibrary();

  const editingLibraryId = id ? parseInt(id, 10) : null;
  const isEditing = editingLibraryId !== null;

  // Local state for form data and content/URL toggle
  const [newLibraryData, setNewLibraryData] = useState<NewLibraryData>({
    name: "",
    url: "",
    content: "",
  });
  const [isContent, setIsContent] = useState<boolean>(true); // Default to showing Content
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state for fetching
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch library data for editing
  const loadLibraryForEditing = useCallback(async (libraryId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const library = await getLibraryById(libraryId);
      if (library) {
        setNewLibraryData({
          name: library.name,
          url: library.url || "",
          content: library.content || "",
        });
        setIsContent(library.isContent);
      } else {
        setError("Library not found.");
        // Optionally navigate back or show a persistent error
      }
    } catch (err) {
      console.error("Error fetching library for editing:", err);
      setError("Failed to load library data.");
    } finally {
      setIsLoading(false);
    }
  }, [getLibraryById]);

  // Effect to load data when editing
  useEffect(() => {
    if (isEditing && editingLibraryId) {
      loadLibraryForEditing(editingLibraryId);
    }
    // Reset form if navigating to 'new' or if ID changes somehow
    if (!isEditing) {
        setNewLibraryData({ name: "", url: "", content: "" });
        setIsContent(true);
    }
  }, [editingLibraryId, isEditing, loadLibraryForEditing]);

  // Handler for form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLibraryData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for Checkbox's onCheckedChange
  const handleIsContentToggle = (checked: boolean) => {
    setIsContent(!checked);
  };

  // Handler for submitting the form (add/update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    const libraryDataToSave = {
      ...newLibraryData,
      isContent: isContent,
    };

    try {
      if (isEditing && editingLibraryId) {
        await updateLibrary(editingLibraryId, libraryDataToSave);
      } else {
        await addLibrary({
            name: libraryDataToSave.name,
            url: libraryDataToSave.url || "",
            content: libraryDataToSave.content || "",
            isContent: libraryDataToSave.isContent,
        });
      }
      navigate("/"); // Navigate back to the main page on success
    } catch (err) {
      console.error("Error saving library:", err);
      setError("Failed to save library. Please try again.");
      // Handle error state appropriately
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading library data...</div>;
  }

  // Potentially show error state more prominently
   if (error && isEditing) {
     return <div className="p-4 text-red-600">Error: {error}</div>;
   }

  return (
    <div className="p-4 w-full max-w-2xl mx-auto"> {/* Center content */}
      <h2 className="text-2xl font-bold mb-4 text-black">
        {isEditing ? "Edit Library" : "Add New Library"}
      </h2>
      <form onSubmit={handleSubmit} className="grid gap-4 p-4 border border-gray-300 rounded bg-white shadow">
        {/* Name Input */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right text-black">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            value={newLibraryData.name}
            onChange={handleInputChange}
            className="col-span-3"
            required
          />
        </div>
        {/* URL/Content Toggle */}
        <div className="flex flex-row items-center gap-4 col-span-4"> {/* Ensure full width */}
          <Label htmlFor="isContent" className="text-left flex-grow-1 text-black">
            Use URL instead?
          </Label>
          <Checkbox
            id="isContent" name="isContent"
            checked={!isContent}
            onCheckedChange={handleIsContentToggle}
            className="w-6 h-6" // Adjusted size
           />
        </div>
        {/* Conditional Fields */}
        {isContent ? (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="content" className="text-right text-black">
            Content
          </Label>
          <Textarea id="content" name="content" value={newLibraryData.content || ''} onChange={handleInputChange} className="col-span-3" />
        </div>
        ) : (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="url" className="text-right text-black">
            URL
          </Label>
          <Input id="url" name="url" value={newLibraryData.url || ''} onChange={handleInputChange} className="col-span-3" />
        </div>
        )}

        {/* Error Display */}
        {error && !isEditing && ( // Show general errors when adding
            <p className="text-red-600 col-span-4">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 col-span-4">
           <Button type="button" variant="outline" onClick={() => navigate("/")}>
             Cancel
           </Button>
           <Button type="submit">
             {isEditing ? "Save Changes" : "Add Library"}
           </Button>
        </div>
      </form>
    </div>
  );
}
