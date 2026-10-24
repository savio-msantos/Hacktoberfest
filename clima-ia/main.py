from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(title="Assistente Climático com Gemma")


class PrevisaoHora(BaseModel):
    hora: str
    temperatura: float
    probabilidade_chuva: float = Field(ge=0, le=100)
    vento_kmh: float = Field(ge=0)


class PedidoAnalise(BaseModel):
    cidade: str
    profissao: str
    inicio: str
    fim: str
    previsao: list[PrevisaoHora] = Field(min_length=1)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analise")
def analisar(pedido: PedidoAnalise):
    return {
        "mensagem": "Dados recebidos. Integração com Gemma pendente.",
        "dados": pedido.model_dump(),
    }