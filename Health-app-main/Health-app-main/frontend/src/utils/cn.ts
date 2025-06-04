import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple class values into a single className string
 * Uses clsx for conditional classes and tailwind-merge to handle Tailwind CSS class conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 