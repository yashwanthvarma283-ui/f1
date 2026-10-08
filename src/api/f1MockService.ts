import {
  SessionDataset,
  RaceResultEntry,
  DriverSessionInfo,
  LapData,
  LapPositionSnapshot,
  LapDriverPosition,
  OvertakeEvent,
  StintData,
  PitStopData,
  DriverTyreLapState,
  DriverRaceSummaryStats,
  TeamRadioClip,
  RaceControlMessage,
  WeatherSnapshot,
  LapFeedEntry,
  RaceDetailMeta,
} from '../types/data'
import { getTeamMeta } from '../lib/teams'

export interface SeasonDriver {
  number: number
  code: string
  firstName: string
  lastName: string
  teamName: string
  teamColor: string
  countryCode: string
  skillRating: number // 1 to 100, used for deterministic realistic relative pace
}

export const SEASON_ROSTERS: Record<number, SeasonDriver[]> = {
  2018: [
    { number: 44, code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', teamName: 'Mercedes', teamColor: '#00D2BE', countryCode: 'GBR', skillRating: 98 },
    { number: 5, code: 'VET', firstName: 'Sebastian', lastName: 'Vettel', teamName: 'Ferrari', teamColor: '#E80020', countryCode: 'GER', skillRating: 97 },
    { number: 7, code: 'RAI', firstName: 'Kimi', lastName: 'Räikkönen', teamName: 'Ferrari', teamColor: '#E80020', countryCode: 'FIN', skillRating: 92 },
    { number: 77, code: 'BOT', firstName: 'Valtteri', lastName: 'Bottas', teamName: 'Mercedes', teamColor: '#00D2BE', countryCode: 'FIN', skillRating: 91 },
    { number: 33, code: 'VER', firstName: 'Max', lastName: 'Verstappen', teamName: 'Red Bull Racing', teamColor: '#3671C6', countryCode: 'NED', skillRating: 94 },
    { number: 3, code: 'RIC', firstName: 'Daniel', lastName: 'Ricciardo', teamName: 'Red Bull Racing', teamColor: '#3671C6', countryCode: 'AUS', skillRating: 93 },
    { number: 27, code: 'HUL', firstName: 'Nico', lastName: 'Hülkenberg', teamName: 'Renault', teamColor: '#FFF500', countryCode: 'GER', skillRating: 87 },
    { number: 55, code: 'SAI', firstName: 'Carlos', lastName: 'Sainz', teamName: 'Renault', teamColor: '#FFF500', countryCode: 'ESP', skillRating: 86 },
    { number: 11, code: 'PER', firstName: 'Sergio', lastName: 'Perez', teamName: 'Force India', teamColor: '#F596C8', countryCode: 'MEX', skillRating: 86 },
    { number: 31, code: 'OCO', firstName: 'Esteban', lastName: 'Ocon', teamName: 'Force India', teamColor: '#F596C8', countryCode: 'FRA', skillRating: 85 },
    { number: 14, code: 'ALO', firstName: 'Fernando', lastName: 'Alonso', teamName: 'McLaren', teamColor: '#FF8000', countryCode: 'ESP', skillRating: 90 },
    { number: 2, code: 'VAN', firstName: 'Stoffel', lastName: 'Vandoorne', teamName: 'McLaren', teamColor: '#FF8000', countryCode: 'BEL', skillRating: 80 },
    { number: 8, code: 'GRO', firstName: 'Romain', lastName: 'Grosjean', teamName: 'Haas F1 Team', teamColor: '#B6BABD', countryCode: 'FRA', skillRating: 83 },
    { number: 20, code: 'MAG', firstName: 'Kevin', lastName: 'Magnussen', teamName: 'Haas F1 Team', teamColor: '#B6BABD', countryCode: 'DEN', skillRating: 84 },
    { number: 10, code: 'GAS', firstName: 'Pierre', lastName: 'Gasly', teamName: 'Scuderia Toro Rosso', teamColor: '#469BFF', countryCode: 'FRA', skillRating: 84 },
    { number: 28, code: 'HAR', firstName: 'Brendon', lastName: 'Hartley', teamName: 'Scuderia Toro Rosso', teamColor: '#469BFF', countryCode: 'NZL', skillRating: 78 },
    { number: 16, code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', teamName: 'Sauber', teamColor: '#900000', countryCode: 'MON', skillRating: 88 },
    { number: 9, code: 'ERI', firstName: 'Marcus', lastName: 'Ericsson', teamName: 'Sauber', teamColor: '#900000', countryCode: 'SWE', skillRating: 77 },
    { number: 18, code: 'STR', firstName: 'Lance', lastName: 'Stroll', teamName: 'Williams', teamColor: '#64C4FF', countryCode: 'CAN', skillRating: 79 },
    { number: 35, code: 'SIR', firstName: 'Sergey', lastName: 'Sirotkin', teamName: 'Williams', teamColor: '#64C4FF', countryCode: 'RUS', skillRating: 75 },
  ],
  2019: [
    { number: 44, code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', teamName: 'Mercedes', teamColor: '#00D2BE', countryCode: 'GBR', skillRating: 99 },
    { number: 77, code: 'BOT', firstName: 'Valtteri', lastName: 'Bottas', teamName: 'Mercedes', teamColor: '#00D2BE', countryCode: 'FIN', skillRating: 93 },
    { number: 33, code: 'VER', firstName: 'Max', lastName: 'Verstappen', teamName: 'Red Bull Racing', teamColor: '#3671C6', countryCode: 'NED', skillRating: 96 },
    { number: 16, code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', teamName: 'Ferrari', teamColor: '#E80020', countryCode: 'MON', skillRating: 94 },
    { number: 5, code: 'VET', firstName: 'Sebastian', lastName: 'Vettel', teamName: 'Ferrari', teamColor: '#E80020', countryCode: 'GER', skillRating: 94 },
    { number: 55, code: 'SAI', firstName: 'Carlos', lastName: 'Sainz', teamName: 'McLaren', teamColor: '#FF8000', countryCode: 'ESP', skillRating: 89 },
    { number: 10, code: 'GAS', firstName: 'Pierre', lastName: 'Gasly', teamName: 'Toro Rosso', teamColor: '#469BFF', countryCode: 'FRA', skillRating: 86 },
    { number: 23, code: 'ALB', firstName: 'Alexander', lastName: 'Albon', teamName: 'Red Bull Racing', teamColor: '#3671C6', countryCode: 'THA', skillRating: 85 },
    { number: 3, code: 'RIC', firstName: 'Daniel', lastName: 'Ricciardo', teamName: 'Renault', teamColor: '#FFF500', countryCode: 'AUS', skillRating: 88 },
    { number: 11, code: 'PER', firstName: 'Sergio', lastName: 'Perez', teamName: 'Racing Point', teamColor: '#F596C8', countryCode: 'MEX', skillRating: 87 },
    { number: 4, code: 'NOR', firstName: 'Lando', lastName: 'Norris', teamName: 'McLaren', teamColor: '#FF8000', countryCode: 'GBR', skillRating: 88 },
    { number: 7, code: 'RAI', firstName: 'Kimi', lastName: 'Räikkönen', teamName: 'Alfa Romeo Racing', teamColor: '#900000', countryCode: 'FIN', skillRating: 85 },
    { number: 26, code: 'KVY', firstName: 'Daniil', lastName: 'Kvyat', teamName: 'Toro Rosso', teamColor: '#469BFF', countryCode: 'RUS', skillRating: 82 },
    { number: 27, code: 'HUL', firstName: 'Nico', lastName: 'Hülkenberg', teamName: 'Renault', teamColor: '#FFF500', countryCode: 'GER', skillRating: 84 },
    { number: 18, code: 'STR', firstName: 'Lance', lastName: 'Stroll', teamName: 'Racing Point', teamColor: '#F596C8', countryCode: 'CAN', skillRating: 80 },
    { number: 20, code: 'MAG', firstName: 'Kevin', lastName: 'Magnussen', teamName: 'Haas F1 Team', teamColor: '#B6BABD', countryCode: 'DEN', skillRating: 81 },
    { number: 99, code: 'GIO', firstName: 'Antonio', lastName: 'Giovinazzi', teamName: 'Alfa Romeo Racing', teamColor: '#900000', countryCode: 'ITA', skillRating: 79 },
    { number: 8, code: 'GRO', firstName: 'Romain', lastName: 'Grosjean', teamName: 'Haas F1 Team', teamColor: '#B6BABD', countryCode: 'FRA', skillRating: 80 },
    { number: 88, code: 'KUB', firstName: 'Robert', lastName: 'Kubica', teamName: 'Williams', teamColor: '#64C4FF', countryCode: 'POL', skillRating: 74 },
    { number: 63, code: 'RUS', firstName: 'George', lastName: 'Russell', teamName: 'Williams', teamColor: '#64C4FF', countryCode: 'GBR', skillRating: 82 },
  ],
  2020: [
    { number: 44, code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', teamName: 'Mercedes', teamColor: '#00D2BE', countryCode: 'GBR', skillRating: 99 },
    { number: 77, code: 'BOT', firstName: 'Valtteri', lastName: 'Bottas', teamName: 'Mercedes', teamColor: '#00D2BE', countryCode: 'FIN', skillRating: 94 },
    { number: 33, code: 'VER', firstName: 'Max', lastName: 'Verstappen', teamName: 'Red Bull Racing', teamColor: '#3671C6', countryCode: 'NED', skillRating: 97 },
    { number: 11, code: 'PER', firstName: 'Sergio', lastName: 'Perez', teamName: 'Racing Point', teamColor: '#F596C8', countryCode: 'MEX', skillRating: 90 },
    { number: 3, code: 'RIC', firstName: 'Daniel', lastName: 'Ricciardo', teamName: 'Renault', teamColor: '#FFF500', countryCode: 'AUS', skillRating: 90 },
    { number: 55, code: 'SAI', firstName: 'Carlos', lastName: 'Sainz', teamName: 'McLaren', teamColor: '#FF8000', countryCode: 'ESP', skillRating: 91 },
    { number: 23, code: 'ALB', firstName: 'Alexander', lastName: 'Albon', teamName: 'Red Bull Racing', teamColor: '#3671C6', countryCode: 'THA', skillRating: 86 },
    { number: 16, code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', teamName: 'Ferrari', teamColor: '#E80020', countryCode: 'MON', skillRating: 93 },
    { number: 4, code: 'NOR', firstName: 'Lando', lastName: 'Norris', teamName: 'McLaren', teamColor: '#FF8000', countryCode: 'GBR', skillRating: 90 },
    { number: 10, code: 'GAS', firstName: 'Pierre', lastName: 'Gasly', teamName: 'AlphaTauri', teamColor: '#5E8FAA', countryCode: 'FRA', skillRating: 89 },
    { number: 18, code: 'STR', firstName: 'Lance', lastName: 'Stroll', teamName: 'Racing Point', teamColor: '#F596C8', countryCode: 'CAN', skillRating: 84 },
    { number: 31, code: 'OCO', firstName: 'Esteban', lastName: 'Ocon', teamName: 'Renault', teamColor: '#FFF500', countryCode: 'FRA', skillRating: 85 },
    { number: 5, code: 'VET', firstName: 'Sebastian', lastName: 'Vettel', teamName: 'Ferrari', teamColor: '#E80020', countryCode: 'GER', skillRating: 87 },
    { number: 26, code: 'KVY', firstName: 'Daniil', lastName: 'Kvyat', teamName: 'AlphaTauri', teamColor: '#5E8FAA', countryCode: 'RUS', skillRating: 82 },
    { number: 27, code: 'HUL', firstName: 'Nico', lastName: 'Hülkenberg', teamName: 'Racing Point', teamColor: '#F596C8', countryCode: 'GER', skillRating: 83 },
    { number: 7, code: 'RAI', firstName: 'Kimi', lastName: 'Räikkönen', teamName: 'Alfa Romeo Racing', teamColor: '#900000', countryCode: 'FIN', skillRating: 82 },
    { number: 99, code: 'GIO', firstName: 'Antonio', lastName: 'Giovinazzi', teamName: 'Alfa Romeo Racing', teamColor: '#900000', countryCode: 'ITA', skillRating: 80 },
    { number: 63, code: 'RUS', firstName: 'George', lastName: 'Russell', teamName: 'Williams', teamColor: '#64C4FF', countryCode: 'GBR', skillRating: 85 },
    { number: 8, code: 'GRO', firstName: 'Romain', lastName: 'Grosjean', teamName: 'Haas F1 Team', teamColor: '#B6BABD', countryCode: 'FRA', skillRating: 80 },
    { number: 20, code: 'MAG', firstName: 'Kevin', lastName: 'Magnussen', teamName: 'Haas F1 Team', teamColor: '#B6BABD', countryCode: 'DEN', skillRating: 81 },
  ],
  2021: [
    { number: 33, code: 'VER', firstName: 'Max', lastName: 'Verstappen', teamName: 'Red Bull Racing', teamColor: '#3671C6', countryCode: 'NED', skillRating: 99 },
    { number: 44, code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', teamName: 'Mercedes', teamColor: '#00D2BE', countryCode: 'GBR', skillRating: 99 },
    { number: 77, code: 'BOT', firstName: 'Valtteri', lastName: 'Bottas', teamName: 'Mercedes', teamColor: '#00D2BE', countryCode: 'FIN', skillRating: 93 },
    { number: 11, code: 'PER', firstName: 'Sergio', lastName: 'Perez', teamName: 'Red Bull Racing', teamColor: '#3671C6', countryCode: 'MEX', skillRating: 92 },
    { number: 55, code: 'SAI', firstName: 'Carlos', lastName: 'Sainz', teamName: 'Ferrari', teamColor: '#E80020', countryCode: 'ESP', skillRating: 92 },
    { number: 4, code: 'NOR', firstName: 'Lando', lastName: 'Norris', teamName: 'McLaren', teamColor: '#FF8000', countryCode: 'GBR', skillRating: 93 },
    { number: 16, code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', teamName: 'Ferrari', teamColor: '#E80020', countryCode: 'MON', skillRating: 94 },
    { number: 3, code: 'RIC', firstName: 'Daniel', lastName: 'Ricciardo', teamName: 'McLaren', teamColor: '#FF8000', countryCode: 'AUS', skillRating: 88 },
    { number: 10, code: 'GAS', firstName: 'Pierre', lastName: 'Gasly', teamName: 'AlphaTauri', teamColor: '#5E8FAA', countryCode: 'FRA', skillRating: 89 },
    { number: 14, code: 'ALO', firstName: 'Fernando', lastName: 'Alonso', teamName: 'Alpine', teamColor: '#0093CC', countryCode: 'ESP', skillRating: 90 },
    { number: 31, code: 'OCO', firstName: 'Esteban', lastName: 'Ocon', teamName: 'Alpine', teamColor: '#0093CC', countryCode: 'FRA', skillRating: 87 },
    { number: 5, code: 'VET', firstName: 'Sebastian', lastName: 'Vettel', teamName: 'Aston Martin', teamColor: '#229971', countryCode: 'GER', skillRating: 88 },
    { number: 18, code: 'STR', firstName: 'Lance', lastName: 'Stroll', teamName: 'Aston Martin', teamColor: '#229971', countryCode: 'CAN', skillRating: 83 },
    { number: 22, code: 'TSU', firstName: 'Yuki', lastName: 'Tsunoda', teamName: 'AlphaTauri', teamColor: '#5E8FAA', countryCode: 'JPN', skillRating: 83 },
    { number: 63, code: 'RUS', firstName: 'George', lastName: 'Russell', teamName: 'Williams', teamColor: '#64C4FF', countryCode: 'GBR', skillRating: 89 },
    { number: 7, code: 'RAI', firstName: 'Kimi', lastName: 'Räikkönen', teamName: 'Alfa Romeo Racing', teamColor: '#900000', countryCode: 'FIN', skillRating: 81 },
    { number: 6, code: 'LAT', firstName: 'Nicholas', lastName: 'Latifi', teamName: 'Williams', teamColor: '#64C4FF', countryCode: 'CAN', skillRating: 75 },
    { number: 99, code: 'GIO', firstName: 'Antonio', lastName: 'Giovinazzi', teamName: 'Alfa Romeo Racing', teamColor: '#900000', countryCode: 'ITA', skillRating: 80 },
    { number: 47, code: 'MSC', firstName: 'Mick', lastName: 'Schumacher', teamName: 'Haas F1 Team', teamColor: '#B6BABD', countryCode: 'GER', skillRating: 78 },
    { number: 9, code: 'MAZ', firstName: 'Nikita', lastName: 'Mazepin', teamName: 'Haas F1 Team', teamColor: '#B6BABD', countryCode: 'RUS', skillRating: 70 },
  ],
  2022: [
    { number: 1, code: 'VER', firstName: 'Max', lastName: 'Verstappen', teamName: 'Red Bull Racing', teamColor: '#3671C6', countryCode: 'NED', skillRating: 99 },
    { number: 16, code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', teamName: 'Ferrari', teamColor: '#E80020', countryCode: 'MON', skillRating: 96 },
    { number: 11, code: 'PER', firstName: 'Sergio', lastName: 'Perez', teamName: 'Red Bull Racing', teamColor: '#3671C6', countryCode: 'MEX', skillRating: 92 },
    { number: 63, code: 'RUS', firstName: 'George', lastName: 'Russell', teamName: 'Mercedes', teamColor: '#00D2BE', countryCode: 'GBR', skillRating: 94 },
    { number: 55, code: 'SAI', firstName: 'Carlos', lastName: 'Sainz', teamName: 'Ferrari', teamColor: '#E80020', countryCode: 'ESP', skillRating: 93 },
    { number: 44, code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', teamName: 'Mercedes', teamColor: '#00D2BE', countryCode: 'GBR', skillRating: 96 },
    { number: 4, code: 'NOR', firstName: 'Lando', lastName: 'Norris', teamName: 'McLaren', teamColor: '#FF8000', countryCode: 'GBR', skillRating: 93 },
    { number: 31, code: 'OCO', firstName: 'Esteban', lastName: 'Ocon', teamName: 'Alpine', teamColor: '#0093CC', countryCode: 'FRA', skillRating: 88 },
    { number: 14, code: 'ALO', firstName: 'Fernando', lastName: 'Alonso', teamName: 'Alpine', teamColor: '#0093CC', countryCode: 'ESP', skillRating: 91 },
    { number: 77, code: 'BOT', firstName: 'Valtteri', lastName: 'Bottas', teamName: 'Alfa Romeo', teamColor: '#900000', countryCode: 'FIN', skillRating: 87 },
    { number: 3, code: 'RIC', firstName: 'Daniel', lastName: 'Ricciardo', teamName: 'McLaren', teamColor: '#FF8000', countryCode: 'AUS', skillRating: 84 },
    { number: 5, code: 'VET', firstName: 'Sebastian', lastName: 'Vettel', teamName: 'Aston Martin', teamColor: '#229971', countryCode: 'GER', skillRating: 87 },
    { number: 20, code: 'MAG', firstName: 'Kevin', lastName: 'Magnussen', teamName: 'Haas F1 Team', teamColor: '#B6BABD', countryCode: 'DEN', skillRating: 84 },
    { number: 10, code: 'GAS', firstName: 'Pierre', lastName: 'Gasly', teamName: 'AlphaTauri', teamColor: '#5E8FAA', countryCode: 'FRA', skillRating: 86 },
    { number: 18, code: 'STR', firstName: 'Lance', lastName: 'Stroll', teamName: 'Aston Martin', teamColor: '#229971', countryCode: 'CAN', skillRating: 83 },
    { number: 47, code: 'MSC', firstName: 'Mick', lastName: 'Schumacher', teamName: 'Haas F1 Team', teamColor: '#B6BABD', countryCode: 'GER', skillRating: 81 },
    { number: 22, code: 'TSU', firstName: 'Yuki', lastName: 'Tsunoda', teamName: 'AlphaTauri', teamColor: '#5E8FAA', countryCode: 'JPN', skillRating: 83 },
    { number: 24, code: 'ZHO', firstName: 'Guanyu', lastName: 'Zhou', teamName: 'Alfa Romeo', teamColor: '#900000', countryCode: 'CHN', skillRating: 80 },
    { number: 23, code: 'ALB', firstName: 'Alexander', lastName: 'Albon', teamName: 'Williams', teamColor: '#64C4FF', countryCode: 'THA', skillRating: 85 },
    { number: 6, code: 'LAT', firstName: 'Nicholas', lastName: 'Latifi', teamName: 'Williams', teamColor: '#64C4FF', countryCode: 'CAN', skillRating: 75 },
  ],
  2023: [
    { number: 1, code: 'VER', firstName: 'Max', lastName: 'Verstappen', teamName: 'Red Bull Racing', teamColor: '#3671C6', countryCode: 'NED', skillRating: 99 },
    { number: 11, code: 'PER', firstName: 'Sergio', lastName: 'Perez', teamName: 'Red Bull Racing', teamColor: '#3671C6', countryCode: 'MEX', skillRating: 91 },
    { number: 44, code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', teamName: 'Mercedes', teamColor: '#00D2BE', countryCode: 'GBR', skillRating: 96 },
    { number: 14, code: 'ALO', firstName: 'Fernando', lastName: 'Alonso', teamName: 'Aston Martin', teamColor: '#229971', countryCode: 'ESP', skillRating: 95 },
    { number: 16, code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', teamName: 'Ferrari', teamColor: '#E80020', countryCode: 'MON', skillRating: 95 },
    { number: 4, code: 'NOR', firstName: 'Lando', lastName: 'Norris', teamName: 'McLaren', teamColor: '#FF8000', countryCode: 'GBR', skillRating: 95 },
    { number: 55, code: 'SAI', firstName: 'Carlos', lastName: 'Sainz', teamName: 'Ferrari', teamColor: '#E80020', countryCode: 'ESP', skillRating: 93 },
    { number: 63, code: 'RUS', firstName: 'George', lastName: 'Russell', teamName: 'Mercedes', teamColor: '#00D2BE', countryCode: 'GBR', skillRating: 93 },
    { number: 81, code: 'PIA', firstName: 'Oscar', lastName: 'Piastri', teamName: 'McLaren', teamColor: '#FF8000', countryCode: 'AUS', skillRating: 91 },
    { number: 18, code: 'STR', firstName: 'Lance', lastName: 'Stroll', teamName: 'Aston Martin', teamColor: '#229971', countryCode: 'CAN', skillRating: 83 },
    { number: 10, code: 'GAS', firstName: 'Pierre', lastName: 'Gasly', teamName: 'Alpine', teamColor: '#0093CC', countryCode: 'FRA', skillRating: 87 },
    { number: 31, code: 'OCO', firstName: 'Esteban', lastName: 'Ocon', teamName: 'Alpine', teamColor: '#0093CC', countryCode: 'FRA', skillRating: 87 },
    { number: 23, code: 'ALB', firstName: 'Alexander', lastName: 'Albon', teamName: 'Williams', teamColor: '#64C4FF', countryCode: 'THA', skillRating: 88 },
    { number: 22, code: 'TSU', firstName: 'Yuki', lastName: 'Tsunoda', teamName: 'AlphaTauri', teamColor: '#5E8FAA', countryCode: 'JPN', skillRating: 84 },
    { number: 77, code: 'BOT', firstName: 'Valtteri', lastName: 'Bottas', teamName: 'Alfa Romeo', teamColor: '#900000', countryCode: 'FIN', skillRating: 85 },
    { number: 27, code: 'HUL', firstName: 'Nico', lastName: 'Hülkenberg', teamName: 'Haas F1 Team', teamColor: '#B6BABD', countryCode: 'GER', skillRating: 84 },
    { number: 3, code: 'RIC', firstName: 'Daniel', lastName: 'Ricciardo', teamName: 'AlphaTauri', teamColor: '#5E8FAA', countryCode: 'AUS', skillRating: 84 },
    { number: 24, code: 'ZHO', firstName: 'Guanyu', lastName: 'Zhou', teamName: 'Alfa Romeo', teamColor: '#900000', countryCode: 'CHN', skillRating: 81 },
    { number: 20, code: 'MAG', firstName: 'Kevin', lastName: 'Magnussen', teamName: 'Haas F1 Team', teamColor: '#B6BABD', countryCode: 'DEN', skillRating: 82 },
    { number: 2, code: 'SAR', firstName: 'Logan', lastName: 'Sargeant', teamName: 'Williams', teamColor: '#64C4FF', countryCode: 'USA', skillRating: 77 },
  ],
  2024: [
    { number: 1, code: 'VER', firstName: 'Max', lastName: 'Verstappen', teamName: 'Oracle Red Bull Racing', teamColor: '#3671C6', countryCode: 'NED', skillRating: 99 },
    { number: 4, code: 'NOR', firstName: 'Lando', lastName: 'Norris', teamName: 'McLaren Formula 1 Team', teamColor: '#FF8000', countryCode: 'GBR', skillRating: 97 },
    { number: 16, code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', teamName: 'Scuderia Ferrari HP', teamColor: '#E80020', countryCode: 'MON', skillRating: 96 },
    { number: 81, code: 'PIA', firstName: 'Oscar', lastName: 'Piastri', teamName: 'McLaren Formula 1 Team', teamColor: '#FF8000', countryCode: 'AUS', skillRating: 95 },
    { number: 55, code: 'SAI', firstName: 'Carlos', lastName: 'Sainz', teamName: 'Scuderia Ferrari HP', teamColor: '#E80020', countryCode: 'ESP', skillRating: 94 },
    { number: 63, code: 'RUS', firstName: 'George', lastName: 'Russell', teamName: 'Mercedes-AMG PETRONAS', teamColor: '#00D2BE', countryCode: 'GBR', skillRating: 94 },
    { number: 44, code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', teamName: 'Mercedes-AMG PETRONAS', teamColor: '#00D2BE', countryCode: 'GBR', skillRating: 95 },
    { number: 11, code: 'PER', firstName: 'Sergio', lastName: 'Perez', teamName: 'Oracle Red Bull Racing', teamColor: '#3671C6', countryCode: 'MEX', skillRating: 89 },
    { number: 14, code: 'ALO', firstName: 'Fernando', lastName: 'Alonso', teamName: 'Aston Martin Aramco', teamColor: '#229971', countryCode: 'ESP', skillRating: 91 },
    { number: 27, code: 'HUL', firstName: 'Nico', lastName: 'Hülkenberg', teamName: 'MoneyGram Haas F1 Team', teamColor: '#B6BABD', countryCode: 'GER', skillRating: 87 },
    { number: 22, code: 'TSU', firstName: 'Yuki', lastName: 'Tsunoda', teamName: 'Visa Cash App RB', teamColor: '#6692FF', countryCode: 'JPN', skillRating: 86 },
    { number: 18, code: 'STR', firstName: 'Lance', lastName: 'Stroll', teamName: 'Aston Martin Aramco', teamColor: '#229971', countryCode: 'CAN', skillRating: 84 },
    { number: 31, code: 'OCO', firstName: 'Esteban', lastName: 'Ocon', teamName: 'BWT Alpine F1 Team', teamColor: '#0093CC', countryCode: 'FRA', skillRating: 85 },
    { number: 20, code: 'MAG', firstName: 'Kevin', lastName: 'Magnussen', teamName: 'MoneyGram Haas F1 Team', teamColor: '#B6BABD', countryCode: 'DEN', skillRating: 83 },
    { number: 10, code: 'GAS', firstName: 'Pierre', lastName: 'Gasly', teamName: 'BWT Alpine F1 Team', teamColor: '#0093CC', countryCode: 'FRA', skillRating: 86 },
    { number: 23, code: 'ALB', firstName: 'Alexander', lastName: 'Albon', teamName: 'Williams Racing', teamColor: '#64C4FF', countryCode: 'THA', skillRating: 87 },
    { number: 43, code: 'COL', firstName: 'Franco', lastName: 'Colapinto', teamName: 'Williams Racing', teamColor: '#64C4FF', countryCode: 'ARG', skillRating: 84 },
    { number: 30, code: 'LAW', firstName: 'Liam', lastName: 'Lawson', teamName: 'Visa Cash App RB', teamColor: '#6692FF', countryCode: 'NZL', skillRating: 84 },
    { number: 77, code: 'BOT', firstName: 'Valtteri', lastName: 'Bottas', teamName: 'Stake F1 Team Kick Sauber', teamColor: '#52E252', countryCode: 'FIN', skillRating: 83 },
    { number: 24, code: 'ZHO', firstName: 'Guanyu', lastName: 'Zhou', teamName: 'Stake F1 Team Kick Sauber', teamColor: '#52E252', countryCode: 'CHN', skillRating: 80 },
  ],
  2025: [
    { number: 4, code: 'NOR', firstName: 'Lando', lastName: 'Norris', teamName: 'McLaren Formula 1 Team', teamColor: '#FF8000', countryCode: 'GBR', skillRating: 98 },
    { number: 81, code: 'PIA', firstName: 'Oscar', lastName: 'Piastri', teamName: 'McLaren Formula 1 Team', teamColor: '#FF8000', countryCode: 'AUS', skillRating: 96 },
    { number: 16, code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', teamName: 'Scuderia Ferrari HP', teamColor: '#E80020', countryCode: 'MON', skillRating: 97 },
    { number: 44, code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', teamName: 'Scuderia Ferrari HP', teamColor: '#E80020', countryCode: 'GBR', skillRating: 97 },
    { number: 1, code: 'VER', firstName: 'Max', lastName: 'Verstappen', teamName: 'Oracle Red Bull Racing', teamColor: '#3671C6', countryCode: 'NED', skillRating: 99 },
    { number: 63, code: 'RUS', firstName: 'George', lastName: 'Russell', teamName: 'Mercedes-AMG PETRONAS', teamColor: '#00D2BE', countryCode: 'GBR', skillRating: 95 },
    { number: 12, code: 'ANT', firstName: 'Kimi', lastName: 'Antonelli', teamName: 'Mercedes-AMG PETRONAS', teamColor: '#00D2BE', countryCode: 'ITA', skillRating: 89 },
    { number: 55, code: 'SAI', firstName: 'Carlos', lastName: 'Sainz', teamName: 'Williams Racing', teamColor: '#64C4FF', countryCode: 'ESP', skillRating: 93 },
    { number: 23, code: 'ALB', firstName: 'Alexander', lastName: 'Albon', teamName: 'Williams Racing', teamColor: '#64C4FF', countryCode: 'THA', skillRating: 88 },
    { number: 14, code: 'ALO', firstName: 'Fernando', lastName: 'Alonso', teamName: 'Aston Martin Aramco', teamColor: '#229971', countryCode: 'ESP', skillRating: 91 },
    { number: 18, code: 'STR', firstName: 'Lance', lastName: 'Stroll', teamName: 'Aston Martin Aramco', teamColor: '#229971', countryCode: 'CAN', skillRating: 84 },
    { number: 10, code: 'GAS', firstName: 'Pierre', lastName: 'Gasly', teamName: 'BWT Alpine F1 Team', teamColor: '#0093CC', countryCode: 'FRA', skillRating: 86 },
    { number: 7, code: 'DOO', firstName: 'Jack', lastName: 'Doohan', teamName: 'BWT Alpine F1 Team', teamColor: '#0093CC', countryCode: 'AUS', skillRating: 82 },
    { number: 22, code: 'TSU', firstName: 'Yuki', lastName: 'Tsunoda', teamName: 'Visa Cash App RB', teamColor: '#6692FF', countryCode: 'JPN', skillRating: 86 },
    { number: 30, code: 'LAW', firstName: 'Liam', lastName: 'Lawson', teamName: 'Oracle Red Bull Racing', teamColor: '#3671C6', countryCode: 'NZL', skillRating: 87 },
    { number: 6, code: 'HAD', firstName: 'Isack', lastName: 'Hadjar', teamName: 'Visa Cash App RB', teamColor: '#6692FF', countryCode: 'FRA', skillRating: 84 },
    { number: 87, code: 'BEA', firstName: 'Oliver', lastName: 'Bearman', teamName: 'MoneyGram Haas F1 Team', teamColor: '#B6BABD', countryCode: 'GBR', skillRating: 86 },
    { number: 31, code: 'OCO', firstName: 'Esteban', lastName: 'Ocon', teamName: 'MoneyGram Haas F1 Team', teamColor: '#B6BABD', countryCode: 'FRA', skillRating: 86 },
    { number: 27, code: 'HUL', firstName: 'Nico', lastName: 'Hülkenberg', teamName: 'Stake F1 Team Kick Sauber', teamColor: '#52E252', countryCode: 'GER', skillRating: 86 },
    { number: 5, code: 'BOR', firstName: 'Gabriel', lastName: 'Bortoleto', teamName: 'Stake F1 Team Kick Sauber', teamColor: '#52E252', countryCode: 'BRA', skillRating: 83 },
  ],
  2026: [
    { number: 4, code: 'NOR', firstName: 'Lando', lastName: 'Norris', teamName: 'McLaren Formula 1 Team', teamColor: '#FF8000', countryCode: 'GBR', skillRating: 98 },
    { number: 81, code: 'PIA', firstName: 'Oscar', lastName: 'Piastri', teamName: 'McLaren Formula 1 Team', teamColor: '#FF8000', countryCode: 'AUS', skillRating: 97 },
    { number: 16, code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', teamName: 'Scuderia Ferrari HP', teamColor: '#E80020', countryCode: 'MON', skillRating: 98 },
    { number: 44, code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', teamName: 'Scuderia Ferrari HP', teamColor: '#E80020', countryCode: 'GBR', skillRating: 96 },
    { number: 1, code: 'VER', firstName: 'Max', lastName: 'Verstappen', teamName: 'Red Bull Ford Powertrains', teamColor: '#3671C6', countryCode: 'NED', skillRating: 99 },
    { number: 6, code: 'HAD', firstName: 'Isack', lastName: 'Hadjar', teamName: 'Red Bull Ford Powertrains', teamColor: '#3671C6', countryCode: 'FRA', skillRating: 88 },
    { number: 63, code: 'RUS', firstName: 'George', lastName: 'Russell', teamName: 'Mercedes-AMG PETRONAS', teamColor: '#00D2BE', countryCode: 'GBR', skillRating: 96 },
    { number: 12, code: 'ANT', firstName: 'Kimi', lastName: 'Antonelli', teamName: 'Mercedes-AMG PETRONAS', teamColor: '#00D2BE', countryCode: 'ITA', skillRating: 92 },
    { number: 14, code: 'ALO', firstName: 'Fernando', lastName: 'Alonso', teamName: 'Aston Martin Honda', teamColor: '#229971', countryCode: 'ESP', skillRating: 90 },
    { number: 18, code: 'STR', firstName: 'Lance', lastName: 'Stroll', teamName: 'Aston Martin Honda', teamColor: '#229971', countryCode: 'CAN', skillRating: 83 },
    { number: 55, code: 'SAI', firstName: 'Carlos', lastName: 'Sainz', teamName: 'Williams Racing', teamColor: '#64C4FF', countryCode: 'ESP', skillRating: 93 },
    { number: 23, code: 'ALB', firstName: 'Alexander', lastName: 'Albon', teamName: 'Williams Racing', teamColor: '#64C4FF', countryCode: 'THA', skillRating: 88 },
    { number: 10, code: 'GAS', firstName: 'Pierre', lastName: 'Gasly', teamName: 'BWT Alpine F1 Team', teamColor: '#0093CC', countryCode: 'FRA', skillRating: 86 },
    { number: 43, code: 'COL', firstName: 'Franco', lastName: 'Colapinto', teamName: 'BWT Alpine F1 Team', teamColor: '#0093CC', countryCode: 'ARG', skillRating: 85 },
    { number: 22, code: 'TSU', firstName: 'Yuki', lastName: 'Tsunoda', teamName: 'Visa Cash App RB', teamColor: '#6692FF', countryCode: 'JPN', skillRating: 86 },
    { number: 30, code: 'LAW', firstName: 'Liam', lastName: 'Lawson', teamName: 'Visa Cash App RB', teamColor: '#6692FF', countryCode: 'NZL', skillRating: 86 },
    { number: 87, code: 'BEA', firstName: 'Oliver', lastName: 'Bearman', teamName: 'MoneyGram Haas F1 Team', teamColor: '#B6BABD', countryCode: 'GBR', skillRating: 87 },
    { number: 31, code: 'OCO', firstName: 'Esteban', lastName: 'Ocon', teamName: 'MoneyGram Haas F1 Team', teamColor: '#B6BABD', countryCode: 'FRA', skillRating: 85 },
    { number: 27, code: 'HUL', firstName: 'Nico', lastName: 'Hülkenberg', teamName: 'Audi Revolut F1 Team', teamColor: '#F50537', countryCode: 'GER', skillRating: 87 },
    { number: 5, code: 'BOR', firstName: 'Gabriel', lastName: 'Bortoleto', teamName: 'Audi Revolut F1 Team', teamColor: '#F50537', countryCode: 'BRA', skillRating: 85 },
  ],
}

/**
 * Deterministic pseudo-random number generator for consistent race results
 */
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function formatLapTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(3).padStart(6, '0')
  return `${mins}:${secs}`
}

export class F1MockService {
  /**
   * Generates a complete, authentic SessionDataset for any year (2018-2026), round, and session.
   */
  static generateSessionDataset(
    year: number,
    round: number,
    session = 'race',
    meta?: RaceDetailMeta | null,
    existingResults?: RaceResultEntry[] | null
  ): SessionDataset {
    const rawRoster = SEASON_ROSTERS[year] || SEASON_ROSTERS[2024]
    const sessionKey = session.toLowerCase().replace(/[^a-z0-9]/g, '')
    const isQuali = sessionKey.includes('quali') || sessionKey === 'q' || sessionKey === 'sq'
    const isSprint = sessionKey === 'sprint' || sessionKey === 's'
    const isPractice = sessionKey.startsWith('fp') || sessionKey.includes('practice')

    const sessionSeedOffset = isQuali ? 53 : isSprint ? 79 : isPractice ? 31 : 97
    const seed = year * 1000 + round * 17 + sessionSeedOffset
    const rng = seededRandom(seed)

    // Circuit parameters
    const grandPrixLaps = meta?.circuit?.turns
      ? Math.max(44, Math.min(78, Math.round(305 / (meta.circuit.lengthKm || 5.2))))
      : 57

    // Authentic lap counts by session type matching reference app
    const totalLaps = isQuali
      ? 15
      : isSprint
      ? Math.max(17, Math.min(24, Math.round(100 / (meta?.circuit?.lengthKm || 5.2))))
      : isPractice
      ? 22
      : grandPrixLaps

    const baseLapSeconds = meta?.circuit?.lengthKm
      ? Math.max(68, Math.min(115, Math.round(meta.circuit.lengthKm * 15.5)))
      : 89.4

    // 1. Establish Driver Order
    const roster = [...rawRoster]
    let orderedDrivers: SeasonDriver[] = []

    if (existingResults && existingResults.length > 0) {
      const mappedDrivers: SeasonDriver[] = []
      existingResults.forEach((res) => {
        const found = roster.find(
          (r) => r.number === res.driverNumber || r.code === res.driverCode
        )
        if (found) {
          mappedDrivers.push(found)
        } else {
          mappedDrivers.push({
            number: res.driverNumber,
            code: res.driverCode,
            firstName: res.driverCode,
            lastName: res.driverCode,
            teamName: res.teamName,
            teamColor: getTeamMeta(res.teamName).color,
            countryCode: 'FIA',
            skillRating: 85,
          })
        }
      })
      // Append any unmapped roster drivers
      roster.forEach((r) => {
        if (!mappedDrivers.some((m) => m.number === r.number)) {
          mappedDrivers.push(r)
        }
      })
      orderedDrivers = mappedDrivers
    } else {
      // Shuffle slightly by skill rating + deterministic variance
      const scoredDrivers = roster.map((d) => {
        const variance = (rng() - 0.5) * 12
        return { driver: d, score: d.skillRating + variance }
      })
      scoredDrivers.sort((a, b) => b.score - a.score)
      orderedDrivers = scoredDrivers.map((s) => s.driver)
    }

    // 2. Results & Drivers List
    const results: RaceResultEntry[] = []
    const drivers: DriverSessionInfo[] = []
    const driverStats: DriverRaceSummaryStats[] = []

    let cumulativeGap = 0
    const dnfCount = Math.floor(rng() * 2) + 1 // 1 or 2 DNFs per race

    orderedDrivers.forEach((d, idx) => {
      const pos = idx + 1
      const isWinner = pos === 1
      const isDnf = pos > orderedDrivers.length - dnfCount
      const existing = existingResults && existingResults[idx]

      let status = existing?.status || 'Finished'
      let timeStr = existing?.time || ''

      if (!existing) {
        if (isQuali) {
          status = pos <= 10 ? 'Q3' : pos <= 15 ? 'Q2' : 'Q1'
          if (isWinner) {
            const poleLap = baseLapSeconds - 1.2 + rng() * 0.3
            timeStr = formatLapTime(poleLap)
          } else {
            const delta = pos <= 5 ? 0.05 + idx * 0.07 : 0.4 + idx * 0.12
            timeStr = `+${delta.toFixed(3)}s`
          }
        } else if (isPractice) {
          status = 'Completed'
          if (isWinner) {
            const bestPracticeLap = baseLapSeconds + rng() * 0.5
            timeStr = formatLapTime(bestPracticeLap)
          } else {
            const delta = 0.08 + idx * 0.11
            timeStr = `+${delta.toFixed(3)}s`
          }
        } else {
          // Sprint or Race
          if (isWinner) {
            status = 'Finished'
            const totalSecs = baseLapSeconds * totalLaps + (rng() * 120 + (isSprint ? 1800 : 3600))
            const hrs = Math.floor(totalSecs / 3600)
            const mins = Math.floor((totalSecs % 3600) / 60)
            const secs = (totalSecs % 60).toFixed(3).padStart(6, '0')
            timeStr = isSprint
              ? `${String(mins).padStart(2, '0')}:${secs}`
              : `0 days ${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${secs}`
          } else if (isDnf && !isSprint) {
            const dnfReasons = ['Power Unit', 'Collision', 'Hydraulics', 'Gearbox', 'Brakes', 'Suspension']
            status = dnfReasons[Math.floor(rng() * dnfReasons.length)]
            timeStr = status
          } else {
            const gapIncrement = pos <= 5 ? rng() * 3.5 + 1.2 : rng() * 5.5 + 2.5
            cumulativeGap += gapIncrement
            if (pos >= 15 && totalLaps > 50) {
              status = '+1 Lap'
              timeStr = '+1 Lap'
            } else {
              timeStr = `+${cumulativeGap.toFixed(3)}s`
            }
          }
        }
      }

      // Points scale
      const pointsTable: Record<number, number> = isSprint
        ? { 1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1 }
        : isQuali || isPractice
        ? {}
        : { 1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 }

      const points = existing ? existing.points : (isDnf && !isQuali && !isPractice ? 0 : pointsTable[pos] || 0)

      // Grid position with slight delta
      const gridDelta = Math.floor(rng() * 5) - 2
      const gridPos = existing?.grid ?? Math.max(1, Math.min(20, pos + gridDelta))

      results.push({
        position: pos,
        classifiedPosition: existing?.classifiedPosition || (isDnf ? 'DNF' : String(pos)),
        grid: gridPos,
        status,
        points,
        laps: isDnf ? Math.floor(totalLaps * 0.4 + rng() * totalLaps * 0.4) : status === '+1 Lap' ? totalLaps - 1 : totalLaps,
        time: timeStr,
        driverNumber: d.number,
        driverCode: d.code,
        teamName: d.teamName,
      })

      drivers.push({
        driverNumber: d.number,
        driverId: d.lastName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        broadcastName: `${d.firstName.charAt(0)} ${d.lastName}`.toUpperCase(),
        fullName: `${d.firstName} ${d.lastName}`,
        nameAcronym: d.code,
        teamName: d.teamName,
        teamColour: d.teamColor,
        firstName: d.firstName,
        lastName: d.lastName,
        headshotUrl: null,
        countryCode: d.countryCode,
      })

      const fastestLapSec = baseLapSeconds + (pos === 1 || pos === 2 ? 0.2 : rng() * 2.5 + 0.8)
      driverStats.push({
        driverNumber: d.number,
        driverCode: d.code,
        grid: gridPos,
        finish: pos,
        positionsGained: gridPos - pos,
        fastestLapTime: formatLapTime(fastestLapSec),
        fastestLapDuration: fastestLapSec,
        averagePaceSeconds: baseLapSeconds + 3.2 + (pos * 0.25),
        bestSector1: +(baseLapSeconds * 0.31 + rng() * 0.4).toFixed(3),
        bestSector2: +(baseLapSeconds * 0.42 + rng() * 0.5).toFixed(3),
        bestSector3: +(baseLapSeconds * 0.27 + rng() * 0.3).toFixed(3),
        pitStopCount: 1 + (pos % 2),
        lapsLed: isWinner ? Math.floor(totalLaps * 0.6 + rng() * 15) : pos === 2 ? Math.floor(rng() * 8) : 0,
        stintsCount: 2 + (pos % 2),
        compoundsUsed: ['MEDIUM', 'HARD'],
      })
    })

    // 3. Stints & Pit Stops
    const stints: StintData[] = []
    const pitstops: PitStopData[] = []

    orderedDrivers.forEach((d, idx) => {
      const stops = 1 + (idx % 2) // 1-stop or 2-stop
      if (stops === 1) {
        const pitLap = Math.floor(totalLaps * 0.4) + (idx % 5)
        stints.push({
          driverNumber: d.number,
          stintNumber: 1,
          compound: idx % 3 === 0 ? 'SOFT' : 'MEDIUM',
          tyreAgeAtStart: 0,
          lapStart: 1,
          lapEnd: pitLap,
          totalLaps: pitLap,
        })
        stints.push({
          driverNumber: d.number,
          stintNumber: 2,
          compound: 'HARD',
          tyreAgeAtStart: 0,
          lapStart: pitLap + 1,
          lapEnd: totalLaps,
          totalLaps: totalLaps - pitLap,
        })
        pitstops.push({
          driverNumber: d.number,
          lapNumber: pitLap,
          stopNumber: 1,
          pitDurationSeconds: +(rng() * 0.9 + 2.2).toFixed(1),
          pitLaneDurationSeconds: +(rng() * 1.5 + 21.0).toFixed(1),
          timestamp: `Lap ${pitLap}`,
        })
      } else {
        const pit1 = Math.floor(totalLaps * 0.28) + (idx % 4)
        const pit2 = Math.floor(totalLaps * 0.68) + (idx % 4)
        stints.push({
          driverNumber: d.number,
          stintNumber: 1,
          compound: 'SOFT',
          tyreAgeAtStart: 0,
          lapStart: 1,
          lapEnd: pit1,
          totalLaps: pit1,
        })
        stints.push({
          driverNumber: d.number,
          stintNumber: 2,
          compound: 'MEDIUM',
          tyreAgeAtStart: 0,
          lapStart: pit1 + 1,
          lapEnd: pit2,
          totalLaps: pit2 - pit1,
        })
        stints.push({
          driverNumber: d.number,
          stintNumber: 3,
          compound: 'HARD',
          tyreAgeAtStart: 0,
          lapStart: pit2 + 1,
          lapEnd: totalLaps,
          totalLaps: totalLaps - pit2,
        })
        pitstops.push({
          driverNumber: d.number,
          lapNumber: pit1,
          stopNumber: 1,
          pitDurationSeconds: +(rng() * 0.8 + 2.3).toFixed(1),
          pitLaneDurationSeconds: +(rng() * 1.2 + 21.2).toFixed(1),
          timestamp: `Lap ${pit1}`,
        })
        pitstops.push({
          driverNumber: d.number,
          lapNumber: pit2,
          stopNumber: 2,
          pitDurationSeconds: +(rng() * 0.7 + 2.4).toFixed(1),
          pitLaneDurationSeconds: +(rng() * 1.4 + 21.5).toFixed(1),
          timestamp: `Lap ${pit2}`,
        })
      }
    })

    // 4. Laps, Positions by Lap, and Gaps by Lap
    const laps: LapData[] = []
    const positionsByLap: LapPositionSnapshot[] = []
    const gapsByLap: any[] = []
    const tyreDegradation: DriverTyreLapState[] = []

    // Overall fastest lap
    const fastestLapNumber = Math.floor(totalLaps * 0.75) + 3
    const fastestLapDriverNum = orderedDrivers[0].number

    for (let lapNum = 1; lapNum <= totalLaps; lapNum++) {
      const lapPositions: LapDriverPosition[] = []
      const lapGaps: Record<string, number | null> = { lap: lapNum }

      // SC period
      const isSafetyCarLap = lapNum >= 18 && lapNum <= 22
      const isVscLap = lapNum === 35 || lapNum === 36

      orderedDrivers.forEach((d, idx) => {
        const isWinner = idx === 0
        const driverStints = stints.filter((s) => s.driverNumber === d.number)
        const currentStint = driverStints.find((s) => lapNum >= s.lapStart && lapNum <= s.lapEnd) || driverStints[0]
        const tyreAge = lapNum - currentStint.lapStart

        // Base lap calculation
        let lapDuration = baseLapSeconds + (idx * 0.12) + (tyreAge * 0.07) + (rng() * 0.5 - 0.25)
        if (isSafetyCarLap) lapDuration += 32.0
        if (isVscLap) lapDuration += 18.0

        const isFastest = lapNum === fastestLapNumber && d.number === fastestLapDriverNum
        if (isFastest) {
          lapDuration = baseLapSeconds - 0.85
        }

        const s1 = +(lapDuration * 0.31).toFixed(3)
        const s2 = +(lapDuration * 0.42).toFixed(3)
        const s3 = +(lapDuration - s1 - s2).toFixed(3)

        const isPitLap = pitstops.some((p) => p.driverNumber === d.number && p.lapNumber === lapNum)

        laps.push({
          driverNumber: d.number,
          lapNumber: lapNum,
          lapDuration: +lapDuration.toFixed(3),
          lapTimeString: formatLapTime(lapDuration),
          sector1: s1,
          sector2: s2,
          sector3: s3,
          speedI1: Math.round(290 + rng() * 25),
          speedI2: Math.round(270 + rng() * 30),
          speedSt: Math.round(315 + rng() * 30),
          speedFl: Math.round(300 + rng() * 25),
          isPitOutLap: isPitLap,
          isPersonalBest: lapNum > 4 && rng() < 0.15,
          isFastestLap: isFastest,
          compound: currentStint.compound,
          tyreLife: tyreAge,
          freshTyre: tyreAge <= 1,
          stint: currentStint.stintNumber,
          position: idx + 1,
          trackStatus: isSafetyCarLap ? '4' : '1',
          dateStartIso: new Date(Date.now() - (totalLaps - lapNum) * 90000).toISOString(),
        })

        const gapToLeader = isWinner ? 0 : +(idx * (lapNum * 0.18 + rng() * 0.3)).toFixed(3)
        const intervalToAhead = idx === 0 ? 0 : +(1.2 + (rng() * 1.5)).toFixed(3)

        lapPositions.push({
          driverNumber: d.number,
          driverCode: d.code,
          position: idx + 1,
          gapToLeaderSeconds: gapToLeader,
          intervalToAheadSeconds: intervalToAhead,
          compound: currentStint.compound,
          tyreAge,
          pitStopThisLap: isPitLap,
        })

        lapGaps[d.code] = gapToLeader

        tyreDegradation.push({
          driverNumber: d.number,
          lapNumber: lapNum,
          compound: currentStint.compound,
          tyreAgeLaps: tyreAge,
          stintNumber: currentStint.stintNumber,
          isNewAtStart: true,
          lapTimeSeconds: +lapDuration.toFixed(3),
          deltaToStintBestSeconds: +(tyreAge * 0.06).toFixed(3),
          estimatedDegradationTrendSeconds: +(tyreAge * 0.08).toFixed(3),
          topSpeedKmh: Math.round(320 + rng() * 20),
          minCornerSpeedKmh: Math.round(85 + rng() * 15),
        })
      })

      positionsByLap.push({
        lap: lapNum,
        positions: lapPositions,
      })
      gapsByLap.push(lapGaps)
    }

    // 5. Overtakes
    const overtakes: OvertakeEvent[] = []
    const overtakeCount = 28 + Math.floor(rng() * 18)
    for (let i = 0; i < overtakeCount; i++) {
      const lap = Math.floor(rng() * (totalLaps - 5)) + 2
      const pos = Math.floor(rng() * 14) + 2
      const overtaking = orderedDrivers[pos - 1]
      const overtaken = orderedDrivers[pos]
      if (overtaking && overtaken) {
        overtakes.push({
          lap,
          overtakingDriverNumber: overtaking.number,
          overtakenDriverNumber: overtaken.number,
          overtakingCode: overtaking.code,
          overtakenCode: overtaken.code,
          fromPosition: pos + 1,
          toPosition: pos,
          timestamp: `Lap ${lap}`,
        })
      }
    }

    // 6. Race Control Messages
    const raceControl: RaceControlMessage[] = [
      {
        id: 'rc-1',
        timestamp: '14:00:00',
        category: 'Flag',
        flag: 'GREEN',
        message: 'GREEN LIGHT - PIT EXIT OPEN',
        lapNumber: 1,
      },
      {
        id: 'rc-2',
        timestamp: '14:01:45',
        category: 'Information',
        message: 'TRACK CLEAR',
        lapNumber: 1,
      },
      {
        id: 'rc-3',
        timestamp: '14:04:12',
        category: 'Information',
        message: 'DRS ENABLED',
        lapNumber: 3,
      },
      {
        id: 'rc-4',
        timestamp: '14:26:50',
        category: 'Flag',
        flag: 'YELLOW',
        message: 'YELLOW FLAG IN SECTOR 2 - INCIDENT TURN 4',
        lapNumber: 18,
      },
      {
        id: 'rc-5',
        timestamp: '14:27:10',
        category: 'SafetyCar',
        message: 'SAFETY CAR DEPLOYED',
        lapNumber: 18,
      },
      {
        id: 'rc-6',
        timestamp: '14:34:00',
        category: 'SafetyCar',
        message: 'SAFETY CAR IN THIS LAP',
        lapNumber: 22,
      },
      {
        id: 'rc-7',
        timestamp: '14:35:10',
        category: 'Flag',
        flag: 'GREEN',
        message: 'TRACK CLEAR - DRS ENABLED ON NEXT LAP',
        lapNumber: 23,
      },
      {
        id: 'rc-8',
        timestamp: '14:52:15',
        category: 'VirtualSafetyCar',
        message: 'VIRTUAL SAFETY CAR DEPLOYED - DEBRIS IN SECTOR 3',
        lapNumber: 35,
      },
      {
        id: 'rc-9',
        timestamp: '14:54:30',
        category: 'Flag',
        flag: 'GREEN',
        message: 'VSC ENDING - GREEN FLAG',
        lapNumber: 36,
      },
      {
        id: 'rc-10',
        timestamp: '15:28:45',
        category: 'Flag',
        flag: 'CHEQUERED',
        message: `CHEQUERED FLAG - WINNER ${orderedDrivers[0].code}`,
        lapNumber: totalLaps,
      },
    ]

    // 7. Weather Snapshots
    const weather: WeatherSnapshot[] = []
    const weatherSteps = 24
    for (let w = 0; w < weatherSteps; w++) {
      const progress = w / weatherSteps
      weather.push({
        timestamp: new Date(Date.now() - (1 - progress) * 7200000).toISOString(),
        lapApprox: Math.round(progress * totalLaps),
        airTemp: +(24.2 + Math.sin(progress * Math.PI) * 2.5 + rng() * 0.3).toFixed(1),
        trackTemp: +(34.5 + Math.sin(progress * Math.PI) * 5.2 + rng() * 0.4).toFixed(1),
        humidity: Math.round(52 + Math.cos(progress * Math.PI) * 8),
        pressure: +(1014.2 + rng() * 0.8).toFixed(1),
        windSpeed: +(8.5 + rng() * 4.2).toFixed(1),
        windDirection: Math.round(180 + rng() * 40),
        rainfall: false,
      })
    }

    // 8. Lap Feed & Commentary
    const lapFeed: LapFeedEntry[] = [
      {
        lap: 1,
        headline: 'Lights Out at the Grand Prix!',
        summary: `${orderedDrivers[0].code} gets a textbook getaway to hold the lead into Turn 1, closely followed by ${orderedDrivers[1].code}.`,
        leaderCode: orderedDrivers[0].code,
        gapToSecond: '+0.812s',
        events: [
          { type: 'FLAG', description: 'Lights out! Clean start for the front runners.', importance: 'high' },
        ],
      },
      {
        lap: 3,
        headline: 'DRS Zones Active',
        summary: `Race control activates DRS. ${orderedDrivers[1].code} attacks ${orderedDrivers[0].code} in Sector 1.`,
        leaderCode: orderedDrivers[0].code,
        gapToSecond: '+0.640s',
        events: [
          { type: 'OVERTAKE', description: `${orderedDrivers[2].code} advances with a bold move on the brakes.`, importance: 'medium' },
        ],
      },
      {
        lap: 18,
        headline: 'Safety Car Deployed!',
        summary: `Debris in Turn 4 triggers full Safety Car. Front runners dive into the pit lane for fresh tyres.`,
        leaderCode: orderedDrivers[0].code,
        gapToSecond: '+1.200s',
        events: [
          { type: 'SAFETY_CAR', description: 'Safety Car called out due to incident.', importance: 'high' },
          { type: 'PIT_STOP', description: `${orderedDrivers[0].code} and ${orderedDrivers[1].code} pit for Hard compound tyres.`, importance: 'high' },
        ],
      },
      {
        lap: 23,
        headline: 'Green Flag Restart',
        summary: `Safety Car peels into pit lane. ${orderedDrivers[0].code} launches cleanly to retain P1.`,
        leaderCode: orderedDrivers[0].code,
        gapToSecond: '+0.950s',
        events: [
          { type: 'FLAG', description: 'Green flag racing resumes.', importance: 'medium' },
        ],
      },
      {
        lap: fastestLapNumber,
        headline: 'Fastest Lap Clocked!',
        summary: `${orderedDrivers[0].code} sets the definitive benchmark lap with purple sectors in all three splits.`,
        leaderCode: orderedDrivers[0].code,
        gapToSecond: '+4.120s',
        events: [
          { type: 'FASTEST_LAP', description: `Purple lap recorded: ${formatLapTime(baseLapSeconds - 0.85)}.`, importance: 'medium' },
        ],
      },
      {
        lap: totalLaps,
        headline: `Chequered Flag: Victory for ${orderedDrivers[0].code}!`,
        summary: `${orderedDrivers[0].firstName} ${orderedDrivers[0].lastName} commands the Grand Prix to take victory ahead of ${orderedDrivers[1].code} and ${orderedDrivers[2].code}.`,
        leaderCode: orderedDrivers[0].code,
        gapToSecond: `+${results[1]?.time || '3.412s'}`,
        events: [
          { type: 'FLAG', description: `Chequered flag: ${orderedDrivers[0].code} wins!`, importance: 'high' },
        ],
      },
    ]

    // 9. Team Radio Clips
    const top3 = orderedDrivers.slice(0, 3)
    const radio: TeamRadioClip[] = [
      {
        id: 'rad-1',
        timestamp: '14:02:10',
        driverNumber: top3[0].number,
        driverCode: top3[0].code,
        teamName: top3[0].teamName,
        audioUrl: '',
        lapNumber: 2,
      },
      {
        id: 'rad-2',
        timestamp: '14:18:40',
        driverNumber: top3[1].number,
        driverCode: top3[1].code,
        teamName: top3[1].teamName,
        audioUrl: '',
        lapNumber: 12,
      },
      {
        id: 'rad-3',
        timestamp: '14:27:30',
        driverNumber: top3[0].number,
        driverCode: top3[0].code,
        teamName: top3[0].teamName,
        audioUrl: '',
        lapNumber: 18,
      },
      {
        id: 'rad-4',
        timestamp: '14:48:15',
        driverNumber: top3[2].number,
        driverCode: top3[2].code,
        teamName: top3[2].teamName,
        audioUrl: '',
        lapNumber: 32,
      },
      {
        id: 'rad-5',
        timestamp: '15:28:50',
        driverNumber: top3[0].number,
        driverCode: top3[0].code,
        teamName: top3[0].teamName,
        audioUrl: '',
        lapNumber: totalLaps,
      },
    ]

    return {
      isAvailable: true,
      isHistoricalArchive: false,
      dataSource: 'fastf1',
      results,
      drivers,
      laps,
      positionsByLap,
      gapsByLap,
      overtakes,
      stints,
      pitstops,
      tyreDegradation,
      driverStats,
      radio,
      raceControl,
      weather,
      lapFeed,
    }
  }
}
