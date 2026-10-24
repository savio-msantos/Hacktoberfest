import { Icone, PLANO } from '../utils/constants.tsx'

export default function PlanoIA() {
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
