import type { ShiftResult } from '../../types/climate'

// Front 2 can replace this component while keeping the shared ShiftResult contract.
export function Results({ results }: { results: ShiftResult[] }) {
  return (
    <div className="result-grid">
      {results.map((result, index) => (
        <article className="card result" key={index}>
          <span className="eyebrow">
            {results.length > 1
              ? `TURNO ${index === 0 ? 'A' : 'B'}`
              : 'SEU TURNO'}
          </span>
          <h2>
            {result.plan.inicio} às {result.plan.fim}
          </h2>
          <p>
            {result.forecast.cidade} · {result.forecast.fonte}
          </p>
          <div className="metrics">
            <strong>
              {Math.min(...result.forecast.previsao.map((h) => h.temperatura))}–
              {Math.max(...result.forecast.previsao.map((h) => h.temperatura))}{' '}
              °C
            </strong>
            <span>
              Chuva até{' '}
              {Math.max(
                ...result.forecast.previsao.map((h) => h.probabilidade_chuva)
              )}
              %
            </span>
            <span>
              Vento até{' '}
              {Math.max(...result.forecast.previsao.map((h) => h.vento_kmh))}{' '}
              km/h
            </span>
          </div>
          <h3>Resumo do turno</h3>
          <p>{result.analysis.resumo}</p>
          <small>
            {result.analysis.gerado_por === 'gemma'
              ? 'Análise gerada pelo Gemma'
              : 'Orientações automáticas · Gemma indisponível'}
          </small>
          <h3>Recomendações e checklist</h3>
          {result.analysis.sugestoes.map((item, i) => (
            <div className="suggestion" key={i}>
              <label>
                <input type="checkbox" />
                {item.dica}
              </label>
              <p>{item.motivo}</p>
            </div>
          ))}
          <details>
            <summary>Previsão hora a hora</summary>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Temperatura</th>
                    <th>Chuva</th>
                    <th>Vento</th>
                  </tr>
                </thead>
                <tbody>
                  {result.forecast.previsao.map((h, i) => (
                    <tr key={i}>
                      <td>{h.hora}</td>
                      <td>{h.temperatura} °C</td>
                      <td>{h.probabilidade_chuva}%</td>
                      <td>{h.vento_kmh} km/h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </article>
      ))}
    </div>
  )
}
