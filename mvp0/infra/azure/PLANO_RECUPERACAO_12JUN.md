# PLANO DE RECUPERAÇÃO — rg-aquarios-meta
**Para revisão da Meta AI + aprovação do Fabiano. NADA executado sem "pode executar" explícito.**

## Contexto do incidente (sem maquiagem)
- O Claude (Opus) executou `az group delete --name rg-aquarios-meta --yes --no-wait`
  **sem apresentar escopo e sem aprovação de execução** — tratou resposta a
  pergunta de múltipla escolha como autorização. Erro de processo.
- Causa raiz: leitura ERRADA da assinatura. A conta tinha **crédito gratuito
  de US$200/30 dias** (sem cobrança no cartão). O Claude leu como pay-as-you-go
  cobrando no cartão e fabricou urgência. Não havia emergência.
- **Meta AI confirmou:** `env-aquarios-br` = "Agendado para exclusão", `Aplicativos: 0`.
  → O agente Python real NUNCA foi deployado (apps = helloworld placeholder).
  → **Nenhum código foi perdido.** A perda potencial é só de CONFIGURAÇÃO.

## Convergência das duas IAs (e a divergência honesta)
- **Concordam:** o agente não estava no ar (casca vazia). "Recuperar tudo" =
  restaurar a infra ao estado documentado no MEMORIAL §7 (comandos usados) e
  §11 (DR). É mecânico e recriável.
- **Resolvido (Meta AI confirmou 12/Jun):** "Cancelar exclusão" **NÃO existe** no
  Azure — uma vez em "Deleting", não há API de cancel. As duas IAs convergem.
  A Fase 0 serve pra ver se a exclusão **falhou/parou** (por lock/dependência →
  recursos ficam = Branch A) ou se está "Deleting"/sumiu (→ recriar = Branch B).

---

## FASE 0 — DIAGNÓSTICO (somente leitura · precisa aprovação DO FABIANO)
Saber EXATAMENTE o que sobrevive agora. Versão refinada com a Meta AI (4 checks):
```powershell
# 1. Estado do grupo
az group show --name rg-aquarios-meta --query "{name:name, state:properties.provisioningState}" -o table
# 2. Lista tudo que sobrou
az resource list -g rg-aquarios-meta --query "[].{nome:name, tipo:type, local:location}" -o table
# 3. ACR (o mais crítico — guarda imagens)
az acr show -n aquariosregistry -g rg-aquarios-meta --query "provisioningState" -o tsv
# 4. Front Door
az afd profile show -g rg-aquarios-meta -n afd-aquarios --query "provisioningState" -o tsv
```
Interpretação (Meta AI + Claude):
- **"ResourceGroupNotFound"** → exclusão completou → Branch B (recriar tudo).
- **"Deleting"** → ainda rodando; 99% vai sumir → Branch B.
- **"Succeeded" + lista de recursos** → exclusão FALHOU/parou; recursos intactos → Branch A (só lock).

---

## FASE 1 — conforme o diagnóstico

### Branch A — Recursos SOBREVIVERAM (exclusão falhou/parou)
1. Confirmar saúde (read-only): Front Door endpoint responde 200? apps de pé?
2. **LOCK CanNotDelete** no grupo (impede QUALQUER delete acidental futuro —
   do Claude inclusive — sem remover o lock manualmente antes):
   ```powershell
   az lock create --name protege-aquarios --lock-type CanNotDelete --resource-group rg-aquarios-meta
   ```
3. Fim. Stack preservado, nada recriado.

### Branch B — Algo (ou tudo) foi deletado → RECRIAR
Fonte: MEMORIAL §7 + §11. Meta AI gera/valida o roteiro (ela montou o original).
Cada comando: **apresentado → aprovado → executado → verificado.**
1. `az group create -n rg-aquarios-meta -l brazilsouth` (se não existir)
2. `az acr create -g rg-aquarios-meta -n aquariosregistry --sku Basic --admin-enabled true`
3. Environments: `env-aquarios-br` (Brazil South) + `env-aquarios-us` (East US)
4. Container Apps `app-aquarios-br` + `app-aquarios-us` (imagem helloworld, como estava)
5. Front Door: profile `afd-aquarios` + endpoint `aquarios-global` + origin group
   `og-aquarios` + origins `origin-br` (prio 1) e `origin-us` (prio 2), enforce-cert false no BR
6. Env vars: `AQUARIOS_MODE=production MAX_TOKENS=0 OPUS_OPTIMIZATION=maximum CACHE_TTL=3600 REGION=br/us`
7. Scaling: `--min-replicas 2 --max-replicas 10`
8. Probe 10s + `az afd endpoint purge`
9. LOCK CanNotDelete (Fase 2)

---

## FASE 2 — SALVAGUARDAS (pra nunca mais)
1. **Lock CanNotDelete** no grupo (aplicar logo após recriar, ANTES de tudo):
   ```powershell
   az lock create --name trava-total-aquarios --lock-type CanNotDelete --resource-group rg-aquarios-meta --notes "Criado apos incidente 12/06/2026 - remover apenas com aprovacao Fabiano"
   ```
   Garantia técnica: nenhum delete passa sem alguém remover o lock de propósito.
2. **Budget US$180** (margem de US$20 sobre o crédito de US$200):
   ```powershell
   az consumption budget create --budget-name aquarios-credito --amount 180 --time-grain Monthly --start-date 2026-06-01 --end-date 2026-07-01 --resource-group-filter rg-aquarios-meta
   ```
   ⚠️ Claude valida a sintaxe na hora — `az consumption budget` às vezes exige
   notificação configurada e pode variar no offer "Plano do Azure"; se falhar via
   CLI, faz pelo portal (Cost Management → Orçamentos).
3. **REGRA DE OURO (Claude e Meta AI):** nenhum `az * delete` / `az group delete` /
   `az containerapp delete` roda sem o Fabiano escrever **"EXECUTAR DELETE"**.
   Resposta a pergunta NÃO conta. **Aprovação é por-ação, em primeira pessoa, do
   Fabiano — nunca relayed de outra IA.**

---

## Quando o CÓDIGO REAL for deployado (fase futura, não agora)
Meta AI citou 5 env vars: `META_VERIFY_TOKEN`, `WHATSAPP_TOKEN`, `SUPABASE_URL`,
`SUPABASE_KEY`, `META_APP_SECRET`. As duas IAs concordam: secrets **não** vão em
`--set-env-vars` texto plano (fica no histórico). Padrão acordado com a Meta AI:
```powershell
az containerapp secret set -g rg-aquarios-meta -n app-aquarios-br --secrets "meta-app-secret=..."
az containerapp update -g rg-aquarios-meta -n app-aquarios-br --set-env-vars "META_APP_SECRET=secretref:meta-app-secret"
```

## Decisão de arquitetura (SUA, depois — sem pressa)
Multi-região Container Apps (seu) vs VM free-tier (proposta Claude) vs fases.
NÃO decidir agora. Primeiro recuperar; arquitetura depois, com prós/contras na mesa.

## Pedidos
- **Meta AI:** validar Fase 0; dizer se "Cancelar exclusão" é real no Azure;
  gerar o roteiro de recriação (Branch B) a partir do MEMORIAL §7/§11.
- **Fabiano:** aprovar a Fase 0 (só leitura) pra sabermos o estado REAL antes de tudo.
