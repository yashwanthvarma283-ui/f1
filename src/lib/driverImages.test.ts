import { describe, it, expect } from 'vitest'
import { driverHeadshots, missingPhotos, getDriverImage } from './driverImages'
import driverstandings from './driverstandings.json'

describe('driverImages', () => {
  it('every driver in the current standings either has an image or is explicitly marked as missing', () => {
    const standingsList = driverstandings.MRData.StandingsTable.StandingsLists[0]
    const drivers = standingsList.DriverStandings

    drivers.forEach((standing: any) => {
      const driverId = standing.Driver.driverId
      
      const hasImage = !!driverHeadshots[driverId]
      const isMissing = missingPhotos.includes(driverId)
      
      expect(hasImage || isMissing, `Driver ${driverId} is neither mapped to an image nor listed in missingPhotos`).toBe(true)
      expect(!(hasImage && isMissing), `Driver ${driverId} cannot be both mapped to an image and listed in missingPhotos`).toBe(true)
    })
  })
})
