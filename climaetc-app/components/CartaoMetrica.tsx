import type { Metrica } from '../types'
import { Icone } from '../utils/constants.tsx'

export default function CartaoMetrica({
  icone,
  rotulo,
  valor,
  detalhe,
}: Readonly<Metrica>) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-[11px] text-slate-500">
        <Icone nome={icone} className="h-3.5 w-3.5 text-slate-600" />
        {rotulo}
      </div>
      <p className="mt-2 text-3xl font-normal text-slate-800">{valor}</p>
      <p className="mt-2 text-[10px] text-slate-500">{detalhe}</p>
    </div>
  )
}
