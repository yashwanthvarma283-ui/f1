/**
 * SVG geometry, sector markers, and telemetry metadata for championship circuits.
 * Adheres to F1 Design Standards:
 * - Mathematical precision vector paths
 * - Turn markers with coordinates, names, and sectors
 * - Sector 1 (Purple), Sector 2 (Green), Sector 3 (Yellow)
 */
import circuitsGeometryRaw from '@/data/circuits_geometry.json'

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
  melbourne: {
    id: 'melbourne',
    name: 'Albert Park Circuit',
    location: 'Melbourne',
    country: 'Australia',
    turns: 14,
    lengthKm: '5.278 km',
    lapRecord: '1:19.813 (Charles Leclerc, 2024)',
    viewBox: '0 0 500 350',
    path: 'M 140 270 L 330 270 L 380 230 L 410 160 L 390 110 L 320 100 L 260 130 L 200 110 L 150 140 L 110 190 L 110 240 Z',
    startFinishPoint: { x: 235, y: 270 },
    turnsData: [
      { number: 1, x: 330, y: 270, name: 'Turn 1 - Jones', sector: 1 },
      { number: 3, x: 380, y: 230, name: 'Turn 3 - Sports Center', sector: 1 },
      { number: 6, x: 390, y: 110, name: 'Turn 6', sector: 2 },
      { number: 9, x: 260, y: 130, name: 'Turn 9/10 High Speed Chicane', sector: 2 },
      { number: 11, x: 150, y: 140, name: 'Turn 11 - Waite', sector: 3 },
      { number: 14, x: 110, y: 240, name: 'Turn 14 - Prost', sector: 3 },
    ],
  },
  albert_park: {
    id: 'albert_park',
    name: 'Albert Park Circuit',
    location: 'Melbourne',
    country: 'Australia',
    turns: 14,
    lengthKm: '5.278 km',
    lapRecord: '1:19.813 (Charles Leclerc, 2024)',
    viewBox: '0 0 500 350',
    path: 'M 140 270 L 330 270 L 380 230 L 410 160 L 390 110 L 320 100 L 260 130 L 200 110 L 150 140 L 110 190 L 110 240 Z',
    startFinishPoint: { x: 235, y: 270 },
    turnsData: [
      { number: 1, x: 330, y: 270, name: 'Turn 1 - Jones', sector: 1 },
      { number: 3, x: 380, y: 230, name: 'Turn 3', sector: 1 },
      { number: 6, x: 390, y: 110, name: 'Turn 6', sector: 2 },
      { number: 9, x: 260, y: 130, name: 'Turn 9/10 Chicane', sector: 2 },
      { number: 11, x: 150, y: 140, name: 'Turn 11', sector: 3 },
      { number: 14, x: 110, y: 240, name: 'Turn 14', sector: 3 },
    ],
  },
  sakhir: {
    id: 'sakhir',
    name: 'Bahrain International Circuit',
    location: 'Sakhir',
    country: 'Bahrain',
    turns: 15,
    lengthKm: '5.412 km',
    lapRecord: '1:31.447 (Pedro de la Rosa, 2005)',
    viewBox: '0 0 500 350',
    path: 'M 100 270 L 370 270 L 420 220 L 380 180 L 330 190 L 300 140 L 250 120 L 210 160 L 160 120 L 110 160 L 80 220 Z',
    startFinishPoint: { x: 235, y: 270 },
    turnsData: [
      { number: 1, x: 370, y: 270, name: 'Turn 1 - Michael Schumacher', sector: 1 },
      { number: 4, x: 420, y: 220, name: 'Turn 4', sector: 1 },
      { number: 8, x: 330, y: 190, name: 'Turn 8 - Hairpin', sector: 2 },
      { number: 10, x: 250, y: 120, name: 'Turn 10 - Tricky Braking', sector: 2 },
      { number: 13, x: 160, y: 120, name: 'Turn 13', sector: 3 },
      { number: 15, x: 80, y: 220, name: 'Turn 15', sector: 3 },
    ],
  },
  bahrain: {
    id: 'bahrain',
    name: 'Bahrain International Circuit',
    location: 'Sakhir',
    country: 'Bahrain',
    turns: 15,
    lengthKm: '5.412 km',
    lapRecord: '1:31.447 (Pedro de la Rosa, 2005)',
    viewBox: '0 0 500 350',
    path: 'M 100 270 L 370 270 L 420 220 L 380 180 L 330 190 L 300 140 L 250 120 L 210 160 L 160 120 L 110 160 L 80 220 Z',
    startFinishPoint: { x: 235, y: 270 },
    turnsData: [
      { number: 1, x: 370, y: 270, name: 'Turn 1', sector: 1 },
      { number: 4, x: 420, y: 220, name: 'Turn 4', sector: 1 },
      { number: 8, x: 330, y: 190, name: 'Turn 8', sector: 2 },
      { number: 10, x: 250, y: 120, name: 'Turn 10', sector: 2 },
      { number: 13, x: 160, y: 120, name: 'Turn 13', sector: 3 },
      { number: 15, x: 80, y: 220, name: 'Turn 15', sector: 3 },
    ],
  },
  shanghai: {
    id: 'shanghai',
    name: 'Shanghai International Circuit',
    location: 'Shanghai',
    country: 'China',
    turns: 16,
    lengthKm: '5.451 km',
    lapRecord: '1:32.238 (Michael Schumacher, 2004)',
    viewBox: '0 0 500 350',
    path: 'M 120 280 L 360 280 L 420 230 L 400 160 L 340 180 L 310 130 L 250 140 L 210 100 L 150 120 L 110 190 L 80 230 Z',
    startFinishPoint: { x: 240, y: 280 },
    turnsData: [
      { number: 1, x: 360, y: 280, name: 'Turn 1 - Snail Curve', sector: 1 },
      { number: 6, x: 400, y: 160, name: 'Turn 6 - Hairpin', sector: 1 },
      { number: 9, x: 310, y: 130, name: 'Turn 9', sector: 2 },
      { number: 13, x: 210, y: 100, name: 'Turn 13 - Banked Entry', sector: 2 },
      { number: 14, x: 110, y: 190, name: 'Turn 14 - End of 1.2km Straight', sector: 3 },
      { number: 16, x: 80, y: 230, name: 'Turn 16', sector: 3 },
    ],
  },
  baku: {
    id: 'baku',
    name: 'Baku City Circuit',
    location: 'Baku',
    country: 'Azerbaijan',
    turns: 20,
    lengthKm: '6.003 km',
    lapRecord: '1:43.009 (Charles Leclerc, 2019)',
    viewBox: '0 0 500 350',
    path: 'M 90 270 L 430 270 L 440 210 L 400 150 L 370 180 L 340 130 L 280 120 L 220 140 L 160 110 L 120 170 L 80 210 Z',
    startFinishPoint: { x: 260, y: 270 },
    turnsData: [
      { number: 1, x: 430, y: 270, name: 'Turn 1 - 90 Degree Left', sector: 1 },
      { number: 3, x: 440, y: 210, name: 'Turn 3', sector: 1 },
      { number: 8, x: 340, y: 130, name: 'Turn 8 - Old City / Castle Section', sector: 2 },
      { number: 12, x: 280, y: 120, name: 'Turn 12', sector: 2 },
      { number: 16, x: 160, y: 110, name: 'Turn 16 - Promenade Entry', sector: 3 },
      { number: 20, x: 80, y: 210, name: 'Turn 20 - 2.2km Flat Out Straight', sector: 3 },
    ],
  },
  monaco: {
    id: 'monaco',
    name: 'Circuit de Monaco',
    location: 'Monte Carlo',
    country: 'Monaco',
    turns: 19,
    lengthKm: '3.337 km',
    lapRecord: '1:12.909 (Lewis Hamilton, 2021)',
    viewBox: '0 0 500 350',
    path: 'M 130 260 L 300 270 L 360 230 L 410 170 L 380 120 L 320 110 L 270 140 L 230 110 L 170 130 L 120 170 L 90 210 Z',
    startFinishPoint: { x: 215, y: 265 },
    turnsData: [
      { number: 1, x: 300, y: 270, name: 'Turn 1 - Sainte Dévote', sector: 1 },
      { number: 3, x: 410, y: 170, name: 'Turn 3 - Massenet & Casino', sector: 1 },
      { number: 6, x: 320, y: 110, name: 'Turn 6 - Fairmont Hairpin', sector: 2 },
      { number: 8, x: 270, y: 140, name: 'Turn 8 - Portier', sector: 2 },
      { number: 10, x: 230, y: 110, name: 'Turn 10 - Nouvelle Chicane', sector: 2 },
      { number: 12, x: 170, y: 130, name: 'Turn 12 - Tabac', sector: 3 },
      { number: 15, x: 120, y: 170, name: 'Turn 15 - Swimming Pool', sector: 3 },
      { number: 18, x: 90, y: 210, name: 'Turn 18 - La Rascasse', sector: 3 },
    ],
  },
  monte_carlo: {
    id: 'monte_carlo',
    name: 'Circuit de Monaco',
    location: 'Monte Carlo',
    country: 'Monaco',
    turns: 19,
    lengthKm: '3.337 km',
    lapRecord: '1:12.909 (Lewis Hamilton, 2021)',
    viewBox: '0 0 500 350',
    path: 'M 130 260 L 300 270 L 360 230 L 410 170 L 380 120 L 320 110 L 270 140 L 230 110 L 170 130 L 120 170 L 90 210 Z',
    startFinishPoint: { x: 215, y: 265 },
    turnsData: [
      { number: 1, x: 300, y: 270, name: 'Turn 1 - Sainte Dévote', sector: 1 },
      { number: 6, x: 320, y: 110, name: 'Turn 6 - Fairmont Hairpin', sector: 2 },
      { number: 15, x: 120, y: 170, name: 'Turn 15 - Swimming Pool', sector: 3 },
    ],
  },
  barcelona: {
    id: 'barcelona',
    name: 'Circuit de Barcelona-Catalunya',
    location: 'Montmeló',
    country: 'Spain',
    turns: 14,
    lengthKm: '4.657 km',
    lapRecord: '1:16.330 (Max Verstappen, 2023)',
    viewBox: '0 0 500 350',
    path: 'M 110 270 L 370 270 L 420 220 L 400 150 L 350 140 L 300 170 L 240 120 L 180 130 L 130 170 L 90 220 Z',
    startFinishPoint: { x: 240, y: 270 },
    turnsData: [
      { number: 1, x: 370, y: 270, name: 'Turn 1 - Elf', sector: 1 },
      { number: 3, x: 420, y: 220, name: 'Turn 3 - Renault Long Curve', sector: 1 },
      { number: 5, x: 400, y: 150, name: 'Turn 5 - Seat Hairpin', sector: 2 },
      { number: 9, x: 300, y: 170, name: 'Turn 9 - Campsa Crest', sector: 2 },
      { number: 10, x: 240, y: 120, name: 'Turn 10 - Caixa Hairpin', sector: 3 },
      { number: 14, x: 90, y: 220, name: 'Turn 14 - Fast Final Turn', sector: 3 },
    ],
  },
  catalunya: {
    id: 'catalunya',
    name: 'Circuit de Barcelona-Catalunya',
    location: 'Montmeló',
    country: 'Spain',
    turns: 14,
    lengthKm: '4.657 km',
    lapRecord: '1:16.330 (Max Verstappen, 2023)',
    viewBox: '0 0 500 350',
    path: 'M 110 270 L 370 270 L 420 220 L 400 150 L 350 140 L 300 170 L 240 120 L 180 130 L 130 170 L 90 220 Z',
    startFinishPoint: { x: 240, y: 270 },
    turnsData: [
      { number: 1, x: 370, y: 270, name: 'Turn 1', sector: 1 },
      { number: 5, x: 400, y: 150, name: 'Turn 5', sector: 2 },
      { number: 14, x: 90, y: 220, name: 'Turn 14', sector: 3 },
    ],
  },
  montreal: {
    id: 'montreal',
    name: 'Circuit Gilles-Villeneuve',
    location: 'Montreal',
    country: 'Canada',
    turns: 14,
    lengthKm: '4.361 km',
    lapRecord: '1:13.078 (Valtteri Bottas, 2019)',
    viewBox: '0 0 500 350',
    path: 'M 90 260 L 410 260 L 430 200 L 380 160 L 340 190 L 290 140 L 220 160 L 160 110 L 110 150 L 80 200 Z',
    startFinishPoint: { x: 250, y: 260 },
    turnsData: [
      { number: 1, x: 410, y: 260, name: 'Turn 1/2 - Senna S', sector: 1 },
      { number: 6, x: 340, y: 190, name: 'Turn 6/7 Chicane', sector: 2 },
      { number: 10, x: 220, y: 160, name: 'Turn 10 - Epingle Hairpin', sector: 2 },
      { number: 13, x: 110, y: 150, name: 'Turn 13/14 - Wall of Champions', sector: 3 },
    ],
  },
  villeneuve: {
    id: 'villeneuve',
    name: 'Circuit Gilles-Villeneuve',
    location: 'Montreal',
    country: 'Canada',
    turns: 14,
    lengthKm: '4.361 km',
    lapRecord: '1:13.078 (Valtteri Bottas, 2019)',
    viewBox: '0 0 500 350',
    path: 'M 90 260 L 410 260 L 430 200 L 380 160 L 340 190 L 290 140 L 220 160 L 160 110 L 110 150 L 80 200 Z',
    startFinishPoint: { x: 250, y: 260 },
    turnsData: [
      { number: 1, x: 410, y: 260, name: 'Turn 1/2', sector: 1 },
      { number: 10, x: 220, y: 160, name: 'Turn 10 Hairpin', sector: 2 },
      { number: 14, x: 80, y: 200, name: 'Wall of Champions', sector: 3 },
    ],
  },
  spielberg: {
    id: 'spielberg',
    name: 'Red Bull Ring',
    location: 'Spielberg',
    country: 'Austria',
    turns: 10,
    lengthKm: '4.318 km',
    lapRecord: '1:05.619 (Carlos Sainz, 2020)',
    viewBox: '0 0 500 350',
    path: 'M 130 270 L 390 270 L 430 210 L 380 120 L 300 130 L 240 160 L 180 150 L 110 200 Z',
    startFinishPoint: { x: 260, y: 270 },
    turnsData: [
      { number: 1, x: 390, y: 270, name: 'Turn 1 - Niki Lauda Kurve', sector: 1 },
      { number: 3, x: 430, y: 210, name: 'Turn 3 - Remus Hairpin', sector: 1 },
      { number: 4, x: 380, y: 120, name: 'Turn 4 - Rauch', sector: 2 },
      { number: 7, x: 240, y: 160, name: 'Turn 7 - Wurth', sector: 2 },
      { number: 9, x: 180, y: 150, name: 'Turn 9 - Rindt Kurve', sector: 3 },
      { number: 10, x: 110, y: 200, name: 'Turn 10 - Red Bull Mobile', sector: 3 },
    ],
  },
  red_bull_ring: {
    id: 'red_bull_ring',
    name: 'Red Bull Ring',
    location: 'Spielberg',
    country: 'Austria',
    turns: 10,
    lengthKm: '4.318 km',
    lapRecord: '1:05.619 (Carlos Sainz, 2020)',
    viewBox: '0 0 500 350',
    path: 'M 130 270 L 390 270 L 430 210 L 380 120 L 300 130 L 240 160 L 180 150 L 110 200 Z',
    startFinishPoint: { x: 260, y: 270 },
    turnsData: [
      { number: 1, x: 390, y: 270, name: 'Turn 1', sector: 1 },
      { number: 3, x: 430, y: 210, name: 'Turn 3', sector: 1 },
      { number: 4, x: 380, y: 120, name: 'Turn 4', sector: 2 },
      { number: 10, x: 110, y: 200, name: 'Turn 10', sector: 3 },
    ],
  },
  spa: {
    id: 'spa',
    name: 'Circuit de Spa-Francorchamps',
    location: 'Stavelot',
    country: 'Belgium',
    turns: 19,
    lengthKm: '7.004 km',
    lapRecord: '1:46.286 (Valtteri Bottas, 2018)',
    viewBox: '0 0 500 350',
    path: 'M 140 280 L 320 280 L 370 240 L 430 190 L 420 120 L 370 100 L 300 130 L 250 90 L 190 110 L 140 170 L 90 220 Z',
    startFinishPoint: { x: 230, y: 280 },
    turnsData: [
      { number: 1, x: 320, y: 280, name: 'Turn 1 - La Source Hairpin', sector: 1 },
      { number: 3, x: 370, y: 240, name: 'Turn 3/4 - Eau Rouge & Raidillon', sector: 1 },
      { number: 5, x: 430, y: 190, name: 'Turn 5 - Kemmel Straight / Les Combes', sector: 1 },
      { number: 8, x: 370, y: 100, name: 'Turn 8 - Bruxelles Hairpin', sector: 2 },
      { number: 10, x: 300, y: 130, name: 'Turn 10/11 - Double Gauche Pouhon', sector: 2 },
      { number: 14, x: 250, y: 90, name: 'Turn 14/15 - Campus & Stavelot', sector: 2 },
      { number: 17, x: 190, y: 110, name: 'Turn 17 - Blanchimont Full Throttle', sector: 3 },
      { number: 19, x: 90, y: 220, name: 'Turn 19 - Bus Stop Chicane', sector: 3 },
    ],
  },
  spa_francorchamps: {
    id: 'spa_francorchamps',
    name: 'Circuit de Spa-Francorchamps',
    location: 'Stavelot',
    country: 'Belgium',
    turns: 19,
    lengthKm: '7.004 km',
    lapRecord: '1:46.286 (Valtteri Bottas, 2018)',
    viewBox: '0 0 500 350',
    path: 'M 140 280 L 320 280 L 370 240 L 430 190 L 420 120 L 370 100 L 300 130 L 250 90 L 190 110 L 140 170 L 90 220 Z',
    startFinishPoint: { x: 230, y: 280 },
    turnsData: [
      { number: 1, x: 320, y: 280, name: 'Turn 1 - La Source', sector: 1 },
      { number: 4, x: 370, y: 240, name: 'Eau Rouge', sector: 1 },
      { number: 10, x: 300, y: 130, name: 'Pouhon', sector: 2 },
      { number: 19, x: 90, y: 220, name: 'Bus Stop Chicane', sector: 3 },
    ],
  },
  budapest: {
    id: 'budapest',
    name: 'Hungaroring',
    location: 'Budapest',
    country: 'Hungary',
    turns: 14,
    lengthKm: '4.381 km',
    lapRecord: '1:16.627 (Lewis Hamilton, 2020)',
    viewBox: '0 0 500 350',
    path: 'M 110 270 L 360 270 L 410 230 L 390 160 L 340 170 L 300 120 L 240 130 L 190 100 L 140 140 L 90 210 Z',
    startFinishPoint: { x: 235, y: 270 },
    turnsData: [
      { number: 1, x: 360, y: 270, name: 'Turn 1 - Downhill Braking', sector: 1 },
      { number: 4, x: 390, y: 160, name: 'Turn 4 - Blind Crest Sweep', sector: 1 },
      { number: 6, x: 300, y: 120, name: 'Turn 6/7 Chicane', sector: 2 },
      { number: 11, x: 190, y: 100, name: 'Turn 11 - Fast Right', sector: 2 },
      { number: 14, x: 90, y: 210, name: 'Turn 14 - Pit Straight Entry', sector: 3 },
    ],
  },
  hungaroring: {
    id: 'hungaroring',
    name: 'Hungaroring',
    location: 'Budapest',
    country: 'Hungary',
    turns: 14,
    lengthKm: '4.381 km',
    lapRecord: '1:16.627 (Lewis Hamilton, 2020)',
    viewBox: '0 0 500 350',
    path: 'M 110 270 L 360 270 L 410 230 L 390 160 L 340 170 L 300 120 L 240 130 L 190 100 L 140 140 L 90 210 Z',
    startFinishPoint: { x: 235, y: 270 },
    turnsData: [
      { number: 1, x: 360, y: 270, name: 'Turn 1', sector: 1 },
      { number: 6, x: 300, y: 120, name: 'Turn 6', sector: 2 },
      { number: 14, x: 90, y: 210, name: 'Turn 14', sector: 3 },
    ],
  },
  zandvoort: {
    id: 'zandvoort',
    name: 'Circuit Zandvoort',
    location: 'Zandvoort',
    country: 'Netherlands',
    turns: 14,
    lengthKm: '4.259 km',
    lapRecord: '1:11.097 (Lewis Hamilton, 2021)',
    viewBox: '0 0 500 350',
    path: 'M 100 270 L 370 270 L 420 220 L 400 160 L 350 140 L 310 180 L 260 130 L 200 120 L 150 160 L 90 210 Z',
    startFinishPoint: { x: 235, y: 270 },
    turnsData: [
      { number: 1, x: 370, y: 270, name: 'Turn 1 - Tarzan Bocht', sector: 1 },
      { number: 3, x: 420, y: 220, name: 'Turn 3 - Hugenholtz Banking', sector: 1 },
      { number: 7, x: 350, y: 140, name: 'Turn 7 - Scheivlak Crest', sector: 2 },
      { number: 10, x: 260, y: 130, name: 'Turn 10 - Hans Ernst Chicane', sector: 2 },
      { number: 14, x: 90, y: 210, name: 'Turn 14 - Arie Luyendyk Banked Curve', sector: 3 },
    ],
  },
  suzuka: {
    id: 'suzuka',
    name: 'Suzuka International Racing Course',
    location: 'Suzuka',
    country: 'Japan',
    turns: 18,
    lengthKm: '5.807 km',
    lapRecord: '1:30.983 (Lewis Hamilton, 2019)',
    viewBox: '0 0 500 350',
    path: 'M 120 280 L 350 280 L 400 230 L 430 160 L 380 120 L 310 140 L 260 110 L 200 130 L 150 100 L 100 150 L 80 220 Z',
    startFinishPoint: { x: 235, y: 280 },
    turnsData: [
      { number: 1, x: 350, y: 280, name: 'Turn 1/2 First Curve', sector: 1 },
      { number: 3, x: 400, y: 230, name: 'Turn 3-6 Esses Complex', sector: 1 },
      { number: 7, x: 430, y: 160, name: 'Turn 7 - Dunlop Curve', sector: 1 },
      { number: 8, x: 380, y: 120, name: 'Turn 8/9 Degner Curves', sector: 2 },
      { number: 11, x: 310, y: 140, name: 'Turn 11 - Hairpin', sector: 2 },
      { number: 13, x: 260, y: 110, name: 'Turn 13/14 Spoon Curve', sector: 2 },
      { number: 15, x: 150, y: 100, name: 'Turn 15 - 130R Iconic Sweeper', sector: 3 },
      { number: 16, x: 80, y: 220, name: 'Turn 16-18 Casio Triangle', sector: 3 },
    ],
  },
  jeddah: {
    id: 'jeddah',
    name: 'Jeddah Corniche Circuit',
    location: 'Jeddah',
    country: 'Saudi Arabia',
    turns: 27,
    lengthKm: '6.174 km',
    lapRecord: '1:30.734 (Lewis Hamilton, 2021)',
    viewBox: '0 0 500 350',
    path: 'M 100 270 L 420 270 L 450 210 L 420 140 L 380 160 L 330 110 L 270 130 L 210 100 L 160 130 L 110 170 L 70 210 Z',
    startFinishPoint: { x: 260, y: 270 },
    turnsData: [
      { number: 1, x: 420, y: 270, name: 'Turn 1/2 Chicane', sector: 1 },
      { number: 13, x: 380, y: 160, name: 'Turn 13 - Banked Hairpin', sector: 2 },
      { number: 22, x: 210, y: 100, name: 'Turn 22 High-Speed Chicane', sector: 3 },
      { number: 27, x: 70, y: 210, name: 'Turn 27 - Final Corner', sector: 3 },
    ],
  },
  miami: {
    id: 'miami',
    name: 'Miami International Autodrome',
    location: 'Miami',
    country: 'USA',
    turns: 19,
    lengthKm: '5.412 km',
    lapRecord: '1:29.708 (Max Verstappen, 2023)',
    viewBox: '0 0 500 350',
    path: 'M 110 270 L 380 270 L 430 220 L 400 150 L 350 170 L 300 120 L 240 140 L 180 110 L 130 160 L 90 220 Z',
    startFinishPoint: { x: 245, y: 270 },
    turnsData: [
      { number: 1, x: 380, y: 270, name: 'Turn 1', sector: 1 },
      { number: 7, x: 400, y: 150, name: 'Turn 7/8 Marina Section', sector: 1 },
      { number: 11, x: 300, y: 120, name: 'Turn 11-16 Overpass Chicane', sector: 2 },
      { number: 17, x: 180, y: 110, name: 'Turn 17 - Hairpin', sector: 3 },
      { number: 19, x: 90, y: 220, name: 'Turn 19', sector: 3 },
    ],
  },
  miami_gardens: {
    id: 'miami_gardens',
    name: 'Miami International Autodrome',
    location: 'Miami',
    country: 'USA',
    turns: 19,
    lengthKm: '5.412 km',
    lapRecord: '1:29.708 (Max Verstappen, 2023)',
    viewBox: '0 0 500 350',
    path: 'M 110 270 L 380 270 L 430 220 L 400 150 L 350 170 L 300 120 L 240 140 L 180 110 L 130 160 L 90 220 Z',
    startFinishPoint: { x: 245, y: 270 },
    turnsData: [
      { number: 1, x: 380, y: 270, name: 'Turn 1', sector: 1 },
      { number: 11, x: 300, y: 120, name: 'Turn 11-16 Chicane', sector: 2 },
      { number: 17, x: 180, y: 110, name: 'Turn 17 Hairpin', sector: 3 },
    ],
  },
  imola: {
    id: 'imola',
    name: 'Autodromo Internazionale Enzo e Dino Ferrari',
    location: 'Imola',
    country: 'Italy',
    turns: 19,
    lengthKm: '4.909 km',
    lapRecord: '1:15.484 (Lewis Hamilton, 2020)',
    viewBox: '0 0 500 350',
    path: 'M 100 270 L 360 270 L 410 220 L 390 150 L 330 160 L 290 110 L 230 130 L 180 100 L 130 150 L 80 210 Z',
    startFinishPoint: { x: 230, y: 270 },
    turnsData: [
      { number: 2, x: 360, y: 270, name: 'Turn 2/3 - Variante Tamburello', sector: 1 },
      { number: 5, x: 410, y: 220, name: 'Turn 5/6 - Variante Villeneuve', sector: 1 },
      { number: 7, x: 390, y: 150, name: 'Turn 7 - Tosa Hairpin', sector: 2 },
      { number: 9, x: 330, y: 160, name: 'Turn 9 - Piratella Downhill', sector: 2 },
      { number: 11, x: 290, y: 110, name: 'Turn 11/12 - Acque Minerali', sector: 2 },
      { number: 14, x: 180, y: 100, name: 'Turn 14/15 - Variante Alta', sector: 3 },
      { number: 17, x: 80, y: 210, name: 'Turn 17/18 - Rivazza', sector: 3 },
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

export interface RealCircuitGeometry {
  id: string
  event_name: string
  circuit_name: string
  rotation: number
  viewBox: string
  inner_boundary: [number, number][]
  outer_boundary: [number, number][]
  racing_line: [number, number][]
  drs_zones: [number, number][][]
  corners: {
    number: number
    x: number
    y: number
    angle?: number
    name?: string
  }[]
  start_finish: {
    inner: [number, number]
    outer: [number, number]
  }
  lapRecordSeconds: number
}

export const LAP_RECORD_SECONDS: Record<string, number> = {
  sakhir: 91.4,
  jeddah: 89.0,
  melbourne: 80.0,
  suzuka: 89.0,
  shanghai: 92.0,
  miami: 89.5,
  imola: 75.0,
  monaco: 73.0,
  montreal: 72.5,
  barcelona: 72.0,
  spielberg: 65.5,
  silverstone: 87.0,
  budapest: 76.5,
  spa: 104.0,
  zandvoort: 71.0,
  monza: 81.0,
  baku: 102.0,
  marina_bay: 92.5,
  austin: 96.0,
  mexico_city: 78.0,
  interlagos: 71.0,
  las_vegas: 93.0,
  lusail: 82.5,
  yas_marina: 84.0,
  portimao: 78.5,
  sochi: 95.0,
  mugello: 75.0,
  nurburgring: 88.0,
  istanbul: 85.0,
  paul_ricard: 92.0,
}

const ALIAS_TO_CIRCUIT_ID: Record<string, string> = {
  bahrain: 'sakhir',
  sakhir: 'sakhir',
  jeddah: 'jeddah',
  saudi_arabia: 'jeddah',
  albert_park: 'melbourne',
  melbourne: 'melbourne',
  australia: 'melbourne',
  suzuka: 'suzuka',
  japan: 'suzuka',
  shanghai: 'shanghai',
  china: 'shanghai',
  miami: 'miami',
  imola: 'imola',
  emilia_romagna: 'imola',
  monaco: 'monaco',
  monte_carlo: 'monaco',
  villeneuve: 'montreal',
  montreal: 'montreal',
  canada: 'montreal',
  catalunya: 'barcelona',
  barcelona: 'barcelona',
  spain: 'barcelona',
  red_bull_ring: 'spielberg',
  spielberg: 'spielberg',
  austria: 'spielberg',
  styria: 'spielberg',
  silverstone: 'silverstone',
  great_britain: 'silverstone',
  britain: 'silverstone',
  hungaroring: 'budapest',
  budapest: 'budapest',
  hungary: 'budapest',
  spa: 'spa',
  spa_francorchamps: 'spa',
  belgium: 'spa',
  zandvoort: 'zandvoort',
  netherlands: 'zandvoort',
  dutch: 'zandvoort',
  monza: 'monza',
  italy: 'monza',
  baku: 'baku',
  azerbaijan: 'baku',
  marina_bay: 'marina_bay',
  singapore: 'marina_bay',
  americas: 'austin',
  austin: 'austin',
  cota: 'austin',
  usa: 'austin',
  united_states: 'austin',
  rodriguez: 'mexico_city',
  mexico: 'mexico_city',
  mexico_city: 'mexico_city',
  hermanos_rodriguez: 'mexico_city',
  interlagos: 'interlagos',
  brazil: 'interlagos',
  sao_paulo: 'interlagos',
  jose_carlos_pace: 'interlagos',
  las_vegas: 'las_vegas',
  vegas: 'las_vegas',
  losail: 'lusail',
  lusail: 'lusail',
  qatar: 'lusail',
  yas_marina: 'yas_marina',
  abu_dhabi: 'yas_marina',
  portimao: 'portimao',
  portugal: 'portimao',
  sochi: 'sochi',
  russia: 'sochi',
  mugello: 'mugello',
  tuscany: 'mugello',
  nurburgring: 'nurburgring',
  eifel: 'nurburgring',
  istanbul: 'istanbul',
  turkey: 'istanbul',
  paul_ricard: 'paul_ricard',
  france: 'paul_ricard',
  le_castellet: 'paul_ricard',
}

/**
 * Returns authentic GPS circuit geometry with inner/outer boundaries,
 * DRS zones, corner turns, and checkered start/finish line.
 */
export function getRealCircuitGeometry(
  circuitId?: string,
  circuitName?: string
): RealCircuitGeometry {
  const geomMap = circuitsGeometryRaw as Record<string, any>
  let targetKey: string | null = null

  if (circuitId) {
    const cleanId = circuitId.toLowerCase().trim()
    if (geomMap[cleanId]) {
      targetKey = cleanId
    } else if (ALIAS_TO_CIRCUIT_ID[cleanId] && geomMap[ALIAS_TO_CIRCUIT_ID[cleanId]]) {
      targetKey = ALIAS_TO_CIRCUIT_ID[cleanId]
    }
  }

  if (!targetKey && circuitName) {
    const cleanName = circuitName.toLowerCase()
    for (const [alias, realId] of Object.entries(ALIAS_TO_CIRCUIT_ID)) {
      if (cleanName.includes(alias) && geomMap[realId]) {
        targetKey = realId
        break
      }
    }
  }

  if (targetKey && geomMap[targetKey]) {
    const item = geomMap[targetKey]
    return {
      id: item.id,
      event_name: item.event_name,
      circuit_name: item.circuit_name,
      rotation: item.rotation || 0,
      viewBox: item.viewBox || '0 0 1000 700',
      inner_boundary: item.inner_boundary || [],
      outer_boundary: item.outer_boundary || [],
      racing_line: item.racing_line || [],
      drs_zones: item.drs_zones || [],
      corners: item.corners || [],
      start_finish: item.start_finish || {
        inner: item.inner_boundary[0] || [500, 350],
        outer: item.outer_boundary[0] || [500, 360],
      },
      lapRecordSeconds: LAP_RECORD_SECONDS[targetKey] || 88.0,
    }
  }

  // Graceful fallback: construct dual boundary geometry from fallback circuit info
  const info = getCircuitInfo(circuitId, circuitName)
  const fallbackKey = circuitId?.toLowerCase() || 'default'
  const recordSec = LAP_RECORD_SECONDS[fallbackKey] || 88.0

  return {
    id: info.id,
    event_name: info.name,
    circuit_name: info.location,
    rotation: 0,
    viewBox: info.viewBox || '0 0 500 350',
    inner_boundary: [],
    outer_boundary: [],
    racing_line: [],
    drs_zones: [],
    corners: info.turnsData.map((t) => ({
      number: t.number,
      x: t.x,
      y: t.y,
      name: t.name,
    })),
    start_finish: {
      inner: [info.startFinishPoint.x - 5, info.startFinishPoint.y],
      outer: [info.startFinishPoint.x + 5, info.startFinishPoint.y],
    },
    lapRecordSeconds: recordSec,
  }
}

