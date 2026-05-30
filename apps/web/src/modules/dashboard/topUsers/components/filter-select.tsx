"use client";

import { useQueryState, parseAsInteger } from "nuqs";
import { useState, useRef, useEffect } from "react";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FilterSelect() {
  const [limitParam, setLimitParam] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10).withOptions({ shallow: false })
  );

  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState(limitParam.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const predefinedOptions = [5, 10, 20, 50, 100];

  useEffect(() => {
    if (isCustom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCustom]);

  const handleValueChange = (val: string | null) => {
    if (!val) return;
    if (val === "custom") {
      setIsCustom(true);
      setCustomValue("");
    } else {
      setLimitParam(Number(val));
    }
  };

  const submitCustomValue = () => {
    const val = Number.parseInt(customValue, 10);
    if (!Number.isNaN(val) && val > 0) {
      setLimitParam(val);
    } else {
      setCustomValue(limitParam.toString());
    }
    setIsCustom(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submitCustomValue();
    } else if (e.key === "Escape") {
      setIsCustom(false);
      setCustomValue(limitParam.toString());
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm font-bold text-gray-400 flex items-center gap-2">
        <Filter size={16} />
        Filter Top:
      </div>

      {isCustom ? (
        <input
          ref={inputRef}
          type="number"
          min="1"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onBlur={submitCustomValue}
          onKeyDown={handleKeyDown}
          className="w-[80px] h-9 bg-[#161a21] border border-gray-800 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          placeholder="Value..."
        />
      ) : (
        <Select value={limitParam.toString()} onValueChange={handleValueChange}>
          <SelectTrigger className="w-[80px] h-9 bg-[#161a21] border-gray-800 text-white font-bold hover:bg-[#1f2937] transition-colors">
            <SelectValue placeholder="Limit" />
          </SelectTrigger>
          <SelectContent>
            {predefinedOptions.map((opt) => (
              <SelectItem key={opt} value={opt.toString()}>
                {opt}
              </SelectItem>
            ))}
            {!predefinedOptions.includes(limitParam) && (
              <SelectItem value={limitParam.toString()}>{limitParam}</SelectItem>
            )}
            <SelectItem value="custom" className="text-blue-400 font-bold focus:text-blue-400">
              Custom...
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
