import React from 'react'
import { teamLogos } from '@/lib/teamLogos'
import { cn } from '@/lib/utils'

interface TeamLogoProps {
  teamId: string
  teamName: string
  showTeamNameNextToIt?: boolean
  className?: string
  width?: number | string
  height?: number | string
}

export const TeamLogo: React.FC<TeamLogoProps> = ({ teamId, teamName, showTeamNameNextToIt = true, className, width, height }) => {
  const logo = teamLogos[teamId]
  if (!logo || !logo.src) return null

  const filterClass = logo.treatment === 'always-white'
    ? 'brightness-0 invert drop-shadow-[0_0_1px_#ffffff] drop-shadow-[0_0_2px_#ffffff]' // pure white everywhere, doubled drop shadow to thicken anti-aliased edges
    : logo.treatment === 'lighten-on-dark'
    ? 'brightness-0 dark:invert dark:drop-shadow-[0_0_1px_#ffffff] dark:drop-shadow-[0_0_2px_#ffffff]' // pure black in light mode, thick white in dark mode
    : logo.treatment === 'white-on-dark'
    ? 'dark:brightness-0 dark:invert dark:drop-shadow-[0_0_1px_#ffffff] dark:drop-shadow-[0_0_2px_#ffffff]' // original in light mode, thick white in dark mode
    : logo.treatment === 'darken-on-light'
    ? 'brightness-0 dark:brightness-100' // pure black in light mode, original (white) in dark mode
    : logo.treatment === 'contrast-both'
    ? 'drop-shadow-[0_0_2px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.4)] dark:brightness-[1.2]'
    : ''
    
  return (
    <img 
      src={logo.src} 
      alt={showTeamNameNextToIt ? '' : teamName}
      className={cn("object-contain", filterClass, className)}
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
    />
  )
}
