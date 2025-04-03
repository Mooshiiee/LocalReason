import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Checkbox } from "./ui/checkbox";
import { useLibrary } from "../context/LibraryContext"; // Import context hook

// Type for the form data
interface NewLibraryData {
  name: string;
  url?: string;
  content?: string;
}

// Define props for the component
interface LibraryFormSheetProps {
  editingLibraryId: number | null;
  setEditingLibraryId: React.Dispatch<React.SetStateAction<number | null>>;
  isSheetOpen: boolean;
  setIsSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function LibraryFormSheet({
  editingLibraryId,
  setEditingLibraryId,
  isSheetOpen,
  setIsSheetOpen,
}: LibraryFormSheetProps) {
  const { addLibrary, updateLibrary, getLibraryById } = useLibrary();

  // Local state for form data and content/URL toggle
  const [newLibraryData, setNewLibraryData] = useState<NewLibraryData>({
    name: "",
    url: "",
    content: "",
  });
  const [isContent, setIsContent] = useState<boolean>(true); // Default to showing Content

  // Fetch library data for editing when editingLibraryId changes
  const loadLibraryForEditing = useCallback(async (id: number) => {
    const library = await getLibraryById(id);
    if (library) {
      setNewLibraryData({
        name: library.name,
        url: library.url || "",
        content: library.content || "",
      });
      setIsContent(library.isContent); // Set based on fetched data
      // setIsSheetOpen(true); // Sheet opening is controlled by parent now
    } else {
      console.error("Library not found for editing:", id);
      setEditingLibraryId(null); // Reset editing state in parent
    }
  }, [getLibraryById, setEditingLibraryId]); // Added setEditingLibraryId dependency

  // Effect to trigger loading when editingLibraryId is set and sheet is intended to open
  useEffect(() => {
    if (editingLibraryId !== null && isSheetOpen) {
        loadLibraryForEditing(editingLibraryId);
    }
    // Reset form when sheet closes or editing ID is cleared externally
    if (!isSheetOpen || editingLibraryId === null) {
        setNewLibraryData({ name: "", url: "", content: "" });
        setIsContent(true);
    }
  }, [editingLibraryId, isSheetOpen, loadLibraryForEditing]);

  // Handler for form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLibraryData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for Checkbox's onCheckedChange
  const handleIsContentToggle = (checked: boolean) => {
    setIsContent(!checked);
  };

  // Handler for adding/updating a library
  const handleAddOrUpdateLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    const libraryDataToSave = {
      ...newLibraryData,
      isContent: isContent,
    };

    try {
      if (editingLibraryId !== null) {
        await updateLibrary(editingLibraryId, libraryDataToSave);
      } else {
        await addLibrary({
            name: libraryDataToSave.name,
            url: libraryDataToSave.url || "",
            content: libraryDataToSave.content || "",
            isContent: libraryDataToSave.isContent,
        });
      }
      // Close sheet and reset editing state in parent on success
      setIsSheetOpen(false);
      setEditingLibraryId(null);
      // Form reset is handled by useEffect based on isSheetOpen/editingLibraryId
    } catch (error) {
      console.error("Error saving library:", error);
      // Handle error state appropriately
    }
  };

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) {
          // Clear editing ID when sheet closes via overlay click or X button
          setEditingLibraryId(null);
        }
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline">Add Library</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{editingLibraryId ? "Edit Library" : "Add New Library"}</SheetTitle>
          <SheetDescription>
            {editingLibraryId
              ? "Update the details for the library. Click save when you're done."
              : "Enter the details for the new library. Click save when you're done."}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleAddOrUpdateLibrary} className="grid gap-4 p-4">
          {/* Name Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
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
          <div className="flex flex-row items-center gap-4">
            <Label htmlFor="isContent" className="text-left flex-grow-1">
              use URL instead?
            </Label>
            <Checkbox
              id="isContent" name="isContent"
              checked={!isContent}
              onCheckedChange={handleIsContentToggle}
              className="col-span-3 w-1/2 h-6"
             />
          </div>
          {/* Conditional rendering based on isContent state */}
          {isContent ? (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Content
            </Label>
            <Textarea id="content" name="content" value={newLibraryData.content || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          ) : (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input id="url" name="url" value={newLibraryData.url || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          )}

          <SheetFooter>
             <Button type="submit">Save changes</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
