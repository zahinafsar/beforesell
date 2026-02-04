"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryAttribute } from "@/components/dynamic-attribute-field";

interface AttributeFiltersProps {
  attributes: CategoryAttribute[];
  values: Record<string, string>;
  onChange: (slug: string, value: string) => void;
  onRangeChange?: (slug: string, type: "min" | "max", value: string) => void;
  rangeValues?: Record<string, { min: string; max: string }>;
}

export function AttributeFilters({
  attributes,
  values,
  onChange,
  onRangeChange,
  rangeValues = {},
}: AttributeFiltersProps) {
  const filterableAttributes = attributes.filter((attr) => attr.filterable);

  if (filterableAttributes.length === 0) return null;

  return (
    <div className="space-y-4">
      {filterableAttributes.map((attr) => {
        if (attr.type === "NUMBER") {
          const range = rangeValues[attr.slug] || { min: "", max: "" };
          return (
            <div key={attr.id} className="space-y-2">
              <Label>
                {attr.name}
                {attr.unit && (
                  <span className="text-muted-foreground ml-1">({attr.unit})</span>
                )}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={range.min}
                  onChange={(e) =>
                    onRangeChange?.(attr.slug, "min", e.target.value)
                  }
                  min={0}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={range.max}
                  onChange={(e) =>
                    onRangeChange?.(attr.slug, "max", e.target.value)
                  }
                  min={0}
                />
              </div>
            </div>
          );
        }

        if (attr.type === "SELECT" || attr.type === "MULTI_SELECT") {
          return (
            <div key={attr.id} className="space-y-2">
              <Label>{attr.name}</Label>
              <Select
                value={values[attr.slug] || "__all__"}
                onValueChange={(v) => onChange(attr.slug, v === "__all__" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`All ${attr.name.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All {attr.name.toLowerCase()}</SelectItem>
                  {attr.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (attr.type === "BOOLEAN") {
          return (
            <div key={attr.id} className="space-y-2">
              <Label>{attr.name}</Label>
              <Select
                value={values[attr.slug] || "__all__"}
                onValueChange={(v) => onChange(attr.slug, v === "__all__" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Any</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
