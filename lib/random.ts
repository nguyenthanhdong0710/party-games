/**
 * Utility functions for random number generation and array shuffling
 * Uses Crypto API when available for better randomness
 */

/**
 * Generate a secure random number between 0 and max-1
 * Uses Crypto API on client, falls back to Math.random for SSR/server
 */
function getSecureRandomNumber(max: number): number {
  // Check for browser environment with Crypto API
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }

  // Check for Node.js crypto (PartyKit server)
  if (typeof globalThis !== "undefined" && "crypto" in globalThis) {
    try {
      const crypto = globalThis.crypto as Crypto;
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return array[0] % max;
    } catch {
      // Fallback if crypto fails
    }
  }

  // Fallback for environments without Crypto API
  return Math.floor(Math.random() * max);
}

/**
 * Fisher-Yates Shuffle algorithm - the standard unbiased shuffle
 * Returns a new shuffled array without modifying the original
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = getSecureRandomNumber(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate random indices for imposters using Fisher-Yates Shuffle
 * Returns an array of player indices (1-based) that should be imposters
 */
export function generateImposterIndices(
  playerCount: number,
  imposterCount: number
): number[] {
  const allPositions = Array.from({ length: playerCount }, (_, i) => i + 1);
  const shuffled = shuffleArray(allPositions);
  return shuffled.slice(0, imposterCount);
}
