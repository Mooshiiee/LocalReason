import React, { useState, useEffect } from "react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button"; // Added
import { Input } from "@/components/ui/input"; // Added
import { Label } from "@/components/ui/label"; // Added
import { Textarea } from "@/components/ui/textarea"; // Added
import {
  Sheet,
  // SheetClose, // Removed unused import
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Added
import { Checkbox } from "./ui/checkbox";

interface Library {
  id: number;
  name: string;
  url: string;
  content: string;
  isContent: boolean; // Assuming this is part of the model, though not used in the form directly
}

// Type for the form data
interface NewLibraryData {
  name: string;
  url?: string;
  content?: string;
}

export function LibraryToggle() {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibraries, setSelectedLibraries] = useState<string[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newLibraryData, setNewLibraryData] = useState<NewLibraryData>({
    name: "",
    url: "",
    content: "",
  });
  const [editingLibraryId, setEditingLibraryId] = useState<number | null>(null);

  // Default to showing Content field initially
  const [isContent, setIsContent] = useState<boolean>(true);

  useEffect(() => {
    // Fetch libraries from the API
    fetch("http://localhost:8000/db/libraries/")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: Library[]) => {
        setLibraries(data);
      })
      .catch((error) => {
        console.error("Error fetching libraries:", error);
        // Handle error state appropriately, e.g., show a message to the user
      });
    // fetchLibraries(); // REMOVED: Redundant call, fetch logic is already here
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to fetch libraries (used for refreshing)
  const fetchLibraries = () => {
    fetch("http://localhost:8000/db/libraries/")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: Library[]) => {
        setLibraries(data);
      })
      .catch((error) => {
        console.error("Error fetching libraries:", error);
      });
  };

  // Handler for toggle group changes
  const handleValueChange = (value: string[]) => {
    setSelectedLibraries(value);
  };

  // Handler for form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLibraryData(prev => ({ ...prev, [name]: value }));
  };

  // Updated handler for Checkbox's onCheckedChange
  const handleIsContentToggle = (checked: boolean) => {
    // If checked (meaning "use URL instead?" is true), then isContent should be false
    setIsContent(!checked);
  };
  // Handler for adding a new library
  const handleAddLibrary = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const response = await fetch("http://localhost:8000/db/libraries/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newLibraryData, isContent: false })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // const addedLibrary = await response.json(); // Removed unused variable

      // Update state: either optimistically add or just refetch
      // Option 1: Optimistic update (faster perceived UI) + refetch for consistency
      // setLibraries(prev => [...prev, addedLibrary]); // Add directly
      // Option 2: Just refetch (simpler, relies on fetchLibraries)
      fetchLibraries(); // Refresh the list

      // Clear form and close sheet *after* successful operation
      setNewLibraryData({ name: "", url: "", content: "" });
      setIsContent(true);
      setIsSheetOpen(false);

    } catch (error) {
      console.error("Error adding library:", error);
      // Handle error state appropriately
    }
  };

   // Handler for deleting selected libraries
   const handleDeleteSelected = async () => {
    if (selectedLibraries.length === 0) return; // Nothing to delete

    const idsToDelete = selectedLibraries.map(id => parseInt(id, 10));

    try {
      // Sequentially delete or use Promise.all for parallel deletion
      for (const id of idsToDelete) {
        const response = await fetch(`http://localhost:8000/db/libraries/${id}`, {
          method: "DELETE",
        });
        if (!response.ok && response.status !== 404) { // Ignore 404 if already deleted
          throw new Error(`HTTP error! status: ${response.status} for ID ${id}`);
        }
      }
      // Clear selection and refresh list
      setSelectedLibraries([]);
      fetchLibraries();
    } catch (error) {
      console.error("Error deleting libraries:", error);
      // Handle error state appropriately
    }
  };


  return (
    <div className="p-4 space-y-4"> {/* Added space-y-4 */}
      {/* --- Action Buttons --- */}
      <div className="flex gap-2">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline">Add Library</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Library</SheetTitle>
              <SheetDescription>
                Enter the details for the new library. Click save when you're done.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleAddLibrary} className="grid gap-4 p-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" value={newLibraryData.name} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="flex flex-row items-center gap-4">
                <Label htmlFor="isContent" className="text-left flex-grow-1">
                  use URL instead?
                </Label>
                <Checkbox
                  id="isContent" name="isContent"
                  // Control checked state based on !isContent
                  checked={!isContent}
                  // Use onCheckedChange which passes the boolean checked state
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
                <Textarea id="content" name="content" value={newLibraryData.content} onChange={handleInputChange} className="col-span-3" />
              </div>
              ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">
                  URL
                </Label>
                <Input id="url" name="url" value={newLibraryData.url} onChange={handleInputChange} className="col-span-3" />
              </div>
              )}

              <SheetFooter>
                 {/* Removed SheetClose wrapper, closing is handled in handleAddLibrary */}
                 <Button type="submit">Save changes</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
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
        className="flex flex-wrap gap-2" // Added for better wrapping
      >
        {libraries.map((library) => (
          <ToggleGroupItem
            key={library.id}
            value={String(library.id)} // Value must be a string
            aria-label={`Toggle ${library.name}`}
            variant={"outline"}
          >
            {library.name}
          </ToggleGroupItem>
          <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingLibraryId(library.id);
                setIsSheetOpen(true);
              }}
            >
              Edit
            </Button>
        </React.Fragment>
        ))}
      </ToggleGroup>
       {/* Optional: Display selected IDs for debugging/verification */}
       {/* <pre className="mt-4 text-sm">Selected IDs: {JSON.stringify(selectedLibraries)}</pre> */}
    </div>
  );
}
