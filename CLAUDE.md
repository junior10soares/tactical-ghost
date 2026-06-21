# CLAUDE.md — Tactical Ghost

## O que é este projeto

Tactical Ghost é uma aplicação web que converte descrições textuais ou gravações de voz de jogadas de futebol em animações táticas interativas em tempo real, em um campo 2D. O usuário pode escrever ou narrar em português livre — "Vinicius arrancou pela esquerda, driblou dois e cruzou para Rodrygo".

A IA interpreta os movimentos espaciais, posiciona os jogadores da seleção brasileira com suas fotos reais, injeta efeitos sonoros (SFX) sincronizados e gera uma narração personalizada com um locutor empolgado, no estilo das transmissões esportivas brasileiras. Além disso, possui o modo gamificado "Desafio do Técnico" para resolver quebra-cabeças contra retrancas.

> Toda a stack é 100% gratuita (ver tabela abaixo). Por isso a narração usa uma voz **premade** padrão da conta do ElevenLabs (plano Free), e não uma clonagem de voz de uma pessoa real — clonagem exige plano pago e levanta questão de direito de imagem/voz sem autorização. Vozes da **Voice Library** (community/marketplace) também ficam fora: o plano Free bloqueia o uso delas via API (`402 paid_plan_required`) mesmo que a voz tenha sido salva na conta — ver detalhes na seção de variáveis de ambiente.

Construído para o contexto da Copa do Mundo FIFA 2026 (EUA, México e Canadá), com foco em portfólio técnico de alto impacto demonstrável em vídeo.

---

## Stack técnica

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Frontend | Next.js 15 (App Router) + TypeScript | SSR, rotas de API nativas, tipagem estruturada |
| Estilo | Tailwind CSS | Utilitário, sem overhead ou build extra |
| Animação de UI | Framer Motion | Transições de entrada/saída entre modos e resultados, open-source (MIT), gratuito |
| Canvas 2D | HTML5 Canvas API (nativo) | Animação tradicional fluida a 30 FPS |
| Áudio / Mixer | Web Audio API (nativo) | Captura de microfone e mixagem concorrente (narração + SFX) |
| Speech-to-Text | Groq API — Whisper-large-v3 | Transcrição do áudio do usuário, gratuita (sem custo por uso) |
| Text-to-Speech | ElevenLabs API (plano Free) | Síntese de áudio com voz premade padrão da conta, tom de locutor esportivo |
| IA Espacial/Tática | Groq API — Llama 3.3 70B | Parser de linguagem natural → Coordenadas, SFX e Desafios, gratuito |
| Orquestração | LangGraph | Modela o pipeline (transcrever → analisar → narrar → persistir) como um grafo de nós, com estado tipado entre etapas |
| Observabilidade | LangSmith (free tier) + LangGraph Studio (local) | Tracing de cada execução do grafo e de cada chamada de IA (Groq/ElevenLabs) — latência, custo, payloads, falhas |
| Banco de Dados | Turso (libSQL) | Histórico de jogadas e cenários do Desafio do Técnico, serverless e gratuito |
| Fotos | Wikimedia Commons (via Wikipedia API) | Fotos reais dos jogadores (sem autenticação) — a ESPN CDN não hospeda headshot para a maioria dos titulares da seleção brasileira |
| Deploy | Vercel (Hobby) | Frontend + API routes, tudo serverless, plano gratuito |

> **Por que essa stack:** todo o projeto roda com custo **R$ 0**. Anthropic Claude e OpenAI Whisper não têm tier gratuito perpétuo (Claude cobra por token; Whisper é pago), por isso a IA tática e a transcrição usam Groq (Llama 3.3 70B e Whisper-large-v3 gratuitos, sem cartão). O Railway deixou de oferecer um tier realmente gratuito — por isso o banco virou Turso (compatível com SQLite, mas serverless/edge e gratuito) e o deploy é só Vercel.

---

## Estrutura de pastas

```text
tactical-ghost/
├── app/
│   ├── page.tsx                  # Página principal com o campo 2D
│   ├── layout.tsx                # Layout global, fontes, metadata
│   ├── api/
│   │   ├── analyze/route.ts      # POST /api/analyze — envia jogada à IA para coordenadas e SFX
│   │   ├── transcribe/route.ts   # POST /api/transcribe — processa áudio via Groq Whisper
│   │   ├── narrate/route.ts      # POST /api/narrate — gera áudio da narração via ElevenLabs
│   │   ├── challenge/route.ts    # POST /api/challenge — validação do Desafio do Técnico
│   │   └── history/route.ts      # GET /api/history — lista o histórico (gravação é automática via o nó persist do grafo)
├── components/
│   ├── TacticalBoard.tsx         # Orquestra o tabuleiro: modo (livre/desafio), estado da jogada
│   ├── Field2D.tsx               # Canvas do campo de futebol tradicional
│   ├── AudioRecorder.tsx         # Botão e lógica de gravação do microfone
│   ├── PlayerToken.tsx           # Renderização de jogador (foto + nome + posição)
│   ├── PlayInput.tsx             # Textarea + botão de análise alternativo
│   ├── Timeline.tsx              # Navegador de passos da jogada
│   ├── AnalysisPanel.tsx         # Painel tático e mixer de som (narração + SFX + grito de gol)
│   ├── HistoryPanel.tsx          # Lista o histórico de jogadas (GET /api/history)
│   └── ChallengeMode.tsx         # Interface e cenários do modo Desafio
├── lib/
│   ├── graph.ts                  # Definição do pipeline como grafo LangGraph (transcribe → analyze → narrate → persist)
│   ├── llm.ts                    # Wrapper da Groq API (Llama 3.3 70B) + prompt estruturado
│   ├── schemas.ts                # Schemas Zod de validação da resposta da IA
│   ├── whisper.ts                # Conexão Groq API (Whisper-large-v3) para Speech-to-Text
│   ├── elevenlabs.ts             # Geração de voz Text-to-Speech (voz premade da conta)
│   ├── audioContext.ts           # Mixer e buffers da Web Audio API para SFX concorrentes
│   ├── db.ts                     # Conexão Turso (libSQL) + queries (Histórico + Desafios)
│   ├── players.ts                # Elenco da seleção brasileira
│   ├── challenges.ts             # Carrega os cenários do Desafio do Técnico (data/challenges/*.json)
│   ├── formations.ts             # Coordenadas de formações (4-3-3, 4-4-2, etc.)
│   └── canvas.ts                 # Funções de desenho no canvas 2D
├── types/
│   └── index.ts                  # Tipos TypeScript do projeto (incluindo SFX)
├── data/
│   ├── players/
│   │   └── brazil.json           # Elenco Brasil Copa 2026 (única seleção disponível)
│   └── challenges/               # Cenários predefinidos de defesas retrancadas
├── public/
│   ├── audio/                    # Banco de efeitos sonoros (.mp3 locais de chutes, gols, etc.)
│   └── fallback-player.svg       # Avatar fallback quando foto falha
├── CLAUDE.md                     # Este arquivo
└── README.md                     # Documentação pública
```

---

## Como a IA funciona

### Orquestração via LangGraph

O núcleo do pipeline (analisar taticamente → persistir) é modelado como um grafo no LangGraph (`lib/graph.ts`), em vez de chamadas sequenciais soltas entre as API routes. Cada etapa é um nó com estado tipado compartilhado (texto da jogada, JSON da análise, id salvo). Isso permite visualizar e depurar a execução passo a passo no **LangGraph Studio**.

> **`transcribe` e `narrate` ficam fora do grafo principal, como endpoints próprios:**
> - `POST /api/transcribe` é chamado pelo frontend antes de `/api/analyze`, para o usuário poder revisar/editar o texto transcrito antes de enviar para análise (em vez de a transcrição alimentar a IA tática silenciosamente).
> - `POST /api/narrate` só é chamado quando o usuário pede para ouvir a jogada, não a cada análise — o plano Free do ElevenLabs tem só 10k créditos/mês, e gerar narração em toda chamada de `/api/analyze` (inclusive durante testes) esgotaria a cota rapidamente sem necessidade.

### Observabilidade via LangSmith

Toda execução do grafo, e cada chamada individual a Groq/ElevenLabs dentro dos nós, é traceada no **LangSmith** (latência, payloads de entrada/saída, custo, falhas). Serve tanto para depuração quanto para demonstrar o funcionamento interno do pipeline em vídeo/portfólio.

### Fluxo completo (Com Áudio e Mixer)

```text
Usuário fala a jogada no microfone
  ↓
POST /api/transcribe (Groq Whisper-large-v3) -> Retorna Texto (usuário revisa/edita antes de enviar)
  ↓
POST /api/analyze -> grafo LangGraph: [Nó: analyze] Groq Llama 3.3 70B -> [Nó: persist] salva no Turso
  ↓
Frontend inicia Animação no Canvas 2D e dispara os SFX (.mp3 locais) via Web Audio API
  ↓
(Sob demanda) Usuário clica em "ouvir narração" -> POST /api/narrate -> ElevenLabs gera o .mp3
```

Toda a execução acima (do nó `transcribe` ao `persist`) gera um trace completo no LangSmith, navegável nó a nó.

### Formato de resposta da IA

A IA deve retornar **sempre** neste formato JSON exato. Nunca adicionar markdown, texto fora do JSON ou campos extras não documentados:

```json
{
  "resumo": "Contra-ataque rápido pela esquerda com finalização no canto",
  "tipo": "contra-ataque",
  "eficacia": 78,
  "desafioSuperado": true, 
  "steps": [
    {
      "label": "Intercepção",
      "descricao": "Casemiro recupera a bola no meio-campo",
      "playerMove": {
        "role": "mid",
        "label": "Casemiro",
        "fromX": 330,
        "fromY": 190,
        "toX": 280,
        "toY": 175
      },
      "ballMove": {
        "fromX": 310,
        "fromY": 180,
        "toX": 280,
        "toY": 175
      },
      "sfx": "apito_juiz"
    },
    {
      "label": "Chute",
      "descricao": "Finalização forte cruzada",
      "playerMove": {
        "role": "att",
        "label": "Vinicius Jr",
        "fromX": 110,
        "fromY": 90,
        "toX": 150,
        "toY": 60
      },
      "ballMove": {
        "fromX": 110,
        "fromY": 90,
        "toX": 320,
        "toY": 25
      },
      "sfx": "chute_seco"
    }
  ],
  "analise": "Olha o contra-ataque do Brasil! Casemiro recuperou, abriu com o Vinicius Júnior. Ele limpou a marcação, bateeeu... que golaço do Brasil!"
}
```

### Tipos válidos de jogada

`contra-ataque` | `escanteio` | `triangulação` | `pressão-alta` | `cruzamento` | `jogada-ensaiada` | `falta` | `tiro-livre`

### Efeitos Sonoros Válidos (sfx)

`corrida_acelerada` | `chute_seco` | `passe_rasteiro` | `cruzamento` | `defesa_goleiro` | `gol_torcida` | `apito_juiz` | `null`

### Coordenadas do campo

O campo possui dimensões lógicas fixas de largura 660px × altura 380px.

| Região | X | Y |
|--------|---|---|
| Gol adversário | 330 | 20 |
| Gol próprio | 330 | 360 |
| Centro | 330 | 190 |
| Lado esquerdo | < 200 | — |
| Lado direito | > 460 | — |
| Área adversária | — | < 90 |
| Meio-campo | — | 150–230 |
| Área defensiva | — | > 290 |

Sempre atacar em direção ao topo (y decrescente). O goleiro fica em y=340, os atacantes em y≈50–80.

## Dados dos jogadores

> Só a seleção brasileira está disponível (`data/players/brazil.json`) — o app não tem seletor de time.

### Formato do JSON de elenco

```json
{
  "team": "brasil",
  "formation": "4-3-3",
  "color": "#1B9E4E",
  "players": [
    {
      "name": "Alisson",
      "fullName": "Alisson Becker",
      "number": 1,
      "position": "gk",
      "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/.../alisson.jpg",
      "label": "GK"
    },
    {
      "name": "Vinicius Jr",
      "fullName": "Vinícius José Paládino de Oliveira Júnior",
      "number": 7,
      "position": "att",
      "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/.../vinicius-jr.jpg",
      "label": "A1"
    }
  ]
}
```

### Fonte das fotos: Wikimedia Commons, não ESPN CDN

A ideia original era usar `https://a.espncdn.com/i/headshots/soccer/players/full/{espnId}.png`, mas a ESPN **não hospeda headshot** para a maioria dos titulares da seleção (testado diretamente: todos os 11 IDs retornavam 404). Em vez de um ID + fórmula de URL, cada jogador armazena a `photoUrl` final, resolvida via a REST API pública e sem autenticação da Wikipedia (`https://en.wikipedia.org/api/rest_v1/page/summary/{título_da_página}`, campo `thumbnail.source`).

Se a foto falhar (404 ou CORS), `PlayerToken.tsx` cai no fallback: inicial do nome em círculo colorido pela posição.

### Cores por posição

```typescript
const POSITION_COLORS = {
  gk:  '#FF8C42',  // laranja
  def: '#A0E0A0',  // verde claro
  mid: '#60AAFF',  // azul
  att: '#FFD700',  // amarelo
}
```

## Banco de dados (Turso / libSQL)

Turso usa o mesmo dialeto SQL do SQLite (via libSQL), mas é acessado por HTTP e funciona em ambiente serverless/edge — por isso substitui o SQLite em arquivo local sem mudar o schema abaixo.

### Schema (Atualizado com Desafios)

```sql
CREATE TABLE plays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  team TEXT NOT NULL,
  formation TEXT NOT NULL,
  input_text TEXT NOT NULL,
  play_type TEXT,
  efficacy INTEGER,
  summary TEXT,
  steps_json TEXT NOT NULL,
  analysis TEXT
);

CREATE TABLE challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  adversary TEXT NOT NULL,
  defenders_json TEXT NOT NULL
);
```

## Variáveis de ambiente

Crie `.env.local` na raiz do projeto:

```text
# Groq (IA tática + transcrição) — gratuito
GROQ_API_KEY=gsk_...

# Turso (banco de dados) — gratuito
TURSO_DATABASE_URL=libsql://tactical-ghost-xxxx.turso.io
TURSO_AUTH_TOKEN=ey...

NEXT_PUBLIC_APP_NAME=Tactical Ghost

# ElevenLabs (narração — plano Free)
# IMPORTANTE: vozes da Voice Library são bloqueadas via API no plano Free
# (402 paid_plan_required), mesmo salvas na conta. Use uma voz "premade"
# (categoria padrão de toda conta nova, ex.: Bella, Roger, Sarah, Charlie,
# George, Callum, River). Para checar a categoria de uma voz:
# GET https://api.elevenlabs.io/v2/voices com sua API key.
ELEVENLABS_API_KEY=el-...
ELEVENLABS_NARRATOR_VOICE_ID=voice_id_premade

# LangSmith / LangGraph (observabilidade e orquestração) — free tier
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_...
LANGSMITH_PROJECT=tactical-ghost
```

## Prompt da IA (em lib/llm.ts)

O system prompt deve sempre incluir as instruções espaciais combinadas com os gatilhos de áudio e validações do modo desafio:

```typescript
const systemPrompt = `Você é um analista tático de futebol e engenheiro de sonoplastia de alto nível.
Analise jogadas em português e retorne APENAS JSON válido sem markdown, sem texto fora do JSON.

Campo: 660x380px. Gol adversário no topo (y=20). Gol próprio na base (y=360).
Formação atual: ${formation}
Jogadores em campo: ${JSON.stringify(currentPlayers)}

Injete gatilhos precisos de 'sfx' no milissegundo em que a ação física ocorre. Valores permitidos: "corrida_acelerada", "chute_seco", "passe_rasteiro", "cruzamento", "defesa_goleiro", "gol_torcida", "apito_juiz", null.

Se estiver avaliando o 'Modo Desafio', julgue se a ação descrita rompe a retranca adversária e defina o campo 'desafioSuperado'.
Gere de 3-6 steps por jogada. Escreva o campo 'analise' simulando a entonação emocionante e os jargões do ritmo clássico das transmissões esportivas brasileiras.`;
```

## Animação no canvas (lib/canvas.ts)

### Ordem de renderização (importante — não alterar no 2D)

1. Fundo do campo (listras de grama)
2. Linhas do campo (área, meio-campo, círculo central)
3. Trail da bola (linha tracejada amarela dos frames anteriores)
4. Setas de movimento dos jogadores
5. Jogadores adversários (vermelho, camada de baixo)
6. Jogadores do time (foto circular com borda colorida)
7. Bola (sempre no topo)

## Diretrizes de UI/UX

A interface precisa ser visualmente chamativa e usar animações de forma generosa — é um projeto de portfólio e a primeira impressão importa tanto quanto a lógica por trás. Mas todo polish visual deve estar sobre uma base 100% funcional: nenhuma animação, transição ou efeito pode ser implementado se a feature correspondente ainda não funciona de ponta a ponta. Prioridade sempre: funcionalidade real primeiro, refinamento visual em seguida — nunca o contrário.

## Comandos de desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Inicializar banco de dados (Jogadas + Desafios)
npm run db:init
```

## Convenções de código

- **Componentes**: PascalCase, um componente por arquivo. Toda a renderização do campo fica em `Field2D.tsx`.
- **Mixer de Áudio**: usar sempre `AudioContext` nativo em `lib/audioContext.ts` para agendar e sobrepor os buffers de SFX sem atrasar a timeline principal.
- **Erros de JSON**: sempre aplicar regex de captura (`/\{[\s\S]*\}/`) no backend caso a resposta da API retorne blocos espúrios de Markdown.
- **Canvas**: nunca acessar `document` ou `window` fora de `useEffect`.

## Checklist antes de commitar

- [ ] `.env.local` contendo chaves Groq, Turso, ElevenLabs e LangSmith não está no commit.
- [ ] O áudio gerado pelo ElevenLabs e as colisões sonoras de SFX disparam de forma sincronizada na timeline.
- [ ] O Fallback de foto e áudio foi testado (App não quebra sem conexão com a API de voz).

## Contexto da Copa 2026

- Início: 11 de junho de 2026, Estádio Azteca, Cidade do México.
- Final: 19 de julho de 2026, MetLife Stadium, Nova Jersey (Nova York).
- Brasil no Grupo C: Marrocos, Haiti, Escócia.
- Estreia do Brasil: 13 de junho vs Marrocos, Nova York/Nova Jersey.
- Formato: 48 seleções, 12 grupos de 4, 104 partidas no total.
