/**
 * SVG geometry, sector markers, and telemetry metadata for championship circuits.
 * Adheres to F1 Design Standards:
 * - Mathematical precision vector paths
 * - Turn markers with coordinates, names, and sectors
 * - Sector 1 (Purple), Sector 2 (Green), Sector 3 (Yellow)
 */

export interface TurnMarker {
  number: number
  x: number
  y: number
  pillX?: number
  pillY?: number
  name?: string
  sector: 1 | 2 | 3
}

export interface CircuitInfo {
  id: string
  name: string
  location: string
  country: string
  turns: number
  lengthKm: string
  lapRecord?: string
  viewBox: string
  path: string
  startFinishPoint: { x: number; y: number }
  turnsData: TurnMarker[]
}

export const CIRCUITS: Record<string, CircuitInfo> = {
  marina_bay: {
    id: 'marina_bay',
    name: 'Marina Bay Street Circuit',
    location: 'Singapore',
    country: 'Singapore',
    turns: 19,
    lengthKm: '4.940 km',
    lapRecord: '1:34.486 (Lewis Hamilton, 2024)',
    viewBox: '0 0 500 350',
    path: 'M 319.9 212.4 L 328.1 212.6 L 336.3 213 L 344.5 213.4 L 352.7 213.9 L 360.3 216.3 L 361.8 224.1 L 363.2 232.1 L 369.7 236.8 L 377.8 238.4 L 386 238.9 L 394.2 239.3 L 402.4 239.7 L 410.6 240.1 L 418.8 240.5 L 427 240.8 L 435.2 241.2 L 443.4 241.5 L 450.6 239 L 455 232 L 459.4 225.1 L 463.8 218.1 L 466.3 210.4 L 465.2 202.3 L 464 194.1 L 462.9 186 L 461.7 177.9 L 460.5 169.7 L 459.3 161.6 L 458.1 153.5 L 456.9 145.3 L 455.7 137.2 L 454.6 129.1 L 453.4 120.9 L 452.2 112.8 L 451 104.7 L 449.8 96.5 L 448.6 88.4 L 447.4 80.3 L 446.3 72.1 L 445.1 64 L 443.9 55.9 L 437.6 52.7 L 429.5 51.6 L 422.1 48 L 416.5 42.1 L 411.2 36 L 403.2 35.9 L 399.5 42.9 L 398.6 51.1 L 398.1 59.3 L 398.5 67.5 L 400.4 75.4 L 403.1 83.2 L 405.9 90.9 L 408.8 98.6 L 411.5 106.4 L 413.8 114.3 L 415.8 122.2 L 417.3 130.3 L 417.4 138.5 L 415.3 146.4 L 410 152.6 L 402.6 155.8 L 394.4 156.2 L 386.2 155.8 L 378 155.4 L 369.8 155 L 361.6 154.7 L 353.4 154.3 L 345.1 153.9 L 336.9 153.6 L 328.7 153.2 L 320.5 152.8 L 312.3 152.5 L 304.1 152 L 295.9 151.4 L 287.7 150.7 L 279.5 149.8 L 271.7 147.6 L 264.5 143.6 L 257.3 139.7 L 250.1 135.7 L 242.9 131.7 L 235.7 127.7 L 228.5 123.8 L 221.3 119.8 L 214.1 115.8 L 206.9 111.8 L 199.7 107.9 L 192.6 103.9 L 185.4 99.9 L 177.8 99.9 L 172.8 106.4 L 168.2 113.2 L 163.8 120.1 L 159.4 127.1 L 155.4 134.3 L 151.9 141.7 L 148.6 149.2 L 142.7 150.6 L 137.1 144.6 L 131.4 138.6 L 125.8 132.6 L 120.2 126.6 L 114.1 121.1 L 107.1 116.9 L 99 116.3 L 91.9 120 L 87.1 126.7 L 83.3 134 L 79.5 141.3 L 75.8 148.5 L 72 155.8 L 68.2 163.1 L 64.4 170.4 L 60.6 177.7 L 56.8 185 L 53 192.3 L 49.1 199.5 L 45.3 206.8 L 41.3 214 L 36.8 220.8 L 34.3 228.1 L 38.1 235.3 L 43.5 241.4 L 49.6 246.9 L 56.4 251.5 L 60.6 256.3 L 61.1 264.4 L 64.6 271.8 L 70.1 277.8 L 76.5 283 L 82.9 288.2 L 89.3 293.3 L 94.6 299.4 L 98.8 306.5 L 103.3 313.3 L 110.7 313.6 L 112.9 305.8 L 114.3 297.7 L 115.7 289.6 L 117.1 281.5 L 118.5 273.4 L 119.9 265.3 L 121.3 257.2 L 122.7 249.1 L 124.1 241 L 125.3 232.9 L 126.6 224.7 L 128.4 216.7 L 130.5 208.8 L 133 200.9 L 135.8 193.2 L 138.8 185.6 L 141.9 177.9 L 145 170.3 L 148.1 162.7 L 154.6 161.5 L 161.6 165.8 L 168.2 170.7 L 174.5 176 L 180.8 181.3 L 187 186.6 L 193.5 191.7 L 199.9 196.8 L 206.4 201.9 L 213.4 205.9 L 221.4 207.9 L 229.6 208.6 L 237.8 209 L 246 209.4 L 254.2 209.7 L 262.4 210 L 270.6 210.4 L 278.8 210.7 L 287.1 211.1 L 295.3 211.4 L 303.5 211.7 L 311.7 212.1 L 319.9 212.4 Z',
    startFinishPoint: { x: 447, y: 130 },
    turnsData: [
      { number: 1, x: 442.0, y: 43.8, pillX: 462, pillY: 34, name: 'Turn 1 - Sheares', sector: 1 },
      { number: 2, x: 417.0, y: 56.3, pillX: 432, pillY: 68, name: 'Turn 2', sector: 1 },
      { number: 3, x: 391.2, y: 32.1, pillX: 388, pillY: 16, name: 'Turn 3', sector: 1 },
      { number: 4, x: 390.9, y: 77.6, pillX: 370, pillY: 82, name: 'Turn 4', sector: 1 },
      { number: 5, x: 421.2, y: 159.5, pillX: 442, pillY: 164, name: 'Turn 5', sector: 1 },
      { number: 6, x: 282.2, y: 138.4, pillX: 282, pillY: 120, name: 'Turn 6 - Raffles Blvd', sector: 2 },
      { number: 7, x: 184.3, y: 87.6, pillX: 184, pillY: 68, name: 'Turn 7 - Memorial Corner', sector: 2 },
      { number: 8, x: 160.3, y: 146.9, pillX: 178, pillY: 144, name: 'Turn 8 - Stamford', sector: 2 },
      { number: 9, x: 95.7, y: 105.9, pillX: 86, pillY: 90, name: 'Turn 9 - Padang', sector: 2 },
      { number: 10, x: 47.1, y: 225.1, pillX: 25, pillY: 220, name: 'Turn 10 - Singapore Sling', sector: 2 },
      { number: 11, x: 72.5, y: 250.1, pillX: 88, pillY: 256, name: 'Turn 11', sector: 2 },
      { number: 12, x: 49.5, y: 271.0, pillX: 28, pillY: 278, name: 'Turn 12', sector: 2 },
      { number: 13, x: 122.8, y: 311.7, pillX: 128, pillY: 330, name: 'Turn 13 - Fullerton', sector: 2 },
      { number: 14, x: 155.5, y: 175.2, pillX: 138, pillY: 162, name: 'Turn 14 - Connaught', sector: 3 },
      { number: 15, x: 214.6, y: 195.2, pillX: 214, pillY: 176, name: 'Turn 15', sector: 3 },
      { number: 16, x: 368.4, y: 203.3, pillX: 364, pillY: 184, name: 'Turn 16 - Waterfront Straight', sector: 3 },
      { number: 17, x: 375.5, y: 225.3, pillX: 356, pillY: 235, name: 'Turn 17', sector: 3 },
      { number: 18, x: 438.4, y: 226.5, pillX: 452, pillY: 242, name: 'Turn 18 - Bayview', sector: 3 },
      { number: 19, x: 450.5, y: 209.4, pillX: 470, pillY: 204, name: 'Turn 19', sector: 3 },
    ],
  },
  americas: {
    id: 'americas',
    name: 'Circuit of the Americas',
    location: 'Austin',
    country: 'USA',
    turns: 20,
    lengthKm: '5.513 km',
    lapRecord: '1:36.169 (Charles Leclerc, 2019)',
    viewBox: '0 0 500 350',
    path: 'M 100 290 L 120 180 L 150 140 L 200 130 L 250 160 L 300 150 L 340 180 L 400 160 L 440 190 L 410 240 L 350 250 L 290 270 L 220 250 L 160 280 Z',
    startFinishPoint: { x: 110, y: 235 },
    turnsData: [
      { number: 1, x: 120, y: 180, name: 'Turn 1 - Big Red Crest', sector: 1 },
      { number: 3, x: 150, y: 140, name: 'Turn 3 - Maggotts-Style Esses', sector: 1 },
      { number: 5, x: 200, y: 130, name: 'Turn 5 - High-G Sweep', sector: 1 },
      { number: 9, x: 250, y: 160, name: 'Turn 9', sector: 2 },
      { number: 11, x: 300, y: 150, name: 'Turn 11 - Hairpin', sector: 2 },
      { number: 12, x: 340, y: 180, name: 'Turn 12 - Heavy Braking', sector: 2 },
      { number: 15, x: 400, y: 160, name: 'Turn 15 - Stadium Section', sector: 2 },
      { number: 16, x: 440, y: 190, name: 'Turn 16 - Multi-Apex Carousel', sector: 3 },
      { number: 18, x: 410, y: 240, name: 'Turn 18', sector: 3 },
      { number: 19, x: 350, y: 250, name: 'Turn 19 - Tower View', sector: 3 },
      { number: 20, x: 290, y: 270, name: 'Turn 20 - Main Straight Entry', sector: 3 },
    ],
  },
  rodriguez: {
    id: 'rodriguez',
    name: 'Autódromo Hermanos Rodríguez',
    location: 'Mexico City',
    country: 'Mexico',
    turns: 17,
    lengthKm: '4.304 km',
    lapRecord: '1:17.774 (Valtteri Bottas, 2021)',
    viewBox: '0 0 500 350',
    path: 'M 80 260 L 380 260 L 430 220 L 410 160 L 370 140 L 340 170 L 280 160 L 240 120 L 180 110 L 130 140 L 90 190 Z',
    startFinishPoint: { x: 230, y: 260 },
    turnsData: [
      { number: 1, x: 380, y: 260, name: 'Turn 1 - Moisés Solana', sector: 1 },
      { number: 2, x: 430, y: 220, name: 'Turn 2', sector: 1 },
      { number: 4, x: 410, y: 160, name: 'Turn 4 - Estadio Entry', sector: 1 },
      { number: 7, x: 370, y: 140, name: 'Turn 7 - Esses Infield', sector: 2 },
      { number: 9, x: 340, y: 170, name: 'Turn 9', sector: 2 },
      { number: 11, x: 280, y: 160, name: 'Turn 11', sector: 2 },
      { number: 12, x: 240, y: 120, name: 'Turn 12 - Foro Sol Stadium', sector: 3 },
      { number: 14, x: 180, y: 110, name: 'Turn 14', sector: 3 },
      { number: 16, x: 130, y: 140, name: 'Turn 16 - Peraltada Exit', sector: 3 },
    ],
  },
  interlagos: {
    id: 'interlagos',
    name: 'Autódromo José Carlos Pace',
    location: 'São Paulo',
    country: 'Brazil',
    turns: 15,
    lengthKm: '4.309 km',
    lapRecord: '1:10.540 (Valtteri Bottas, 2018)',
    viewBox: '0 0 500 350',
    path: 'M 150 270 L 280 280 L 380 250 L 430 190 L 390 130 L 310 110 L 250 130 L 200 180 L 150 190 L 110 220 Z',
    startFinishPoint: { x: 215, y: 275 },
    turnsData: [
      { number: 1, x: 280, y: 280, name: "Turn 1 - Senna 'S'", sector: 1 },
      { number: 3, x: 380, y: 250, name: 'Turn 3 - Curva do Sol', sector: 1 },
      { number: 4, x: 430, y: 190, name: 'Turn 4 - Descida do Lago', sector: 2 },
      { number: 6, x: 390, y: 130, name: 'Turn 6 - Ferradura', sector: 2 },
      { number: 8, x: 310, y: 110, name: 'Turn 8', sector: 2 },
      { number: 10, x: 250, y: 130, name: 'Turn 10 - Bico de Pato', sector: 2 },
      { number: 12, x: 200, y: 180, name: 'Turn 12 - Mergulho', sector: 3 },
      { number: 13, x: 150, y: 190, name: 'Turn 13 - Junção', sector: 3 },
      { number: 14, x: 110, y: 220, name: 'Turn 14 - Subida dos Boxes', sector: 3 },
    ],
  },
  vegas: {
    id: 'vegas',
    name: 'Las Vegas Strip Circuit',
    location: 'Las Vegas',
    country: 'USA',
    turns: 17,
    lengthKm: '6.201 km',
    lapRecord: '1:35.490 (Oscar Piastri, 2023)',
    viewBox: '0 0 500 350',
    path: 'M 110 260 L 420 260 L 440 200 L 410 150 L 380 160 L 350 120 L 280 110 L 220 130 L 160 130 L 120 180 Z',
    startFinishPoint: { x: 265, y: 260 },
    turnsData: [
      { number: 1, x: 420, y: 260, name: 'Turn 1 - Koval Lane', sector: 1 },
      { number: 4, x: 440, y: 200, name: 'Turn 4', sector: 1 },
      { number: 5, x: 410, y: 150, name: 'Turn 5 - Sphere Entry', sector: 2 },
      { number: 7, x: 380, y: 160, name: 'Turn 7 - MSG Sphere Chicane', sector: 2 },
      { number: 9, x: 350, y: 120, name: 'Turn 9 - Sands Avenue', sector: 2 },
      { number: 12, x: 280, y: 110, name: 'Turn 12 - Las Vegas Boulevard', sector: 3 },
      { number: 14, x: 220, y: 130, name: 'Turn 14 - Bellagio Straight', sector: 3 },
      { number: 16, x: 160, y: 130, name: 'Turn 16 - Harmon Corner', sector: 3 },
    ],
  },
  monza: {
    id: 'monza',
    name: 'Autodromo Nazionale Monza',
    location: 'Monza',
    country: 'Italy',
    turns: 11,
    lengthKm: '5.793 km',
    lapRecord: '1:21.046 (Rubens Barrichello, 2004)',
    viewBox: '0 0 500 350',
    path: 'M 80 250 L 430 250 L 450 180 L 420 120 L 350 140 L 280 130 L 210 110 L 140 130 L 70 190 Z',
    startFinishPoint: { x: 255, y: 250 },
    turnsData: [
      { number: 1, x: 430, y: 250, name: 'Turn 1 - Variante del Rettifilo', sector: 1 },
      { number: 3, x: 450, y: 180, name: 'Turn 3 - Curva Grande', sector: 1 },
      { number: 4, x: 420, y: 120, name: 'Turn 4 - Variante della Roggia', sector: 2 },
      { number: 6, x: 350, y: 140, name: 'Turn 6 - Curva di Lesmo 1', sector: 2 },
      { number: 7, x: 280, y: 130, name: 'Turn 7 - Curva di Lesmo 2', sector: 2 },
      { number: 8, x: 210, y: 110, name: 'Turn 8 - Variante Ascari', sector: 3 },
      { number: 11, x: 70, y: 190, name: 'Turn 11 - Curva Parabolica', sector: 3 },
    ],
  },
  silverstone: {
    id: 'silverstone',
    name: 'Silverstone Circuit',
    location: 'Silverstone',
    country: 'UK',
    turns: 18,
    lengthKm: '5.891 km',
    lapRecord: '1:27.097 (Max Verstappen, 2020)',
    viewBox: '0 0 500 350',
    path: 'M 120 260 L 340 260 L 400 220 L 430 150 L 370 100 L 300 120 L 240 90 L 170 110 L 110 160 L 90 220 Z',
    startFinishPoint: { x: 230, y: 260 },
    turnsData: [
      { number: 1, x: 340, y: 260, name: 'Turn 1 - Abbey', sector: 1 },
      { number: 3, x: 400, y: 220, name: 'Turn 3 - Village', sector: 1 },
      { number: 4, x: 430, y: 150, name: 'Turn 4 - The Loop', sector: 1 },
      { number: 6, x: 370, y: 100, name: 'Turn 6 - Brooklands', sector: 2 },
      { number: 7, x: 300, y: 120, name: 'Turn 7 - Luffield', sector: 2 },
      { number: 9, x: 240, y: 90, name: 'Turn 9 - Copse', sector: 2 },
      { number: 11, x: 170, y: 110, name: 'Turn 11 - Maggotts & Becketts', sector: 3 },
      { number: 15, x: 110, y: 160, name: 'Turn 15 - Stowe', sector: 3 },
      { number: 18, x: 90, y: 220, name: 'Turn 18 - Club Corner', sector: 3 },
    ],
  },
  losail: {
    id: 'losail',
    name: 'Lusail International Circuit',
    location: 'Lusail',
    country: 'Qatar',
    turns: 16,
    lengthKm: '5.419 km',
    lapRecord: '1:24.319 (Max Verstappen, 2023)',
    viewBox: '0 0 500 350',
    path: 'M 90 270 L 390 270 L 430 230 L 400 170 L 360 140 L 310 160 L 250 130 L 200 100 L 140 120 L 100 180 Z',
    startFinishPoint: { x: 240, y: 270 },
    turnsData: [
      { number: 1, x: 390, y: 270, name: 'Turn 1', sector: 1 },
      { number: 4, x: 430, y: 230, name: 'Turn 4', sector: 1 },
      { number: 6, x: 400, y: 170, name: 'Turn 6', sector: 2 },
      { number: 10, x: 360, y: 140, name: 'Turn 10', sector: 2 },
      { number: 12, x: 250, y: 130, name: 'Turn 12 - Triple Apex Sweep', sector: 3 },
      { number: 16, x: 100, y: 180, name: 'Turn 16 - Main Straight Entry', sector: 3 },
    ],
  },
  yas_marina: {
    id: 'yas_marina',
    name: 'Yas Marina Circuit',
    location: 'Abu Dhabi',
    country: 'UAE',
    turns: 16,
    lengthKm: '5.281 km',
    lapRecord: '1:26.103 (Max Verstappen, 2021)',
    viewBox: '0 0 500 350',
    path: 'M 100 280 L 320 280 L 370 240 L 420 190 L 390 130 L 330 110 L 260 140 L 210 100 L 150 120 L 110 190 Z',
    startFinishPoint: { x: 210, y: 280 },
    turnsData: [
      { number: 1, x: 320, y: 280, name: 'Turn 1', sector: 1 },
      { number: 5, x: 370, y: 240, name: 'Turn 5 - North Hairpin', sector: 1 },
      { number: 6, x: 420, y: 190, name: 'Turn 6 - Back Straight', sector: 2 },
      { number: 9, x: 390, y: 130, name: 'Turn 9 - Marsa Corner', sector: 2 },
      { number: 12, x: 330, y: 110, name: 'Turn 12 - Marina Hotel', sector: 3 },
      { number: 16, x: 110, y: 190, name: 'Turn 16', sector: 3 },
    ],
  },
  sepang: {
    id: 'sepang',
    name: 'Sepang International Circuit',
    location: 'Sepang',
    country: 'Malaysia',
    turns: 15,
    lengthKm: '5.543 km',
    lapRecord: '1:34.080 (Sebastian Vettel, 2017)',
    viewBox: '0 0 500 350',
    path: 'M 100 270 L 360 270 L 410 220 L 390 150 L 340 130 L 290 160 L 230 110 L 170 110 L 120 160 L 80 220 Z',
    startFinishPoint: { x: 230, y: 270 },
    turnsData: [
      { number: 1, x: 360, y: 270, name: 'Turn 1', sector: 1 },
      { number: 4, x: 410, y: 220, name: 'Turn 4', sector: 1 },
      { number: 7, x: 390, y: 150, name: 'Turn 7', sector: 2 },
      { number: 9, x: 290, y: 160, name: 'Turn 9', sector: 2 },
      { number: 14, x: 170, y: 110, name: 'Turn 14', sector: 3 },
      { number: 15, x: 80, y: 220, name: 'Turn 15 - Final Hairpin', sector: 3 },
    ],
  },
}

/**
 * Sanitizes race names to ensure official Grand Prix nomenclature.
 * Fixes Jolpica anomaly where Sepang / Round 16 is named "Bahrain Grand Prix in Malaysia"
 * and ensures official name "Malaysian Grand Prix".
 */
export function sanitizeRaceName(
  raceName: string,
  circuitId?: string,
  country?: string
): string {
  const cId = circuitId?.toLowerCase() || ''
  const cCountry = country?.toLowerCase() || ''
  const nameLower = raceName.toLowerCase()

  if (
    cId === 'sepang' ||
    cCountry === 'malaysia' ||
    nameLower.includes('in malaysia') ||
    (nameLower.includes('bahrain') && nameLower.includes('malaysia'))
  ) {
    return 'Malaysian Grand Prix'
  }

  // Sanitize any generic "Grand Prix in <Location>" join error
  if (nameLower.includes(' in ')) {
    const match = raceName.match(/(.*?\bGrand Prix\b)/i)
    if (match) {
      return match[1].trim()
    }
  }

  return raceName
}

/**
 * Returns circuit geometry by circuitId or fuzzy name matching.
 */
export function getCircuitInfo(circuitId?: string, circuitName?: string): CircuitInfo {
  if (circuitId && CIRCUITS[circuitId.toLowerCase()]) {
    return CIRCUITS[circuitId.toLowerCase()]
  }

  // Check matching by name or location
  if (circuitName) {
    const nameLower = circuitName.toLowerCase()
    for (const info of Object.values(CIRCUITS)) {
      if (
        nameLower.includes(info.location.toLowerCase()) ||
        nameLower.includes(info.name.toLowerCase()) ||
        nameLower.includes(info.country.toLowerCase())
      ) {
        return info
      }
    }
  }

  // Fallback circuit with sector divisions and turns
  return {
    id: 'default_circuit',
    name: circuitName || 'Grand Prix Circuit',
    location: 'FIA Circuit',
    country: 'International',
    turns: 18,
    lengthKm: '5.300 km',
    viewBox: '0 0 500 350',
    path: 'M 100 260 C 200 260, 350 280, 420 220 C 460 180, 430 120, 360 110 C 290 100, 240 140, 180 120 C 120 100, 80 180, 100 260 Z',
    startFinishPoint: { x: 260, y: 265 },
    turnsData: [
      { number: 1, x: 420, y: 220, name: 'Turn 1', sector: 1 },
      { number: 4, x: 430, y: 120, name: 'Turn 4', sector: 1 },
      { number: 8, x: 360, y: 110, name: 'Turn 8', sector: 2 },
      { number: 11, x: 240, y: 140, name: 'Turn 11', sector: 2 },
      { number: 15, x: 120, y: 100, name: 'Turn 15', sector: 3 },
      { number: 18, x: 100, y: 260, name: 'Turn 18', sector: 3 },
    ],
  }
}
