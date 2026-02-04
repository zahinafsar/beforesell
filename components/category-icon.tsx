"use client";

import { type LucideIcon, Package } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface CategoryIconProps {
  iconName: string | null;
  className?: string;
}

function getIcon(name: string): LucideIcon | undefined {
  return (LucideIcons as unknown as Record<string, LucideIcon>)[name];
}

export function CategoryIcon({ iconName, className }: CategoryIconProps) {
  if (!iconName) {
    return <Package className={className} />;
  }
  const Icon = getIcon(iconName);
  if (!Icon) {
    return <Package className={className} />;
  }
  return <Icon className={className} />;
}
