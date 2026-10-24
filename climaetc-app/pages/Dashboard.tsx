import React from 'react'

/* ------------------------------------------------------------------ */
/* Dados de exemplo                                                    */
/* ------------------------------------------------------------------ */
const HORAS = [
  { hora: '13h', icone: 'nuvem', temp: 32, chuva: 35 },
  { hora: '14h', icone: 'chuvisco', temp: 31, chuva: 55 },
  { hora: '15h', icone: 'chuva', temp: 29, chuva: 80 },
  { hora: '16h', icone: 'chuva', temp: 28, chuva: 85 },
  { hora: '17h', icone: 'chuvisco', temp: 28, chuva: 65 },
  { hora: '18h', icone: 'nuvem', temp: 29, chuva: 40 },
]

const METRICAS = [
  { icone: 'gota', rotulo: 'Chuva • pico', valor: '85%', detalhe: 'às 16h' },
  { icone: 'vento', rotulo: 'Vento', valor: '10–18', detalhe: 'km/h no turno' },
  {
    icone: 'termometro',
    rotulo: 'Calor • pico',
    valor: '32 °C',
    detalhe: 'às 13h',
  },
]

const PLANO = [
  {
    icone: 'gota',
    titulo: '13h–14h · Organize as saídas',
    texto:
      'Se possível, priorize trajetos mais longos no início do turno. Leve água e faça pausas à sombra.',
    porque:
      'Por quê? Às 13h, a chance de chuva é de 35% e a temperatura chega a 32 °C.',
  },
  {
    icone: 'guardachuva',
    titulo: '15h–16h · Redobre o cuidado',
    texto:
      'Prefira rotas curtas e pontos de espera cobertos. Na chuva, reduza a velocidade e evite trechos alagados.',
    porque:
      'Por quê? A chance de chuva sobe para 80–85%; o vento chega a 18 km/h às 16h.',
  },
  {
    icone: 'caixa',
    titulo: 'Antes de sair · Proteja a carga',
    texto:
      'Separe a capa e vede a mochila. Use proteção impermeável para celular e comprovantes.',
    porque:
      'Por quê? Há chance de chuva em todo o turno, inclusive 65% às 17h e 40% às 18h.',
  },
]

/* ------------------------------------------------------------------ */
/* Ícones (SVG inline, sem dependências)                               */
/* ------------------------------------------------------------------ */
const Svg = ({ children, className = 'h-4 w-4', ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
)

const Nuvem = ({ className }) => (
  <Svg className={className}>
    <path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 9.5a4.25 4.25 0 0 1 .5 8.5H7Z" />
  </Svg>
)

const NuvemChuva = ({ className, intensa }) => (
  <Svg className={className}>
    <path d="M7 15a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 6.5a4.25 4.25 0 0 1 .5 8.5H7Z" />
    <path d="M8 18.5 7 21M12 18.5 11 21M16 18.5 15 21" />
    {intensa && <path d="M10 17.5 9 20" strokeOpacity="0" />}
  </Svg>
)

const Icones = {
  nuvem: (c) => <Nuvem className={c} />,
  chuvisco: (c) => <NuvemChuva className={c} />,
  chuva: (c) => <NuvemChuva className={c} intensa />,
  gota: (c) => (
    <Svg className={c}>
      <path d="M12 3c3.5 4.2 6 7.2 6 10.5a6 6 0 0 1-12 0C6 10.2 8.5 7.2 12 3Z" />
    </Svg>
  ),
  vento: (c) => (
    <Svg className={c}>
      <path d="M3 8h10a2.5 2.5 0 1 0-2.5-2.5M3 12h15a2.5 2.5 0 1 1-2.5 2.5M3 16h7a2.5 2.5 0 1 1-2.5 2.5" />
    </Svg>
  ),
  termometro: (c) => (
    <Svg className={c}>
      <path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z" />
    </Svg>
  ),
  guardachuva: (c) => (
    <Svg className={c}>
      <path d="M3 13a9 9 0 0 1 18 0H3Z" />
      <path d="M12 13v5a2 2 0 0 0 4 0" />
    </Svg>
  ),
  caixa: (c) => (
    <Svg className={c}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </Svg>
  ),
  brilho: (c) => (
    <Svg className={c}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
    </Svg>
  ),
  relogio: (c) => (
    <Svg className={c}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  ),
  ajustes: (c) => (
    <Svg className={c}>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
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
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
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

function CartaoPrevisao() {
  return (
    <section className="rounded-2xl bg-[#04463e] p-6 text-white">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-white/80">
        <span>Previsão meteorológica</span>
        <span>Demo</span>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-6xl font-light tracking-tight">28°–32°</span>
          <span className="max-w-[90px] text-sm leading-snug text-white/80">
            Calor e chuva à tarde
          </span>
        </div>
        <NuvemChuva className="h-14 w-14 text-white/80" />
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-lg bg-[#fbe9d0] px-4 py-3 text-xs font-medium text-[#a8530f]">
        <Icone nome="guardachuva" className="h-4 w-4" />
        Mais chance de chuva entre 15h e 16h
      </div>
    </section>
  )
}

function CartaoMetrica({ icone, rotulo, valor, detalhe }) {
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

function GraficoHora() {
  const ALTURA = 170 // px da barra de fundo
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-slate-800">Seu turno, hora a hora</h2>
        <Icone nome="relogio" className="h-5 w-5 text-[#0b5c52]" />
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
        <span>Probabilidade de chuva (%)</span>
        <span className="flex items-center gap-1.5 text-[#a8530f]">
          <span className="h-2 w-2 rounded-[2px] bg-[#f2b955]" />
          Maior chance · 15h–16h
        </span>
      </div>

      <div className="mt-5 grid grid-cols-6 gap-2">
        {HORAS.map((h) => {
          const destaque = h.chuva >= 80
          return (
            <div key={h.hora} className="flex flex-col items-center">
              <span className="text-xs text-slate-800">{h.hora}</span>
              <Icone nome={h.icone} className="mt-3 h-5 w-5 text-slate-500" />
              <span className="mt-2 text-xs text-slate-700">{h.temp}°</span>

              <div
                className="relative mt-3 flex w-full items-end overflow-hidden rounded-md bg-[#f3f5f4]"
                style={{ height: ALTURA }}
              >
                <div
                  className={`w-full rounded-md ${
                    destaque ? 'bg-[#f2b955]' : 'bg-[#a3c9d6]'
                  }`}
                  style={{ height: `${h.chuva}%` }}
                />
              </div>

              <span
                className={`mt-3 text-xs font-medium ${
                  destaque ? 'text-[#a8530f]' : 'text-[#2f6f86]'
                }`}
              >
                {h.chuva}%
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-6 border-t border-slate-200 pt-3 text-[10px] leading-relaxed text-slate-500">
        <p>Fonte: amostra de API meteorológica · 24 out.</p>
        <p>Valores de exemplo, não uma previsão real.</p>
      </div>
    </section>
  )
}

function AvisoOficial() {
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

function PlanoIA() {
  return (
    <section className="rounded-2xl border border-[#0b5c52] bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#0b5c52]">
          <Icone nome="brilho" className="h-5 w-5" />
          <h2 className="text-lg text-slate-800">Seu plano com Gemma</h2>
        </div>
        <span className="rounded bg-[#e3ebe8] px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
          IA
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-700">
        Seu turno começa quente e fica mais chuvoso no meio da tarde. Prepare a
        proteção antes de sair e ajuste as rotas entre 15h e 16h.
      </p>

      <hr className="my-5 border-slate-200" />

      <ul className="space-y-5">
        {PLANO.map((item) => (
          <li key={item.titulo} className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e3ebe8] text-[#0b5c52]">
              <Icone nome={item.icone} className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                {item.titulo}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {item.texto}
              </p>
              <p className="mt-2 text-[10px] text-slate-500">{item.porque}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-lg bg-[#dcefe8] p-4">
        <p className="text-[11px] font-semibold text-[#0b5c52]">
          Orientações de IA · demonstração
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
          O Gemma interpreta apenas os dados exibidos. Os números vêm da amostra
          meteorológica, não da IA.
        </p>
      </div>
    </section>
  )
}

function BotaoSecundario({ children, className = '' }) {
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

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */
export default function AlertaClimatico() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f3f6f5] font-sans text-slate-800">
      <Header />

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-8">
        {/* Título da página */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#0b5c52]">
              Previsão e orientações
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-4">
              <h1 className="text-3xl font-normal text-slate-900">
                Rio Branco, AC
              </h1>
              <span className="text-xs text-slate-500">
                Entregador · Hoje, 13h às 18h
              </span>
            </div>
          </div>
          <BotaoSecundario>Editar</BotaoSecundario>
        </div>

        {/* Grade principal */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* Coluna esquerda */}
          <div className="space-y-6">
            <CartaoPrevisao />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {METRICAS.map((m) => (
                <CartaoMetrica key={m.rotulo} {...m} />
              ))}
            </div>

            <GraficoHora />
            <AvisoOficial />
          </div>

          {/* Coluna direita */}
          <div className="space-y-4">
            <PlanoIA />
            <BotaoSecundario className="w-full">
              Planejar outro turno
            </BotaoSecundario>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-2 px-6 py-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-2">
            <Icone nome="info" className="h-3.5 w-3.5" />
            Previsão e análise demonstrativas. Sem consulta em tempo real.
          </span>
          <span>Para entregadores e mototaxistas da região Norte</span>
        </div>
      </footer>
    </div>
  )
}
