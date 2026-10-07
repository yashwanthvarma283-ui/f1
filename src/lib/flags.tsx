import React from 'react'

/**
 * High-definition vector flags for Grand Prix host nations and driver nationalities.
 * Adheres to SRP & F1 Design Standards: replaces emojis with precision SVG geometry.
 * Robustly maps country names, demonyms (e.g. Italian, French, Monegasque), and ISO codes.
 */

interface FlagProps {
  country?: string | null
  className?: string
}

export const CountryFlag: React.FC<FlagProps> = ({ country, className = 'w-5 h-3.5 inline-block shrink-0' }) => {
  if (!country) return null
  const c = country.toLowerCase().trim()
  if (c === '' || c === '-' || c === '–' || c === '—' || c === 'n/a' || c === 'unknown') {
    return null
  }

  // Singapore
  if (c.includes('singapore') || c === 'sgp') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="240" fill="#ED2939" />
        <rect y="240" width="640" height="240" fill="#FFFFFF" />
        <circle cx="120" cy="120" r="70" fill="#FFFFFF" />
        <circle cx="140" cy="120" r="70" fill="#ED2939" />
      </svg>
    )
  }

  // Italy / Italian (Andrea Kimi Antonelli, Monza, Imola, Ferrari)
  if (c.includes('ital') || c === 'ita' || c.includes('monza') || c.includes('imola')) {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="213.3" height="480" fill="#009246" />
        <rect x="213.3" width="213.3" height="480" fill="#FFFFFF" />
        <rect x="426.6" width="213.4" height="480" fill="#CE2B37" />
      </svg>
    )
  }

  // France / French (Isack Hadjar, Pierre Gasly, Esteban Ocon)
  if (c.includes('franc') || c.includes('french') || c === 'fra') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="213.3" height="480" fill="#002654" />
        <rect x="213.3" width="213.3" height="480" fill="#FFFFFF" />
        <rect x="426.6" width="213.4" height="480" fill="#ED2939" />
      </svg>
    )
  }

  // Monaco / Monegasque (Charles Leclerc)
  if (c.includes('monac') || c.includes('monegasque') || c === 'mco') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="240" fill="#CE1126" />
        <rect y="240" width="640" height="240" fill="#FFFFFF" />
      </svg>
    )
  }

  // United States / USA / American (Austin, Miami, Vegas)
  if (c.includes('usa') || c.includes('united states') || c.includes('america')) {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="480" fill="#B22234" />
        <path d="M0 37h640M0 111h640M0 185h640M0 259h640M0 333h640M0 407h640" stroke="#FFFFFF" strokeWidth="37" />
        <rect width="256" height="259" fill="#3C3B6E" />
      </svg>
    )
  }

  // United Kingdom / Great Britain / British (Lewis Hamilton, Lando Norris, George Russell, Bearman, Lindblad)
  if (c.includes('uk') || c.includes('brit') || c === 'gbr' || c.includes('silverstone') || c.includes('england')) {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="480" fill="#012169" />
        <path d="M0 0l640 480M640 0L0 480" stroke="#FFFFFF" strokeWidth="60" />
        <path d="M0 0l640 480M640 0L0 480" stroke="#C8102E" strokeWidth="20" />
        <path d="M320 0v480M0 240h640" stroke="#FFFFFF" strokeWidth="100" />
        <path d="M320 0v480M0 240h640" stroke="#C8102E" strokeWidth="60" />
      </svg>
    )
  }

  // Netherlands / Dutch (Max Verstappen, Zandvoort)
  if (c.includes('netherland') || c.includes('dutch') || c === 'ned' || c === 'nld') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="160" fill="#AE1C28" />
        <rect y="160" width="640" height="160" fill="#FFFFFF" />
        <rect y="320" width="640" height="160" fill="#21468B" />
      </svg>
    )
  }

  // Spain / Spanish (Fernando Alonso, Carlos Sainz, Barcelona, Madrid)
  if (c.includes('spain') || c.includes('spanish') || c === 'esp') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="120" fill="#AA151B" />
        <rect y="120" width="640" height="240" fill="#F1BF00" />
        <rect y="360" width="640" height="120" fill="#AA151B" />
      </svg>
    )
  }

  // Australia / Australian (Oscar Piastri, Melbourne)
  if (c.includes('austral') || c === 'aus') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="480" fill="#012169" />
        <path d="M0 0l320 240M320 0L0 240" stroke="#FFFFFF" strokeWidth="30" />
        <path d="M160 0v240M0 120h320" stroke="#FFFFFF" strokeWidth="50" />
        <path d="M160 0v240M0 120h320" stroke="#E4002B" strokeWidth="30" />
        <circle cx="480" cy="360" r="24" fill="#FFFFFF" />
        <circle cx="480" cy="120" r="16" fill="#FFFFFF" />
        <circle cx="560" cy="200" r="16" fill="#FFFFFF" />
      </svg>
    )
  }

  // Germany / German (Nico Hülkenberg, Audi)
  if (c.includes('german') || c === 'ger' || c === 'deu') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="160" fill="#000000" />
        <rect y="160" width="640" height="160" fill="#DD0000" />
        <rect y="320" width="640" height="160" fill="#FFCE00" />
      </svg>
    )
  }

  // Brazil / Brazilian (Gabriel Bortoleto, Interlagos)
  if (c.includes('brazil') || c.includes('brasil') || c === 'bra') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="480" fill="#009739" />
        <path d="M320 60L560 240L320 420L80 240Z" fill="#FEDD00" />
        <circle cx="320" cy="240" r="85" fill="#012169" />
      </svg>
    )
  }

  // Canada / Canadian (Lance Stroll, Montreal)
  if (c.includes('canad') || c === 'can') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="160" height="480" fill="#FF0000" />
        <rect x="160" width="320" height="480" fill="#FFFFFF" />
        <rect x="480" width="160" height="480" fill="#FF0000" />
        <path d="M320 120l30 60 40-10-20 40 40 10-30 30 20 40-50-10-10 70-40-70-50 10 20-40-30-30 40-10-20-40 40 10z" fill="#FF0000" />
      </svg>
    )
  }

  // Mexico / Mexican (Sergio Pérez, Mexico City)
  if (c.includes('mexic') || c === 'mex') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="213.3" height="480" fill="#006847" />
        <rect x="213.3" width="213.3" height="480" fill="#FFFFFF" />
        <rect x="426.6" width="213.4" height="480" fill="#CE1126" />
        <circle cx="320" cy="240" r="28" fill="#B38E5D" />
      </svg>
    )
  }

  // Finland / Finnish (Valtteri Bottas)
  if (c.includes('finland') || c.includes('finnish') || c === 'fin') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="480" fill="#FFFFFF" />
        <path d="M0 190h640M200 0v480" stroke="#003580" strokeWidth="100" />
      </svg>
    )
  }

  // Argentina / Argentine (Franco Colapinto)
  if (c.includes('argentin') || c === 'arg') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="160" fill="#75AADB" />
        <rect y="160" width="640" height="160" fill="#FFFFFF" />
        <rect y="320" width="640" height="160" fill="#75AADB" />
        <circle cx="320" cy="240" r="24" fill="#F6B40E" />
      </svg>
    )
  }

  // Thailand / Thai (Alexander Albon)
  if (c.includes('thai') || c === 'tha') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="80" fill="#A51931" />
        <rect y="80" width="640" height="80" fill="#F4F5F8" />
        <rect y="160" width="640" height="160" fill="#2D2A4A" />
        <rect y="320" width="640" height="80" fill="#F4F5F8" />
        <rect y="400" width="640" height="80" fill="#A51931" />
      </svg>
    )
  }

  // New Zealand / New Zealander (Liam Lawson)
  if (c.includes('zealand') || c === 'nzl') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="480" fill="#012169" />
        <path d="M0 0l320 240M320 0L0 240" stroke="#FFFFFF" strokeWidth="30" />
        <path d="M160 0v240M0 120h320" stroke="#FFFFFF" strokeWidth="50" />
        <path d="M160 0v240M0 120h320" stroke="#E4002B" strokeWidth="30" />
        <polygon points="480,120 488,144 512,144 492,158 500,182 480,168 460,182 468,158 448,144 472,144" fill="#CC142B" />
        <polygon points="480,320 488,344 512,344 492,358 500,382 480,368 460,382 468,358 448,344 472,344" fill="#CC142B" />
      </svg>
    )
  }

  // Japan / Japanese (Suzuka, Yuki Tsunoda)
  if (c.includes('japan') || c.includes('japanese') || c === 'jpn') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="480" fill="#FFFFFF" />
        <circle cx="320" cy="240" r="144" fill="#BC002D" />
      </svg>
    )
  }

  // Malaysia / Sepang
  if (c.includes('malaysia') || c === 'mys') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="480" fill="#CC0000" />
        <path d="M0 34h640M0 102h640M0 170h640M0 238h640M0 306h640M0 374h640M0 442h640" stroke="#FFFFFF" strokeWidth="34" />
        <rect width="320" height="272" fill="#000066" />
        <circle cx="160" cy="136" r="60" fill="#FFCC00" />
        <circle cx="180" cy="136" r="54" fill="#000066" />
      </svg>
    )
  }

  // Belgium / Spa
  if (c.includes('belgi') || c === 'bel') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="213.3" height="480" fill="#000000" />
        <rect x="213.3" width="213.3" height="480" fill="#FDDA24" />
        <rect x="426.6" width="213.4" height="480" fill="#EF3340" />
      </svg>
    )
  }

  // Bahrain / Sakhir
  if (c.includes('bahrain') || c === 'bhr') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="480" fill="#CE1126" />
        <path d="M0 0h160l64 48-64 48 64 48-64 48 64 48-64 48 64 48-64 48 64 48H0z" fill="#FFFFFF" />
      </svg>
    )
  }

  // Saudi Arabia
  if (c.includes('saudi') || c === 'sau') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="480" fill="#006C35" />
        <path d="M180 280h280v14H180z" fill="#FFFFFF" />
        <text x="320" y="240" textAnchor="middle" fill="#FFFFFF" fontSize="64" fontFamily="sans-serif" fontWeight="bold">KSA</text>
      </svg>
    )
  }

  // China / Chinese (Shanghai)
  if (c.includes('china') || c.includes('chinese') || c === 'chn') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="480" fill="#EE1C25" />
        <polygon points="120,60 135,105 180,105 144,132 158,175 120,148 82,175 96,132 60,105 105,105" fill="#FFFF00" />
      </svg>
    )
  }

  // Austria / Austrian (Red Bull Ring)
  if (c.includes('austria') || c === 'aut') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="160" fill="#ED2939" />
        <rect y="160" width="640" height="160" fill="#FFFFFF" />
        <rect y="320" width="640" height="160" fill="#ED2939" />
      </svg>
    )
  }

  // Hungary / Hungarian (Hungaroring)
  if (c.includes('hungar') || c === 'hun') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="160" fill="#CE2939" />
        <rect y="160" width="640" height="160" fill="#FFFFFF" />
        <rect y="320" width="640" height="160" fill="#477050" />
      </svg>
    )
  }

  // Qatar (Lusail)
  if (c.includes('qatar') || c === 'qat') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="480" fill="#8D1B3D" />
        <path d="M0 0h180l60 27-60 27 60 26-60 27 60 27-60 26 60 27-60 27 60 26-60 27 60 27-60 26 60 27-60 27 60 26-60 27 60 27-60 26H0z" fill="#FFFFFF" />
      </svg>
    )
  }

  // UAE / Abu Dhabi
  if (c.includes('uae') || c.includes('emirates') || c.includes('abu dhabi') || c === 'are') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="160" fill="#00732F" />
        <rect y="160" width="640" height="160" fill="#FFFFFF" />
        <rect y="320" width="640" height="160" fill="#000000" />
        <rect width="160" height="480" fill="#FF0000" />
      </svg>
    )
  }

  // Azerbaijan (Baku)
  if (c.includes('azerbaijan') || c === 'aze') {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="160" fill="#00B5E2" />
        <rect y="160" width="640" height="160" fill="#EF3340" />
        <rect y="320" width="640" height="160" fill="#509E2F" />
        <circle cx="320" cy="240" r="40" fill="#FFFFFF" />
        <circle cx="330" cy="240" r="32" fill="#EF3340" />
      </svg>
    )
  }

  // Valid 2-3 letter code fallback pill with high-contrast text
  if (country.length >= 2 && country.length <= 4) {
    return (
      <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="480" rx="40" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="20" />
        <text x="320" y="290" textAnchor="middle" fill="var(--text-muted)" fontSize="180" fontFamily="monospace" fontWeight="bold">
          {country.toUpperCase()}
        </text>
      </svg>
    )
  }

  // Unknown or unmapped: hide slot cleanly
  return null
}
