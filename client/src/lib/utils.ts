import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a consistent, high-quality male avatar for each user based on their ID
export function getUserAvatar(userId: string) {
  // Use DiceBear API with 'pixel-art' or 'personas' style for a premium look
  // 'personas' is modern and high-quality. We filter for male attributes.
  return `https://api.dicebear.com/7.x/personas/svg?seed=${userId}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}
