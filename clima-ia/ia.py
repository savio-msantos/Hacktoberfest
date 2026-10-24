import json
import os

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


def montar_prompt(cidade: str, profissao: str, inicio: str, fim: str, horas: list[dict], janelas: list[dict]) -> str:
    linhas_horas = "\n".join(
        f'- {h["hora"]}: {h["descricao"] or "sem descrição"}, {h["temperatura"]}°C, '
        f'chuva {h["probabilidade_chuva"]}% ({h["chuva_mm"]} mm), vento {h["vento_kmh"]} km/h'
        for h in horas
    )
    linhas_janelas = "\n".join(
        f'- {j["inicio"]} às {j["fim"]}: risco {j["nivel"]}, até {j["chance_max"]}% de chance'
        for j in janelas
    ) or "- Nenhuma janela de chuva relevante."

    return f"""Você é um assistente climático para um {profissao} de {cidade} ({CUIDADOS.get(profissao, "trabalho ao ar livre")}).
Use SOMENTE os dados abaixo. Não invente horários, números ou alertas.
Português simples, frases curtas, para ler rápido no celular.

Turno: {inicio} às {fim}.

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
    texto = texto.strip().removeprefix("```json").removeprefix("```").removesuffix("```")
    try:
        d = json.loads(texto)
        resumo, sugestoes = d["resumo"], d["sugestoes"]
    except (ValueError, KeyError, TypeError):
        return None
    if not isinstance(resumo, str) or not resumo.strip() or not isinstance(sugestoes, list):
        return None
    sugestoes = [{"dica": s["dica"], "motivo": s["motivo"]} for s in sugestoes
                 if isinstance(s, dict) and isinstance(s.get("dica"), str) and isinstance(s.get("motivo"), str)]
    return {"resumo": resumo.strip(), "sugestoes": sugestoes[:4]} if sugestoes else None


def chamar_gemma(prompt: str) -> str | None:
    if not API_KEY:
        return None
    try:
        r = requests.post(f"{API_URL}/models/{MODELO}:generateContent",
                          headers={"x-goog-api-key": API_KEY}, timeout=40,
                          json={"contents": [{"parts": [{"text": prompt}]}],
                                "generationConfig": {"temperature": 0.3}})
        if not r.ok:
            print(f"[gemma] HTTP {r.status_code}: {r.text[:300]}")
            return None
        partes = r.json()["candidates"][0]["content"]["parts"]
        return "".join(p.get("text", "") for p in partes if not p.get("thought")) or None
    except (requests.RequestException, KeyError, IndexError, ValueError) as e:
        print(f"[gemma] falhou: {e!r}")
        return None


def analise_template(inicio: str, fim: str, horas: list[dict], janelas: list[dict]) -> dict:
    tmin = min(h["temperatura"] for h in horas)
    tmax = max(h["temperatura"] for h in horas)
    if not janelas:
        return {"resumo": f"Turno {inicio}–{fim}: tempo firme, {tmin:.0f}–{tmax:.0f}°C.",
                "sugestoes": [{"dica": "Hidrate-se e use protetor solar.", "motivo": f"Temperatura chega a {tmax:.0f}°C."},
                              {"dica": "Leve a capa por garantia.", "motivo": "Em Rio Branco a chuva muda rápido."}]}
    pior = max(janelas, key=lambda j: j["chance_max"])
    horarios = ", ".join(f'{j["inicio"]}–{j["fim"]}' for j in janelas)
    return {"resumo": f"Turno {inicio}–{fim}: {tmin:.0f}–{tmax:.0f}°C, chuva prevista em {horarios}.",
            "sugestoes": [
                {"dica": f'Concentre as saídas fora de {pior["inicio"]}–{pior["fim"]}.',
                 "motivo": f'É o período com maior chance de chuva ({pior["chance_max"]:.0f}%).'},
                {"dica": "Leve capa de chuva e proteja celular e mochila.",
                 "motivo": f'Previsão de até {pior["chuva_mm"]} mm de chuva.'},
                {"dica": "Reduza a velocidade e evite ruas que alagam.",
                 "motivo": "Pista molhada aumenta o risco de queda."}]}


def analisar(cidade: str, profissao: str, inicio: str, fim: str, horas: list[dict], janelas: list[dict]) -> tuple[dict, str]:
    texto = chamar_gemma(montar_prompt(cidade, profissao, inicio, fim, horas, janelas))
    analise = validar(texto) if texto else None
    if analise:
        return analise, "gemma"
    return analise_template(inicio, fim, horas, janelas), "template"


if __name__ == "__main__":
    assert validar('```json\n{"resumo": "ok", "sugestoes": [{"dica": "a", "motivo": "b"}]}\n```')["resumo"] == "ok"
    assert validar('{"resumo": "ok", "sugestoes": []}') is None
    assert validar("não é json") is None

    if not API_KEY:
        raise SystemExit("Preencha GEMMA_API_KEY no .env para testar a chamada real ao Gemma.")
    horas = [{"hora": "15:00", "temperatura": 31, "probabilidade_chuva": 80, "chuva_mm": 6, "vento_kmh": 20, "descricao": "Pancadas fortes"}]
    janelas = [{"inicio": "15:00", "fim": "16:00", "nivel": "alto", "chance_max": 80, "chuva_mm": 6, "descricao": "Pancadas fortes"}]
    texto = chamar_gemma(montar_prompt("Rio Branco, Acre", "entregador", "15:00", "16:00", horas, janelas))
    print(f"Modelo: {MODELO}\nResposta bruta:\n{texto}\n\nValidada: {validar(texto) if texto else None}")
    print("GEMMA OK" if texto and validar(texto) else "GEMMA FALHOU (verifique chave/modelo)")
