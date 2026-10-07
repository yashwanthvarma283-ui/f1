import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility for combining conditional CSS classes with Tailwind conflict resolution.
 * Adheres to SRP: exactly one responsibility of merging class strings.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
