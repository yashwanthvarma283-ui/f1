/**
 * Registry of Formula 1 constructors and livery color tokens.
 * Adheres to SRP & OCP: single source of truth for constructor metadata,
 * easily extensible without altering UI rendering components.
 */

export interface TeamMeta {
  id: string
  name: string
  shortName: string
  color: string // Primary accent hex
  secondaryColor?: string
  contrastTextColor: '#ffffff' | '#09090b'
}

export const F1_TEAMS: Record<string, TeamMeta> = {
  mercedes: {
    id: 'mercedes',
    name: 'Mercedes-AMG PETRONAS',
    shortName: 'Mercedes',
    color: '#00D2BE',
    secondaryColor: '#000000',
    contrastTextColor: '#09090b',
  },
  ferrari: {
    id: 'ferrari',
    name: 'Scuderia Ferrari HP',
    shortName: 'Ferrari',
    color: '#E80020',
    secondaryColor: '#FFF200',
    contrastTextColor: '#ffffff',
  },
  mclaren: {
    id: 'mclaren',
    name: 'McLaren Formula 1 Team',
    shortName: 'McLaren',
    color: '#FF8000',
    secondaryColor: '#47C7FC',
    contrastTextColor: '#09090b',
  },
  red_bull: {
    id: 'red_bull',
    name: 'Oracle Red Bull Racing',
    shortName: 'Red Bull',
    color: '#3671C6',
    secondaryColor: '#CC1E4A',
    contrastTextColor: '#ffffff',
  },
  rb: {
    id: 'rb',
    name: 'Visa Cash App RB',
    shortName: 'Racing Bulls',
    color: '#6692FF',
    secondaryColor: '#FFFFFF',
    contrastTextColor: '#ffffff',
  },
  aston_martin: {
    id: 'aston_martin',
    name: 'Aston Martin Aramco',
    shortName: 'Aston Martin',
    color: '#229971',
    secondaryColor: '#CEDC00',
    contrastTextColor: '#ffffff',
  },
  alpine: {
    id: 'alpine',
    name: 'BWT Alpine F1 Team',
    shortName: 'Alpine',
    color: '#0093CC',
    secondaryColor: '#FD4BC7',
    contrastTextColor: '#ffffff',
  },
  haas: {
    id: 'haas',
    name: 'MoneyGram Haas F1 Team',
    shortName: 'Haas',
    color: '#B6BABD',
    secondaryColor: '#E6002B',
    contrastTextColor: '#09090b',
  },
  audi: {
    id: 'audi',
    name: 'Audi Revolut F1 Team',
    shortName: 'Audi',
    color: '#F50537',
    secondaryColor: '#000000',
    contrastTextColor: '#ffffff',
  },
  williams: {
    id: 'williams',
    name: 'Williams Racing',
    shortName: 'Williams',
    color: '#64C4FF',
    secondaryColor: '#00A0DE',
    contrastTextColor: '#09090b',
  },
  cadillac: {
    id: 'cadillac',
    name: 'Cadillac Formula 1 Team',
    shortName: 'Cadillac',
    color: '#D4AF37',
    secondaryColor: '#1A1A1A',
    contrastTextColor: '#09090b',
  },
  sauber: {
    id: 'sauber',
    name: 'Stake F1 Team Kick Sauber',
    shortName: 'Sauber',
    color: '#52E252',
    contrastTextColor: '#09090b',
  },
}

/**
 * Returns team metadata by constructorId with reliable fallback.
 */
export function getTeamMeta(constructorId?: string): TeamMeta {
  if (!constructorId) {
    return {
      id: 'unknown',
      name: 'Independent',
      shortName: 'F1',
      color: '#E10600',
      contrastTextColor: '#ffffff',
    }
  }

  const lower = constructorId.toLowerCase()
  if (lower.includes('red bull') || lower.includes('red_bull')) return F1_TEAMS.red_bull
  if (lower.includes('ferrari')) return F1_TEAMS.ferrari
  if (lower.includes('mclaren')) return F1_TEAMS.mclaren
  if (lower.includes('mercedes')) return F1_TEAMS.mercedes
  if (lower.includes('aston')) return F1_TEAMS.aston_martin
  if (lower.includes('alpine')) return F1_TEAMS.alpine
  if (lower.includes('williams')) return F1_TEAMS.williams
  if (lower.includes('haas')) return F1_TEAMS.haas
  if (lower.includes('sauber') || lower.includes('kick') || lower.includes('stake')) return F1_TEAMS.sauber
  if (lower.includes('rb') || lower.includes('racing bulls') || lower.includes('cash app') || lower.includes('toro rosso') || lower.includes('alphatauri')) return F1_TEAMS.rb

  const normalized = lower.replace(/[^a-z0-9_]/g, '_')
  return (
    F1_TEAMS[normalized] || {
      id: constructorId,
      name: constructorId.charAt(0).toUpperCase() + constructorId.slice(1),
      shortName: constructorId.toUpperCase(),
      color: '#E10600',
      contrastTextColor: '#ffffff',
    }
  )
}
