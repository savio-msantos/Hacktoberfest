import { Icone } from './Icone'

export default function AvisoOficial() {
  return (
    <section className="flex items-start gap-3 rounded-xl bg-[#e3ebe8] p-4">
      <Icone nome="escudo" className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
      <div>
        <p className="text-xs font-semibold text-slate-700">
          Alertas oficiais não consultados
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Este conceito não exibe alertas oficiais. As orientações ao lado não
          são avisos da Defesa Civil.
        </p>
      </div>
    </section>
  )
}
