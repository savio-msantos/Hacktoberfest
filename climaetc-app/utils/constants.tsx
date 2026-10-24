import type {
  HoraPrevisao,
  Metrica,
  PassoPlano,
  ComparativoItem,
} from '../types'

export function calcularDuracaoHoras(inicio: string, fim: string): string {
  const i = parseInt(inicio, 10)
  const f = parseInt(fim, 10)
  const h = f >= i ? f - i : 24 - i + f
  return `${h} horas`
}

export const HORAS: HoraPrevisao[] = [
  { hora: '13h', icone: 'nuvem', temp: 32, chuva: 35 },
  { hora: '14h', icone: 'chuvisco', temp: 31, chuva: 55 },
  { hora: '15h', icone: 'chuva', temp: 29, chuva: 80 },
  { hora: '16h', icone: 'chuva', temp: 28, chuva: 85 },
  { hora: '17h', icone: 'chuvisco', temp: 28, chuva: 65 },
  { hora: '18h', icone: 'nuvem', temp: 29, chuva: 40 },
]

export const HORARIOS = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, '0')}:00`
)

export const METRICAS: Metrica[] = [
  { icone: 'gota', rotulo: 'Chuva • pico', valor: '85%', detalhe: 'às 16h' },
  { icone: 'vento', rotulo: 'Vento', valor: '10–18', detalhe: 'km/h no turno' },
  {
    icone: 'termometro',
    rotulo: 'Calor • pico',
    valor: '32 °C',
    detalhe: 'às 13h',
  },
]

export const PLANO: PassoPlano[] = [
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

export const COMPARATIVO: ComparativoItem[] = [
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
