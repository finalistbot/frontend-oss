import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function slugToTitle(slug: string | null) {
  if (!slug) return "N/A";
  return toTitleCase(slug.replace(/-/g, " ").replace(/_/g, " "));
}

export function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function stringToColor(str: string) {
  const hash = hashString(str);
  const r = (hash & 0xff0000) >> 16;
  const g = (hash & 0x00ff00) >> 8;
  const b = hash & 0x0000ff;
  return `rgb(${(r + 256) % 256}, ${(g + 256) % 256}, ${(b + 256) % 256})`;
}

export function stringToHSLBase(str: string) {
  const hash = hashString(str);
  const h = Math.abs(hash) % 360;
  const s = 60;
  return { h, s };
}

export function getShadesForString(str: string) {
  const { h, s } = stringToHSLBase(str);

  return {
    bg: `hsl(${h}, ${s}%, 88%)`, // light pastel background
    text: `hsl(${h}, ${s}%, 25%)`, // darker text
  };
}

/**
 * Converts an ISO date string to YYYY-MM-DD format for HTML date inputs
 * @param isoDate - ISO 8601 date string (e.g., "2026-01-09T00:00:00Z")
 * @returns Date string in YYYY-MM-DD format or empty string if invalid
 */
export function formatDateForInput(isoDate?: string | null): string {
  if (!isoDate) return "";
  try {
    // Extract just the date part (YYYY-MM-DD) from ISO string
    return isoDate.split("T")[0] || "";
  } catch {
    return "";
  }
}
