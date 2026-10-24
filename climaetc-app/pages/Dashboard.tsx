import { METRICAS } from '../utils/constants.tsx'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import BotaoSecundario from '../components/BotaoSecundario'
import CartaoPrevisao from '../components/CartaoPrevisao'
import CartaoMetrica from '../components/CartaoMetrica'
import GraficoHora from '../components/GraficoHora'
import AvisoOficial from '../components/AvisoOficial'
import PlanoIA from '../components/PlanoIA'

export default function AlertaClimatico() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f3f6f5] font-sans text-slate-800">
      <Header />

      <main className="mx-auto w-full max-w-275 flex-1 px-6 py-8">
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

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
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

          <div className="space-y-4">
            <PlanoIA />
            <BotaoSecundario className="w-full">
              Planejar outro turno
            </BotaoSecundario>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
