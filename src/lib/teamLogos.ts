export type LogoTreatment = 'lighten-on-dark' | 'darken-on-light' | 'none' | 'contrast-both' | 'always-white' | 'white-on-dark'

export interface TeamLogoMeta {
  src: string | null
  treatment: LogoTreatment
}

export const teamLogos: Record<string, TeamLogoMeta> = {
  mercedes: { src: "/logos/Mercedes.png", treatment: "lighten-on-dark" },
  ferrari: { src: "/logos/Ferrari.png", treatment: "none" },
  mclaren: { src: "/logos/McLaren.png", treatment: "none" },
  red_bull: { src: "/logos/Redbull.png", treatment: "none" },
  rb: { src: "/logos/RacingBulls.png", treatment: "darken-on-light" },
  aston_martin: { src: "/logos/AstonmartinNew.png", treatment: "white-on-dark" },
  alpine: { src: "/logos/Alpine.png", treatment: "none" },
  haas: { src: "/logos/HaasClean.png", treatment: "none" },
  williams: { src: "/logos/Williams.png", treatment: "none" },
  audi: { src: "/logos/AudiNew.png", treatment: "none" },
  cadillac: { src: "/logos/Cadillac.png", treatment: "lighten-on-dark" }
}
