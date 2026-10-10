fetch('https://api.jolpi.ca/ergast/f1/current/driverstandings.json')
  .then(r => r.json())
  .then(d => {
    const list = d.MRData.StandingsTable.StandingsLists[0].DriverStandings;
    console.log("Driver ID | Code | Number | Given Name | Family Name | Constructor");
    console.log("---|---|---|---|---|---");
    list.forEach(s => {
      console.log(`${s.Driver.driverId} | ${s.Driver.code} | ${s.Driver.permanentNumber} | ${s.Driver.givenName} | ${s.Driver.familyName} | ${s.Constructors[0].constructorId}`);
    });
  });
