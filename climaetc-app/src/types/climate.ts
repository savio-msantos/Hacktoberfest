export type Profession = 'entregador' | 'mototaxista'
export interface Shift {
  inicio: string
  fim: string
}
export interface Plan extends Shift {
  cidade: string
  profissao: Profession
  data: string
}
export interface ForecastHour {
  hora: string
  temperatura: number
  probabilidade_chuva: number
  vento_kmh: number
  chuva_mm: number
  descricao: string
}
export interface Forecast {
  cidade: string
  data: string
  fonte: string
  previsao: ForecastHour[]
}
export interface Analysis {
  resumo: string
  horarios_atencao: {
    inicio: string
    fim: string
    nivel: string
    chance_max: number
    chuva_mm: number
    descricao: string
  }[]
  sugestoes: { dica: string; motivo: string }[]
  gerado_por: 'gemma' | 'template'
}
export interface ShiftResult {
  plan: Plan
  forecast: Forecast
  analysis: Analysis
}
export type Stage = 'form' | 'weather' | 'analysis' | 'error' | 'complete'
