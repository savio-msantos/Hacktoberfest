import type { Pedido } from './api'

export type Retorno =
  'nao_informado' | 'tranquilo' | 'chuva_atrapalhou' | 'mudei_horario'
export type Registro = Omit<Pedido, 'historico'> & {
  id: string
  retorno: Retorno
}
const chave = 'clima-historico-v1'

export function lerHistorico(): Registro[] {
  try {
    const dados: unknown = JSON.parse(localStorage.getItem(chave) || '[]')
    if (!Array.isArray(dados)) return []
    return dados
      .filter(
        (r): r is Registro =>
          r &&
          typeof r.id === 'string' &&
          typeof r.data === 'string' &&
          typeof r.inicio === 'string' &&
          typeof r.fim === 'string' &&
          typeof r.profissao === 'string' &&
          typeof r.fuso === 'string' &&
          typeof r.origem?.nome === 'string' &&
          typeof r.destino?.nome === 'string' &&
          Number.isFinite(r.origem?.latitude) &&
          Number.isFinite(r.origem?.longitude) &&
          Number.isFinite(r.destino?.latitude) &&
          Number.isFinite(r.destino?.longitude) &&
          ['moto', 'carro'].includes(r.transporte) &&
          [
            'nao_informado',
            'tranquilo',
            'chuva_atrapalhou',
            'mudei_horario',
          ].includes(r.retorno)
      )
      .slice(0, 10)
  } catch {
    return []
  }
}

export function salvarHistorico(registros: Registro[]): boolean {
  try {
    if (registros.length)
      localStorage.setItem(chave, JSON.stringify(registros.slice(0, 10)))
    else localStorage.removeItem(chave)
    return true
  } catch {
    return false
  }
}

export function paraContexto(
  registros: Registro[],
  profissao: string
): NonNullable<Pedido['historico']> {
  return registros
    .filter(
      (r) => r.profissao.trim().toLowerCase() === profissao.trim().toLowerCase()
    )
    .slice(0, 5)
    .map((r) => ({
      data: r.data,
      inicio: r.inicio,
      fim: r.fim,
      fuso: r.fuso,
      origem: r.origem.nome,
      destino: r.destino.nome,
      profissao: r.profissao,
      transporte: r.transporte,
      retorno: r.retorno,
    }))
}
