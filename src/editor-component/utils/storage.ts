const STORAGE_PREFIX = "lit-editor:";

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    // Storage unavailable
  }
}
