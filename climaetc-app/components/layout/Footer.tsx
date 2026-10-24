import { Icone } from '../../utils/constants'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-275 flex-wrap items-center justify-between gap-2 px-6 py-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-2">
          <Icone nome="info" className="h-3.5 w-3.5" />
          Previsão e análise demonstrativas. Sem consulta em tempo real.
        </span>
        <span>Para entregadores e mototaxistas da região Norte</span>
      </div>
    </footer>
  )
}
