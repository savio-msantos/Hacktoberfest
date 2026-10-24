import { HORARIOS, Icone } from '../utils/constants'

interface SelecaoProps {
  rotulo: string
  valor: string
  onChange: (v: string) => void
}

export function Selecao({ rotulo, valor, onChange }: Readonly<SelecaoProps>) {
  return (
    <label className="block flex-1">
      <span className="mb-1 block text-[10px] text-slate-500">{rotulo}</span>
      <span className="relative block">
        <select
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-800 focus:border-[#0b5c52] focus:outline-none focus:ring-1 focus:ring-[#0b5c52]"
        >
          {HORARIOS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <Icone
          nome="chevron"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
        />
      </span>
    </label>
  )
}
