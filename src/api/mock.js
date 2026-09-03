// Testcontent voor VITE_DEBUG, in dezelfde vorm als normalize() in korfbal.js
// teruggeeft. De reeks dekt bewust de gevallen die de opmaak onderscheidt:
// eigen team thuis en uit, een onderlinge wedstrijd, en bij uitslagen een
// winst, een verlies en een gelijkspel. De lengte is zo gekozen dat één dag
// niet in één story past, zodat ook het doorlopen naar een tweede afbeelding
// zichtbaar wordt.
const FIXTURES = [
  { day: 0, hour: 9, minute: 0, home: 'De Zwaluwen A1', away: 'Fortuna A2', score: [14, 11] },
  { day: 0, hour: 9, minute: 45, home: 'DTS B3', away: 'De Zwaluwen B1', score: [9, 17] },
  { day: 0, hour: 10, minute: 30, home: 'De Zwaluwen C2', away: 'Nikantes C1', score: [8, 12] },
  { day: 0, hour: 11, minute: 15, home: 'De Zwaluwen D1', away: 'De Zwaluwen D2', score: [6, 6] },
  { day: 0, hour: 12, minute: 0, home: 'Sporting Delta 2', away: 'De Zwaluwen 2', score: [19, 19] },
  { day: 0, hour: 12, minute: 45, home: 'De Zwaluwen E1', away: 'ODO E3', score: [10, 4] },
  { day: 0, hour: 13, minute: 30, home: 'Excelsior 4', away: 'De Zwaluwen 4', score: [13, 21] },
  { day: 0, hour: 14, minute: 15, home: 'De Zwaluwen 1', away: 'KCC/SO Natural 1', score: [16, 18] },
  { day: 0, hour: 15, minute: 0, home: 'De Zwaluwen F1', away: 'Vitesse F2', score: [7, 5] },
  { day: 0, hour: 15, minute: 45, home: 'Achilles 5', away: 'De Zwaluwen 5', score: [11, 12] },
  { day: 0, hour: 16, minute: 30, home: 'De Zwaluwen A2', away: 'Sperwers A1', score: [15, 9] },
  { day: 0, hour: 17, minute: 15, home: 'De Zwaluwen 3', away: 'Oranje Nassau 2', score: [20, 13] },
  { day: 0, hour: 18, minute: 0, home: 'Die Haghe 3', away: 'De Zwaluwen B2', score: [8, 8] },
  { day: 0, hour: 18, minute: 45, home: 'De Zwaluwen C1', away: 'Weidevogels C2', score: [12, 10] },
  { day: 0, hour: 19, minute: 30, home: 'ODO 2', away: 'De Zwaluwen 6', score: [17, 14] },
  { day: 0, hour: 20, minute: 15, home: 'De Zwaluwen 7', away: 'Rowdies 3', score: [9, 16] },
  { day: 1, hour: 9, minute: 30, home: 'De Zwaluwen D3', away: 'Fortuna D4', score: [5, 3] },
  { day: 1, hour: 10, minute: 45, home: 'Nikantes 4', away: 'De Zwaluwen 8', score: [10, 10] },
  { day: 1, hour: 12, minute: 0, home: 'De Zwaluwen E2', away: 'DTS E1', score: [6, 11] },
  { day: 1, hour: 13, minute: 15, home: 'De Zwaluwen 9', away: 'Sporting Delta 5', score: [18, 12] },
  { day: 1, hour: 14, minute: 30, home: 'Vitesse 2', away: 'De Zwaluwen A3', score: [14, 15] },
  { day: 1, hour: 15, minute: 45, home: 'De Zwaluwen B4', away: 'Excelsior B2', score: [7, 7] },
]

function dayStart(dateFrom, offset) {
  const [year, month, day] = dateFrom.split('-').map(Number)
  return new Date(year, month - 1, day + offset)
}

/**
 * @param {'program'|'results'} kind
 * @param {string} dateFrom yyyy-mm-dd, bepaalt op welke dagen de reeks valt
 * @returns {{matches: object[], raw: object[]}}
 */
export function mockMatches(kind, dateFrom) {
  const matches = FIXTURES.map((fixture, index) => {
    const date = dayStart(dateFrom, fixture.day)
    date.setHours(fixture.hour, fixture.minute)
    return {
      id: `mock-${index}`,
      date,
      home: fixture.home,
      away: fixture.away,
      isHomeClub: fixture.home.startsWith('De Zwaluwen'),
      isAwayClub: fixture.away.startsWith('De Zwaluwen'),
      facility: 'Sporthal De Vliegers',
      city: 'Vlaardingen',
      field: 'Veld 1',
      pool: 'Poule A',
      score: kind === 'results' ? { home: fixture.score[0], away: fixture.score[1] } : null,
    }
  })
  return { matches, raw: [] }
}
