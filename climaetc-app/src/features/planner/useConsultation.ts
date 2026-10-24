import { useEffect, useRef, useState } from 'react'
import { getAnalysis, getForecast } from '../../services/climateApi'
import type { Plan, ShiftResult, Stage } from '../../types/climate'

export function useConsultation() {
  const [stage, setStage] = useState<Stage>('form')
  const [error, setError] = useState('')
  const [results, setResults] = useState<ShiftResult[]>([])
  const [weatherReady, setWeatherReady] = useState(false)
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  function edit() {
    controller.current?.abort()
    setStage('form')
  }
  async function run(plans: Plan[]) {
    controller.current?.abort()
    const current = new AbortController()
    controller.current = current
    setResults([])
    setError('')
    setWeatherReady(false)
    setStage('weather')
    try {
      const forecasts = await Promise.all(
        plans.map((plan) => getForecast(plan, current.signal))
      )
      if (current.signal.aborted) return
      setWeatherReady(true)
      setStage('analysis')
      const complete = await Promise.all(
        plans.map(async (plan, index) => ({
          plan,
          forecast: forecasts[index],
          analysis: await getAnalysis(plan, current.signal),
        }))
      )
      if (current.signal.aborted) return
      setResults(complete)
      setStage('complete')
    } catch (cause) {
      if (current.signal.aborted) return
      setError(
        cause instanceof Error
          ? cause.message
          : 'Falha inesperada. Tente novamente.'
      )
      setStage('error')
      current.abort()
    }
  }
  return { stage, error, results, weatherReady, run, edit }
}
