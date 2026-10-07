/**
 * Safe, typed local storage adapter.
 * Adheres to SRP: exactly one responsibility of managing client-side key-value storage.
 */
export interface IStorageAdapter {
  getItem<T>(key: string, defaultValue: T): T
  setItem<T>(key: string, value: T): void
  removeItem(key: string): void
}

class LocalStorageAdapter implements IStorageAdapter {
  getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue
    try {
      const item = window.localStorage.getItem(key)
      if (item === null) return defaultValue
      return JSON.parse(item) as T
    } catch {
      return defaultValue
    }
  }

  setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.warn(`LocalStorage write error for key "${key}":`, e)
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(key)
    } catch (e) {
      console.warn(`LocalStorage remove error for key "${key}":`, e)
    }
  }
}

export const appStorage: IStorageAdapter = new LocalStorageAdapter()
