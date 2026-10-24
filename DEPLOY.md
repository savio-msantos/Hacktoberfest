# Deploy no Render

O front e a API continuam como dois serviços separados do mesmo repositório.
As configurações abaixo não exigem recriar os serviços já publicados.

## Backend: Web Service

- Branch: `main`.
- Root Directory: `clima-ia`.
- Build Command: `pip install -r requirements.txt`.
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
- Instance Type: `Free`.
- Health Check Path: `/health`.
- Environment: adicione `GEMMA_API_KEY` diretamente no painel. Nunca no frontend ou GitHub.
- Se a chave já estiver como `GEMINI_API_KEY` ou `GOOGLE_API_KEY`, o backend também aceita esses nomes.
- Opcionais: `GEMMA_API_URL` e `GEMMA_MODEL`, conforme `.env.example`.

Depois de enviar as alterações ao GitHub, use **Manual Deploy → Deploy latest commit**.
Confira `/health`: `ia_configurada: true` confirma a presença da chave,
não a validade da chave ou disponibilidade do modelo. O resultado de uma consulta
com `gerado_por: gemma` confirma que a análise veio da IA.

## Frontend: Static Site

- Root Directory: `climaetc-app`.
- Build Command: `npm ci && npm run build`.
- Publish Directory: `dist`.
- Environment: `VITE_API_URL=https://clima-ia.onrender.com` (substitua pela URL real da API se ela mudar).
- Em **Redirects/Rewrites**, crie: Source `/*`, Destination `/index.html`, Action `Rewrite`.

A variável `VITE_API_URL` entra no build: ao alterá-la, faça um novo deploy.
O código usa a API publicada acima como padrão em produção e localhost em desenvolvimento.
Não configure `GEMMA_API_KEY` no Static Site: variáveis `VITE_*` ficam públicas.

## Verificar depois do deploy

1. Abra o frontend. Busque e selecione a origem e o destino (inclua cidade e estado).
2. Informe profissão, data futura, período e fuso correto. Clique em **Analisar meu trajeto**.
3. Confira cinco pontos, previsão por hora, fontes, avisos e plano de trabalho.
4. Em **Comparar turnos**, consulte dois períodos. Resultados mudam com os dados retornados, sem amostras fixas.
5. Abra `/comparar-turnos` diretamente e atualize a página para verificar a regra de rewrite.

## Limites desta versão

- Histórico: até 10 planejamentos ficam no `localStorage` do navegador, sem conta ou banco de dados.
  Há opção de desativar o uso pela IA e botão para apagar. Até cinco registros da mesma profissão
  são enviados junto com a nova análise. O retorno "Como foi?" é relato do usuário, não observação meteorológica.
  O histórico não substitui a previsão atual e não acompanha a pessoa em outro navegador/dispositivo.

- O perfil viário é de carro, inclusive para moto. Não há rotas de bicicleta ou a pé.
- A previsão é amostrada em cinco pontos do trajeto rodoviário e considera o período inteiro;
  não estima em que horário a pessoa passará em cada trecho.
- Alertas INMET são procurados apenas nos municípios dos extremos. Falhas aparecem como consulta parcial.
- Não há dados de trânsito, bloqueios ou alagamentos observados; o sistema não garante segurança ou viabilidade.
- Gemma recebe rota, profissão, transporte, fuso e dados reais. Se não responder, o retorno identifica o fallback.
- Os provedores públicos Photon e OSRM são serviços de demonstração, sem garantia de disponibilidade.
  Consultas de locais e trajetos têm cache; a busca só ocorre por ação explícita do usuário.
  `GEOCODER_URL` e `ROUTER_URL` permitem trocar por instâncias compatíveis.
- O cache é local ao processo, adequado a uma instância pequena. A primeira chamada ao Render Free pode demorar.

Documentação dos provedores: [Photon](https://github.com/komoot/photon),
[OSRM](https://project-osrm.org/docs/v5.24.0/api/), [Open-Meteo](https://open-meteo.com/en/docs).
