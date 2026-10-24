import { useRef, useState, type FormEvent } from 'react'
import { NavLink } from 'react-router'
import {
  lerHistorico,
  salvarHistorico,
  paraContexto,
  type Registro,
  type Retorno,
} from './historico'
import {
  analisarRota,
  buscarLocais,
  type Local,
  type Nivel,
  type Pedido,
  type Resultado,
} from './api'

const HORAS = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, '0')}:00`
)
const rotulos = {
  baixo: 'Menor atenção',
  moderado: 'Atenção moderada',
  alto: 'Atenção elevada',
}
const fusos = [
  ['America/Rio_Branco', 'Acre · UTC−5'],
  ['America/Manaus', 'Manaus · UTC−4'],
  ['America/Sao_Paulo', 'Brasília · UTC−3'],
  ['America/Noronha', 'Noronha · UTC−2'],
]
type Formulario = Omit<Pedido, 'origem' | 'destino'> & {
  origem: Local | null
  destino: Local | null
  inicioB: string
  fimB: string
}

function inicial(): Formulario {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const data = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const padrao: Formulario = {
    origem: null,
    destino: null,
    profissao: 'Entregador',
    transporte: 'moto',
    data,
    inicio: '08:00',
    fim: '12:00',
    inicioB: '14:00',
    fimB: '18:00',
    fuso: 'America/Rio_Branco',
  }
  try {
    const salvo = sessionStorage.getItem('clima-planejamento-v1')
    return salvo ? { ...padrao, ...JSON.parse(salvo) } : padrao
  } catch {
    return padrao
  }
}

function Selo({ nivel }: { nivel: Nivel }) {
  return <span className={`selo ${nivel}`}>{rotulos[nivel]}</span>
}

function CampoLocal({
  titulo,
  valor,
  onChange,
}: {
  titulo: string
  valor: Local | null
  onChange: (v: Local | null) => void
}) {
  const [texto, setTexto] = useState(valor?.nome || '')
  const [opcoes, setOpcoes] = useState<Local[]>([])
  const [buscando, setBuscando] = useState(false)
  const [erro, setErro] = useState('')
  const sequencia = useRef(0)
  async function buscar() {
    const id = ++sequencia.current
    setBuscando(true)
    setErro('')
    setOpcoes([])
    try {
      const locais = await buscarLocais(texto.trim())
      if (id !== sequencia.current) return
      setOpcoes(locais)
      if (!locais.length)
        setErro(
          'Nenhum local encontrado. Inclua cidade e estado ou tente um ponto de referência.'
        )
    } catch (e) {
      if (id === sequencia.current) setErro((e as Error).message)
    } finally {
      if (id === sequencia.current) setBuscando(false)
    }
  }
  return (
    <div className="campo-local">
      <label htmlFor={titulo}>{titulo}</label>
      <div className="busca-local">
        <input
          id={titulo}
          value={texto}
          maxLength={180}
          placeholder="Rua ou ponto de referência, cidade e estado"
          onChange={(e) => {
            sequencia.current++
            setBuscando(false)
            setTexto(e.target.value)
            onChange(null)
            setOpcoes([])
            setErro('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (texto.trim().length >= 3) void buscar()
            }
          }}
        />
        <button
          type="button"
          className="botao leve"
          disabled={buscando || texto.trim().length < 3}
          onClick={() => void buscar()}
        >
          {buscando ? 'Buscando…' : 'Buscar'}
        </button>
      </div>
      {valor && (
        <small className="selecionado">✓ Local selecionado: {valor.nome}</small>
      )}
      {erro && (
        <small role="alert" className="erro-texto">
          {erro}
        </small>
      )}
      {!!opcoes.length && (
        <ul className="opcoes" aria-label={`Resultados de ${titulo}`}>
          {opcoes.map((local, i) => (
            <li key={`${local.latitude}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  setTexto(local.nome)
                  onChange(local)
                  setOpcoes([])
                }}
              >
                {local.nome}
                <small>
                  {local.latitude.toFixed(4)}, {local.longitude.toFixed(4)}
                </small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Horario({
  titulo,
  inicio,
  fim,
  mudar,
}: {
  titulo: string
  inicio: string
  fim: string
  mudar: (campo: 'inicio' | 'fim', v: string) => void
}) {
  return (
    <fieldset className="horario">
      <legend>{titulo}</legend>
      <div className="dupla">
        <label>
          Início
          <select
            value={inicio}
            onChange={(e) => mudar('inicio', e.target.value)}
          >
            {HORAS.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </label>
        <label>
          Fim
          <select value={fim} onChange={(e) => mudar('fim', e.target.value)}>
            {HORAS.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </label>
      </div>
      {fim < inicio && <small>O período termina no dia seguinte.</small>}
    </fieldset>
  )
}

function Tracado({ resultado: r }: { resultado: Resultado }) {
  const xs = r.geometria.map((c) => c[0]),
    ys = r.geometria.map((c) => c[1])
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys)
  const cos = Math.cos((((minY + maxY) / 2) * Math.PI) / 180)
  const escala = Math.min(
    530 / Math.max((maxX - minX) * cos, 0.001),
    190 / Math.max(maxY - minY, 0.001)
  )
  const projetar = (lon: number, lat: number) => [
    35 + (lon - minX) * cos * escala,
    225 - (lat - minY) * escala,
  ]
  return (
    <section className="cartao">
      <div className="titulo-linha">
        <h2>Seu trajeto</h2>
        <span className="muted">{r.distancia_km} km</span>
      </div>
      <p className="muted pequeno">
        Esquema da via calculada · cinco pontos de previsão
      </p>
      <svg
        className="mapa-rota"
        viewBox="0 0 600 270"
        role="img"
        aria-label="Traçado rodoviário com cinco pontos de consulta climática"
      >
        <defs>
          <pattern
            id="grade"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke="#dde9e3"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="600" height="270" rx="16" fill="url(#grade)" />
        <polyline
          points={r.geometria
            .map((c) => projetar(c[0], c[1]).join(','))
            .join(' ')}
          fill="none"
          stroke="#0b5c52"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {r.pontos.map((p, i) => {
          const [x, y] = projetar(p.longitude, p.latitude)
          return (
            <g key={p.nome}>
              <circle
                cx={x}
                cy={y}
                r="11"
                fill={
                  p.nivel === 'alto'
                    ? '#b44e25'
                    : p.nivel === 'moderado'
                      ? '#bd8719'
                      : '#0b5c52'
                }
                stroke="white"
                strokeWidth="3"
              />
              <text
                x={x}
                y={y - 17}
                textAnchor="middle"
                fill="#243c33"
                fontSize="12"
              >
                {i + 1}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="extremos">
        <span>
          <b>1 · Origem</b>
          {r.origem.nome}
        </span>
        <span>
          <b>5 · Destino</b>
          {r.destino.nome}
        </span>
      </div>
      <p className="muted pequeno">
        Trajeto de referência para carro, inclusive nas atividades de moto.
        Estimativa de {r.duracao_min} min sem trânsito; não considera paradas de
        trabalho ou interdições.
      </p>
      <a
        className="link"
        target="_blank"
        rel="noreferrer"
        href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${r.origem.latitude}%2C${r.origem.longitude}%3B${r.destino.latitude}%2C${r.destino.longitude}`}
      >
        Conferir trajeto no OpenStreetMap ↗
      </a>
    </section>
  )
}

function PainelResultado({
  resultado: r,
  titulo = 'Análise do trajeto',
}: {
  resultado: Resultado
  titulo?: string
}) {
  const max = (k: 'temperatura' | 'probabilidade_chuva' | 'rajada_kmh') =>
    Math.max(...r.previsao.map((h) => h[k]))
  return (
    <div className="resultado">
      <section className="resumo cartao">
        <div className="titulo-linha">
          <span className="eyebrow">{titulo}</span>
          <Selo nivel={r.nivel} />
        </div>
        <h2>
          {r.inicio}–{r.fim} · {r.profissao}
        </h2>
        <p>{r.resumo}</p>
        <div className="metricas">
          <div>
            <strong>{max('probabilidade_chuva')}%</strong>
            <span>pico de chance horária</span>
          </div>
          <div>
            <strong>{max('temperatura')} °C</strong>
            <span>maior temperatura</span>
          </div>
          <div>
            <strong>{max('rajada_kmh')} km/h</strong>
            <span>maior rajada</span>
          </div>
        </div>
        <small>
          {r.data.split('-').reverse().join('/')} · {r.fuso} · consultado às{' '}
          {new Date(r.consultado_em).toLocaleTimeString('pt-BR', {
            timeZone: r.fuso,
            hour: '2-digit',
            minute: '2-digit',
          })}
        </small>
      </section>
      <div className="grade-resultado">
        <div className="coluna">
          <Tracado resultado={r} />
          <section className="cartao">
            <h2>Condições por hora</h2>
            <p className="muted pequeno">
              Maiores valores entre os cinco pontos em cada horário. Chance de
              chuva horária, não do turno inteiro; mm correspondem ao acumulado
              da hora meteorológica.
            </p>
            <div className="tabela-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Chuva</th>
                    <th>mm</th>
                    <th>Calor</th>
                    <th>Rajadas</th>
                  </tr>
                </thead>
                <tbody>
                  {r.previsao.map((h, i) => (
                    <tr key={`${h.hora}-${i}`}>
                      <th>
                        {h.hora}
                        {i > 0 && h.hora === '00:00' ? ' (+1 dia)' : ''}
                      </th>
                      <td>
                        {h.probabilidade_chuva}%
                        <span className="barra">
                          <i style={{ width: `${h.probabilidade_chuva}%` }} />
                        </span>
                      </td>
                      <td>{h.chuva_mm}</td>
                      <td>{h.temperatura} °C</td>
                      <td>{h.rajada_kmh} km/h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="cartao">
            <h2>Ao longo do caminho</h2>
            <p className="muted pequeno">
              Todos os pontos são avaliados durante o período inteiro, sem
              estimar sua chegada a cada trecho.
            </p>
            <ul className="pontos">
              {r.pontos.map((p, i) => (
                <li key={p.nome}>
                  <span className="numero">{i + 1}</span>
                  <div>
                    <b>{p.nome}</b>
                    <small>
                      {Math.max(
                        ...p.previsao.map((h) => h.probabilidade_chuva)
                      )}
                      % chuva · até{' '}
                      {Math.max(...p.previsao.map((h) => h.temperatura))} °C
                    </small>
                  </div>
                  <Selo nivel={p.nivel} />
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="coluna">
          <section className="cartao plano">
            <div className="titulo-linha">
              <h2>Seu plano de trabalho</h2>
              <span className="selo baixo">
                {r.gerado_por === 'gemma' ? 'Gemma · IA' : 'Orientações padrão'}
              </span>
            </div>
            <p className="muted pequeno">
              {r.gerado_por === 'gemma'
                ? 'Gemma interpreta os dados meteorológicos para sua profissão.'
                : 'A IA não respondeu nesta consulta. Estas orientações usam regras e o perfil informado.'}
            </p>
            <ul className="sugestoes">
              {r.sugestoes.map((s, i) => (
                <li key={i}>
                  <span className="numero">{i + 1}</span>
                  <div>
                    <h3>{s.dica}</h3>
                    <p>{s.motivo}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="cartao">
            <h2>Horários de atenção</h2>
            {r.horarios_atencao.length ? (
              r.horarios_atencao.map((j, i) => (
                <div className="janela" key={i}>
                  <div className="titulo-linha">
                    <b>
                      {j.inicio}–{j.fim}
                    </b>
                    <Selo nivel={j.nivel} />
                  </div>
                  <p>
                    Até {j.chance_max}% de chuva · {j.descricao}
                  </p>
                </div>
              ))
            ) : (
              <p className="muted">
                Sem janelas pelos limiares de chuva e rajadas. Confira também
                calor e alertas.
              </p>
            )}
          </section>
          <section className="cartao">
            <h2>Alertas oficiais · INMET</h2>
            <p className="muted pequeno">
              Consulta apenas aos municípios da origem e do destino. Não cobre
              todos os municípios intermediários.
            </p>
            {r.alertas_status === 'parcial' && (
              <p className="aviso">
                Consulta incompleta ou indisponível. A ausência de avisos nesta
                tela não significa ausência de alertas.
              </p>
            )}
            {r.alertas.map((a, i) => (
              <article className="aviso" key={i}>
                <h3>
                  {a.evento} · {a.severidade}
                </h3>
                <p>
                  {a.inicio} a {a.fim} · horário de Brasília
                </p>
                {a.riscos.map((v) => (
                  <p key={v}>{v}</p>
                ))}
                {a.instrucoes.map((v) => (
                  <p key={v}>{v}</p>
                ))}
              </article>
            ))}
            {!r.alertas.length && r.alertas_status !== 'parcial' && (
              <p>
                Nenhum alerta encontrado nos dois municípios para o período.
              </p>
            )}
            <a
              className="link"
              href="https://alertas2.inmet.gov.br/"
              target="_blank"
              rel="noreferrer"
            >
              Conferir avisos do INMET ↗
            </a>
          </section>
        </div>
      </div>
      <p className="nota">
        Atenção climática estimada, não uma garantia de que a atividade ou a via
        esteja segura. Cinco amostras não cobrem cada rua. Confira as condições
        locais antes de sair.
      </p>
    </div>
  )
}

function Comparacao({ resultados }: { resultados: Resultado[] }) {
  const valores = resultados.map((r) => ({
    chuva:
      r.previsao.reduce((s, h) => s + h.probabilidade_chuva, 0) /
      r.previsao.length,
    calor: Math.max(...r.previsao.map((h) => h.temperatura)),
    vento: Math.max(...r.previsao.map((h) => h.rajada_kmh)),
  }))
  const diferenca = valores[0].chuva - valores[1].chuva
  return (
    <>
      <section className="cartao comparacao">
        <span className="eyebrow">Mesma rota · dois períodos</span>
        <h2>
          {Math.abs(diferenca) < 0.1
            ? 'Os períodos têm média de chuva semelhante'
            : `Período ${diferenca < 0 ? 'A' : 'B'} tem menor média de chance horária de chuva`}
        </h2>
        <p className="muted">
          Observe também calor, rajadas e avisos. Esse indicador não determina
          um turno seguro.
        </p>
        <div className="tabela-scroll">
          <table>
            <thead>
              <tr>
                <th>Indicador</th>
                {resultados.map((r, i) => (
                  <th key={i}>
                    {i === 0 ? 'A' : 'B'} · {r.inicio}–{r.fim}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Média de chance horária*</th>
                {valores.map((v, i) => (
                  <td key={i}>{v.chuva.toFixed(1)}%</td>
                ))}
              </tr>
              <tr>
                <th>Temperatura máxima</th>
                {valores.map((v, i) => (
                  <td key={i}>{v.calor} °C</td>
                ))}
              </tr>
              <tr>
                <th>Rajada máxima</th>
                {valores.map((v, i) => (
                  <td key={i}>{v.vento} km/h</td>
                ))}
              </tr>
              <tr>
                <th>Atenção climática</th>
                {resultados.map((r, i) => (
                  <td key={i}>
                    <Selo nivel={r.nivel} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <small>
          *Média dos máximos entre os pontos a cada hora; não é a chance de
          chover no turno inteiro.
        </small>
      </section>
      {resultados.map((r, i) => (
        <PainelResultado
          key={i}
          resultado={r}
          titulo={`Período ${i === 0 ? 'A' : 'B'}`}
        />
      ))}
    </>
  )
}

export default function Planejador({
  comparar = false,
}: {
  comparar?: boolean
}) {
  const [form, setForm] = useState<Formulario>(inicial)
  const [historico, setHistorico] = useState<Registro[]>(lerHistorico)
  const [usarHistorico, setUsarHistorico] = useState(true)
  const [avisoHistorico, setAvisoHistorico] = useState('')
  const [restauracao, setRestauracao] = useState(0)
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const alterar = <K extends keyof Formulario>(k: K, v: Formulario[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    setResultados([])
    setErro('')
  }
  function guardar(registros: Registro[]) {
    setHistorico(registros)
    setAvisoHistorico(
      salvarHistorico(registros)
        ? ''
        : 'O navegador não permitiu salvar ou apagar o histórico. Os dados desta sessão podem ser perdidos ao fechar a página.'
    )
  }
  function repetir(r: Registro) {
    setForm((f) => ({
      ...f,
      origem: r.origem,
      destino: r.destino,
      profissao: r.profissao,
      transporte: r.transporte,
      inicio: r.inicio,
      fim: r.fim,
      fuso: r.fuso,
    }))
    setRestauracao((v) => v + 1)
    setResultados([])
    setErro('')
  }
  async function consultar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setResultados([])
    if (!form.origem || !form.destino) {
      setErro('Busque e selecione um resultado para a origem e o destino.')
      return
    }
    if (!form.profissao.trim()) {
      setErro('Informe sua profissão.')
      return
    }
    if (form.inicio === form.fim || (comparar && form.inicioB === form.fimB)) {
      setErro('O início e o fim de cada período devem ser diferentes.')
      return
    }
    if (
      form.origem.latitude === form.destino.latitude &&
      form.origem.longitude === form.destino.longitude
    ) {
      setErro('Escolha origem e destino diferentes.')
      return
    }
    setCarregando(true)
    const pedido: Pedido = {
      origem: form.origem,
      destino: form.destino,
      profissao: form.profissao,
      transporte: form.transporte,
      data: form.data,
      inicio: form.inicio,
      fim: form.fim,
      fuso: form.fuso,
      historico: usarHistorico ? paraContexto(historico, form.profissao) : [],
    }
    try {
      try {
        sessionStorage.setItem('clima-planejamento-v1', JSON.stringify(form))
      } catch {
        /* Armazenamento pode estar desativado. */
      }
      const a = await analisarRota(pedido)
      const b = comparar
        ? await analisarRota({
            ...pedido,
            inicio: form.inicioB,
            fim: form.fimB,
          })
        : null
      setResultados(b ? [a, b] : [a])
      const registros = (b ? [a, b] : [a]).map((r): Registro => ({
        id: crypto.randomUUID(),
        origem: r.origem,
        destino: r.destino,
        profissao: r.profissao,
        transporte: r.transporte,
        data: r.data,
        inicio: r.inicio,
        fim: r.fim,
        fuso: r.fuso,
        retorno: 'nao_informado',
      }))
      const assinatura = (r: Registro) =>
        JSON.stringify([
          r.data,
          r.inicio,
          r.fim,
          r.fuso,
          r.profissao,
          r.transporte,
          r.origem.latitude,
          r.origem.longitude,
          r.destino.latitude,
          r.destino.longitude,
        ])
      const anteriores = new Map(historico.map((r) => [assinatura(r), r]))
      const novos = registros.map((r) => anteriores.get(assinatura(r)) || r)
      guardar(
        [
          ...novos,
          ...historico.filter(
            (r) => !registros.some((n) => assinatura(n) === assinatura(r))
          ),
        ].slice(0, 10)
      )
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregando(false)
    }
  }
  return (
    <>
      <header className="cabecalho">
        <div className="container header-inner">
          <NavLink className="marca" to="/">
            ☁{' '}
            <span>
              Alerta Climático<small>O tempo no seu caminho.</small>
            </span>
          </NavLink>
          <nav aria-label="Navegação principal">
            <NavLink to="/" end>
              Planejar trajeto
            </NavLink>
            <NavLink to="/comparar-turnos">Comparar turnos</NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        <div className="introducao">
          <span className="eyebrow">Clima, caminho e trabalho</span>
          <h1>
            {comparar
              ? 'Qual período combina com seu trabalho?'
              : 'Prepare seu trabalho antes de sair.'}
          </h1>
          <p>
            Informe seu trajeto e veja como a previsão pode afetar suas
            atividades, com orientações para sua profissão.
          </p>
        </div>
        <form className="cartao formulario" onSubmit={(e) => void consultar(e)}>
          <fieldset disabled={carregando} className="sem-borda">
            <div className="titulo-linha">
              <h2>
                {comparar
                  ? 'Compare dois períodos na mesma rota'
                  : 'Planeje seu trajeto'}
              </h2>
              <span className="muted pequeno">Locais no Brasil</span>
            </div>
            <div className="dupla locais">
              <CampoLocal
                key={`origem-${restauracao}`}
                titulo="Origem"
                valor={form.origem}
                onChange={(v) => alterar('origem', v)}
              />
              <CampoLocal
                key={`destino-${restauracao}`}
                titulo="Destino"
                valor={form.destino}
                onChange={(v) => alterar('destino', v)}
              />
            </div>
            <div className="grade-form">
              <label>
                Sua profissão
                <input
                  required
                  value={form.profissao}
                  maxLength={60}
                  placeholder="Ex.: entregador, técnico, vendedor"
                  onChange={(e) => alterar('profissao', e.target.value)}
                />
              </label>
              <label>
                Deslocamento
                <select
                  value={form.transporte}
                  onChange={(e) =>
                    alterar(
                      'transporte',
                      e.target.value as Pedido['transporte']
                    )
                  }
                >
                  <option value="moto">Moto</option>
                  <option value="carro">Carro</option>
                </select>
              </label>
              <label>
                Data
                <input
                  type="date"
                  required
                  value={form.data}
                  onChange={(e) => alterar('data', e.target.value)}
                />
              </label>
              <label>
                Fuso dos horários
                <select
                  value={form.fuso}
                  onChange={(e) => alterar('fuso', e.target.value)}
                >
                  {fusos.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="dupla">
              <Horario
                titulo={comparar ? 'Período A' : 'Período das atividades'}
                inicio={form.inicio}
                fim={form.fim}
                mudar={(k, v) => alterar(k, v)}
              />
              {comparar && (
                <Horario
                  titulo="Período B"
                  inicio={form.inicioB}
                  fim={form.fimB}
                  mudar={(k, v) =>
                    alterar(k === 'inicio' ? 'inicioB' : 'fimB', v)
                  }
                />
              )}
            </div>
            <label className="opcao-historico">
              <input
                type="checkbox"
                checked={usarHistorico}
                onChange={(e) => setUsarHistorico(e.target.checked)}
              />
              Usar meus últimos planejamentos para personalizar as orientações
              do Gemma
            </label>
            <small className="muted">
              Histórico salvo somente neste navegador. Ao ativar, até cinco
              registros da mesma profissão são enviados para a API e para a IA.
            </small>
            <div className="form-rodape">
              <p className="muted pequeno">
                O clima será avaliado em cinco pontos durante todo o período.
                Selecione o fuso do local de trabalho.
              </p>
              <button className="botao principal" type="submit">
                {carregando
                  ? 'Consultando clima e Gemma…'
                  : comparar
                    ? 'Comparar períodos →'
                    : 'Analisar meu trajeto →'}
              </button>
            </div>
          </fieldset>
        </form>
        <section className="cartao historico">
          <div className="titulo-linha">
            <h2>Seus últimos planejamentos</h2>
            {!!historico.length && (
              <button
                type="button"
                disabled={carregando}
                className="botao leve"
                onClick={() => guardar([])}
              >
                Apagar histórico
              </button>
            )}
          </div>
          <p className="muted pequeno">
            Reaproveite um trajeto e conte como foi. Ao repetir, a data atual do
            formulário é mantida: confira antes de consultar.
          </p>
          {!historico.length && (
            <p className="muted pequeno">
              Seus planejamentos vão aparecer aqui depois da primeira análise.
            </p>
          )}
          {historico.map((r) => (
            <article className="registro-historico" key={r.id}>
              <div>
                <h3>
                  {r.origem.nome} → {r.destino.nome}
                </h3>
                <small>
                  {r.data.split('-').reverse().join('/')} · {r.inicio}–{r.fim} ·{' '}
                  {r.profissao} · {r.fuso}
                </small>
              </div>
              <div className="acoes-historico">
                <label>
                  Como foi?
                  <select
                    disabled={carregando}
                    value={r.retorno}
                    onChange={(e) =>
                      guardar(
                        historico.map((h) =>
                          h.id === r.id
                            ? { ...h, retorno: e.target.value as Retorno }
                            : h
                        )
                      )
                    }
                  >
                    <option value="nao_informado">Ainda não informei</option>
                    <option value="tranquilo">Consegui trabalhar bem</option>
                    <option value="chuva_atrapalhou">A chuva atrapalhou</option>
                    <option value="mudei_horario">
                      Precisei mudar o horário
                    </option>
                  </select>
                </label>
                <button
                  type="button"
                  disabled={carregando}
                  className="botao leve"
                  onClick={() => repetir(r)}
                >
                  Repetir trajeto
                </button>
              </div>
            </article>
          ))}
          {avisoHistorico && (
            <p role="status" className="aviso">
              {avisoHistorico}
            </p>
          )}
        </section>
        {carregando && (
          <div role="status" aria-live="polite" className="cartao carregando">
            <span className="spinner" />
            Buscando trajeto, previsão e orientações. A primeira consulta pode
            demorar até dois minutos enquanto o servidor inicia.
          </div>
        )}
        {erro && (
          <div role="alert" className="aviso erro">
            {erro}
          </div>
        )}
        {!carregando && !erro && !resultados.length && (
          <section className="vazio">
            <span>↗</span>
            <h2>Uma previsão que acompanha sua rotina</h2>
            <p>
              Selecione os locais, conte o que você faz e consulte os horários.
              Os resultados aparecem aqui com dados da API.
            </p>
            <div className="etapas">
              <b>01 · Seu caminho</b>
              <b>02 · O clima por hora</b>
              <b>03 · Seu plano com Gemma</b>
            </div>
          </section>
        )}
        {!!resultados.length &&
          (comparar ? (
            <Comparacao resultados={resultados} />
          ) : (
            <PainelResultado resultado={resultados[0]} />
          ))}
      </main>
      <footer className="rodape container">
        Previsão:{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo
        </a>{' '}
        · Locais e vias: ©{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap contributors
        </a>
        , Photon e OSRM · Alertas: INMET · Análise: Gemma, quando disponível.
      </footer>
    </>
  )
}
