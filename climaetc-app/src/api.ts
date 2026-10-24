export type Local = {
  nome: string
  latitude: number
  longitude: number
  cidade: string
  uf: string
}
export type Nivel = 'baixo' | 'moderado' | 'alto'
export type Hora = {
  hora: string
  temperatura: number
  probabilidade_chuva: number
  vento_kmh: number
  rajada_kmh: number
  chuva_mm: number
  descricao: string
}
export type Pedido = {
  origem: Local
  destino: Local
  profissao: string
  transporte: 'moto' | 'carro'
  data: string
  inicio: string
  fim: string
  fuso: string
  historico?: {
    data: string
    inicio: string
    fim: string
    fuso: string
    origem: string
    destino: string
    profissao: string
    transporte: 'moto' | 'carro'
    retorno:
      'nao_informado' | 'tranquilo' | 'chuva_atrapalhou' | 'mudei_horario'
  }[]
}
export type Resultado = Pedido & {
  distancia_km: number
  duracao_min: number
  geometria: number[][]
  nivel: Nivel
  pontos: {
    nome: string
    latitude: number
    longitude: number
    previsao: Hora[]
    nivel: Nivel
  }[]
  previsao: Hora[]
  resumo: string
  sugestoes: { dica: string; motivo: string }[]
  horarios_atencao: {
    inicio: string
    fim: string
    nivel: Nivel
    chance_max: number
    chuva_mm: number
    descricao: string
  }[]
  alertas: {
    fonte: string
    evento: string
    severidade: string
    inicio: string
    fim: string
    riscos: string[]
    instrucoes: string[]
  }[]
  alertas_status: 'parcial' | 'consultados_nos_extremos'
  gerado_por: 'gemma' | 'template'
  consultado_em: string
}

const base = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:8000'
    : 'https://clima-ia.onrender.com')
).replace(/\/$/, '')

async function requisitar<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 150000)
  try {
    const response = await fetch(`${base}${path}`, {
      ...options,
      signal: controller.signal,
    })
    const data = await response.json().catch(() => null)
    if (!response.ok)
      throw new Error(
        typeof data?.detail === 'string'
          ? data.detail
          : 'A consulta falhou. Tente novamente.'
      )
    if (!data) throw new Error('A API retornou uma resposta inválida.')
    return data as T
  } catch (e) {
    if (e instanceof TypeError)
      throw new Error(
        'Não conseguimos acessar a API. Confira a conexão; o servidor gratuito pode estar iniciando.',
        { cause: e }
      )
    if (e instanceof DOMException && e.name === 'AbortError')
      throw new Error(
        'A consulta demorou demais. Aguarde alguns instantes e tente novamente.',
        { cause: e }
      )
    throw e
  } finally {
    window.clearTimeout(timeout)
  }
}

export const buscarLocais = (q: string, uf = '') =>
  requisitar<Local[]>(
    `/locais?q=${encodeURIComponent(q)}&uf=${encodeURIComponent(uf)}`
  )
export const analisarRota = (pedido: Pedido) =>
  requisitar<Resultado>('/rotas/analise', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedido),
  })
