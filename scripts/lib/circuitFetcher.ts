import fs from 'fs'
import path from 'path'
import { CONFIG } from './config'
import { rateLimiter } from './rateLimiter'

export interface CircuitCorner {
  number: number
  letter?: string
  angle?: number
  length?: number
  trackPosition?: { x: number; y: number }
}

export interface MarshalSector {
  number: number
  trackPosition?: { x: number; y: number }
}

export interface MultiViewerCircuitData {
  circuitKey: number
  circuitName: string
  countryName: string
  rotation: number
  pitLoss?: { normal: string; sc: string; vsc: string }
  corners?: CircuitCorner[]
  marshalSectors?: MarshalSector[]
  x?: number[]
  y?: number[]
}

export interface CircuitGeoJSONFeature {
  type: 'Feature'
  id: string
  properties: {
    id: string
    Name: string
    Location: string
    opened?: number
    firstgp?: number
    length?: number
    altitude?: number
    [key: string]: any
  }
  geometry: {
    type: 'LineString' | 'MultiLineString' | 'Polygon'
    coordinates: any
  }
}

export class CircuitFetcher {
  private static circuitsGeoJsonCache: any = null
  private static mvCircuitsIndex: Record<string, any> | null = null

  /**
   * Fetch and cache full bacinger/f1-circuits GeoJSON
   */
  static async getCircuitsGeoJSON(): Promise<CircuitGeoJSONFeature[]> {
    if (this.circuitsGeoJsonCache) return this.circuitsGeoJsonCache

    const diskPath = path.join(CONFIG.DATA_DIR, 'circuits', 'circuits.geojson')
    if (fs.existsSync(diskPath)) {
      try {
        const fileContent = JSON.parse(fs.readFileSync(diskPath, 'utf-8'))
        this.circuitsGeoJsonCache = fileContent.features || []
        return this.circuitsGeoJsonCache
      } catch {}
    }

    try {
      const url = 'https://raw.githubusercontent.com/bacinger/f1-circuits/master/f1-circuits.geojson'
      const res = await rateLimiter.fetchWithRetry(url)
      if (res.ok) {
        const data = await res.json()
        fs.mkdirSync(path.dirname(diskPath), { recursive: true })
        fs.writeFileSync(diskPath, JSON.stringify(data, null, 2), 'utf-8')
        this.circuitsGeoJsonCache = data.features || []
        return this.circuitsGeoJsonCache
      }
    } catch (e: any) {
      console.warn('[CircuitFetcher] Failed to fetch bacinger GeoJSON:', e.message)
    }

    return []
  }

  /**
   * Fetch MultiViewer circuits index
   */
  static async getMultiViewerIndex(): Promise<Record<string, any>> {
    if (this.mvCircuitsIndex) return this.mvCircuitsIndex

    const diskPath = path.join(CONFIG.DATA_DIR, 'circuits', 'multiviewer_index.json')
    if (fs.existsSync(diskPath)) {
      try {
        this.mvCircuitsIndex = JSON.parse(fs.readFileSync(diskPath, 'utf-8'))
        return this.mvCircuitsIndex!
      } catch {}
    }

    try {
      const url = 'https://api.multiviewer.app/api/v1/circuits'
      const res = await rateLimiter.fetchWithRetry(url)
      if (res.ok) {
        const data = await res.json()
        fs.mkdirSync(path.dirname(diskPath), { recursive: true })
        fs.writeFileSync(diskPath, JSON.stringify(data, null, 2), 'utf-8')
        this.mvCircuitsIndex = data
        return data
      }
    } catch (e: any) {
      console.warn('[CircuitFetcher] Failed to fetch MultiViewer index:', e.message)
    }

    return {}
  }

  /**
   * Get detailed MultiViewer circuit data (corners, rotation, sectors)
   */
  static async getMultiViewerCircuit(circuitKey: number, year: number): Promise<MultiViewerCircuitData | null> {
    const diskPath = path.join(CONFIG.DATA_DIR, 'circuits', `mv_${circuitKey}_${year}.json`)
    if (fs.existsSync(diskPath)) {
      try {
        return JSON.parse(fs.readFileSync(diskPath, 'utf-8'))
      } catch {}
    }

    try {
      const url = `https://api.multiviewer.app/api/v1/circuits/${circuitKey}/${year}`
      const res = await rateLimiter.fetchWithRetry(url)
      if (res.ok) {
        const data = await res.json()
        fs.mkdirSync(path.dirname(diskPath), { recursive: true })
        fs.writeFileSync(diskPath, JSON.stringify(data, null, 2), 'utf-8')
        return data
      }
    } catch (e: any) {
      console.warn(`[CircuitFetcher] MultiViewer circuit ${circuitKey}/${year} not available:`, e.message)
    }

    return null
  }

  /**
   * Match circuit from bacinger GeoJSON by ID or Country / Locality
   */
  static async matchGeoJSONCircuit(circuitId: string, country: string, locality: string): Promise<CircuitGeoJSONFeature | null> {
    const features = await this.getCircuitsGeoJSON()
    const cId = circuitId.toLowerCase().replace(/[^a-z0-9]/g, '')
    const cCountry = country.toLowerCase()
    const cLoc = locality.toLowerCase()

    // 1. Direct ID match
    let match = features.find((f) => f.properties.id?.toLowerCase().includes(cId))
    if (match) return match

    // 2. Location match
    match = features.find((f) => {
      const loc = f.properties.Location?.toLowerCase() || ''
      const name = f.properties.Name?.toLowerCase() || ''
      return loc.includes(cLoc) || name.includes(cLoc) || cId.includes(loc) || loc.includes(cId)
    })
    if (match) return match

    // 3. Country match
    match = features.find((f) => {
      const loc = f.properties.Location?.toLowerCase() || ''
      const name = f.properties.Name?.toLowerCase() || ''
      return name.includes(cCountry) || loc.includes(cCountry)
    })

    return match || null
  }
}
