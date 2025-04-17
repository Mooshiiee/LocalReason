import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export type VersionType = "1" | "2" | "3"; // Added "3"

interface VersionToggleGroupProps {
    version: VersionType;
    setVersion: (ver: VersionType) => void;
}

export function VersionToggleGroup({version, setVersion} : VersionToggleGroupProps) {
  return (
    <ToggleGroup
      type="single" 
      size={"lg"}
      value={version}
      onValueChange={(value) => {
        // The ToggleGroup value can be empty string if nothing is selected,
        // handle this case or ensure a default value is always selected.
        // Since the values are hardcoded "1", "2", and "3", we can cast here.
        if (value === "1" || value === "2" || value === "3") { // Added "3"
          setVersion(value);
        }
      }}
    >
      {/* Replaced hardcoded colors with theme variables */}
      <ToggleGroupItem value="1" aria-label="Version 1" className="bg-card text-foreground data-[state=on]:bg-amber-200 data-[state=on]:text-black">
        <p>Ver. 1: Pipeline</p>
      </ToggleGroupItem>
      <ToggleGroupItem value="2" aria-label="Version 2" className="bg-card text-foreground data-[state=on]:bg-amber-200 data-[state=on]:text-black">
        <p>Ver. 2 : RAG</p>
      </ToggleGroupItem>
      {/* Added Version 3 Toggle */}
      <ToggleGroupItem value="3" aria-label="Version 3" className="bg-card text-foreground data-[state=on]:bg-amber-200 data-[state=on]:text-black">
        <p>Ver. 3 : RAG-2</p>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
