import { Icone } from '../utils/constants.tsx'
import { type EstadoTurnos } from '../types'
import { SeusTurnos } from '../components/Turnos.tsx'
import Header from '../components/layout/Header'
import {
  ResumoPergunta,
  Comparativo,
  GemmaExplica,
} from '../components/PainelIA'
import { useState } from 'react'

export default function CompararTurnos() {
  const [turnos, setTurnos] = useState<EstadoTurnos>({
    a: { inicio: '13:00', fim: '17:00' },
    b: { inicio: '16:00', fim: '20:00' },
  })

  return (
    <div className="min-h-screen bg-[#f3f6f5] font-sans text-slate-800">
      <Header />

      <main className="mx-auto w-full max-w-250 px-6 py-8">
        <a
          href="#"
          className="inline-flex items-center gap-2 text-[11px] text-[#0b5c52] hover:underline"
        >
          <Icone nome="seta" className="h-4 w-4" /> Voltar à previsão
        </a>

        <h1 className="mt-4 text-4xl font-normal text-slate-900">
          Comparar turnos
        </h1>
        <p className="mt-2 text-xs text-slate-500">
          Rio Branco, AC · Entregador · Hoje, 24 out.
        </p>

        <div className="mt-6">
          <SeusTurnos turnos={turnos} setTurnos={setTurnos} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <ResumoPergunta />
            <Comparativo />
          </div>

          <div className="space-y-4">
            <GemmaExplica />

            <div className="flex items-center gap-3 rounded-xl bg-[#e3ebe8] px-4 py-4">
              <Icone nome="escudo" className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-semibold text-slate-700">
                Alertas oficiais não consultados
              </span>
            </div>

            <p className="flex items-center gap-2 text-[11px] text-slate-500">
              <Icone nome="info" className="h-3.5 w-3.5" />
              Previsão e análise demonstrativas. Sem consulta em tempo real.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
