import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function parseUnimaEmail(email: string) {
  const [prefix] = email.split('@');
  const parts = prefix.split('-');
  
  if (parts.length < 3) return null;

  // Example: bsc-com-14-21
  const programmeCode = parts.slice(0, parts.length - 2).join(' ').toUpperCase();
  const year = "20" + parts[parts.length - 1];

  return {
    programme: programmeCode, // e.g., BSC COM
    id: prefix.toUpperCase(),
    year: year
  };
}