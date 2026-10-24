import { Cloud } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0b5c52] text-white">
            <Cloud className="h-5 w-5" />
          </span>
          <span className="text-lg text-slate-800">Alerta Climático</span>
        </div>
        <p className="hidden text-xs text-slate-500 md:block">
          Mais preparo para quem trabalha na rua.
        </p>
        <span className="rounded bg-[#d9eee8] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#0b5c52]">
          Conceito
        </span>
      </div>
    </header>
  )
}
