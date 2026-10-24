import { Icone } from './Icone'

import { CloudRain } from 'lucide-react'

export default function CartaoPrevisao() {
  return (
    <section className="rounded-2xl bg-[#04463e] p-6 text-white">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-white/80">
        <span>Previsão meteorológica</span>
        <span>Demo</span>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-6xl font-light tracking-tight">28°–32°</span>
          <span className="max-w-[90px] text-sm leading-snug text-white/80">
            Calor e chuva à tarde
          </span>
        </div>
        <CloudRain className="h-14 w-14 text-white/80" />
      </div>
      <div className="mt-6 flex items-center gap-2 rounded-lg bg-[#fbe9d0] px-4 py-3 text-xs font-medium text-[#a8530f]">
        <Icone nome="guardachuva" className="h-4 w-4" />
        Mais chance de chuva entre 15h e 16h
      </div>
    </section>
  )
}
