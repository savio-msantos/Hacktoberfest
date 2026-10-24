import requests

TZ = "America/Rio_Branco"
TIMEOUT = 10

DESCRICAO = {
    0: "Céu limpo", 1: "Poucas nuvens", 2: "Parcialmente nublado", 3: "Nublado",
    45: "Neblina", 48: "Neblina",
    51: "Garoa fraca", 53: "Garoa", 55: "Garoa forte",
    61: "Chuva fraca", 63: "Chuva moderada", 65: "Chuva forte",
    80: "Pancadas fracas", 81: "Pancadas de chuva", 82: "Pancadas fortes",
    95: "Tempestade", 96: "Tempestade com granizo", 99: "Tempestade com granizo",
}


class ErroClima(Exception):
    """Falha ao obter dados meteorológicos"""


def _get(url: str, params: dict) -> dict:
    try:
        r = requests.get(url, params=params, timeout=TIMEOUT)
        r.raise_for_status()
        return r.json()
    except requests.Timeout:
        raise ErroClima("Serviço de clima demorou demais. Tente de novo.")
    except requests.RequestException as e:
        raise ErroClima(f"Erro ao consultar o serviço de clima: {e}")


def geocodificar(cidade: str) -> tuple[float, float, str]:
    dados = _get("https://geocoding-api.open-meteo.com/v1/search",
                 {"name": cidade, "count": 1, "language": "pt", "countryCode": "BR"})
    if not dados.get("results"):
        raise ErroClima(f"Local '{cidade}' não encontrado.")
    r = dados["results"][0]
    return r["latitude"], r["longitude"], f'{r["name"]}, {r.get("admin1", "")}'.strip(", ")


def previsao_horaria(lat: float, lon: float, data: str) -> list[dict]:
    dados = _get("https://api.open-meteo.com/v1/forecast", {
        "latitude": lat, "longitude": lon, "timezone": TZ,
        "start_date": data, "end_date": data,
        "hourly": "temperature_2m,precipitation_probability,precipitation,wind_speed_10m,weather_code",
    })
    return normalizar(dados)


def normalizar(dados: dict) -> list[dict]:
    h = dados["hourly"]
    return [
        {
            "hora": h["time"][i][11:16],  
            "temperatura": round(h["temperature_2m"][i]),
            "probabilidade_chuva": h["precipitation_probability"][i] or 0,
            "chuva_mm": h["precipitation"][i] or 0,
            "vento_kmh": round(h["wind_speed_10m"][i]),
            "descricao": DESCRICAO.get(h["weather_code"][i], "Indefinido"),
        }
        for i in range(len(h["time"]))
    ]


def hora_int(hora: str) -> int:
    return int(hora[:2])


def filtrar_turno(horas: list[dict], inicio: int, fim: int) -> list[dict]:
    fim = 24 if fim <= inicio else fim
    return [h for h in horas if inicio <= hora_int(h["hora"]) < fim]


def nivel(h: dict) -> str | None:
    if h["probabilidade_chuva"] >= 70 or h["chuva_mm"] >= 5 or h["vento_kmh"] >= 40:
        return "alto"
    if h["probabilidade_chuva"] >= 40 or h["chuva_mm"] >= 1:
        return "moderado"
    return None


def janelas_de_risco(horas: list[dict]) -> list[dict]:
    janelas = []
    for h in horas:
        n = nivel(h)
        if not n:
            continue
        hora = hora_int(h["hora"])
        ultima = janelas[-1] if janelas else None
        if ultima and hora_int(ultima["fim"]) == hora:
            ultima["fim"] = f"{hora + 1:02d}:00"
            ultima["chance_max"] = max(ultima["chance_max"], h["probabilidade_chuva"])
            ultima["chuva_mm"] = round(ultima["chuva_mm"] + h["chuva_mm"], 1)
            if n == "alto":
                ultima["nivel"] = "alto"
        else:
            janelas.append({"inicio": f"{hora:02d}:00", "fim": f"{hora + 1:02d}:00", "nivel": n,
                            "chance_max": h["probabilidade_chuva"], "chuva_mm": h["chuva_mm"],
                            "descricao": h["descricao"]})
    return janelas
