# 📝 Guia de Prompts — OpenGravity

Estes são os padrões estruturados projetados especificamente para guiar o agente LLM com consistência dentro de seu Workflow. Ao formatar suas intenções rigidamente, o uso de Contexto das ferramentas é intensificado e o modelo de negócio respeitado.

## Formato Padrão de Prompts

Recomenda-se fortemente utilizar o seguinte bloco base ao emitir uma task no Telegram:

```
PROJETO: [nomedoprojeto]
AÇÃO: [gerar | modificar | eliminar | investigar | revisar]
ARQUIVOS: [caminhos das modificações]
CONTEXTO: [texto narrativo explicando o por quê e o escopo da tarefa]
RESTRIÇÕES: [Regras de tecnologias cruas (Padrão, i18n, lint)]
```

---

## Exemplos Práticos Oficiais

### 1. Criar Nova Página no Site
```text
PROJETO: site
AÇÃO: gerar
ARQUIVOS: src/pages/admin/HashRegistryAdmin.tsx
CONTEXTO: Criar página admin para gerenciar documentos com hash SHA-256
RESTRIÇÕES: TypeScript, React, usar t() para i18n, seguir padrão existente
```

### 2. Adicionar Traduções
```text
PROJETO: zk-id
AÇÃO: modificar
ARQUIVOS: src/locales/pt-BR/common.json, src/locales/en/common.json, src/locales/es/common.json
CONTEXTO: Adicionar 10 novas chaves de tradução relacionadas ao modulo ZK para common.*
RESTRIÇÕES: Manter formato JSON, alinhar chaves hierarquicamente entre os 3 idiomas
```

### 3. Executar Testes Rápidos
```text
PROJETO: civitas-institucional
AÇÃO: executar
COMANDO: npm run test
CONTEXTO: Rodar a suite nativa de tests na CLI para reportar se i18n builda.
RESTRIÇÕES: Timeout 5 minutos, repassar relatório.
```

### 4. Inspeção Segura (Audit)
```text
PROJETO: zk-id
AÇÃO: revisar
ARQUIVOS: src/**/*.{ts,tsx}
CONTEXTO: Apenas investigue e liste caso hajam hardcoded strings que não usam as ferramentas do translate (t).
RESTRIÇÕES: Reportar pelo chat de forma direta; NÃO ative a `write_file_tool`.
```

---

## 🔥 Melhores Práticas

### ✅ O que Fazer:
- Refine o campo "ARQUIVOS" ao máximo. Quanto mais estático o range para ele ler com a tool `read_file`, mais rápidos serão os reports e LLM Costs.
- Revise cada `+` e `-` vindo da check_diff, é o seu escudo-protetor final contra códigos inúteis.
- Envie um comando `/clear` na máquina de estados a cada vez que o contexto da TaskA for incompatível com uma subsequente TaskB para limpar a memória do SQLite da sessão e começar veloz e indutivo.

### ❌ O que NÃO Fazer:
- Não confie que o agente rodará `npx` solto ou pacotes avulsos se a restrição de Firewall / NPM CLI não estiver configurada no seu host; ele tentará rodar como `run_command` padrão via Node Child Process e vai falhar com Timeout se barrado. Dê hints pelo prompt. 
- Evite "/apply" no celular correndo se o PR for monstruosamente gigante, por conta do tamanho limite da box pre-merge do telegram. Revise com calma num desktop.

## Fluxo de Trabalho (Standard)

1. Envie a task (Ex: `/implement ...`) ou digite direto `/start` + formato bloco.
2. Agente lerá, executará sua `write_file` memory tool, e lançará o DIFF renderizado p você.
3. Cheque os Logs, responda com aprovação `/apply`.
4. Processo completo. Host recebe Git Local Push silencioso e reflete na pasta do Windows/Linux.
