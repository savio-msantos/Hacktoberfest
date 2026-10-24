import type { Analysis, Forecast, Plan } from '../types/climate'
const baseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
async function post<T>(
  path: string,
  body: unknown,
  signal: AbortSignal
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.any([signal, AbortSignal.timeout(90000)]),
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(
      typeof payload?.detail === 'string'
        ? payload.detail
        : `Não foi possível concluir a consulta (${response.status}).`
    )
  }
  return response.json() as Promise<T>
}
export async function getForecast(
  plan: Plan,
  signal: AbortSignal
): Promise<Forecast> {
  const { cidade, inicio, fim, data } = plan
  // The updated backend handles the entire shift, including hours after midnight.
  const forecast = await post<Forecast>(
    '/previsao',
    { cidade, inicio, fim, data },
    signal
  )
  if (!forecast.previsao.length)
    throw new Error(
      'A previsão não contém horas para este turno. Altere o horário e tente novamente.'
    )
  return forecast
}
export function getAnalysis(plan: Plan, signal: AbortSignal) {
  // The updated backend retrieves its own trusted forecast for this date and shift.
  return post<Analysis>('/analise', plan, signal)
}
