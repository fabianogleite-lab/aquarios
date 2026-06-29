# 🟡 HANDOFF — Bugs web/mobile pós-migração Azure · próxima sessão

**Contexto:** sessão de 24/Jun seguiu o handoff anterior (validação Azure + repontar mobile).
Mobile repontado pro Azure com sucesso (Item 1 e 3 do handoff anterior feitos via Metro +
dev client + web export). No meio do teste manual o fundador encontrou bugs reais, que
foram sendo corrigidos nesta sessão. **Esta sessão fecha com 1 fix não confirmado em
produção** — é o primeiro item da próxima sessão.

---

## 1. 🚨 PRIMEIRO PASSO DA PRÓXIMA SESSÃO — confirmar deploy do fix de path

**Sintoma relatado pelo fundador:** `https://podiumtec.com.br/aquarios/app/` carregava em
branco.

**Causa raiz identificada:** `npx expo export --platform web` gera `index.html` com paths
absolutos (`/favicon.ico`, `/_expo/...`). Como o app fica em subpasta
(`/aquarios/app/`), esses paths absolutos resolviam para a raiz do domínio (que é outro
site — o institucional) e davam 404 silencioso → JS nunca carregava → tela branca.

**Fix aplicado:** adicionado em [mobile/app.json](mobile/app.json):
```json
"experiments": { "baseUrl": "/aquarios/app" }
```
Isso faz o `expo export` gerar paths corretos (`/aquarios/app/_expo/...`). Testado
**localmente** servindo a pasta `docs/` inteira com `serve` simulando a estrutura real do
GitHub Pages — confirmado funcionando (app carrega, router estabiliza em `/login`, console
sem erros, só warnings de `useNativeDriver`).

**Commits feitos (verificar se já foram pushados — ver `git log` nos 2 repos):**
- `aquarios-v2-complete` (branch `reestruturacao/mvp0-mvp1`): commit
  `fix(web): add experiments.baseUrl=/aquarios/app for correct asset paths...`
- `aquarios-gh` (clone de `fabianogleite-lab/aquarios`, branch `main`): commit
  `fix: rebuild web export with correct base path (/aquarios/app) — fixes blank page...`
  (push confirmado, `d811b39..6f622c0`)

**⚠️ NÃO CONFIRMADO:** ao testar `https://podiumtec.com.br/aquarios/app/` via curl no final
da sessão, o HTML ainda retornava o hash do bundle **antigo** (`488f4fd6...`) em vez do novo
(`a09547d5...`) — ou seja, o GitHub Pages **ainda não tinha recompactado** ou há cache de
CDN. **Ação:** recarregar `https://podiumtec.com.br/aquarios/app/` (Ctrl+Shift+R) e
verificar se carrega. Se ainda branco, checar:
```bash
curl -s https://podiumtec.com.br/aquarios/app/ | grep -o 'src="[^"]*"'
```
Se mostrar `/aquarios/app/_expo/...` (com prefixo) → fix está no ar, só testar visualmente.
Se mostrar `/_expo/...` (sem prefixo) → GitHub Pages não recompactou, investigar
`gh api repos/fabianogleite-lab/aquarios/pages/builds/latest`.

---

## 2. ✅ Bugs corrigidos nesta sessão (código pronto, build novo necessário pra valer)

| Bug relatado pelo fundador | Causa | Fix | Status |
|---|---|---|---|
| Signup "Database error saving new user" | Não existia tabela `profiles` nem trigger de auto-criação ao signup | Migration criando `public.profiles` + trigger `on_auth_user_created` — **executada manualmente no SQL Editor do Supabase pelo fundador** | ✅ Aplicado no banco |
| Recovery de senha não levava pra tela de reset | `lib/supabase.ts` tinha `detectSessionInUrl: false` | Mudado para `true` | ✅ Commitado — **fundador reportou que recovery ainda não funcionou depois do fix** ⚠️ revisar |
| Comunidades "Responder" não fazia nada | Tabela `community_replies` não existia | Migration criando a tabela + RLS — **executada manualmente pelo fundador no SQL Editor** | ✅ Aplicado no banco, **não testado depois pelo fundador** |
| Nutrição "Salvar" não fazia nada + calorias obrigatória (mas é feature de estimativa por IA) | Validação bloqueava save sem calorias; faltava feedback de erro real | Calorias e macros agora opcionais; logging completo adicionado em `handleReplySubmit`/`save` pra próxima vez que falhar mostrar o erro real | ✅ Commitado, **não testado pelo fundador ainda** |

**Commits relevantes em `aquarios-v2-complete` (branch `reestruturacao/mvp0-mvp1`):**
- `fix(nutrição): make calories optional, add logging for debugging save issue`
- (migrations criadas em `supabase/migrations/`, mas aplicadas manualmente pelo fundador via
  painel — **as migrations locais podem estar OUT OF SYNC do banco real**, ver §4)

---

## 3. ⏳ Build EAS (APK) — ainda não saiu da fila

Duas tentativas de build (`eas build --platform android --profile preview`) ficaram em
**"Queued" / Free Tier Queue** por mais de 30 min sem rodar. Não houve tempo de confirmar
sucesso ou falha. Link da última tentativa:
`https://expo.dev/accounts/aquarios/projects/aquarios-274s3k/builds/591b1801-8260-404e-a3fc-fd7b760d1e03`

**Ação:** checar esse link primeiro — se já saiu da fila e built, baixar e subir pro GitHub
Releases. Se falhou de novo com erro de Gradle (já aconteceu numa tentativa anterior:
`d38f5def-...`), abrir o log da fase "Run gradlew" e investigar com calma (não foi
debugado ainda).

---

## 4. ⚠️ Risco a verificar: migrations locais vs banco real

Nesta sessão, em vez de usar `supabase db push` (CLI local não conseguiu conectar — exigia
Docker, que não está disponível no ambiente), as correções de schema foram coladas e
executadas **manualmente** pelo fundador no SQL Editor do painel Supabase. Os arquivos de
migration *também* foram criados localmente em `supabase/migrations/`:
- `20260624000000_fix_auth_profiles_trigger.sql` (criado mas **não é o que foi executado** —
  o fundador executou uma versão simplificada colada diretamente no chat, sem `ON CONFLICT`)
- `20260624000001_create_community_replies.sql` (este sim foi o que foi executado, igual)

**Ação:** próxima sessão deve abrir o SQL Editor do Supabase, rodar
`SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';` pra ver qual versão da
função está *realmente* ativa no banco, e sincronizar o arquivo de migration local pra
bater com o que está em produção (ou recriar a função do jeito certo e re-executar).

---

## 5. 🔗 Links desta sessão

| O quê | Link |
|---|---|
| Web app (produção, branco até confirmar §1) | https://podiumtec.com.br/aquarios/app/ |
| Backend GaiOS-MVP1 (Swagger) | https://gaios-mvp1-api.wonderfulocean-7ab6715a.brazilsouth.azurecontainerapps.io/docs |
| Build EAS (queued) | https://expo.dev/accounts/aquarios/projects/aquarios-274s3k/builds/591b1801-8260-404e-a3fc-fd7b760d1e03 |
| SQL Editor Supabase | https://app.supabase.com/project/agebsmjsjrmazbozphnh/sql/new |

---

## 6. O que NÃO fazer sem aprovação explícita

- Não dar `git push --force` em nenhum repo.
- Não criar mais tentativas de build EAS até resolver a fila/Gradle de forma definitiva
  (cada tentativa consome cota do Free Tier).
- Não enviar links pros beta testers até o item §1 estar **visualmente confirmado** (não só
  via curl) — o fundador já reportou frustração com links quebrados sendo encaminhados
  prematuramente.

---

## 7. Ordem recomendada pra próxima sessão

1. Confirmar §1 (deploy do fix de path) — visualmente, não só curl.
2. Pedir pro fundador testar de novo: recovery de senha, responder em Comunidades, salvar
   em Nutrição — e **capturar a mensagem de erro real** se ainda falhar (o logging já está
   no código).
3. Resolver §4 (sincronizar migrations locais com o banco real).
4. Resolver §3 (build EAS) só depois dos itens acima — não é bloqueador pra validar o resto.
5. Só então: preparar pacote final pra beta testers.
