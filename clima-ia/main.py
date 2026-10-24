from datetime import date, timedelta
from typing import Annotated, Literal

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import AfterValidator, BaseModel, Field, StringConstraints, model_validator

import clima
import ia

app = FastAPI(title="Assistente Climático com Gemma")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def _horario(v: str) -> str:
    if len(v) != 5 or v[2:] != ":00" or not v[:2].isdigit() or int(v[:2]) > 23:
        raise ValueError("use hora cheia no formato HH:00, ex: 13:00")
    return v


Horario = Annotated[str, AfterValidator(_horario)]
Texto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
Profissao = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=60)]


class Turno(BaseModel):
    inicio: Horario
    fim: Horario

    @model_validator(mode="after")
    def turno_valido(self):
        if self.inicio == self.fim:
            raise ValueError("início e fim do turno não podem ser iguais")
        return self


class PrevisaoHora(BaseModel):
    hora: str
    temperatura: float
    probabilidade_chuva: float
    vento_kmh: float
    rajada_kmh: float
    chuva_mm: float
    descricao: str


class Alerta(BaseModel):
    fonte: str
    evento: str
    severidade: str
    inicio: str
    fim: str
    riscos: list[str]
    instrucoes: list[str]


class PedidoPrevisao(Turno):
    cidade: Texto
    data: date | None = Field(None, description=f"Padrão: hoje. Até {clima.DIAS_PREVISAO} dias à frente.")

    @model_validator(mode="after")
    def data_valida(self):
        hoje = clima.hoje()
        if self.data and not hoje <= self.data <= hoje + timedelta(days=clima.DIAS_PREVISAO):
            raise ValueError(f"a data deve estar entre hoje e {clima.DIAS_PREVISAO} dias à frente")
        return self


class RespostaPrevisao(BaseModel):
    cidade: str
    data: date
    fonte: str = "Open-Meteo"
    previsao: list[PrevisaoHora]
    alertas: list[Alerta]


class PedidoAnalise(PedidoPrevisao):
    profissao: Profissao


class Janela(BaseModel):
    inicio: str
    fim: str
    nivel: Literal["moderado", "alto"]
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


MENSAGENS = {
    "missing": "campo obrigatório",
    "json_invalid": "JSON inválido",
    "string_too_short": "não pode ficar vazio",
    "string_too_long": "texto longo demais",
    "date_from_datetime_parsing": "data inválida, use AAAA-MM-DD",
    "date_parsing": "data inválida, use AAAA-MM-DD",
    "date_type": "data inválida, use AAAA-MM-DD",
    "string_type": "precisa ser texto",
    "model_attributes_type": "o corpo precisa ser um objeto JSON",
}


@app.exception_handler(RequestValidationError)
def erro_validacao(_: Request, exc: RequestValidationError):
    partes = []
    for e in exc.errors():
        campo = "" if e["type"] == "json_invalid" else ".".join(str(x) for x in e["loc"] if x != "body")
        msg = MENSAGENS.get(e["type"]) or e["msg"].removeprefix("Value error, ")
        partes.append(f"{campo}: {msg}" if campo else msg)
    return JSONResponse(status_code=422, content={"detail": "; ".join(partes)})


@app.exception_handler(clima.ErroClima)
def erro_clima(_: Request, exc: clima.ErroClima):
    return JSONResponse(status_code=exc.status, content={"detail": str(exc)})


@app.exception_handler(Exception)
def erro_interno(_: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Erro interno no servidor. Tente de novo."},
                        headers={"Access-Control-Allow-Origin": "*"})


@app.get("/health")
def health():
    return {"status": "ok", "ia_configurada": bool(ia.API_KEY), "modelo": ia.MODELO}


@app.post("/previsao", response_model=RespostaPrevisao)
def previsao(p: PedidoPrevisao):
    dia = p.data or clima.hoje()
    local, _, horas, alertas = clima.previsao_turno(p.cidade, dia, clima.hora_int(p.inicio), clima.hora_int(p.fim))
    return RespostaPrevisao(cidade=local, data=dia, previsao=horas, alertas=alertas)


@app.post("/analise", response_model=RespostaAnalise)
def analisar(p: PedidoAnalise):
    dia = p.data or clima.hoje()
    local, _, horas, alertas = clima.previsao_turno(p.cidade, dia, clima.hora_int(p.inicio), clima.hora_int(p.fim))
    janelas = clima.janelas_de_risco(horas)
    analise, gerado_por = ia.analisar(local, p.profissao, dia, p.inicio, p.fim, horas, janelas, alertas)
    return RespostaAnalise(**analise, horarios_atencao=janelas, gerado_por=gerado_por)
