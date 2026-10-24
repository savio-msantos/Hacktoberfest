import { Icone, HORAS } from '../utils/constants.tsx'

export default function GraficoHora() {
  const ALTURA = 170

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-slate-800">Seu turno, hora a hora</h2>
        <Icone nome="relogio" className="h-5 w-5 text-[#0b5c52]" />
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
        <span>Probabilidade de chuva (%)</span>
        <span className="flex items-center gap-1.5 text-[#a8530f]">
          <span className="h-2 w-2 rounded-[2px] bg-[#f2b955]" />
          Maior chance · 15h–16h
        </span>
      </div>

      <div className="mt-5 grid grid-cols-6 gap-2">
        {HORAS.map((h) => {
          const destaque = h.chuva >= 80
          return (
            <div key={h.hora} className="flex flex-col items-center">
              <span className="text-xs text-slate-800">{h.hora}</span>
              <Icone nome={h.icone} className="mt-3 h-5 w-5 text-slate-500" />
              <span className="mt-2 text-xs text-slate-700">{h.temp}°</span>
              <div
                className="relative mt-3 flex w-full items-end overflow-hidden rounded-md bg-[#f3f5f4]"
                style={{ height: ALTURA }}
              >
                <div
                  className={`w-full rounded-md ${destaque ? 'bg-[#f2b955]' : 'bg-[#a3c9d6]'}`}
                  style={{ height: `${h.chuva}%` }}
                />
              </div>
              <span
                className={`mt-3 text-xs font-medium ${destaque ? 'text-[#a8530f]' : 'text-[#2f6f86]'}`}
              >
                {h.chuva}%
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-6 border-t border-slate-200 pt-3 text-[10px] leading-relaxed text-slate-500">
        <p>Fonte: amostra de API meteorológica · 24 out.</p>
        <p>Valores de exemplo, não uma previsão real.</p>
      </div>
    </section>
  )
}
