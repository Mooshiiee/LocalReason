import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export type VersionType = "1" | "2";

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
        // Since the values are hardcoded "1" and "2", we can cast here.
        if (value === "1" || value === "2") {
          setVersion(value);
        }
      }}
    >
      <ToggleGroupItem value="1" aria-label="Version 1" className="bg-white data-[state=on]:bg-amber-200">
        <p>Ver. 1 : Single Pass</p>
      </ToggleGroupItem>
      <ToggleGroupItem value="2" aria-label="Version 2" className="bg-white data-[state=on]:bg-amber-200">
        <p>Ver. 2 : Double Pass</p>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
