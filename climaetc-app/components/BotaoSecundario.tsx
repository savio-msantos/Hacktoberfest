import { Icone } from './Icone'
import type { ReactNode } from 'react'

interface BotaoSecundarioProps {
  children: ReactNode
  className?: string
}

export default function BotaoSecundario({
  children,
  className = '',
}: Readonly<BotaoSecundarioProps>) {
  return (
    <button
      type="button"
      className={`flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs text-[#0b5c52] transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c52] ${className}`}
    >
      {children}
      <Icone nome="ajustes" className="h-4 w-4" />
    </button>
  )
}
