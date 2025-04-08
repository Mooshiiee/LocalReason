import { useLibrary } from "../context/LibraryContext"; // Import the context hook
import {
  ToggleGroup,
  ToggleGroupItem,
} from "./ui/toggle-group";
import { Button } from "./ui/button"; // Added
// Removed unused UI imports: Input, Label, Textarea, Sheet components, Checkbox
// Removed import for LibraryFormSheet
import { Link } from "react-router-dom"; // Import Link for navigation

export function LibraryToggle() {
  // Use context for library data and selection
  const {
    libraries,
    selectedLibraries,
    setSelectedLibraries,
    deleteLibrary,
    // Removed getLibraryById, addLibrary, updateLibrary as they are used in LibraryFormSheet
  } = useLibrary();

  // Removed state for Sheet control (isSheetOpen, editingLibraryId)

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
        {/* Link to the Add New Library page */}
        <Button asChild variant="outline">
          <Link to="/library/new">Add Library</Link>
        </Button>
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
            {/* Link to the Edit Library page */}
            <Button asChild variant="default" size="sm">
              <Link to={`/library/edit/${library.id}`}>Edit</Link>
            </Button>
          </div>
        ))}
      </ToggleGroup>
       {/* Optional: Display selected IDs for debugging/verification */}
       {/* <pre className="mt-4 text-sm">Selected IDs: {JSON.stringify(selectedLibraries)}</pre> */}
    </div>
  );
}
