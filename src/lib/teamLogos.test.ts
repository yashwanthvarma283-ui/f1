import { describe, it, expect } from 'vitest'
import { teamLogos } from './teamLogos'
import { getTeamMeta } from './teams'

describe('Team Logos', () => {
  it('should have a logo entry for every constructor in the 2026 standings', () => {
    // These are the constructorIds from the current 2026 standings
    const currentConstructors = [
      'mercedes',
      'ferrari',
      'mclaren',
      'red_bull',
      'rb',
      'alpine',
      'haas',
      'audi',
      'williams',
      'aston_martin',
      'cadillac'
    ]

    for (const constructorId of currentConstructors) {
      const meta = getTeamMeta(constructorId)
      const logo = teamLogos[meta.id]
      
      expect(logo, `Missing logo mapping for ${meta.id} (constructor: ${constructorId})`).toBeDefined()
      // Either a string is provided for src, or it's explicitly null for "noLogo"
      expect(logo.src === null || typeof logo.src === 'string', `Invalid src for ${meta.id}`).toBe(true)
    }
  })
})
