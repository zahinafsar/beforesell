import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + Date.now().toString(36);
}

export function formatBudgetRange(minBudget: number | null, maxBudget: number | null): string {
  const format = (value: number) => `৳${value.toLocaleString("en-BD")}`;
  if (minBudget != null && maxBudget != null) {
    return `${format(minBudget)} - ${format(maxBudget)}`;
  }
  if (minBudget != null) {
    return `From ${format(minBudget)}`;
  }
  if (maxBudget != null) {
    return `Up to ${format(maxBudget)}`;
  }
  return "Budget open";
}
