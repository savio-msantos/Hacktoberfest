from datetime import date
from typing import Annotated, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import clima
import ia  

app = FastAPI(title="Assistente Climático com Gemma")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

Horario = Annotated[str, Field(pattern=r"^([01]\d|2[0-3]):00$", description="Hora cheia, ex: 13:00")]


class PrevisaoHora(BaseModel):
    hora: str
    temperatura: float
    probabilidade_chuva: float = Field(ge=0, le=100)
    vento_kmh: float = Field(ge=0)
    chuva_mm: float = Field(0, ge=0)
    descricao: str = ""


class PedidoPrevisao(BaseModel):
    cidade: str
    inicio: Horario
    fim: Horario
    data: date | None = Field(None, description="Padrão: hoje (até 15 dias à frente)")


class RespostaPrevisao(BaseModel):
    cidade: str
    data: date
    fonte: str = "Open-Meteo"
    previsao: list[PrevisaoHora]


class PedidoAnalise(BaseModel):
    cidade: str
    profissao: Literal["entregador", "mototaxista"]
    inicio: Horario
    fim: Horario
    previsao: list[PrevisaoHora] = Field(min_length=1)


class Janela(BaseModel):
    inicio: str
    fim: str
    nivel: str
    chance_max: float
    chuva_mm: float
    descricao: str


class Sugestao(BaseModel):
    dica: str
    motivo: str


class RespostaAnalise(BaseModel):
    resumo: str
    horarios_atencao: list[Janela]
    sugestoes: list[Sugestao]
    gerado_por: Literal["gemma", "template"]


@app.get("/health")
def health():
    return {"status": "ok", "ia_configurada": bool(ia.API_KEY), "modelo": ia.MODELO}


@app.post("/previsao", response_model=RespostaPrevisao)
def previsao(p: PedidoPrevisao):
    dia = p.data or date.today()
    try:
        lat, lon, local = clima.geocodificar(p.cidade)
        horas = clima.previsao_horaria(lat, lon, dia.isoformat())
    except clima.ErroClima as e:
        raise HTTPException(status_code=502, detail=str(e))
    turno = clima.filtrar_turno(horas, clima.hora_int(p.inicio), clima.hora_int(p.fim))
    return RespostaPrevisao(cidade=local, data=dia, previsao=turno)


@app.post("/analise", response_model=RespostaAnalise)
def analisar(pedido: PedidoAnalise):
    horas = [h.model_dump() for h in pedido.previsao]
    janelas = clima.janelas_de_risco(horas)
    analise, gerado_por = ia.analisar(pedido.cidade, pedido.profissao, pedido.inicio, pedido.fim, horas, janelas)
    return RespostaAnalise(**analise, horarios_atencao=janelas, gerado_por=gerado_por)
