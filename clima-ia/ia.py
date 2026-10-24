import json
import os
from datetime import date

import requests
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv("GEMMA_API_URL") or "https://generativelanguage.googleapis.com/v1beta"
API_KEY = os.getenv("GEMMA_API_KEY", "")
MODELO = os.getenv("GEMMA_MODEL") or "gemma-4-26b-a4b-it"

CUIDADOS = {
    "entregador": "entregas de moto ou bicicleta, com mochila térmica e celular no suporte",
    "mototaxista": "transporte de passageiros de moto, com capacete extra para o passageiro",
}


def montar_prompt(cidade: str, profissao: str, dia: date, inicio: str, fim: str,
                  horas: list[dict], janelas: list[dict], alertas: list[dict]) -> str:
    linhas_horas = "\n".join(
        f'- {h["hora"]}: {h["descricao"] or "sem descrição"}, {h["temperatura"]}°C, '
        f'chuva {h["probabilidade_chuva"]}% ({h["chuva_mm"]} mm), '
        f'vento {h["vento_kmh"]} km/h com rajadas de {h["rajada_kmh"]} km/h'
        for h in horas
    )
    linhas_janelas = "\n".join(
        f'- {j["inicio"]} às {j["fim"]}: risco {j["nivel"]}, até {j["chance_max"]}% de chance'
        for j in janelas
    ) or "- Nenhuma janela de chuva relevante."
    linhas_alertas = "\n".join(
        f'- [{a["fonte"]}] {a["evento"]} ({a["severidade"]}), de {a["inicio"]} a {a["fim"]}. {" ".join(a["riscos"])}'
        for a in alertas
    ) or "- Nenhum alerta oficial ativo."

    contexto = CUIDADOS.get(profissao.lower(), "trabalho ao ar livre")
    return f"""Você é um assistente climático para uma pessoa que trabalha como {profissao} em {cidade} ({contexto}).
Adapte as dicas à rotina dessa profissão.
Use SOMENTE os dados abaixo. Não invente horários, números ou alertas.
Se houver alerta oficial, mencione-o citando a fonte (ex: "alerta do INMET").
Português simples, frases curtas, para ler rápido no celular.

Dia: {dia:%d/%m/%Y}. Turno: {inicio} às {fim}. Todos os horários estão no horário de Brasília.

Alertas oficiais:
{linhas_alertas}

Janelas de risco já calculadas:
{linhas_janelas}

Previsão hora a hora:
{linhas_horas}

Responda APENAS com JSON válido, sem texto fora dele, neste formato:
{{"resumo": "1 ou 2 frases sobre o turno, citando os horários de atenção",
  "sugestoes": [{{"dica": "ação prática (organizar saídas, proteger equipamento, segurança)",
                  "motivo": "por quê, citando o dado da previsão"}}]}}
Dê de 2 a 4 sugestões."""


def validar(texto: str) -> dict | None:
    texto = texto[texto.find("{"):texto.rfind("}") + 1]
    try:
        d = json.loads(texto)
        resumo, sugestoes = d["resumo"], d["sugestoes"]
    except (ValueError, KeyError, TypeError):
        return None
    if not isinstance(resumo, str) or not resumo.strip() or not isinstance(sugestoes, list):
        return None
    sugestoes = [{"dica": s["dica"].strip(), "motivo": s["motivo"].strip()} for s in sugestoes
                 if isinstance(s, dict) and isinstance(s.get("dica"), str) and isinstance(s.get("motivo"), str)
                 and s["dica"].strip() and s["motivo"].strip()]
    return {"resumo": resumo.strip(), "sugestoes": sugestoes[:4]} if sugestoes else None


def chamar_gemma(prompt: str) -> str | None:
    if not API_KEY:
        return None
    try:
        for config in ({"temperature": 0.3, "responseMimeType": "application/json"}, {"temperature": 0.3}):
            r = requests.post(f"{API_URL}/models/{MODELO}:generateContent",
                              headers={"x-goog-api-key": API_KEY}, timeout=20,
                              json={"contents": [{"parts": [{"text": prompt}]}], "generationConfig": config})
            if r.status_code != 400:
                break
            print(f"[gemma] HTTP 400 com {config}: {r.text[:300]}")
        if not r.ok:
            print(f"[gemma] HTTP {r.status_code}: {r.text[:300]}")
            return None
        dados = r.json()
        if not dados.get("candidates"):
            print(f"[gemma] sem resposta (bloqueada?): {dados.get('promptFeedback')}")
            return None
        partes = dados["candidates"][0].get("content", {}).get("parts", [])
        return "".join(p.get("text", "") for p in partes if not p.get("thought")) or None
    except (requests.RequestException, KeyError, IndexError, ValueError, AttributeError, TypeError) as e:
        print(f"[gemma] falhou: {e!r}")
        return None


def analise_template(inicio: str, fim: str, horas: list[dict], janelas: list[dict], alertas: list[dict]) -> dict:
    tmin = min(h["temperatura"] for h in horas)
    tmax = max(h["temperatura"] for h in horas)
    oficiais = [{"dica": f'Atenção ao alerta do {a["fonte"]}: {a["evento"]} ({a["severidade"]}).',
                 "motivo": " ".join(a["riscos"]) or f'Válido de {a["inicio"]} a {a["fim"]}.'} for a in alertas[:1]]
    if not janelas:
        return {"resumo": f"Turno {inicio}–{fim}: tempo firme, {tmin:.0f}–{tmax:.0f}°C.",
                "sugestoes": oficiais + [
                    {"dica": "Hidrate-se e use protetor solar.", "motivo": f"Temperatura chega a {tmax:.0f}°C."},
                    {"dica": "Leve a capa por garantia.", "motivo": "No período chuvoso o tempo muda rápido."}]}
    pior = max(janelas, key=lambda j: j["chance_max"])
    horarios = ", ".join(f'{j["inicio"]}–{j["fim"]}' for j in janelas)
    return {"resumo": f"Turno {inicio}–{fim}: {tmin:.0f}–{tmax:.0f}°C, chuva prevista em {horarios}.",
            "sugestoes": (oficiais + [
                {"dica": f'Concentre as saídas fora de {pior["inicio"]}–{pior["fim"]}.',
                 "motivo": f'É o período com maior chance de chuva ({pior["chance_max"]:.0f}%).'},
                {"dica": "Leve capa de chuva e proteja celular e equipamentos.",
                 "motivo": f'Previsão de até {pior["chuva_mm"]} mm de chuva.'},
                {"dica": "Evite deslocamentos por ruas que costumam alagar.",
                 "motivo": "Chuva forte causa alagamentos e deixa o chão escorregadio."}])[:4]}


def analisar(cidade: str, profissao: str, dia: date, inicio: str, fim: str,
             horas: list[dict], janelas: list[dict], alertas: list[dict]) -> tuple[dict, str]:
    texto = chamar_gemma(montar_prompt(cidade, profissao, dia, inicio, fim, horas, janelas, alertas))
    analise = validar(texto) if texto else None
    if analise:
        return analise, "gemma"
    return analise_template(inicio, fim, horas, janelas, alertas), "template"


if __name__ == "__main__":
    assert validar('```json\n{"resumo": "ok", "sugestoes": [{"dica": "a", "motivo": "b"}]}\n```')["resumo"] == "ok"
    assert validar('{"resumo": "ok", "sugestoes": []}') is None
    assert validar("não é json") is None
    assert validar('Claro! {"resumo": "ok", "sugestoes": [{"dica": "a", "motivo": "b"}]} Espero ajudar.') is not None
    assert validar('{"resumo": "ok", "sugestoes": [{"dica": " ", "motivo": "b"}]}') is None

    horas = [{"hora": "15:00", "temperatura": 31, "probabilidade_chuva": 80, "chuva_mm": 6, "vento_kmh": 20,
              "rajada_kmh": 45, "descricao": "Pancadas fortes"}]
    janelas = [{"inicio": "15:00", "fim": "16:00", "nivel": "alto", "chance_max": 80, "chuva_mm": 6, "descricao": "Pancadas fortes"}]
    alertas = [{"fonte": "INMET", "evento": "Tempestade", "severidade": "Perigo", "inicio": "2026-10-24 15:00",
                "fim": "2026-10-24 23:00", "riscos": ["Ventos de até 60 km/h."], "instrucoes": []}]
    t = analise_template("15:00", "16:00", horas, janelas, alertas)
    assert "INMET" in t["sugestoes"][0]["dica"] and len(t["sugestoes"]) <= 4
    p = montar_prompt("Manaus, Amazonas", "entregador", date(2026, 10, 25), "15:00", "16:00", horas, janelas, alertas)
    assert "Dia: 25/10/2026" in p and "rajadas de 45 km/h" in p and "mochila térmica" in p
    p = montar_prompt("Manaus, Amazonas", "Feirante", date(2026, 10, 25), "15:00", "16:00", horas, janelas, alertas)
    assert "trabalha como Feirante" in p and "trabalho ao ar livre" in p
    assert "Rio Branco" not in str(analise_template("15:00", "16:00", horas, [], []))
    print("validação OK")

    if not API_KEY:
        raise SystemExit("Preencha GEMMA_API_KEY no .env para testar a chamada real ao Gemma.")
    texto = chamar_gemma(montar_prompt("Rio Branco, Acre", "entregador", date.today(), "15:00", "16:00",
                                       horas, janelas, alertas))
    print(f"Modelo: {MODELO}\nResposta bruta:\n{texto}\n\nValidada: {validar(texto) if texto else None}")
    print("GEMMA OK" if texto and validar(texto) else "GEMMA FALHOU (verifique chave/modelo)")
