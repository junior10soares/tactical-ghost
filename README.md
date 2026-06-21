# Tactical Ghost ⚽

> Descreva uma jogada em português ou grave seu áudio. A IA anima no campo 2D em tempo real com efeitos sonoros e narração de locutor esportivo!

**Tactical Ghost** é uma aplicação web que usa inteligência artificial para converter descrições textuais ou gravações de voz de jogadas de futebol em animações táticas interativas — com fotos reais dos jogadores, análise tática automática, efeitos sonoros ambientais sincronizados, narração em áudio personalizada e histórico navegável por passos.

Construído no contexto da **Copa do Mundo FIFA 2026** (EUA, México e Canadá).

---

## Demo

> *"Vinicius arrancou pela esquerda, driblou dois adversários e cruzou rasteiro para Rodrygo que finalizou no canto direito"*

↓ A IA interpreta, posiciona os jogadores com suas fotos reais, anima cada movimento passo a passo no campo 2D, injeta efeitos sonoros de jogo e gera a narração emotiva por IA.

---

## Por que este projeto é diferente

A maioria dos projetos de IA para futebol são chatbots ou dashboards de estatísticas. O Tactical Ghost faz algo que poucos exploram: **raciocínio espacial e áudio-visual emergindo de linguagem natural**.

O sistema não usa coordenadas pré-definidas. Ele lê a descrição (ou transcreve o seu áudio), entende quem se moveu, para onde, com a bola ou sem ela, e converte isso em posições x/y no campo — tudo via LLM. Para coroar a experiência, a IA renderiza o lance em 30 FPS, gerencia trilhas de áudio concorrentes em tempo real (Narração + Efeitos Sonoros de torcida e chute) e permite ao usuário testar suas próprias habilidades táticas contra retrancas reais da Copa 2026.

> Toda a stack roda em planos gratuitos — sem custo de operação (ver tabela de stack abaixo).

---

## Funcionalidades

- **Animação em tempo real** — jogadores com fotos reais se movem no campo 2D passo a passo.
- **Entrada por Voz (Gravação)** — grave sua própria narração diretamente pelo microfone; o sistema transcreve e gera a tática automaticamente.
- **Narração com locutor esportivo** — a IA gera um áudio personalizado, no tom empolgado das transmissões de futebol, comentando e narrando a sua jogada.
- **Sincronização de Efeitos Sonoros (SFX)** — sonoroplastia inteligente em tempo real; sons de chute, apito e explosão da torcida disparam no milissegundo exato do impacto da jogada.
- **Modo "Desafio do Técnico"** — um quebra-cabeça tático interativo onde a IA posiciona uma defesa adversária (ex: a retranca da França) e desafia você a ditar a jogada perfeita para superá-la.
- **IA tática** — Groq (Llama 3.3 70B) analisa a jogada e retorna tipo, eficácia e análise detalhada.
- **Timeline navegável** — avance e retroceda entre os passos da jogada livremente.
- **Seleção brasileira** — elenco real da Copa 2026, formação 4-3-3.
- **Formações táticas** — 4-3-3, 4-4-2, 3-5-2 e 4-2-3-1.
- **Histórico local** — todas as jogadas salvas no Turso para revisitar.
- **Fallback inteligente** — se a foto do jogador não carregar, exibe inicial com cor da posição.

---

## Stack tecnológica

| Tecnologia | Uso | Custo |
|-----------|-----|-------|
| **Next.js 15** | Frontend + API Routes | Gratuito |
| **TypeScript** | Tipagem do projeto | Gratuito |
| **Tailwind CSS** | Estilização | Gratuito |
| **Framer Motion** | Transições e animações de UI | Gratuito (MIT) |
| **Canvas API** | Animação do campo em 2D | Nativo |
| **Web Audio API** | Captura do microfone e mixagem concorrente (narração + SFX) | Nativo |
| **Groq API — Whisper-large-v3** | Transcrição de áudio para texto (Speech-to-Text) | Gratuito |
| **Groq API — Llama 3.3 70B** | Parser de linguagem natural, coordenadas e lógica de desafios | Gratuito |
| **LangGraph** | Orquestra o pipeline (transcrever → analisar → narrar → persistir) como um grafo, visualizável no LangGraph Studio | Gratuito |
| **LangSmith** | Tracing e observabilidade de cada execução e chamada de IA do pipeline | Free tier |
| **ElevenLabs API** | Text-to-Speech com voz premade padrão da conta (plano Free) | Free tier |
| **Turso (libSQL)** | Histórico de jogadas e cenários do Desafio do Técnico, serverless | Free tier |
| **Wikimedia Commons** | Fotos reais dos jogadores (via API pública da Wikipedia) | Público e gratuito |
| **Vercel (Hobby)** | Deploy do frontend e das API routes (tudo serverless) | Free tier |

**Custo total de operação: R$ 0** — toda a stack roda em planos gratuitos (ver justificativa de cada escolha no `CLAUDE.md`).

---

## Como funciona

### Arquitetura

```text
┌─────────────────────────────────────────────────────┐
│                   Usuário                            │
│  digita texto OU grava áudio falando a jogada        │
└─────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              Next.js Frontend                        │
│  [Web Audio API] capta áudio se necessário            │
│  Renderiza o Campo em 2D (Canvas)                     │
└─────────────────────┬─────────────────────────────────┘
                       │ POST /api/analyze (ou /api/transcribe)
                       ▼
┌─────────────────────────────────────────────────────┐
│            API Route (Next.js)                        │
│  Groq Whisper-large-v3 transcreve áudio -> Texto       │
│  Monta prompt com contexto do campo + elenco atual    │
└─────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│         Groq API — Llama 3.3 70B                      │
│  Retorna JSON com steps, coordenadas, SFX e análise   │
└─────────────────────┬─────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│      ElevenLabs API        │  │          Turso              │
│  Gera áudio .mp3 com voz   │  │ Jogada salva com metadados │
│  premade da conta (Free)   │  │ para histórico              │
└─────────────┬───────────────┘  └───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│          Reprodução e Mixagem Sincronizada            │
│  O motor gráfico roda a animação 2D enquanto a Web    │
│  Audio API mixa a narração com gatilhos de efeitos    │
│  sonoros (SFX de chutes, apitos e torcida)            │
└─────────────────────────────────────────────────────┘
```

Todo o pipeline acima é orquestrado por um grafo **LangGraph** (visualizável no LangGraph Studio) e traceado no **LangSmith**.

### Pipeline de uma jogada

1. **Entrada:** O usuário digita o comando, grava uma narração ou inicia um "Desafio do Técnico" (onde tenta quebrar uma defesa predefinida pela IA).
2. **Orquestração:** Um grafo LangGraph conduz as etapas abaixo, com tracing completo de cada nó e chamada de IA no LangSmith.
3. **Processamento Inicial:** Se houver áudio, o Groq Whisper-large-v3 (`POST /api/transcribe`) faz o Speech-to-Text.
4. **Análise Espacial & Sonoplastia:** O Groq Llama 3.3 70B (`POST /api/analyze`) interpreta a jogada em relação às posições atuais e devolve um JSON estruturado contendo as coordenadas passo a passo e marcadores de eventos sonoros (ex: `sfx: "chute"`).
5. **Geração de Voz:** A narrativa gerada pela IA vai para o ElevenLabs (`POST /api/narrate`) para sintetizar o áudio com uma voz premade da conta (ver nota sobre Voice Library vs. premade abaixo).
6. **Renderização & Mixagem:** O Frontend recebe os dados e anima a jogada no campo 2D. Nos milissegundos exatos mapeados pela IA, a Web Audio API dispara os arquivos de som locais por cima da narração de fundo.
7. **Persistência:** Tudo fica gravado no histórico no Turso.

---

## Instalação e execução

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Chave da API Groq (gratuita, sem cartão)
- Conta Turso (banco de dados, plano Free)
- Chave da API ElevenLabs (plano Free)
- Conta LangSmith (free tier, para tracing e LangGraph Studio)

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/junior10soares/tactical-ghost.git
cd tactical-ghost

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local e preencher as chaves de API

# 4. Inicializar o banco de dados (inclui tabelas de desafios)
npm run db:init

# 5. Rodar em desenvolvimento
npm run dev
```

### Variáveis de ambiente

```text
# .env.local
GROQ_API_KEY=gsk_...

TURSO_DATABASE_URL=libsql://tactical-ghost-xxxx.turso.io
TURSO_AUTH_TOKEN=ey...

NEXT_PUBLIC_APP_NAME=Tactical Ghost

# ElevenLabs (narração — plano Free, voz premade da conta)
ELEVENLABS_API_KEY=el-...
ELEVENLABS_NARRATOR_VOICE_ID=voice_id_premade

# LangSmith / LangGraph (free tier)
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_...
LANGSMITH_PROJECT=tactical-ghost
```

> **Voice Library vs. voz premade:** o plano Free do ElevenLabs **não permite usar vozes da Voice Library (community/marketplace) via API** — mesmo que a voz tenha sido salva na sua conta, ela continua bloqueada (`402 paid_plan_required`) por carregar a categoria `professional`/`generated` da Library. Só as vozes **premade** que já vêm por padrão em toda conta nova (ex.: Bella, Roger, Sarah, Charlie, George, Callum, River) funcionam de graça via API. Para confirmar a categoria de uma voz antes de configurá-la, consulte `GET https://api.elevenlabs.io/v2/voices` com sua API key e procure por `"category": "premade"`.

## Estrutura do projeto

```text
tactical-ghost/
├── app/
│   ├── page.tsx                  # Página principal (Campo 2D + Controles)
│   ├── layout.tsx                # Layout e metadata
│   └── api/
│       ├── analyze/route.ts      # Análise de jogada e injeção de SFX via Groq (Llama 3.3 70B)
│       ├── transcribe/route.ts   # Transcrição de áudio via Groq (Whisper-large-v3)
│       ├── narrate/route.ts      # Geração de narração via ElevenLabs
│       ├── challenge/route.ts    # Geração e validação do "Desafio do Técnico"
│       └── history/route.ts      # Histórico de jogadas
├── components/
│   ├── Field2D.tsx               # Canvas do campo tradicional 2D
│   ├── AudioRecorder.tsx         # Botão e lógica de gravação de áudio
│   ├── PlayerToken.tsx           # Token visual do jogador (foto via Wikimedia Commons)
│   ├── PlayInput.tsx             # Input de texto alternativo
│   ├── Timeline.tsx              # Navegador de passos
│   ├── AnalysisPanel.tsx         # Análise tática e mixer de som (narração + SFX + grito de gol)
│   └── ChallengeMode.tsx         # Interface e feedback do modo Desafio
├── lib/
│   ├── graph.ts                  # Pipeline como grafo LangGraph (transcribe → analyze → narrate → persist)
│   ├── llm.ts                    # Integração Groq API — Llama 3.3 70B (prompt estruturado de SFX)
│   ├── whisper.ts                # Integração Groq API — Whisper-large-v3
│   ├── elevenlabs.ts             # Integração ElevenLabs (voz premade da conta)
│   ├── audioContext.ts           # Mixer e buffers da Web Audio API para SFX concorrentes
│   └── db.ts                     # Turso (libSQL) queries (Histórico + Desafios)
├── data/
│   ├── players/                  # Elenco da seleção brasileira (brazil.json)
│   └── challenges/               # Cenários predefinidos de defesas retrancadas
├── types/
│   └── index.ts                  # Tipos TypeScript (incluindo assinaturas de SFX nos Steps)
└── public/
    ├── audio/                    # Banco de efeitos sonoros (.mp3 de chutes, vaias, gols)
    └── fallback-player.svg       # Avatar padrão
```

## API

### POST /api/analyze

Analisa uma jogada e retorna os passos para animação com gatilhos de áudio.

Response (Estrutura Atualizada):

```json
{
  "resumo": "Jogada de velocidade pela ala esquerda com cruzamento",
  "tipo": "cruzamento",
  "eficacia": 72,
  "steps": [
    {
      "label": "Arrancada",
      "descricao": "Vinicius acelera pela esquerda",
      "playerMove": { "label": "Vinicius Jr", "toX": 120, "toY": 100 },
      "ballMove": { "toX": 120, "toY": 100 },
      "sfx": "corrida_acelerada"
    },
    {
      "label": "Chute de primeira",
      "descricao": "Rodrygo finaliza de chapa",
      "playerMove": { "label": "Rodrygo", "toX": 180, "toY": 140 },
      "ballMove": { "toX": 250, "toY": 150 },
      "sfx": "chute_seco"
    }
  ],
  "analise": "Jogada bem executada explorando a velocidade pela ala..."
}
```

### POST /api/challenge

Gera um cenário de defesa compactada ou avalia se a solução textual/por voz do usuário conseguiu romper a retranca proposta.

## Roadmap

- [x] Entrada por Voz — Integração com microfone e transcrição inteligente via Groq (Whisper-large-v3).
- [x] Narração com locutor esportivo — Geração de áudio customizado Text-to-Speech via ElevenLabs (voz premade da conta).
- [x] Sonoplastia Dinâmica (SFX) — Injeção de gatilhos de efeitos sonoros (chute, gol, torcida) pela IA rodando sob a Web Audio API.
- [x] Desafio do Técnico — Sistema gamificado de cenários táticos defensivos para o usuário tentar quebrar.
- [x] Orquestração via LangGraph + observabilidade via LangSmith/LangGraph Studio.
- [ ] Exportar animação completa como vídeo MP4 com o áudio mixado integrado.

## Licença

MIT — use, modifique e distribua livremente.

## Contato

Feito por **Junior Soares** — [LinkedIn](https://www.linkedin.com/in/edsonjr-dev/) · [GitHub](https://github.com/junior10soares)

Projeto construído para demonstração técnica de portfólio durante a Copa do Mundo FIFA 2026.
