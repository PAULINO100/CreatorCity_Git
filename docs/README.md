# 🤖 OpenGravity

![Status](https://img.shields.io/badge/Status-Beta-yellow) ![License](https://img.shields.io/badge/License-MIT-blue) ![i18n](https://img.shields.io/badge/i18n-Supported-green)

## 🎯 O Que É

OpenGravity é um agente de IA de desenvolvimento local controlado via Telegram. Ele foi projetado para ler contextos rigorosos, compor códigos, e submeter modificações com integrações diretas pro ecossistema do seu projeto, contanto que autorizadas previamente. É operado sob uma arquitetura de alta segurança desenhada preventivamente contra vulnerabilidades inerentes de geração LLM.

## 🚀 Instalação Rápida

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o `.env` (Você pode basear-se no arquivo `.env.example` copiado na pasta raiz):
   ```bash
   cp .env.example .env
   ```
3. Inicie o sistema em modo de desenvolvimento observador:
   ```bash
   npm run dev
   ```
4. Converse com o bot no Telegram digitando `/start`.

## ⚙️ Configuração

### Variáveis Obrigatórias
- `TELEGRAM_BOT_TOKEN`: Token gerado pelo @BotFather no Telegram.
- `TELEGRAM_ALLOWED_USER_IDS`: Uma vírgula contendo IDs (números) explícitos para whitelist.
- `GROQ_API_KEY` ou `OPENROUTER_API_KEY`: Você precisa configurar **pelo menos um** LLM.

### Variáveis Opcionais
- `DB_PATH`: Customizar destino do cache sqlite. (Padrão: `./memory.db`).
- `LOG_LEVEL`: Configuração de auditoria (info, debug, warn, error).
- `ALLOWED_PROJECTS`: Define a Sandbox permitida (Ex: `./projects/site`).

## 🛠️ Comandos Disponíveis

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/start` | Iniciar bot e ver status inicial | `/start` |
| `/help` | Listar comandos e ver formatos do prompt | `/help` |
| `/projects` | Mostrar os projetos mapeados na root | `/projects` |
| `/implement` | Inicializa o ciclo core de LLM | `/implement site gerar página de login` |
| `/apply` | Confirmar mudança do disco (Gera Backup)| `/apply` |
| `/cancel` | Descartar simulação na memória pendente| `/cancel` |

## 🔒 Segurança

O OpenGravity foi construído com modelo "Defense-in-depth":
- **Sandbox de arquivos:** Só manipula o que é explicitamente apontado via config. Pastas do Sistema jamais são tocadas.
- **Whitelist de usuários:** Bot barra chamadas que não constam nos `ALLOWED_USER_IDS`.
- **Rate limiting:** Limita spams do Telegram usando cota horária ajustável.
- **Confirmação antes de escrever:** Motor de Diff obriga um /apply humano.
- **Git backup automático:** A tool `/apply` roda um command silent pré commit para estabilidade se estiver em um Working Tree.

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Bot não responde | Verifique o `TELEGRAM_BOT_TOKEN` e conexão Node. |
| "Acesso negado" | Garanta seu Numeral ID no field `TELEGRAM_ALLOWED_USER_IDS` |
| LLM não avança | Cheque se validou `GROQ_API_KEY` ou `OPENROUTER_API_KEY` |
| NPM Script Erro | `npm.ps1` bloqueado no Windows. Use modo bypass do PS. |

## 📄 Licença
Distribuído livremente. Aberto à comunidade. OpenGravity Core System.
