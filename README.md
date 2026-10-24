# Hacktoberfest
Equipe: Sávio Monteiro, Leonam Leão, Clara Serena e Isaque Santarem 

Assistente climático para planejar trabalho por trajeto, horário e profissão.

- `clima-ia/`: API FastAPI, previsão Open-Meteo, trajeto OSRM, busca Photon, avisos INMET e orientações Gemma.
- `climaetc-app/`: interface React/TypeScript com planejamento de trajeto e comparação de turnos.
- [Deploy no Render e limites da análise](DEPLOY.md).

## Desenvolvimento

Backend (PowerShell):

```powershell
cd clima-ia
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
# Apenas se ainda não existir:
Copy-Item .env.example .env
# Preencha GEMMA_API_KEY no .env para usar a IA.
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

Frontend em outro terminal:

```powershell
cd climaetc-app
npm.cmd install
npm.cmd run dev
```

Use Node 22.22+ ou 24 LTS. O frontend local consulta `http://localhost:8000`.
Para outra API, copie `climaetc-app/.env.example` para `.env.local` e ajuste `VITE_API_URL`.

Rotas da interface: `/` e `/rotas` para planejar; `/comparar-turnos` para comparar.
API: `GET /locais?q=...`, `POST /rotas/analise`; contratos em `/docs`.
Os endpoints antigos `/previsao` e `/analise` continuam disponíveis.

## Validação

```powershell
cd climaetc-app
npm.cmd run build
npm.cmd run lint
```

```powershell
cd clima-ia
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m unittest -v test_rotas
```

Os testes HTTP usam respostas simuladas, sem chave de IA ou chamadas pagas.
