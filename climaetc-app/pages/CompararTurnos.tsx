import React, { useState } from 'react'

/* ------------------------------------------------------------------ */
/* Dados de exemplo                                                    */
/* ------------------------------------------------------------------ */
const HORARIOS = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, '0')}:00`
)

const COMPARATIVO = [
  {
    icone: 'gotas',
    rotulo: 'Chuva',
    detalhe: 'Média das probabilidades horárias (%)',
    a: { valor: '64%' },
    b: { valor: '69%' },
  },
  {
    icone: 'termometro',
    rotulo: 'Temperatura',
    detalhe: 'Média das temperaturas (°C)',
    a: { valor: '29,6 °C', faixa: '28–32 °C' },
    b: { valor: '27,6 °C', faixa: '26–29 °C' },
  },
  {
    icone: 'vento',
    rotulo: 'Vento',
    detalhe: 'Intervalo em km/h',
    a: { valor: '10–18' },
    b: { valor: '12–18' },
  },
]

/* ------------------------------------------------------------------ */
/* Ícones                                                              */
/* ------------------------------------------------------------------ */
const Svg = ({ children, className = 'h-4 w-4', ...p }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...p}
  >
    {children}
  </svg>
)

const Nuvem = ({ className }) => (
  <Svg className={className}>
    <path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 9.5a4.25 4.25 0 0 1 .5 8.5H7Z" />
  </Svg>
)

const Icones = {
  seta: (c) => (
    <Svg className={c}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Svg>
  ),
  chevron: (c) => (
    <Svg className={c}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  ),
  atualizar: (c) => (
    <Svg className={c}>
      <path d="M20 11a8 8 0 0 0-14.3-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.5L20 16M20 20v-4h-4" />
    </Svg>
  ),
  brilho: (c) => (
    <Svg className={c}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
    </Svg>
  ),
  guardachuva: (c) => (
    <Svg className={c}>
      <path d="M3 13a9 9 0 0 1 18 0H3Z" />
      <path d="M12 13v5a2 2 0 0 0 4 0" />
    </Svg>
  ),
  gotas: (c) => (
    <Svg className={c}>
      <path d="M9 4c2.4 3 4 5 4 7.2a4 4 0 0 1-8 0C5 9 6.6 7 9 4Z" />
      <path d="M16.5 11c1.6 2 2.5 3.3 2.5 4.7a2.5 2.5 0 0 1-5 0c0-1.400.9-2.700 2.500-4.700Z" />
    </Svg>
  ),
  termometro: (c) => (
    <Svg className={c}>
      <path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z" />
    </Svg>
  ),
  vento: (c) => (
    <Svg className={c}>
      <path d="M3 8h10a2.5 2.5 0 1 0-2.5-2.5M3 12h15a2.5 2.5 0 1 1-2.5 2.5M3 16h7a2.5 2.5 0 1 1-2.5 2.5" />
    </Svg>
  ),
  caixa: (c) => (
    <Svg className={c}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </Svg>
  ),
  escudo: (c) => (
    <Svg className={c}>
      <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
      <path d="M12 9v4M12 16h.01" />
    </Svg>
  ),
  info: (c) => (
    <Svg className={c}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </Svg>
  ),
}

const Icone = ({ nome, className }) =>
  Icones[nome] ? Icones[nome](className) : null

/* ------------------------------------------------------------------ */
/* Componentes                                                         */
/* ------------------------------------------------------------------ */
function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0b5c52] text-white">
            <Nuvem className="h-5 w-5" />
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

function Selecao({ rotulo, valor, onChange }) {
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

function Badge({ letra, ativo }) {
  return (
    <span
      className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
        ativo ? 'bg-[#04463e] text-white' : 'bg-[#d9eee8] text-[#0b5c52]'
      }`}
    >
      {letra}
    </span>
  )
}

function DuracaoHoras(inicio, fim) {
  const i = parseInt(inicio, 10)
  const f = parseInt(fim, 10)
  const h = f >= i ? f - i : 24 - i + f
  return `${h} horas`
}

function SeusTurnos({ turnos, setTurnos }) {
  const set = (chave, campo) => (v) =>
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
        {[
          { chave: 'a', letra: 'A', ativo: true },
          { chave: 'b', letra: 'B', ativo: false },
        ].map(({ chave, letra, ativo }) => (
          <div key={chave} className="flex-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Badge letra={letra} ativo={ativo} />
                Opção {letra}
              </span>
              <span className="text-[10px] text-slate-500">
                {DuracaoHoras(turnos[chave].inicio, turnos[chave].fim)}
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
        ))}

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg bg-[#04463e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b5c52] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c52] focus-visible:ring-offset-2 lg:w-[210px]"
        >
          <Icone nome="atualizar" className="h-4 w-4" />
          Atualizar comparação
        </button>
      </div>
    </section>
  )
}

function ResumoPergunta() {
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
        <Icone nome="guardachuva" className="h-4 w-4" />
        Chuva alta em A: 80–85% às 15h–16h.
      </div>
    </section>
  )
}

function Comparativo() {
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
              <Icone nome={linha.icone} className="h-4 w-4 text-[#2f6f86]" />
              {linha.rotulo}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">{linha.detalhe}</p>
          </div>
          {[linha.a, linha.b].map((c, i) => (
            <div key={i} className="text-center">
              <p
                className={`text-2xl font-normal ${
                  linha.rotulo === 'Chuva' ? 'text-[#2f6f86]' : 'text-slate-800'
                }`}
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

function RotuloVantagem({ tipo, children }) {
  const cor = tipo === 'vantagem' ? 'text-[#0b5c52]' : 'text-[#a8530f]'
  return (
    <>
      <p
        className={`mt-3 text-[10px] font-bold uppercase tracking-wide ${cor}`}
      >
        {tipo === 'vantagem' ? 'Vantagem' : 'Atenção'}
      </p>
      <p className="mt-1 text-sm text-slate-700">{children}</p>
    </>
  )
}

function GemmaExplica() {
  return (
    <section className="rounded-2xl border border-[#0b5c52] bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl text-slate-800">
          <Icone nome="brilho" className="h-5 w-5 text-[#0b5c52]" />
          Gemma explica
        </h2>
        <span className="rounded bg-[#e3ebe8] px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
          IA
        </span>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Badge letra="A" ativo />
          13h às 17h · Menor média de chuva
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
          <Badge letra="B" />
          16h às 20h · Temperaturas menores
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

      <div className="mt-5">
        <p className="text-[11px] font-semibold text-[#0b5c52]">
          Orientações de IA · demonstração
        </p>
        <p className="mt-1 text-[10px] text-slate-500">
          Dados meteorológicos fictícios; Gemma apenas interpreta.
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */
export default function CompararTurnos() {
  const [turnos, setTurnos] = useState({
    a: { inicio: '13:00', fim: '17:00' },
    b: { inicio: '16:00', fim: '20:00' },
  })

  return (
    <div className="min-h-screen bg-[#f3f6f5] font-sans text-slate-800">
      <Header />

      <main className="mx-auto w-full max-w-[1000px] px-6 py-8">
        <a
          href="#"
          className="inline-flex items-center gap-2 text-[11px] text-[#0b5c52] hover:underline"
        >
          <Icone nome="seta" className="h-4 w-4" />
          Voltar à previsão
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
