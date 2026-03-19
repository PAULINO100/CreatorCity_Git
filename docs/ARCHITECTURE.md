# 🏗️ Arquitetura do OpenGravity

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                   OPENGRAVITY ENVIRONMENT                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [ TELEGRAM BOT API ] <─────┐                              │
│         (Grammy)             │                              │
│                              ▼                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     ROUTING/MUX                       │  │
│  │  Middlewares: Auth, Security, Logic Sanitizer, Rate   │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                              │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │                    AGENT CORE LOOP                    │  │
│  │  - Context Manager (Memory/SQLite)                    │  │
│  │  - Tool Resolution Loop (Up to MAX_ITERATIONS)        │  │
│  │  - Prompts Parser                                     │  │
│  └──────────────────┬─────────────────┬──────────────────┘  │
│                     │                 │                     │
│  ┌──────────────────▼────┐ ┌──────────▼──────────────────┐  │
│  │    LLM PROVIDERS      │ │      TOOL REGISTRY          │  │
│  │    - Groq (Pri.)      │ │   - File Checkers (Read)    │  │
│  │    - ORouter (Sec.)   │ │   - File Writer (Apply)     │  │
│  └───────────────────────┘ │   - Env Executor Commands   │  │
│                            └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Principais

### Agent Core (`src/agent/`)
- `Agent.ts`: Loop central de processamento determinístico, resolvendo Tools assíncronamente sem interromper o usuário.
- `Agent.types.ts`: Tipagens nativas TypeScript (ex: Message, Role, Models Tooling).
- `Agent.config.ts`: Definições globais validadas via injetor sintático Zod com Fallback Defaults.

### LLM Providers (`src/llm/`)
- `LLMProvider.ts`: Interface abstrata, estendendo facilidade de plug no futuro (Gemini, Claude, GPT).
- `GroqProvider.ts`: Client prioritário operando Llama 3 para máxima velocidade com inferência nativa.
- `OpenRouterProvider.ts`: Fallback dinâmico com inserção de cabeçalhos de analytics do platform.

### Tools (`src/tools/`)
- `ToolRegistry.ts`: Mapper central para descoberta autêntica pelo LLM. Instancia injetores de tools isolados.
- Ferramentas Nativas: `read_file`, `write_file`, `check_diff`, `generate_code`, `run_command`.

### Security (`src/security/`)
- `sandbox.ts`: Bloqueador File System (Path Traversal/Local Injection).
- `whitelist.ts`: Gestor ID de Botnet/DDoS externo.
- `rateLimiter.ts`: Controlador limitador e throttling.

### Memory (`src/memory/`)
- `SQLiteMemoryStore.ts`: Interface via `better-sqlite3` que preserva as long-term chains de LLM contextuado.

### Bot (`src/bot/`)
- `TelegramBot.ts`: Facade geradora e empacotador de injeções (Long-Polling Mode).
- `TelegramBot.handlers.ts` e `TelegramBot.router.ts`: Controladores dos comandos nativos e processadores Text.

## Fluxo de Dados

1. O usuário emite a mensagem com formato limpo do Telegram (`/implement <...>`, pura ou afins)
2. A `AuthMiddleware` e a `RateLimitMiddleware` travam as requisições se irregulares.
3. O `TelegramBot.Router` roteia as requisições purificadas ao `processPrompt()`.
4. O `Agent.ts` conecta-se a Memory SQL e restaura a aba da memória conversacional.
5. Inicia o Loop Chamando LLMProvider (Groq. Tentativa secundária: ORouter).
6. Tool Calls geradas são executadas na máquina host (via `ToolRegistry`).
7. `write_file` simula o processo parando a string em cache `pendingWrites`.
8. Loop devolve o diff. O usuário é estimulado a invocar o handler manual `/apply`.
9. Um `/apply` dispara um `run_command` (Git Backup) local, que por fim salva o arquivo com a biblioteca Node `fs`.
10. Final da Chain, e o logger relata em `opengravity.log`.

## Decisões de Design

| Decisão | Justificativa |
|---------|---------------|
| Long polling vs Webhook | Mantém o host interno invisível no ambiente de rede global local sem mexer com HTTPS Ports e Firewalls para desenvolvimento. |
| SQLite vs PostgreSQL | Deploy extremamente flexível e simples. Evita overhead de DB local e roda Serverless sem dor. |
| Pending writes pattern | Fator base para Agentes Autônomos de Código 1.0 — Protege o utilizador de falhas lógicas e bad-outputs da LLM e preza pelo controle absoluto. |
| Zod para config | Reduz 45% do boilerplate comum de `process.env`. |
| Middleware chain | Aumenta legibilidade e escalabilidade do Grammy-bot. |

## Escalabilidade Futura

- Multi-usuário: Modelagem RBAC (Role Base Access) e escopo fragmentado (Docker/K8s).
- Cloud: Usar Drivers Postgres invés de SQLite, implementando interface compatível ao Firebase Store.
- Multi-canal: Criar interfaces que consumam via discord/slack os drivers modulares base.
- Plugins: Criação de hooks na engine para ferramentas personalizadas sem alterar Source-code.
