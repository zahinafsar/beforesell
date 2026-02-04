"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CategoryAttribute {
  id: string;
  name: string;
  slug: string;
  type: "SELECT" | "MULTI_SELECT" | "TEXT" | "NUMBER" | "BOOLEAN";
  options: string[];
  unit: string | null;
  required: boolean;
  filterable: boolean;
  order: number;
}

interface DynamicAttributeFieldProps {
  attribute: CategoryAttribute;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
}

export function DynamicAttributeField({
  attribute,
  value,
  onChange,
  error,
}: DynamicAttributeFieldProps) {
  const { name, type, options, unit, required } = attribute;

  switch (type) {
    case "SELECT":
      return (
        <div className="space-y-2">
          <Label>
            {name}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select
            value={value as string || "__none__"}
            onValueChange={(v) => onChange(v === "__none__" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Select {name.toLowerCase()}</SelectItem>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      );

    case "MULTI_SELECT":
      const selectedValues = Array.isArray(value) ? value : value ? value.split(",") : [];
      return (
        <div className="space-y-2">
          <Label>
            {name}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {options.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  id={`${attribute.id}-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selectedValues, option]);
                    } else {
                      onChange(selectedValues.filter((v) => v !== option));
                    }
                  }}
                />
                <Label
                  htmlFor={`${attribute.id}-${option}`}
                  className="font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      );

    case "NUMBER":
      return (
        <div className="space-y-2">
          <Label>
            {name}
            {unit && <span className="text-muted-foreground ml-1">({unit})</span>}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            type="number"
            value={value as string || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${name.toLowerCase()}`}
            required={required}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      );

    case "TEXT":
      return (
        <div className="space-y-2">
          <Label>
            {name}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            type="text"
            value={value as string || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${name.toLowerCase()}`}
            required={required}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      );

    case "BOOLEAN":
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            id={attribute.id}
            checked={value === "true"}
            onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
          />
          <Label htmlFor={attribute.id} className="cursor-pointer">
            {name}
          </Label>
          {error && <p className="text-sm text-destructive ml-2">{error}</p>}
        </div>
      );

    default:
      return null;
  }
}
