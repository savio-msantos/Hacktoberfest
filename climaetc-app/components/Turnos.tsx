import { Icone } from './Icone'
import React from 'react'
import { calcularDuracaoHoras } from '../utils/constants.tsx'
import type { EstadoTurnos } from '../types'
import { Selecao } from './Selecao.tsx'
import { Badge } from './Badge.tsx'

interface SeusTurnosProps {
  turnos: EstadoTurnos
  setTurnos: React.Dispatch<React.SetStateAction<EstadoTurnos>>
}

export function SeusTurnos({ turnos, setTurnos }: Readonly<SeusTurnosProps>) {
  const set =
    (chave: keyof EstadoTurnos, campo: 'inicio' | 'fim') => (v: string) =>
      setTurnos((t) => ({ ...t, [chave]: { ...t[chave], [campo]: v } }))

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-slate-800">Seus dois turnos</h2>
        <span className="rounded bg-[#d9eee8] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#0b5c52]">
          Demonstração
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end">
        {(['a', 'b'] as const).map((chave) => {
          const ativo = chave === 'a'
          const letra = chave.toUpperCase()
          return (
            <div key={chave} className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Badge letra={letra} ativo={ativo} /> Opção {letra}
                </span>
                <span className="text-[10px] text-slate-500">
                  {calcularDuracaoHoras(
                    turnos[chave].inicio,
                    turnos[chave].fim
                  )}
                </span>
              </div>
              <div className="flex gap-3">
                <Selecao
                  rotulo="Início"
                  valor={turnos[chave].inicio}
                  onChange={set(chave, 'inicio')}
                />
                <Selecao
                  rotulo="Fim"
                  valor={turnos[chave].fim}
                  onChange={set(chave, 'fim')}
                />
              </div>
            </div>
          )
        })}

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg bg-[#04463e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b5c52] lg:w-[210px]"
        >
          <Icone nome="atualizar" className="h-4 w-4" /> Atualizar comparação
        </button>
      </div>
    </section>
  )
}
