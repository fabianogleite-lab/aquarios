# 🟢 HANDOFF — Validar links da migração Azure + repontar mobile · próxima sessão

**Foco:** validar os 3 links públicos da migração GaiOS-MVP1→Azure e executar os **3 itens
importantes** que ficaram pendentes: (1) repontar o mobile para o Azure, (2) gerar novo
build/APK, (3) testar o app de ponta a ponta contra o backend novo.

> Sessão anterior (23-24/Jun) fez o deploy completo do GaiOS-MVP1 no Azure Container Apps
> e corrigiu 3 bugs reais (ACR auth no Terraform, `python-multipart` faltando, rota de
> compat `/api/v2/ivi/{user_id}`). Backend 100% verificado e funcionando. Mobile **ainda não
> foi tocado** — é o próximo passo. Este handoff é o ponto de partida.

---

## 0. Contexto — por que isso importa

Decisão do fundador (24/Jun): **"tem que estar tudo no Azure para ter certeza que a
migração foi um sucesso e GaiOS ficou robusta"**. Oracle VM (`api.podiumtec.com.br`) fica
só como **histórico MVP0** — não deve mais servir produção depois que o mobile for repontado.

---

## 1. ✅ Os 3 links — validar primeiro (devem responder 200 / carregar)

| O quê | Link | Esperado |
|---|---|---|
| **Backend GaiOS-MVP1 (Swagger)** | https://gaios-mvp1-api.wonderfulocean-7ab6715a.brazilsouth.azurecontainerapps.io/docs | Página Swagger, 25 rotas |
| **Health check** | https://gaios-mvp1-api.wonderfulocean-7ab6715a.brazilsouth.azurecontainerapps.io/cerber/status | `200 OK` |
| **Console Azure (infra)** | https://portal.azure.com/#@9a480d29-2baf-49f5-be0a-522613a4c4e1/resource/subscriptions/d0c1b514-9205-46fa-b327-b8033528863d/resourceGroups/rg-aquarios-meta/overview | Login `celgestoradeservicos@hotmail.com` — mostra Container App `gaios-mvp1-api` Running |
| Site institucional (já vivo antes desta sessão) | https://podiumtec.com.br | Landing AquariOS |

Smoke test rápido (rodar no terminal, confirma dados reais do Supabase, não placeholder):
```bash
curl -s https://gaios-mvp1-api.wonderfulocean-7ab6715a.brazilsouth.azurecontainerapps.io/alexandrios/search?q=ansiedade
curl -s -X POST https://gaios-mvp1-api.wonderfulocean-7ab6715a.brazilsouth.azurecontainerapps.io/sandeiros/responder -H "Content-Type: application/json" -d '{"prompt":"teste"}'
curl -s https://gaios-mvp1-api.wonderfulocean-7ab6715a.brazilsouth.azurecontainerapps.io/api/v2/ivi/00000000-0000-0000-0000-000000000000
```
Se algum desses voltar **500** (não 200/503), o Container App caiu de revisão — ver §5 troubleshooting.

---

## 2. 🚦 Os 3 itens importantes — em ordem

### ▶ Item 1 — Repontar `mobile/.env` para o Azure *(começa aqui)*

Arquivo: `mobile/.env`. Trocar:
```diff
- EXPO_PUBLIC_HYGEIOS_V2_URL=https://api.podiumtec.com.br
+ EXPO_PUBLIC_HYGEIOS_V2_URL=https://gaios-mvp1-api.wonderfulocean-7ab6715a.brazilsouth.azurecontainerapps.io
```
Contratos já confirmados compatíveis (não precisa mexer no código do mobile):
- `GET /api/v2/ivi/{user_id}` → `{"scores": {fisico,mental,espiritual,social,overall}}` (rota de
  compat criada nesta sessão em `GaiOS-MVP1/src/kernel/hygeios/api.py`)
- `POST /v1/stt` (FormData) e `POST /v1/tts` (JSON) — usados em `mobile/lib/elevenlabs.ts`

⚠️ **Voz vai continuar inerte** mesmo após repontar — a chave ElevenLabs ainda não foi
configurada como secret no Container App (não é regressão, já estava assim no Oracle
também sem a chave). Se quiser ativar voz, é item separado: pegar a chave ElevenLabs e
`az containerapp secret set` + env var `ELEVENLABS_API_KEY`.

⚠️ **iVi vai aparecer zerado / "calibrando"** para todo usuário — a tabela
`telemetry_vitality_logs` no Supabase está **vazia** (0 linhas). O motor de cálculo existe
e funciona (`src/kernel/hygeios/h2_tools.py` + RPC `calculate_ivi`), só falta o ETL que
povoa essa tabela rodar pelo menos uma vez. Não é bug do backend — é dado ausente.

### ▶ Item 2 — Gerar novo build/APK

O APK público atual (`v0.1.0-beta` no GitHub Releases) foi buildado **antes** desta
migração — ele tem o `.env` antigo embutido (Expo injeta `EXPO_PUBLIC_*` em build-time).
Depois do Item 1, rodar o build EAS de novo:
```bash
cd mobile
eas build --platform android --profile preview   # ou o profile que já era usado
```
Conferir no `eas.json` qual profile/canal está configurado antes de rodar.

### ▶ Item 3 — Testar mobile de ponta a ponta contra o Azure

Instalar o APK novo num device/emulador e validar manualmente:
- [ ] Login funciona (Supabase Auth — não muda, mesmo projeto)
- [ ] Tela HygeiOS (`app/(app)/hygeios.tsx`) carrega sem crash, mostra "calibrando" (esperado, ver Item 1)
- [ ] AlexandriOS / busca de ajuda retorna resultado real (não erro)
- [ ] ProteOS / chat responde (mesmo que `fonte:MISS` — cascata LLM é F3, ainda não ligada)
- [ ] Voz: se tentar usar, deve falhar com erro claro (chave ausente), não crash

---

## 3. O que JÁ está feito e funcionando (não retrabalhar)

- Backend GaiOS-MVP1 deployado em `rg-aquarios-meta` / Container App `gaios-mvp1-api`,
  **25 rotas** registradas e testadas uma a uma (CerberOS, HygeiOS, ProteOS, SandeirOS,
  PanaceIA, EteriOS, HermeOS, AlexandriOS, Agencia).
- `SUPABASE_SERVICE_ROLE_KEY` real injetada como **secret** do Container App (não placeholder,
  não em texto puro no Terraform — usa `secretref`).
- 3 bugs reais corrigidos nesta sessão: ACR auth ausente no `main.tf`, `python-multipart`
  faltando (derrubava EteriOS), rota `/api/v2/ivi/{user_id}` ausente (mobile chamava e dava 404).
- `GaiOS-MVP1` ganhou `.git` próprio (commit local `e0628a0`, branch `master`, **sem push**).
  `.gitignore` exclui `*.tfstate*`/`.terraform/` — o state guardava a senha do ACR em texto puro.
- `aquarios-v2-complete` tem commit local `98b9438` (fix segredo Meta hardcoded + docs MVP1
  pendentes de sessões anteriores), **sem push**.

## 4. O que NÃO fazer sem aprovação explícita

- Não dar `git push` em nenhum dos dois repos sem perguntar primeiro.
- Não rodar `terraform destroy` nem `az containerapp delete` — é o único ambiente vivo.
- Não desligar/pausar a Oracle VM ainda — ela continua sendo a fonte do MVP0 histórico até
  o mobile estar 100% validado no Azure (Item 3 deste handoff concluído).

## 5. Troubleshooting rápido

- **500 em rota que tocava Supabase:** checar se a revisão ativa do Container App é a mais
  recente (`az containerapp revision list -n gaios-mvp1-api -g rg-aquarios-meta`) — durante
  transição de revisão pode dar 500 passageiro, espera ~10s e retesta.
- **Terraform state lock:** se aparecer "Error acquiring the state lock", checar processo
  `terraform.exe` orfão (`Get-Process terraform` no PowerShell) antes de tentar
  `force-unlock` — foi a causa raiz da última vez, não o Terraform em si.
- **ACR build trava no log (`UnicodeEncodeError`/colorama):** é só a exibição do log no
  terminal Windows que crasha, o build roda normal no servidor. Confirmar com
  `az acr task list-runs -r aquariosregistry --top 1 -o table`.
