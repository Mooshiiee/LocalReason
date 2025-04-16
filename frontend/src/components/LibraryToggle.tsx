import { useLibrary } from "../context/LibraryContext"; 
import {
  ToggleGroup,
  ToggleGroupItem,
} from "./ui/toggle-group";
import { Button } from "./ui/button"; 
import { Link } from "react-router-dom"; 

export function LibraryToggle() {
  // Use context for library data and selection
  const {
    libraries,
    selectedLibraries,
    setSelectedLibraries,
    deleteLibrary,
  } = useLibrary();

  // Removed state for Sheet control (isSheetOpen, editingLibraryId)

  // Handler for toggle group changes - uses context setter
  const handleValueChange = (value: string[]) => {
    const numericValues = value.map(id => parseInt(id, 10)); // Convert strings to numbers
    setSelectedLibraries(numericValues); // Pass number[] to context
  };

  // Handler for deleting selected libraries - uses context function
  const handleDeleteSelected = async () => {
    if (selectedLibraries.length === 0) return;

    // No need to map/parseInt anymore, selectedLibraries is already number[]
    const idsToDelete = selectedLibraries;

    try {
      // Use Promise.all for potentially faster parallel deletion
      await Promise.all(idsToDelete.map(id => deleteLibrary(id)));
      // Context handles updating libraries and selectedLibraries state internally now
    } catch (error) {
      console.error("Error deleting libraries:", error);
      // Handle error state appropriately
    }
     // Clear selection locally after attempting deletion
     setSelectedLibraries([]);
  };


  return (
    <div className="w-3/4 p-4 space-y-4 bg-white border-1 border-black mb-4"> {/* Added space-y-4 */}
      <div className="flex gap-2">
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

      <ToggleGroup
        size={"lg"}
        type="multiple"
        variant="outline"
        value={selectedLibraries.map(id => String(id))} 
        onValueChange={handleValueChange}
        className="flex flex-wrap gap-2 space-x-2 group"
      >
        {libraries.map((library) => (
          <div key={library.id} className="items-center">
            <ToggleGroupItem
              value={String(library.id)}
              aria-label={`Toggle ${library.name}`}
              className="data-[state=on]:bg-amber-200"
            > 
              {library.name}
              <Button asChild variant="default" size="sm">
              <Link to={`/library/edit/${library.id}`}>Edit</Link>
            </Button>
            </ToggleGroupItem>
            {/* Link to the Edit Library page */}

          </div>
        ))}
      </ToggleGroup>

    </div>
  );
}
