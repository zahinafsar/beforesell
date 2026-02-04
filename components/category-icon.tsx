"use client";

import { type LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface CategoryIconProps {
  iconName: string | null;
  className?: string;
}

export function CategoryIcon({ iconName, className }: CategoryIconProps) {
  if (!iconName) {
    return <LucideIcons.Package className={className} />;
  }
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName];
  if (!Icon) {
    return <LucideIcons.Package className={className} />;
  }
  return <Icon className={className} />;
}
