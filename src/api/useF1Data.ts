import { useQuery } from '@tanstack/react-query'
import { jolpicaClient } from './jolpicaClient'
import { openf1Client } from './openf1Client'

export const QUERY_KEYS = {
  schedule: (season: string) => ['f1', 'schedule', season] as const,
  lastResult: () => ['f1', 'lastResult'] as const,
  driverStandings: (season: string) => ['f1', 'driverStandings', season] as const,
  constructorStandings: (season: string) => ['f1', 'constructorStandings', season] as const,
  seasons: () => ['f1', 'seasons'] as const,
  liveStatus: (circuit?: string, country?: string) => ['f1', 'liveStatus', circuit, country] as const,
}

export function useSchedule(season: string = 'current') {
  return useQuery({
    queryKey: QUERY_KEYS.schedule(season),
    queryFn: () => jolpicaClient.getSchedule(season),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useLastRaceResult() {
  return useQuery({
    queryKey: QUERY_KEYS.lastResult(),
    queryFn: () => jolpicaClient.getLastRaceResult(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}

export function useDriverStandings(season: string = 'current') {
  return useQuery({
    queryKey: QUERY_KEYS.driverStandings(season),
    queryFn: () => jolpicaClient.getDriverStandings(season),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useConstructorStandings(season: string = 'current') {
  return useQuery({
    queryKey: QUERY_KEYS.constructorStandings(season),
    queryFn: () => jolpicaClient.getConstructorStandings(season),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useAvailableSeasons() {
  return useQuery({
    queryKey: QUERY_KEYS.seasons(),
    queryFn: () => jolpicaClient.getSeasons(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}

export function useLiveStatus(circuitName?: string, countryName?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.liveStatus(circuitName, countryName),
    queryFn: () => openf1Client.checkSessionStatus(circuitName, countryName),
    refetchInterval: 1000 * 60, // Poll every minute for live status updates
    staleTime: 1000 * 30,
  })
}
