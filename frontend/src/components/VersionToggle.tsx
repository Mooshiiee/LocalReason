import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export type VersionType = "0" | "1" | "2" | "3"; // Added "0" for Plain mode

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
        // Since the values are hardcoded "0", "1", "2", and "3", we can cast here.
        if (value === "0" || value === "1" || value === "2" || value === "3") { // Added "0"
          setVersion(value);
        }
      }}
    >
      {/* Added Plain Mode Toggle */}
      <ToggleGroupItem value="0" aria-label="Version 0" className="bg-card text-foreground data-[state=on]:bg-amber-200 data-[state=on]:text-black">
        <p>Plain</p>
      </ToggleGroupItem>
      {/* Replaced hardcoded colors with theme variables */}
      <ToggleGroupItem value="1" aria-label="Version 1" className="bg-card text-foreground data-[state=on]:bg-amber-200 data-[state=on]:text-black">
        <p>Pipeline</p> {/* Simplified label */}
      </ToggleGroupItem>
      <ToggleGroupItem value="2" aria-label="Version 2" className="bg-card text-foreground data-[state=on]:bg-amber-200 data-[state=on]:text-black">
        <p>RAG</p> {/* Simplified label */}
      </ToggleGroupItem>
      {/* Added Version 3 Toggle */}
      <ToggleGroupItem value="3" aria-label="Version 3" className="bg-card text-foreground data-[state=on]:bg-amber-200 data-[state=on]:text-black">
        <p>RAG-2</p> {/* Simplified label */}
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
