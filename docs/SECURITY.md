# 🔐 Política de Segurança — OpenGravity

O OpenGravity foi modelado não apenas para fornecer inteligência artificial ao seu host local, mas o foi com os padrões primários do DevSecOps em mente para mitigação de vetores comuns contra Agentes Autônomos LLM.

## Reportar Vulnerabilidades

Se for detectado uma vulnerabilidade bypassavel no nosso Sandbox Code, envie os dados abertamente para: [security@educatech.ai](mailto:security@educatech.ai).

Não realize exploits publicamente ou crie bugs intencionais em repositórios alheios.

## Modelo de Ameaças

### O Que Protegemos (In-scope)
- Impedimos a escrita inadvertida ou intencional (Hallucination LLM) em Pastas vitais de File System OS Root e Global User scope (`C:/`, `/root`, `/etc/`).
- Bloqueamos acessos irrestritos e invasões sobre via API Telegram Externa, protegendo a sua Instância local.
- Fornecemos garantia de mitigação contra loops infinitos de IA.

### O Que Não Protegemos (Responsabilidade do Usuário)
- Não somos responsáveis por roubo das chaves `GROQ` na sua máquina se seu sistema local já foi comprometido. 
- Backups definitivos em Clouds secundárias. A tool /apply apenas cria um commit GIT local.

## Controles de Segurança Implementados

### 1. Sandbox de Arquivos 🛡️
- Empregada via arquivo `sandbox.ts`.
- Opera antes que `fs.writeFileSync` ou `fs.readFileSync` seja chamado.
- Lança exceções baseadas não apenas em startsWith mas subverificações e exatas contra o Set Default de Proibições: `*.env`, `/etc/**`, `/root/**`.

### 2. Whitelist de Usuários 🎫
- O Grammy.js injeta como _chain-middleware_ frontal o ID interceptado do Remetente. Ele deve obrigatóriamente dar match com as tipagens da env `TELEGRAM_ALLOWED_USER_IDS`. 

### 3. Rate Limiting 🔌
- Mantém integridade temporal do Bot processando spam de bots concorrentes / scripts, protegendo rate limts da API nativa da Groq & Open Router por Proxy lógico. Padrão: 20/hora.

### 4. Confirmação Obrigatória para Escrita (Pending Pattern) 📌
- Nenhum LLM por mais inteligente que for tem poder primário de alteração de file system nesse software. TUDO passa pelo operador no comando final explícito `/apply`.

### 5. Git Backup Automático 🔙
- Ferramenta nativa que roda implicitamente dentro da `Agent.confirmApply`. Realiza snapshoting antes do diff override ser forçado sob os dados vitais. 

### 6. Sanitização de Input 🧹
- Todo comando tem lixo hexadecimal, bytes nulos (null-byte poisoning) extraídos.

### 7. Logging de Auditoria 📜
- Informações Críticas (Auth error, Rate limit reach, Shell Error, File Write) são escritas em `logs/opengravity.log` e printadas no console do NodeJS host.

### 8. Error Handling Seguro ⚙️
- `errorHandler.ts` garante que Exceptions geradas por FileSystems, Shells (exec), etc não joguem stack-traces com IPs e detalhes crus dentro de logs vazados pro usuário do Telegram, retornando falhas abstratas porém precisas.

## Boas Práticas para Operadores

1. Sempre mantenha permissão restrita de Linux/Windows sobre seu `.env` contendo DB e chaves.
2. É sugerido que adicione exclusões do Windows Defender / AV para `NODE.JS` e da workspace `opengravity` caso o Agente acuse falsos alarmes ao gerar arquivos longos.
3. Não use senhas puras em `ToolRegistry` personalizadas no escopo futuro do aplicativo.

## Atualizações de Segurança

Assegure varreduras via pacote npm:
```bash
npm run security-check 
```
Para forçar varredura por `npm audit`.

## Histórico de Vulnerabilidades

| Data | Descrição | Severidade | Status |
|------|-----------|------------|--------|
| _Build Atual_ | Sistema Operacional Base 1.0 Seguro | - | Sem pendências críticas |
