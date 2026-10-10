import { jolpicaClient } from './src/api/jolpicaClient.js'

async function run() {
  const drivers = await jolpicaClient.getDriverStandings('current')
  console.log("DRIVERS:")
  drivers.forEach(d => {
    console.log(`${d.driver.driverId} - #${d.driver.permanentNumber} - ${d.driver.givenName} ${d.driver.familyName}`)
  })
  
  const constructors = await jolpicaClient.getConstructorStandings('current')
  console.log("\nCONSTRUCTORS:")
  constructors.forEach(c => {
    console.log(`${c.constructor.constructorId} - ${c.constructor.name}`)
  })
}

run().catch(console.error)
