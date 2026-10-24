export type IconName =
  | 'nuvem'
  | 'chuvisco'
  | 'chuva'
  | 'gota'
  | 'vento'
  | 'termometro'
  | 'guardachuva'
  | 'caixa'
  | 'brilho'
  | 'relogio'
  | 'ajustes'
  | 'escudo'
  | 'info'
  | 'seta'
  | 'chevron'
  | 'atualizar'
  | 'gotas'

export interface HoraPrevisao {
  hora: string
  icone: IconName
  temp: number
  chuva: number
}

export interface Metrica {
  icone: IconName
  rotulo: string
  valor: string
  detalhe: string
}

export interface PassoPlano {
  icone: IconName
  titulo: string
  texto: string
  porque: string
}

export interface ComparativoValor {
  valor: string
  faixa?: string
}

export interface ComparativoItem {
  icone: IconName
  rotulo: string
  detalhe: string
  a: ComparativoValor
  b: ComparativoValor
}

export interface Turno {
  inicio: string
  fim: string
}

export interface EstadoTurnos {
  a: Turno
  b: Turno
}
