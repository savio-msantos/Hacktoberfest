import React from 'react'
import { Icone, COMPARATIVO } from '../utils/constants.tsx'

import { Badge } from './Badge.tsx'

export function ResumoPergunta() {
  return (
    <section className="rounded-2xl bg-[#04463e] p-6 text-white">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-white/80">
        <span>Dados meteorológicos</span>
        <span>Demo</span>
      </div>
      <h2 className="mt-4 text-2xl font-normal">Menos chuva ou menos calor?</h2>
      <div className="mt-5 grid grid-cols-2 gap-0">
        <div className="pr-4">
          <p className="text-[10px] text-white/80">A · 13h às 17h</p>
          <p className="mt-2 text-4xl font-light">−5 p.p.</p>
          <p className="mt-2 text-[10px] text-white/70">
            na média das probabilidades de chuva
          </p>
        </div>
        <div className="border-l border-white/20 pl-4">
          <p className="text-[10px] text-white/80">B · 16h às 20h</p>
          <p className="mt-2 text-4xl font-light">−2 °C</p>
          <p className="mt-2 text-[10px] text-white/70">
            na temperatura média do turno
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-lg bg-[#fbe9d0] px-3 py-2.5 text-[11px] font-medium text-[#a8530f]">
        <Icone nome="guardachuva" className="h-4 w-4" /> Chuva alta em A: 80–85%
        às 15h–16h.
      </div>
    </section>
  )
}

export function Comparativo() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg text-slate-800">Comparativo objetivo</h2>
      <div className="mt-5 grid grid-cols-[1.2fr_1fr_1fr] items-end gap-2 pb-3">
        <span className="text-[10px] text-slate-500">Indicador</span>
        <div className="text-center">
          <span className="inline-block rounded bg-[#04463e] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            Opção A
          </span>
          <p className="mt-1 text-[10px] text-slate-500">13h–17h</p>
        </div>
        <div className="text-center">
          <span className="inline-block rounded bg-[#d9eee8] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0b5c52]">
            Opção B
          </span>
          <p className="mt-1 text-[10px] text-slate-500">16h–20h</p>
        </div>
      </div>
      {COMPARATIVO.map((linha) => (
        <div
          key={linha.rotulo}
          className="grid grid-cols-[1.2fr_1fr_1fr] items-center gap-2 border-t border-slate-200 py-4"
        >
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Icone nome={linha.icone} className="h-4 w-4 text-[#2f6f86]" />{' '}
              {linha.rotulo}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">{linha.detalhe}</p>
          </div>
          {[linha.a, linha.b].map((c, i) => (
            <div key={i} className="text-center">
              <p
                className={`text-2xl font-normal ${linha.rotulo === 'Chuva' ? 'text-[#2f6f86]' : 'text-slate-800'}`}
              >
                {c.valor}
              </p>
              {c.faixa && (
                <p className="mt-1 text-[10px] text-slate-500">{c.faixa}</p>
              )}
            </div>
          ))}
        </div>
      ))}
      <p className="border-t border-slate-200 pt-3 text-[10px] text-slate-500">
        Médias de 5 horários; não indicam a chance de chover no turno inteiro.
      </p>
    </section>
  )
}

export function GemmaExplica() {
  const RotuloVantagem = ({
    tipo,
    children,
  }: {
    tipo: 'vantagem' | 'atencao'
    children: React.ReactNode
  }) => (
    <>
      <p
        className={`mt-3 text-[10px] font-bold uppercase tracking-wide ${tipo === 'vantagem' ? 'text-[#0b5c52]' : 'text-[#a8530f]'}`}
      >
        {tipo === 'vantagem' ? 'Vantagem' : 'Atenção'}
      </p>
      <p className="mt-1 text-sm text-slate-700">{children}</p>
    </>
  )

  return (
    <section className="rounded-2xl border border-[#0b5c52] bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl text-slate-800">
          <Icone nome="brilho" className="h-5 w-5 text-[#0b5c52]" /> Gemma
          explica
        </h2>
        <span className="rounded bg-[#e3ebe8] px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
          IA
        </span>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Badge letra="A" ativo /> 13h às 17h · Menor média de chuva
        </h3>
        <RotuloVantagem tipo="vantagem">
          Menor média de chuva: 64% × 69%.
        </RotuloVantagem>
        <RotuloVantagem tipo="atencao">
          Pico de 32 °C. Leve água e faça pausas à sombra.
        </RotuloVantagem>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Badge letra="B" /> 16h às 20h · Temperaturas menores
        </h3>
        <RotuloVantagem tipo="vantagem">
          2 °C mais fresco, em média.
        </RotuloVantagem>
        <RotuloVantagem tipo="atencao">
          Chuva de 85% às 16h. Prefira rotas curtas e espera coberta.
        </RotuloVantagem>
      </div>

      <div className="mt-5 flex gap-3 rounded-lg bg-[#dcefe8] p-4">
        <Icone
          nome="caixa"
          className="mt-0.5 h-4 w-4 shrink-0 text-[#0b5c52]"
        />
        <div>
          <p className="text-xs font-semibold text-slate-800">
            Em ambos: proteja carga e celular
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            Há chance de chuva nos dois turnos. Impermeabilize mochila e
            celular.
          </p>
        </div>
      </div>
    </section>
  )
}
