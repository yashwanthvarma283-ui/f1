import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import {
  detectBrowserTimezone,
  getTimezoneAbbreviation,
  getTimezoneOffsetString,
  formatTimeInZone,
  formatDateInZone,
  formatWeekdayInZone,
  formatFullRaceDate,
  formatWeekendSpan,
} from '@/lib/timezone'
import { appStorage } from '@/lib/storage'

interface TimezoneContextValue {
  timezone: string
  is24h: boolean
  timezoneAbbr: string
  timezoneOffset: string
  showFirstVisitPrompt: boolean
  setTimezone: (tz: string) => void
  setIs24h: (val: boolean) => void
  toggleTimeFormat: () => void
  confirmTimezone: () => void
  formatTime: (dateInput: Date | string) => string
  formatDate: (dateInput: Date | string) => string
  formatWeekday: (dateInput: Date | string) => string
  formatFullRaceDate: (dateInput: Date | string) => string
  formatWeekendSpan: (dateInput: Date | string) => string
}

const STORAGE_KEYS = {
  TIMEZONE: 'pitwall_selected_timezone',
  IS_24H: 'pitwall_time_format_24h',
  CONFIRMED: 'pitwall_tz_confirmed',
}

const TimezoneContext = createContext<TimezoneContextValue | null>(null)

export const TimezoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timezone, setTimezoneState] = useState<string>(() => {
    return appStorage.getItem<string>(STORAGE_KEYS.TIMEZONE, detectBrowserTimezone())
  })

  const [is24h, setIs24hState] = useState<boolean>(() => {
    return appStorage.getItem<boolean>(STORAGE_KEYS.IS_24H, true) // 24h default for motorsport precision
  })

  const [showFirstVisitPrompt, setShowFirstVisitPrompt] = useState<boolean>(() => {
    const confirmed = appStorage.getItem<boolean>(STORAGE_KEYS.CONFIRMED, false)
    return !confirmed
  })

  const setTimezone = (newTz: string) => {
    setTimezoneState(newTz)
    appStorage.setItem(STORAGE_KEYS.TIMEZONE, newTz)
  }

  const setIs24h = (val: boolean) => {
    setIs24hState(val)
    appStorage.setItem(STORAGE_KEYS.IS_24H, val)
  }

  const toggleTimeFormat = () => {
    setIs24h(!is24h)
  }

  const confirmTimezone = () => {
    setShowFirstVisitPrompt(false)
    appStorage.setItem(STORAGE_KEYS.CONFIRMED, true)
  }

  const timezoneAbbr = useMemo(() => {
    return getTimezoneAbbreviation(timezone)
  }, [timezone])

  const timezoneOffset = useMemo(() => {
    return getTimezoneOffsetString(timezone)
  }, [timezone])

  const formatTime = (dateInput: Date | string) => {
    return formatTimeInZone(dateInput, timezone, is24h)
  }

  const formatDate = (dateInput: Date | string) => {
    return formatDateInZone(dateInput, timezone)
  }

  const formatWeekday = (dateInput: Date | string) => {
    return formatWeekdayInZone(dateInput, timezone)
  }

  const formatFullRaceDateFn = (dateInput: Date | string) => {
    return formatFullRaceDate(dateInput, timezone)
  }

  const formatWeekendSpanFn = (dateInput: Date | string) => {
    return formatWeekendSpan(dateInput, timezone)
  }

  const value = useMemo(
    () => ({
      timezone,
      is24h,
      timezoneAbbr,
      timezoneOffset,
      showFirstVisitPrompt,
      setTimezone,
      setIs24h,
      toggleTimeFormat,
      confirmTimezone,
      formatTime,
      formatDate,
      formatWeekday,
      formatFullRaceDate: formatFullRaceDateFn,
      formatWeekendSpan: formatWeekendSpanFn,
    }),
    [timezone, is24h, timezoneAbbr, timezoneOffset, showFirstVisitPrompt]
  )

  return <TimezoneContext.Provider value={value}>{children}</TimezoneContext.Provider>
}

export function useTimezone(): TimezoneContextValue {
  const ctx = useContext(TimezoneContext)
  if (!ctx) {
    throw new Error('useTimezone must be used within a TimezoneProvider')
  }
  return ctx
}
