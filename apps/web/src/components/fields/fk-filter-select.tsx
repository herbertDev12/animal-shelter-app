import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import type { FkOption } from "./rhf-fk-select";

/** Sentinel for "no filter"; cannot collide with a UUID. */
const ALL = "all";

interface FkFilterSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  queryKey: unknown[];
  queryFn: () => Promise<FkOption[]>;
  placeholder: string;
  /** Adds an item that clears the filter. Off for pickers that need a value. */
  allowAll?: boolean;
  className?: string;
}

/**
 * Foreign-key filter for list pages. Picking from loaded options means the API
 * only ever receives a complete, valid UUID.
 */
export function FkFilterSelect({
  value,
  onChange,
  queryKey,
  queryFn,
  placeholder,
  allowAll = true,
  className = "w-48",
}: FkFilterSelectProps) {
  const { data: options = [] } = useQuery({ queryKey, queryFn });

  return (
    <Select
      value={value ?? (allowAll ? ALL : undefined)}
      onValueChange={(next) => onChange(next === ALL ? null : next)}
    >
      <SelectTrigger
        className={`${className} bg-[#10131a] border-gray-800 text-white`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-60 bg-[#10131a] border-gray-800 text-white">
        {allowAll && <SelectItem value={ALL}>{placeholder}</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
