import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a consistent, cute avatar for each user based on their ID
export function getUserAvatar(userId: string) {
  // Use DiceBear API with avataaars style for cute, modern avatars
  // The backgroundColor parameter uses soft pastel colors that match the neon/cyberpunk theme
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}
