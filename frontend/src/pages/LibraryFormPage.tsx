import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { useLibrary } from "../context/LibraryContext";

interface NewLibraryData {
  name: string;
  description: string;
  url?: string;
  content?: string;
}

export function LibraryFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { addLibrary, updateLibrary, getLibraryById } = useLibrary();

  const editingLibraryId = id ? parseInt(id, 10) : null;
  const isEditing = editingLibraryId !== null;

  const [newLibraryData, setNewLibraryData] = useState<NewLibraryData>({
    name: "",
    description: "",
    url: "",
    content: "",
  });
  const [isContent, setIsContent] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadLibraryForEditing = useCallback(async (libraryId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const library = await getLibraryById(libraryId);
      if (library) {
        setNewLibraryData({
          name: library.name,
          description: library.description || "",
          url: library.url || "",
          content: library.content || "",
        });
        setIsContent(library.isContent);
      } else {
        setError("Library not found.");
      }
    } catch (err) {
      console.error("Error fetching library for editing:", err);
      setError("Failed to load library data.");
    } finally {
      setIsLoading(false);
    }
  }, [getLibraryById]);


  useEffect(() => {
    if (isEditing && editingLibraryId) {
      loadLibraryForEditing(editingLibraryId);
    }
    if (!isEditing) {
      setNewLibraryData({ name: "", description: "", url: "", content: "" });
      setIsContent(true);
    }
  }, [editingLibraryId, isEditing, loadLibraryForEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLibraryData(prev => ({ ...prev, [name]: value }));
  };

  const handleIsContentToggle = (checked: boolean) => {
    setIsContent(!checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
          description: libraryDataToSave.description || "",
          url: libraryDataToSave.url || "",
          content: libraryDataToSave.content || "",
          isContent: libraryDataToSave.isContent,
        });
      }
      navigate("/");
    } catch (err) {
      console.error("Error saving library:", err);
      setError("Failed to save library. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading library data...</div>;
  }

  if (error && isEditing) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-black">
        {isEditing ? "Edit Library" : "Add New Library"}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border border-gray-300 rounded bg-white shadow">

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Save Changes" : "Add Library"}
          </Button>
        </div>

        {/* Name Input */}
        <div className="flex flex-col gap-2 w-1/2">
          <Label htmlFor="name" className="text-black">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            value={newLibraryData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-black">
              Description (Important for LLM Context)
            </Label>
            <Input
              id="description"
              name="description"
              value={newLibraryData.description || ''}
              onChange={handleInputChange}
            />
          </div>

        {/* URL/Content Toggle */}
        <div className="flex items-center gap-2">
          <Label htmlFor="isContent" className="text-black">
            Use URL instead?
          </Label>
          <Checkbox
            id="isContent"
            name="isContent"
            checked={!isContent}
            onCheckedChange={handleIsContentToggle}
            className="w-6 h-6"
          />
        </div>

        {/* Conditional Fields */}
        {isContent ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="content" className="text-black">
              Content
            </Label>
            <Textarea
              id="content"
              name="content"
              value={newLibraryData.content || ''}
              onChange={handleInputChange}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label htmlFor="url" className="text-black">
              URL
            </Label>
            <Input
              id="url"
              name="url"
              value={newLibraryData.url || ''}
              onChange={handleInputChange}
            />
          </div>
        )}

        {/* Error Display */}
        {error && !isEditing && (
          <p className="text-red-600">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
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
