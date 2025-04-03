import React, { useState } from "react"; // Removed useEffect, useCallback
import { useLibrary } from "../context/LibraryContext"; // Import the context hook
import {
  ToggleGroup,
  ToggleGroupItem,
} from "./ui/toggle-group";
import { Button } from "./ui/button"; // Added
// Removed unused UI imports: Input, Label, Textarea, Sheet components, Checkbox
import { LibraryFormSheet } from "./LibraryFormSheet"; // Import the new component

export function LibraryToggle() {
  // Use context for library data and selection
  const {
    libraries,
    selectedLibraries,
    setSelectedLibraries,
    deleteLibrary,
    // Removed getLibraryById, addLibrary, updateLibrary as they are used in LibraryFormSheet
  } = useLibrary();

  // Local state for controlling the Sheet (open/close) and tracking the ID being edited
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingLibraryId, setEditingLibraryId] = useState<number | null>(null);

  // Removed local state and effects related to form data (NewLibraryData interface, newLibraryData, isContent, loadLibraryForEditing, useEffect)
  // Removed handlers related to form (handleInputChange, handleIsContentToggle, handleAddOrUpdateLibrary)

  // Handler for toggle group changes - uses context setter
  const handleValueChange = (value: string[]) => {
    setSelectedLibraries(value); // Use context's setter
    console.log(selectedLibraries)
  };

  // Handler for deleting selected libraries - uses context function
  const handleDeleteSelected = async () => {
    if (selectedLibraries.length === 0) return;

    const idsToDelete = selectedLibraries.map(id => parseInt(id, 10));

    try {
      // Use Promise.all for potentially faster parallel deletion
      await Promise.all(idsToDelete.map(id => deleteLibrary(id)));
      // Context handles updating libraries and selectedLibraries state internally now
      // setSelectedLibraries([]); // Context should clear this if needed, or maybe not? Let's clear it here for now.
    } catch (error) {
      console.error("Error deleting libraries:", error);
      // Handle error state appropriately
    }
     // Clear selection locally after attempting deletion
     setSelectedLibraries([]);
  };


  return (
    <div className="p-4 space-y-4"> {/* Added space-y-4 */}
      {/* --- Action Buttons --- */}
      <div className="flex gap-2">
        {/* Render the extracted Sheet component */}
        <LibraryFormSheet
          isSheetOpen={isSheetOpen}
          setIsSheetOpen={setIsSheetOpen}
          editingLibraryId={editingLibraryId}
          setEditingLibraryId={setEditingLibraryId}
        />
        <Button
          variant="destructive"
          onClick={handleDeleteSelected}
          disabled={selectedLibraries.length === 0} // Disable if nothing selected
        >
          Delete Selected
        </Button>
      </div>

      {/* --- Library Toggles --- */}
      <ToggleGroup
        size={"lg"}
        type="multiple"
        value={selectedLibraries}
        onValueChange={handleValueChange}
        className="flex flex-wrap gap-2 group"
      >
        {libraries.map((library) => (
          <div key={library.id} className="inline-flex items-center space-x-2">
            <ToggleGroupItem
              value={String(library.id)}
              aria-label={`Toggle ${library.name}`}
              className=""
            > 
              {library.name}
            </ToggleGroupItem>
            {/* Edit button now sets the ID and opens the sheet */}
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setEditingLibraryId(library.id);
                setIsSheetOpen(true); // Open the sheet for editing
              }}
            >
              Edit
            </Button>
          </div>
        ))}
      </ToggleGroup>
       {/* Optional: Display selected IDs for debugging/verification */}
       {/* <pre className="mt-4 text-sm">Selected IDs: {JSON.stringify(selectedLibraries)}</pre> */}
    </div>
  );
}
