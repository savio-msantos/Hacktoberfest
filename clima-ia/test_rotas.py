import json
import unittest
from datetime import datetime, timedelta
from unittest.mock import patch
from zoneinfo import ZoneInfo

from fastapi.testclient import TestClient

import clima
import main
import rotas


def pedido():
    dia = (datetime.now(ZoneInfo("America/Rio_Branco")) + timedelta(days=1)).date()
    return {"origem": {"nome": "Centro, Rio Branco", "latitude": -9.975, "longitude": -67.82,
                       "cidade": "Rio Branco", "uf": "AC"},
            "destino": {"nome": "Universidade, Rio Branco", "latitude": -9.95, "longitude": -67.87,
                        "cidade": "Rio Branco", "uf": "AC"},
            "profissao": "Entregador", "transporte": "moto", "data": dia.isoformat(),
            "inicio": "22:00", "fim": "02:00", "fuso": "America/Rio_Branco"}


def previsao_fake(coord, inicio, fim, fuso, indice):
    horas = []
    while inicio < fim:
        horas.append({"data_hora": inicio.isoformat(), "hora": inicio.strftime("%H:%M"),
                      "temperatura": 30, "probabilidade_chuva": 80 if indice == 2 else 10,
                      "chuva_mm": 6 if indice == 2 else 0, "vento_kmh": 15, "rajada_kmh": 20,
                      "descricao": "Chuva forte" if indice == 2 else "Céu limpo"})
        inicio += timedelta(hours=1)
    return {"nome": str(indice), "latitude": coord[1], "longitude": coord[0],
            "previsao": horas, "nivel": rotas.avaliar(horas)}


class RotasTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(main.app)
        self.rota = {"distancia_km": 10, "duracao_min": 20,
                     "pontos": [[-67.82 - i * .01, -9.975] for i in range(5)],
                     "geometria": [[-67.82, -9.975], [-67.87, -9.95]]}

    def consultar(self, gemma=None, alerta=None, payload=None):
        with patch.object(rotas, "caminho", return_value=self.rota), \
             patch.object(rotas, "previsao_ponto", side_effect=previsao_fake), \
             patch.object(clima, "alertas_inmet", side_effect=alerta, return_value=[]), \
             patch.object(rotas.ia, "chamar_gemma", return_value=gemma) as chamada:
            resposta = self.client.post("/rotas/analise", json=payload or pedido())
            return resposta, chamada

    def test_fluxo_meia_noite_e_pior_trecho(self):
        resposta, _ = self.consultar()
        self.assertEqual(resposta.status_code, 200, resposta.text)
        r = resposta.json()
        self.assertEqual([h["hora"] for h in r["previsao"]], ["22:00", "23:00", "00:00", "01:00"])
        self.assertEqual(r["nivel"], "alto")
        self.assertTrue(all(h["probabilidade_chuva"] == 80 for h in r["previsao"]))
        self.assertEqual(r["gerado_por"], "template")
        self.assertEqual(r["horarios_atencao"][0]["fim"], "02:00")

    def test_gemma_recebe_profissao_rota_fuso_e_dados(self):
        resposta, chamada = self.consultar(json.dumps({"resumo": "Chuva no percurso.",
            "sugestoes": [{"dica": "Proteja a mochila.", "motivo": "Chuva de até 6 mm."}]}))
        self.assertEqual(resposta.json()["gerado_por"], "gemma")
        prompt = chamada.call_args.args[0]
        for trecho in ("Entregador", "Centro, Rio Branco", "Universidade, Rio Branco", "America/Rio_Branco", "80%"):
            self.assertIn(trecho, prompt)
        self.assertNotIn("Todos os horários estão no horário de Brasília", prompt)

    def test_gemma_invalido_usa_fallback_personalizado(self):
        p = pedido(); p["profissao"] = "Mototaxista"
        resposta, _ = self.consultar("resposta inválida", payload=p)
        self.assertEqual(resposta.json()["gerado_por"], "template")
        self.assertIn("capacete", str(resposta.json()["sugestoes"]))

    def test_alertas_falharam_nao_significa_nenhum_alerta(self):
        resposta, _ = self.consultar(alerta=clima.ErroClima("fora do ar"))
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.json()["alertas_status"], "parcial")

    def test_intervalo_igual_rejeitado(self):
        p = pedido(); p["fim"] = p["inicio"]
        self.assertEqual(self.client.post("/rotas/analise", json=p).status_code, 422)

    def test_data_fora_da_previsao(self):
        p = pedido(); p["data"] = "2000-01-01"
        self.assertEqual(self.client.post("/rotas/analise", json=p).status_code, 404)

    def test_coordenadas_invalidas_e_locais_iguais(self):
        p = pedido(); p["origem"]["latitude"] = 200
        self.assertEqual(self.client.post("/rotas/analise", json=p).status_code, 422)
        p = pedido(); p["destino"] = p["origem"]
        self.assertEqual(self.client.post("/rotas/analise", json=p).status_code, 422)

    def test_sem_rota_erro_visivel(self):
        with patch.object(rotas, "caminho", side_effect=clima.LocalNaoEncontrado("Sem trajeto")):
            r = self.client.post("/rotas/analise", json=pedido())
        self.assertEqual(r.status_code, 404)
        self.assertEqual(r.json()["detail"], "Sem trajeto")

    def test_busca_locais_validada(self):
        with patch.object(rotas, "buscar_locais", return_value=[pedido()["origem"]]):
            self.assertEqual(self.client.get("/locais?q=Rio%20Branco").status_code, 200)
        self.assertEqual(self.client.get("/locais?q=a").status_code, 422)

    def test_amostras_seguem_curva_da_via(self):
        curva = [[-68, -10], [-68, -9], [-67, -9]]
        pontos = rotas.amostrar(curva)
        self.assertEqual(pontos[0], curva[0]); self.assertEqual(pontos[-1], curva[-1])
        self.assertTrue(all(p[0] == -68 or p[1] == -9 for p in pontos))

    def test_normalizacao_mantem_indice_e_ultima_hora(self):
        dados = {"hourly": {"time": ["2026-10-25T10:00", "2026-10-25T11:00"],
            "temperature_2m": [30, 31], "precipitation_probability": [10, 80],
            "precipitation": [0, 6], "wind_speed_10m": [10, 15],
            "wind_gusts_10m": [20, 40], "weather_code": [0, 65]}}
        horas = clima.normalizar(dados)
        self.assertEqual(len(horas), 2)
        self.assertEqual(horas[0]["probabilidade_chuva"], 10)
        self.assertEqual(horas[1]["descricao"], "Chuva forte")

    def test_fuso_inmet_convertido(self):
        with patch.object(rotas, "caminho", return_value=self.rota), \
             patch.object(rotas, "previsao_ponto", side_effect=previsao_fake), \
             patch.object(clima, "alertas_inmet", return_value=[]) as avisos, \
             patch.object(rotas.ia, "chamar_gemma", return_value=None):
            self.client.post("/rotas/analise", json=pedido())
        self.assertEqual(avisos.call_args.args[2].hour, 0)  # 22h no Acre = 00h em Brasília

    def test_dado_ausente_nao_e_chuva_zero(self):
        d = datetime(2026, 10, 25, 10)
        dados = {"hourly": {"time": [d.isoformat()], "temperature_2m": [30],
            "precipitation_probability": [None], "precipitation": [0],
            "wind_speed_10m": [10], "wind_gusts_10m": [20], "weather_code": [0]}}
        with patch.object(clima, "_get", return_value=dados):
            with self.assertRaises(clima.SemPrevisao):
                rotas.previsao_ponto([-67, -9], d, d + timedelta(hours=1), "America/Rio_Branco", 0)

    def test_historico_enviado_ao_gemma_sem_trocar_previsao(self):
        p = pedido()
        p["historico"] = [{"data": p["data"], "inicio": "08:00", "fim": "12:00",
            "fuso": p["fuso"], "origem": "Trabalho anterior", "destino": "Cliente anterior",
            "profissao": "Entregador", "transporte": "moto", "retorno": "chuva_atrapalhou"}]
        resposta, chamada = self.consultar(payload=p)
        self.assertEqual(resposta.status_code, 200, resposta.text)
        prompt = chamada.call_args.args[0]
        self.assertIn("chuva_atrapalhou", prompt)
        self.assertIn("Não transfira a previsão de outro dia", prompt)
        self.assertIn("Trabalho anterior", prompt)
        self.assertNotIn("historico", resposta.json())  # histórico não vaza na resposta pública

    def test_limite_historico_e_profissao(self):
        p = pedido()
        registro = {"data": p["data"], "inicio": "08:00", "fim": "12:00", "fuso": p["fuso"],
            "origem": "Origem antiga", "destino": "Destino antigo", "profissao": "Vendedor", "transporte": "carro"}
        p["historico"] = [registro]
        _, chamada = self.consultar(payload=p)
        self.assertNotIn("Origem antiga", chamada.call_args.args[0])
        p["historico"] = [registro] * 6
        self.assertEqual(self.client.post("/rotas/analise", json=p).status_code, 422)


if __name__ == "__main__":
    unittest.main()
