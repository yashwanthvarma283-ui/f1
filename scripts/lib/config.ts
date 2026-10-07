import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config()

/**
 * GEMINI_API_KEY is optional:
 * - If present, Stage 2 LLM commentary is enabled.
 * - If absent, cleanly falls back to deterministic template commentary.
 */
let geminiApiKey = process.env.GEMINI_API_KEY?.trim()
if (!geminiApiKey) {
  try {
    const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8').trim()
    if (envContent && !envContent.includes('=')) {
      geminiApiKey = envContent
    }
  } catch {}
}

if (!geminiApiKey) {
  console.log(
    '\x1b[33m[INFO] GEMINI_API_KEY not set. Using deterministic template commentary engine.\x1b[0m'
  )
}

export const CONFIG = {
  GEMINI_API_KEY: geminiApiKey || '',
  ROOT_DIR: path.resolve(import.meta.dirname, '../../'),
  DATA_DIR: path.resolve(import.meta.dirname, '../../public/data'),
  CACHE_DIR: path.resolve(import.meta.dirname, '../cache/raw'),
  OPENF1_BASE_URL: 'https://api.openf1.org/v1',
  JOLPICA_BASE_URL: 'https://api.jolpi.ca/ergast/f1',
  // Rate limiting parameters (be a polite API citizen)
  MAX_REQUESTS_PER_SECOND: 3,
  MAX_RETRIES: 5,
  INITIAL_RETRY_DELAY_MS: 1000,
}
