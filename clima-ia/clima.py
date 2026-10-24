from datetime import date, datetime, timedelta, timezone

import requests

TZ = "America/Sao_Paulo"
FUSO = timezone(timedelta(hours=-3))
TIMEOUT = 10
DIAS_PREVISAO = 14

DESCRICAO = {
    0: "Céu limpo", 1: "Poucas nuvens", 2: "Parcialmente nublado", 3: "Nublado",
    45: "Neblina", 48: "Neblina",
    51: "Garoa fraca", 53: "Garoa", 55: "Garoa forte",
    61: "Chuva fraca", 63: "Chuva moderada", 65: "Chuva forte",
    80: "Pancadas fracas", 81: "Pancadas de chuva", 82: "Pancadas fortes",
    95: "Tempestade", 96: "Tempestade com granizo", 99: "Tempestade com granizo",
}

UF = {
    "Acre": "AC", "Alagoas": "AL", "Amapá": "AP", "Amazonas": "AM", "Bahia": "BA", "Ceará": "CE",
    "Distrito Federal": "DF", "Espírito Santo": "ES", "Goiás": "GO", "Maranhão": "MA",
    "Mato Grosso": "MT", "Mato Grosso do Sul": "MS", "Minas Gerais": "MG", "Pará": "PA",
    "Paraíba": "PB", "Paraná": "PR", "Pernambuco": "PE", "Piauí": "PI", "Rio de Janeiro": "RJ",
    "Rio Grande do Norte": "RN", "Rio Grande do Sul": "RS", "Rondônia": "RO", "Roraima": "RR",
    "Santa Catarina": "SC", "São Paulo": "SP", "Sergipe": "SE", "Tocantins": "TO",
}


class ErroClima(Exception):
    status = 502


class LocalNaoEncontrado(ErroClima):
    status = 404


class SemPrevisao(ErroClima):
    status = 404


def hoje() -> date:
    return datetime.now(FUSO).date()


def _get(url: str, params: dict) -> dict:
    try:
        r = requests.get(url, params=params, timeout=TIMEOUT)
    except requests.Timeout:
        raise ErroClima("Serviço de clima demorou demais. Tente de novo.")
    except requests.RequestException:
        raise ErroClima("Não foi possível conectar ao serviço de clima. Verifique a internet.")
    if not r.ok:
        try:
            motivo = r.json().get("reason", "")
        except ValueError:
            motivo = ""
        raise ErroClima(f"Serviço de clima respondeu com erro {r.status_code}. {motivo}".strip())
    try:
        return r.json()
    except ValueError:
        raise ErroClima("Serviço de clima devolveu uma resposta inválida.")


def geocodificar(cidade: str) -> tuple[float, float, str, str]:
    dados = _get("https://geocoding-api.open-meteo.com/v1/search",
                 {"name": cidade, "count": 1, "language": "pt", "countryCode": "BR"})
    if not dados.get("results"):
        raise LocalNaoEncontrado(f"Cidade '{cidade}' não encontrada. Confira o nome.")
    r = dados["results"][0]
    estado = r.get("admin1", "")
    return r["latitude"], r["longitude"], f'{r["name"]}, {estado}'.strip(", "), UF.get(estado, "")


def previsao_horaria(lat: float, lon: float, inicio: date, fim: date) -> list[dict]:
    dados = _get("https://api.open-meteo.com/v1/forecast", {
        "latitude": lat, "longitude": lon, "timezone": TZ,
        "start_date": inicio.isoformat(), "end_date": fim.isoformat(),
        "hourly": "temperature_2m,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m,weather_code",
    })
    return normalizar(dados)


def normalizar(dados: dict) -> list[dict]:
    try:
        h = dados["hourly"]
        return [
            {
                "data_hora": h["time"][i],
                "hora": h["time"][i][11:16],
                "temperatura": round(h["temperature_2m"][i]),
                "probabilidade_chuva": h["precipitation_probability"][i + 1] or 0,
                "chuva_mm": h["precipitation"][i + 1] or 0,
                "vento_kmh": round(h["wind_speed_10m"][i] or 0),
                "rajada_kmh": round(h["wind_gusts_10m"][i + 1] or 0),
                "descricao": DESCRICAO.get(h["weather_code"][i + 1], "Indefinido"),
            }
            for i in range(len(h["time"]) - 1)
            if h["temperature_2m"][i] is not None
        ]
    except (KeyError, TypeError, IndexError):
        raise ErroClima("Serviço de clima devolveu dados num formato inesperado.")


def hora_int(hora: str) -> int:
    return int(hora[:2])


def periodo_turno(dia: date, inicio: int, fim: int) -> tuple[datetime, datetime]:
    comeco = datetime(dia.year, dia.month, dia.day, inicio)
    return comeco, comeco + timedelta(hours=(fim - inicio) % 24)


def filtrar_turno(horas: list[dict], comeco: datetime, final: datetime) -> list[dict]:
    return [h for h in horas if comeco <= datetime.fromisoformat(h["data_hora"]) < final]


def previsao_turno(cidade: str, dia: date, inicio: int, fim: int) -> tuple[str, str, list[dict], list[dict]]:
    lat, lon, local, uf = geocodificar(cidade)
    comeco, final = periodo_turno(dia, inicio, fim)
    horas = filtrar_turno(previsao_horaria(lat, lon, dia, final.date()), comeco, final)
    if not horas:
        raise SemPrevisao("Sem previsão disponível para esse dia e horário.")
    try:
        alertas = alertas_inmet(local.split(",")[0], uf, comeco, final)
    except Exception as e:
        print(f"[inmet] falhou: {e!r}")
        alertas = []
    return local, uf, horas, alertas


def alertas_inmet(cidade: str, uf: str, comeco: datetime, final: datetime) -> list[dict]:
    if not uf:
        return []
    try:
        r = requests.get("https://apiprevmet3.inmet.gov.br/avisos/ativos", timeout=TIMEOUT,
                         headers={"User-Agent": "Mozilla/5.0"})
        r.raise_for_status()
        avisos = r.json().get("hoje", []) + r.json().get("futuro", [])
    except (requests.RequestException, ValueError, AttributeError, TypeError) as e:
        print(f"[inmet] falhou: {e!r}")
        return []

    alvo = f"{cidade} - {uf} ("
    alertas, vistos = [], set()
    for a in avisos:
        try:
            if alvo not in (a.get("municipios") or "") or a.get("encerrado"):
                continue
            ini, fim = datetime.fromisoformat(a["inicio"]), datetime.fromisoformat(a["fim"])
        except (KeyError, TypeError, ValueError):
            continue
        chave = (a.get("descricao"), a.get("severidade"), ini, fim)
        if ini < final and fim > comeco and chave not in vistos:
            vistos.add(chave)
            alertas.append({
                "fonte": "INMET",
                "evento": a.get("descricao") or "Aviso meteorológico",
                "severidade": a.get("severidade") or "",
                "inicio": f"{ini:%Y-%m-%d %H:%M}", "fim": f"{fim:%Y-%m-%d %H:%M}",
                "riscos": [s.strip() for s in a.get("riscos") or [] if isinstance(s, str) and s.strip()],
                "instrucoes": [s.strip() for s in a.get("instrucoes") or [] if isinstance(s, str) and s.strip()],
            })
    return alertas


def nivel(h: dict) -> str | None:
    if h["probabilidade_chuva"] >= 70 or h["chuva_mm"] >= 5 or h["rajada_kmh"] >= 60:
        return "alto"
    if h["probabilidade_chuva"] >= 40 or h["chuva_mm"] >= 1 or h["rajada_kmh"] >= 40:
        return "moderado"
    return None


def janelas_de_risco(horas: list[dict]) -> list[dict]:
    janelas = []
    for h in horas:
        n = nivel(h)
        if not n:
            continue
        hora = hora_int(h["hora"])
        prox = f"{(hora + 1) % 24:02d}:00"
        ultima = janelas[-1] if janelas else None
        if ultima and ultima["fim"] == h["hora"]:
            ultima["fim"] = prox
            if h["probabilidade_chuva"] > ultima["chance_max"]:
                ultima["descricao"] = h["descricao"]
            ultima["chance_max"] = max(ultima["chance_max"], h["probabilidade_chuva"])
            ultima["chuva_mm"] = round(ultima["chuva_mm"] + h["chuva_mm"], 1)
            if n == "alto":
                ultima["nivel"] = "alto"
        else:
            janelas.append({"inicio": h["hora"], "fim": prox, "nivel": n,
                            "chance_max": h["probabilidade_chuva"], "chuva_mm": h["chuva_mm"],
                            "descricao": h["descricao"]})
    return janelas


if __name__ == "__main__":
    c, f = periodo_turno(date(2026, 10, 24), 22, 2)
    assert (c.hour, f.day, f.hour) == (22, 25, 2)
    horas = [{"data_hora": f"2026-10-24T{h:02d}:00", "hora": f"{h:02d}:00", "probabilidade_chuva": p,
              "chuva_mm": 0, "vento_kmh": 0, "rajada_kmh": 0, "descricao": d}
             for h, p, d in [(21, 90, "a"), (22, 50, "Chuva fraca"), (23, 75, "Pancadas fortes")]]
    horas.append({"data_hora": "2026-10-25T00:00", "hora": "00:00", "probabilidade_chuva": 10,
                  "chuva_mm": 0, "vento_kmh": 0, "rajada_kmh": 45, "descricao": ""})
    turno = filtrar_turno(horas, c, f)
    assert [h["hora"] for h in turno] == ["22:00", "23:00", "00:00"]
    j = janelas_de_risco(turno)
    assert len(j) == 1 and (j[0]["inicio"], j[0]["fim"], j[0]["nivel"], j[0]["descricao"]) == \
        ("22:00", "01:00", "alto", "Pancadas fortes"), j

    d = {"hourly": {"time": ["2026-10-24T15:00", "2026-10-24T16:00"], "temperature_2m": [30, 27],
                    "precipitation_probability": [20, 80], "precipitation": [0, 6.1],
                    "wind_speed_10m": [9, 22], "wind_gusts_10m": [15, 55], "weather_code": [2, 82]}}
    assert [(x["hora"], x["probabilidade_chuva"], x["rajada_kmh"], x["descricao"]) for x in normalizar(d)] == \
        [("15:00", 80, 55, "Pancadas fortes")]
    print("clima OK")
