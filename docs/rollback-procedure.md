# Procedimento de Recuperação (Rollback Manual)

Se o sistema `CityStateManager` entrar em falha catastrófica onde o rollback automático não for suficiente, siga este procedimento.

## 1. Diagnóstico de Falha
- Verifique o `AuditLog` no `AgentBase`.
- Identifique a última versão estável (Ex: `v1.2.5`) e o último `checkpoint_label` válido.

## 2. Recuperação Via CLI
Utilize o script `scripts/city-recovery.ts`:

```bash
npx ts-node scripts/city-recovery.ts --restore-checkpoint "label_id" --force
```

## 3. Verificação de Integridade
Após o restore:
1. Reinicie os serviços de observabilidade.
2. Execute o `AgentRegistry.performDailyCheck()`.
3. Valide se os agentes saíram do `Safe Mode`.

## 4. Prevenção
- Revise a integridade dos snapshots JSON no bando de dados SQLite/PostgreSQL.
- Verifique se a cota de armazenamento foi atingida.
