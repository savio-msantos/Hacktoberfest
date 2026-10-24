import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Icon } from "../../components/Icon";
import type { Plan, Shift } from "../../types/climate";
import { displayDate, localDate, nextDate } from "../../utils/date";
import { ShiftFields } from "./ShiftFields";
import { useConsultation } from "./useConsultation";
import { Results } from "./Results";

export function Planner() {
  const [plan, setPlan] = useState<Plan>({
    cidade: "Rio Branco",
    profissao: "entregador",
    inicio: "13:00",
    fim: "18:00",
    data: localDate(),
  });
  const [compare, setCompare] = useState(false);
  const [alternative, setAlternative] = useState<Shift>({
    inicio: "08:00",
    fim: "13:00",
  });
  const [validation, setValidation] = useState("");
  const [locationMessage, setLocationMessage] = useState(
    "Você também pode escolher a cidade, sem usar GPS.",
  );
  const [locating, setLocating] = useState(false);
  const locationRequest = useRef(0);
  const query = useConsultation();
  const isForm = query.stage === "form";
  const failed = query.stage === "error";
  const complete = query.stage === "complete";
  const plans = () => (compare ? [plan, { ...plan, ...alternative }] : [plan]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plan.cidade.trim()) {
      setValidation("Informe a cidade onde você vai trabalhar.");
      return;
    }
    if (
      plan.inicio === plan.fim ||
      (compare && alternative.inicio === alternative.fim)
    ) {
      setValidation("O começo e o fim de cada turno precisam ser diferentes.");
      return;
    }
    if (
      compare &&
      plan.inicio === alternative.inicio &&
      plan.fim === alternative.fim
    ) {
      setValidation("Escolha horários diferentes para comparar os turnos.");
      return;
    }
    locationRequest.current++;
    setLocating(false);
    setValidation("");
    void query.run(plans().map((p) => ({ ...p, cidade: p.cidade.trim() })));
  }
  function locate() {
    if (!navigator.geolocation) {
      setLocationMessage("Localização indisponível. Digite sua cidade.");
      return;
    }
    setLocating(true);
    setLocationMessage("Buscando sua cidade…");
    const requestId = ++locationRequest.current;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.coords.latitude}&lon=${position.coords.longitude}&accept-language=pt-BR`,
            { signal: AbortSignal.timeout(10000) },
          );
          if (!response.ok) throw new Error();
          const data = await response.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.municipality ||
            data.address?.village;
          if (!city) throw new Error();
          if (requestId !== locationRequest.current) return;
          setPlan((previous) => ({ ...previous, cidade: city }));
          setLocationMessage("Cidade encontrada. Confira antes de consultar.");
        } catch {
          if (requestId === locationRequest.current)
            setLocationMessage(
              "Não foi possível identificar a cidade. Digite-a no campo acima.",
            );
        } finally {
          if (requestId === locationRequest.current) setLocating(false);
        }
      },
      () => {
        if (requestId === locationRequest.current) {
          setLocating(false);
          setLocationMessage(
            "Localização não autorizada ou indisponível. Digite sua cidade.",
          );
        }
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  }
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <div className="identity">
            <button
              className="brand"
              aria-label="Voltar ao planejamento"
              onClick={query.edit}
            >
              <Icon name="brand" />
            </button>
            <span>Alerta Climático</span>
          </div>
          <p>Mais preparo para quem trabalha na rua.</p>
          <span className="badge">CONCEITO</span>
        </div>
      </header>
      {isForm ? (
        <main className="planning container">
          <section className="intro">
            <span className="eyebrow">MAIS PREPARO, MENOS IMPREVISTOS</span>
            <h1>O clima muda. Seu turno pode se adaptar.</h1>
            <p>
              Planeje suas saídas com a previsão e orientações para quem
              trabalha na rua.
            </p>
            <div className="how-it-works">
              <div className="explanation">
                <span className="icon-tile">
                  <Icon name="sparkle" />
                </span>
                <div>
                  <h3>Do clima ao seu plano de trabalho</h3>
                  <p>
                    A previsão traz os números. O Gemma ajuda a transformar
                    esses dados em cuidados.
                  </p>
                </div>
              </div>
              <div className="steps">
                <div>
                  <Icon name="stepPin" />
                  <small>Escolha a cidade</small>
                </div>
                <div>
                  <Icon name="stepClock" />
                  <small>Defina o turno</small>
                </div>
                <div>
                  <Icon name="stepSparkle" />
                  <small>Receba orientações</small>
                </div>
              </div>
            </div>
          </section>
          <form className="card plan-form" onSubmit={submit}>
            <div className="form-heading">
              <h2>Planejar meu turno</h2>
              <p>A previsão certa para o seu horário de trabalho.</p>
            </div>
            <div className="location-field">
              <label htmlFor="city">
                Onde você vai trabalhar?
                <span className="input-wrap">
                  <Icon name="pin" />
                  <input
                    id="city"
                    autoComplete="address-level2"
                    required
                    maxLength={120}
                    value={plan.cidade}
                    onChange={(e) => {
                      locationRequest.current++;
                      setLocating(false);
                      setPlan({ ...plan, cidade: e.target.value });
                    }}
                    placeholder="Digite sua cidade"
                  />
                  <Icon name="down" />
                </span>
              </label>
              <button
                className="text-button locate"
                type="button"
                onClick={locate}
                disabled={locating}
              >
                <Icon name="locate" />
                {locating ? "Buscando localização…" : "Usar minha localização"}
              </button>
              <small role="status">{locationMessage}</small>
            </div>
            <fieldset>
              <legend>Como você trabalha?</legend>
              <div className="profession-options">
                {(["entregador", "mototaxista"] as const).map((value) => (
                  <label
                    className={`profession ${plan.profissao === value ? "selected" : ""}`}
                    key={value}
                  >
                    <input
                      type="radio"
                      name="profession"
                      value={value}
                      checked={plan.profissao === value}
                      onChange={() => setPlan({ ...plan, profissao: value })}
                    />
                    <Icon
                      name={value === "entregador" ? "package" : "helmet"}
                    />
                    <span>
                      {value === "entregador" ? "Entregador" : "Mototaxista"}
                    </span>
                    <Icon
                      name={plan.profissao === value ? "checked" : "circle"}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="shift-section">
              <div className="shift-heading">
                <span>Qual é o seu turno?</span>
                <label className="date-label">
                  <span className="sr-only">Dia do turno</span>
                  <input
                    aria-label="Dia do turno"
                    type="date"
                    min={localDate()}
                    max={nextDate(localDate(), 14)}
                    value={plan.data}
                    required
                    onChange={(e) => setPlan({ ...plan, data: e.target.value })}
                  />
                  <small>{displayDate(plan.data)}</small>
                </label>
              </div>
              <ShiftFields
                prefix="main"
                value={plan}
                onChange={(shift) => setPlan({ ...plan, ...shift })}
              />
              {plan.fim < plan.inicio && (
                <small>Termina no dia seguinte.</small>
              )}
            </div>
            {compare && (
              <section className="alternative">
                <div className="shift-heading">
                  <h3>Turno B · Comparar horários</h3>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setCompare(false)}
                  >
                    Remover
                  </button>
                </div>
                <ShiftFields
                  prefix="alternative"
                  value={alternative}
                  onChange={setAlternative}
                />
                {alternative.fim < alternative.inicio && (
                  <small>Termina no dia seguinte.</small>
                )}
                <small>
                  Os dois turnos usam a mesma cidade, profissão e data de
                  início.
                </small>
              </section>
            )}
            <div className="mobile-explanation">
              <Icon name="sparkle" />
              <div>
                <h3>Do clima ao seu plano de trabalho</h3>
                <p>
                  A previsão traz os números. O Gemma transforma os dados em
                  cuidados.
                </p>
              </div>
            </div>
            {!compare && (
              <button
                className="mobile-compare"
                type="button"
                onClick={() => setCompare(true)}
                aria-label="Comparar turnos"
              >
                <Icon name="calendar" />
                <span>
                  <strong>Comparar turnos</strong>
                  <small>
                    Veja chuva, calor e vento em dois horários antes de decidir.
                  </small>
                </span>
                <span className="quick-shifts">
                  <b>A · 13h–18h</b>
                  <b>B · 08h–13h</b>
                </span>
              </button>
            )}
            {validation && (
              <p className="validation" role="alert">
                {validation}
              </p>
            )}
            <div className="form-actions">
              <button className="primary" type="submit">
                {compare
                  ? "Analisar e comparar turnos"
                  : "Ver previsão do meu turno"}
                <Icon name="arrow" />
              </button>
              {!compare && (
                <button
                  className="secondary desktop-compare"
                  type="button"
                  onClick={() => setCompare(true)}
                >
                  Comparar turnos
                  <Icon name="calendar" />
                </button>
              )}
            </div>
          </form>
        </main>
      ) : (
        <main className="consultation container">
          <section className="page-heading">
            <span className="eyebrow">
              {failed
                ? "CONSULTA INDISPONÍVEL"
                : complete
                  ? "SEU PLANO ESTÁ PRONTO"
                  : "PREPARANDO SEU TURNO"}
            </span>
            <h1 tabIndex={-1}>
              {failed
                ? "Seu turno está salvo. Vamos tentar de novo?"
                : complete
                  ? compare
                    ? "Compare seus horários de trabalho."
                    : "Tudo pronto para o seu turno."
                  : "Um momento para planejar melhor."}
            </h1>
            <p>
              {failed
                ? "Você não precisa preencher seus dados novamente."
                : "Da previsão às orientações: acompanhe cada etapa da sua consulta."}
            </p>
          </section>
          {complete ? (
            <>
              <Results results={query.results} />
              <button className="secondary" onClick={query.edit}>
                Alterar local ou turno
                <Icon name="edit" />
              </button>
            </>
          ) : (
            <div className="consultation-grid">
              <aside className="card shift-summary">
                <div className="summary-title">
                  <span className="icon-tile">
                    <Icon name="bike" />
                  </span>
                  <h2>Seu turno</h2>
                </div>
                <dl>
                  <div>
                    <dt>Cidade</dt>
                    <dd>{plan.cidade}</dd>
                  </div>
                  <div>
                    <dt>Profissão</dt>
                    <dd>
                      {plan.profissao === "entregador"
                        ? "Entregador"
                        : "Mototaxista"}
                    </dd>
                  </div>
                  <div>
                    <dt>Dia</dt>
                    <dd>{displayDate(plan.data)}</dd>
                  </div>
                  <div>
                    <dt>{compare ? "Turno A" : "Horário"}</dt>
                    <dd>
                      {plan.inicio} às {plan.fim}
                      {plan.fim < plan.inicio ? " (+1 dia)" : ""}
                    </dd>
                  </div>
                  {compare && (
                    <div>
                      <dt>Turno B</dt>
                      <dd>
                        {alternative.inicio} às {alternative.fim}
                        {alternative.fim < alternative.inicio
                          ? " (+1 dia)"
                          : ""}
                      </dd>
                    </div>
                  )}
                </dl>
                <div className="saved-note">
                  <Icon name="saved" />
                  <small>
                    {failed
                      ? "Seu local e turno continuam salvos nesta tela."
                      : "Local e horário definidos para sua consulta."}
                  </small>
                </div>
              </aside>
              <section
                className="consultation-content"
                aria-live="polite"
                aria-busy={!failed}
              >
                {failed ? (
                  <>
                    <div className="card error-card">
                      <div className="error-heading">
                        <span className="error-illustration">
                          <Icon name="error" />
                        </span>
                        <div>
                          <h2>
                            {query.weatherReady
                              ? "Não conseguimos concluir a análise."
                              : "Não conseguimos trazer a previsão."}
                          </h2>
                          <p role="alert">{query.error}</p>
                        </div>
                      </div>
                      <hr />
                      <div className="progress-step">
                        <Icon
                          name={query.weatherReady ? "check" : "unavailable"}
                        />
                        <div>
                          <h3>
                            {query.weatherReady
                              ? "Previsão recebida"
                              : "Dados do clima indisponíveis"}
                          </h3>
                          <p>
                            {query.weatherReady
                              ? "A consulta meteorológica foi concluída."
                              : "Não foi possível obter a previsão do turno."}
                          </p>
                        </div>
                      </div>
                      <div className="progress-step">
                        <Icon name="blocked" />
                        <div>
                          <h3>
                            {query.weatherReady
                              ? "Análise interrompida"
                              : "Análise do Gemma não iniciada"}
                          </h3>
                          <p>
                            {query.weatherReady
                              ? "Tente novamente para gerar as orientações."
                              : "Sem dados meteorológicos, a IA não gera orientações para este turno."}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="recovery-actions">
                      <button
                        className="primary"
                        onClick={() => void query.run(plans())}
                      >
                        Tentar novamente
                        <Icon name="retry" />
                      </button>
                      <button className="secondary" onClick={query.edit}>
                        Alterar local ou turno
                        <Icon name="edit" />
                      </button>
                    </div>
                    <small>
                      Se o problema continuar, confira sua conexão e tente mais
                      tarde.
                    </small>
                  </>
                ) : (
                  <>
                    <div className="card progress-card">
                      <div className="shift-heading">
                        <h2>Da previsão ao seu plano</h2>
                        <small>
                          Etapa {query.weatherReady ? "2" : "1"} de 2
                        </small>
                      </div>
                      <div className="progress-step">
                        <Icon
                          name={query.weatherReady ? "check" : "spinner"}
                          className={query.weatherReady ? "" : "spinning"}
                        />
                        <div>
                          <div className="step-heading">
                            <h3>
                              {query.weatherReady
                                ? "Previsão organizada"
                                : "Consultando a previsão"}
                            </h3>
                            {query.weatherReady && (
                              <span className="eyebrow">DADOS RECEBIDOS</span>
                            )}
                          </div>
                          <p>
                            Local, chuva, temperatura e vento para o seu horário
                            de trabalho.
                          </p>
                        </div>
                      </div>
                      <hr />
                      <div
                        className={`progress-step ${!query.weatherReady ? "pending" : ""}`}
                      >
                        <Icon
                          name={query.weatherReady ? "spinner" : "circle"}
                          className={query.weatherReady ? "spinning" : ""}
                        />
                        <div>
                          <div className="step-heading">
                            <h3>
                              {query.weatherReady
                                ? "Gemma analisa seu turno"
                                : "Aguardando os dados do clima"}
                            </h3>
                            {query.weatherReady && <Icon name="dots" />}
                          </div>
                          <p>
                            Cruzando o clima com a rotina de{" "}
                            {plan.profissao === "entregador"
                              ? "entregas"
                              : "transporte de passageiros"}{" "}
                            para explicar cada cuidado.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="preview">
                      <h3>
                        <Icon name="previewSparkle" />
                        Seu plano está tomando forma
                      </h3>
                      <div className="skeleton" />
                      <div className="skeleton short" />
                      <small>
                        A IA usa a previsão recebida. Ela não cria novos números
                        meteorológicos.
                      </small>
                    </div>
                    <div className="back-action">
                      <button className="secondary" onClick={query.edit}>
                        Voltar ao meu turno
                        <Icon name="back" />
                      </button>
                    </div>
                  </>
                )}
              </section>
            </div>
          )}
        </main>
      )}
      <footer className="site-footer">
        <div className="container footer-inner">
          <p>
            <Icon name="info" />
            Previsão: Open-Meteo. Orientações conforme os dados recebidos.
          </p>
          <span>Para entregadores e mototaxistas da região Norte</span>
        </div>
      </footer>
    </div>
  );
}
