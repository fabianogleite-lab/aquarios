# Sessao 6 — Build, Limpeza e Distribuicao

## Modelo: Opus | Estimativa: 1 sessao

---

## Contexto

Phase 4 teve 5 sessoes (S1-S5) que construiram o app completo:
- S1: Backend Supabase + Auth
- S2: ProteOS Chat + Diario CRUD
- S3: Nutricao + Comunidades + Wonder Night
- S4: Polish visual, tema, animacoes, build config
- S5: Debug, documentacao (White Paper, Blueprint, README, Help), GitHub push + tag v4.2.0

O app esta funcional, tipado (0 erros TS), bundle compila (3.16 MB), codigo no GitHub.
O que falta: build real (APK/AAB), limpeza do repo, e distribuicao.

---

## Prompt para iniciar

```
Sessao 6 — AquariOS: Build + Limpeza + Distribuicao.

ANTES DE TUDO: Leia estes arquivos na ordem:
1. mobile/docs/sessions/MASTER_PLAN.md
2. mobile/docs/sessions/SESSION_5_COMPLETE.md
3. mobile/docs/sessions/SESSION_6_BRIEFING.md

REPO: https://github.com/fabianogleite-lab/aquarios
TAG ATUAL: v4.2.0 | COMMIT: cecba0c

TAREFA DESTA SESSAO (nesta ordem):

1. LIMPEZA DO REPO
   - Raiz tem ~30 arquivos legados da Phase 1-2 (.md, .txt, .html)
   - Pastas legadas: backend/, src/, web/, supabase/, assets/, .github/
   - Avaliar o que manter vs remover
   - O app real esta todo em mobile/
   - Manter: README.md, .gitignore, mobile/

2. BUILD
   - Disparar `eas build --platform android --profile preview` (APK)
   - Se APK OK: `eas build --platform android --profile production` (AAB)
   - Acompanhar build, resolver erros se houver

3. GITHUB RELEASE
   - Criar release page a partir da tag v4.2.0
   - Incluir notas de release
   - Anexar APK se possivel

4. PREPARACAO PLAY STORE (opcional, se der tempo)
   - Verificar app.json (nome, versao, icones)
   - Listar o que falta para submission
   - Privacy policy (LGPD)

ENTREGA: APK funcional + repo limpo + release no GitHub.
```

---

## Detalhamento Tecnico

### 1. Limpeza do Repo

Arquivos na raiz que sao legados da Phase 1-2 e podem ser removidos:

```
ACESSO_RAPIDO_ARQUIVOS.md
AUDITORIA_CONSOLIDADA_v2_0000.md
BLUEPRINT_MVP_PLAYSTORE.md
CAMINHOS_DIRETOS_WINDOWS.txt
CHECKLIST_APK_INTERATIVO.md
CONSOLIDACAO_FINAL_v2_0000.md
DELIVERABLES_v2_0000.txt
DELIVERY_SUMMARY.txt
DEPLOY_GUIDE.md
DOCUMENTACAO_VALIDACAO_APK.md
ESCOPO_DETALHADO_PRE_APROVACAO.md
ESTRUTURA_PROJETO_MAPA.md
FILE_TREE_FINAL.txt
FINAL_DELIVERY_STATUS.md
FINAL_SUMMARY.txt
GUIA_CRIAR_ASSETS.md
HANDOFF_NEXT_SESSION.md
INDICE_ARQUIVOS_GERADOS_CHAT.md
INDICE_DOCUMENTACAO_COMPLETO.md
LISTA_COMPLETA_ARQUIVOS.md
MANUAL_SECOES_FALTANTES_06-20.md
NEXT_STEPS.md
PHASE_1_EXCELENTE.md
PROJECT_INDEX.md
PROJECT_MANIFEST.md
QUICK_REFERENCE.txt
RELEASE_NOTES_v2_0000.md
SETUP_README.md
START_HERE.md
SUMARIO_EXECUTIVO_FINAL.txt
VALIDACAO_APK_COMPLETA.md
VALIDACAO_APK_RESUMO.txt
VALIDACAO_APK_RESUMO_VISUAL.txt
V1-vs-V2-COMPARATIVO-COMPLETO.html
V2-NOVAS-FUNCIONALIDADES-TECNOLOGIA.html
MANUAL_v2_0000.html
```

Pastas legadas:
```
backend/          # Node.js backend v2 (substituido por Supabase)
src/              # Python/JSX v1-v2 (nao usado)
web/              # HTML simples (nao usado)
supabase/         # Edge functions antigas
assets/           # Placeholder
.github/workflows/ # CI/CD v2 (nao configurado para Phase 4)
docs/             # Docs v2 (substituidos por mobile/docs/)
.env.example      # V2 (desatualizado)
Dockerfile        # V2 (nao usado)
Makefile           # V2 (nao usado)
requirements.txt  # Python (nao usado)
vercel.json       # Config Vercel (avaliar se manter)
```

**Regra:** mover tudo legado para uma pasta `_legacy/` ou deletar. Manter apenas:
- `README.md` (novo, Phase 4)
- `.gitignore` (atualizado)
- `mobile/` (o app real)

### 2. Build

```bash
cd mobile

# Login EAS (se necessario)
eas login

# APK para teste interno
eas build --platform android --profile preview

# AAB para Play Store
eas build --platform android --profile production
```

### 3. GitHub Release

Apos build:
```bash
# Se gh CLI disponivel:
gh release create v4.2.0 \
  --title "AquariOS v4.2.0" \
  --notes "..."

# Se nao: criar via Chrome MCP no GitHub
```

### 4. Checklist Pre-Play Store

- [ ] app.json: nome, versao, icone, splash
- [ ] eas.json: production profile correto
- [ ] Privacy policy URL
- [ ] Screenshots do app (5-8)
- [ ] Descricao curta e longa em PT-BR
- [ ] Content rating questionnaire
- [ ] Support email configurado
