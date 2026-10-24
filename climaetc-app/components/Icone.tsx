import {
  Cloud,
  CloudDrizzle,
  CloudRain,
  Droplet,
  Wind,
  Thermometer,
  Umbrella,
  Package,
  Sparkles,
  Clock,
  SlidersHorizontal,
  Shield,
  Info,
  type LucideIcon,
} from 'lucide-react'
import type { IconName } from '../types'

const IconMap: Record<IconName, LucideIcon> = {
  nuvem: Cloud,
  chuvisco: CloudDrizzle,
  chuva: CloudRain,
  gota: Droplet,
  vento: Wind,
  termometro: Thermometer,
  guardachuva: Umbrella,
  caixa: Package,
  brilho: Sparkles,
  relogio: Clock,
  ajustes: SlidersHorizontal,
  escudo: Shield,
  info: Info,
}

export function Icone({
  nome,
  className,
}: {
  nome: IconName
  className?: string
}) {
  const LucideComponent = IconMap[nome]
  return LucideComponent ? <LucideComponent className={className} /> : null
}
