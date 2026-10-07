import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { CONFIG } from './config'

/**
 * On-disk raw response cache.
 * Adheres to SRP: exactly one responsibility of persisting raw network responses.
 */
class DiskCache {
  private ensureDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  private getCachePath(key: string): string {
    const hash = crypto.createHash('md5').update(key).digest('hex')
    const safeSubdir = key.split('?')[0].replace(/[^a-zA-Z0-9_-]/g, '_').slice(-40)
    const dir = path.join(CONFIG.CACHE_DIR, safeSubdir)
    this.ensureDir(dir)
    return path.join(dir, `${hash}.json`)
  }

  has(key: string): boolean {
    const filePath = this.getCachePath(key)
    return fs.existsSync(filePath)
  }

  get<T>(key: string): T | null {
    try {
      const filePath = this.getCachePath(key)
      if (!fs.existsSync(filePath)) return null
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content) as T
    } catch {
      return null
    }
  }

  set<T>(key: string, data: T): void {
    try {
      const filePath = this.getCachePath(key)
      fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8')
    } catch (e) {
      console.warn(`[CACHE WRITE ERROR] Could not cache ${key}:`, e)
    }
  }
}

export const diskCache = new DiskCache()
