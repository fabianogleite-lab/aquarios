# Política de Exclusão de Dados — AquariOS

> **STATUS:** RASCUNHO v0.1 (Pacote D · D0 · item #3) — PT-BR canônico.
> **Fonte de verdade:** decisões do projeto (handoff/LIVRO) prevalecem sobre sugestões de terceiros. Submissão à Meta em lote, via extensão do Chrome.
> **Vigência:** [A DEFINIR] · **Última atualização:** 10/06/2026
> **Documentos irmãos:** [Política de Privacidade](POLITICA_DE_PRIVACIDADE.md) · [Termos de Uso](TERMOS_DE_USO.md).

---

## ⚠️ PLACEHOLDERS A PREENCHER (antes de publicar)

| Campo | Onde | Status |
|---|---|---|
| Prazos legais de retenção mínima | §5 | `[A CONFIRMAR juridicamente]` |
| `META_APP_SECRET` (verificação do callback) | Anexo A | variável de ambiente — **nunca no documento** |
| Encarregado/DPO | §10 | `[DPO: ________]` |

---

## 1. O que é esta Política

Esta Política descreve **como você solicita a exclusão dos seus dados pessoais** do AquariOS, **o que é excluído**, **o que pode ser retido por obrigação legal** e **em quanto tempo**. Ela cumpre o direito de eliminação previsto na LGPD (art. 18), no GDPR (art. 17 — direito ao apagamento) e em regimes equivalentes (Anexo da Política de Privacidade), além do requisito de **Data Deletion** das plataformas Meta.

## 2. Como solicitar a exclusão

Você pode pedir a exclusão por qualquer destes canais:

1. **No aplicativo:** Configurações → Conta → *Excluir meus dados*.
2. **Endpoint público:** **https://api.podiumtec.com.br/delete-data**.
3. **E-mail:** contato@podiumtec.com.br (assunto: "Exclusão de dados").
4. **Via Meta:** ao remover o app/integração nas configurações da Meta, a Meta aciona automaticamente nosso *callback* de exclusão (Anexo A).

## 3. Verificação de identidade

Para proteger sua conta, confirmamos sua identidade antes de excluir:

- pedidos **no app** usam sua sessão autenticada;
- pedidos por **e-mail** exigem confirmação a partir do e-mail cadastrado;
- pedidos da **Meta** são autenticados pela assinatura `signed_request` (HMAC-SHA256) — Anexo A.

Isso evita exclusões fraudulentas por terceiros.

## 4. O que excluímos

Mediante pedido válido, excluímos os dados pessoais vinculados à sua conta, incluindo:

- dados de cadastro e identificação;
- dados de bem-estar (humor, Diário do Ser, dimensões do iVi);
- histórico de conversas com os agentes de IA e canais Meta;
- registros de interação do widget que identifiquem você (IP, *user agent*).

## 5. O que pode ser retido (exceções legais)

A lei permite reter um **conjunto mínimo** de dados, de forma segregada e pelo tempo estritamente necessário, quando houver:

| Categoria retida | Por quê | Tratamento |
|---|---|---|
| Prova de consentimento (opt-in) | Defesa em fiscalização (LGPD/GDPR) | Mantida pelo prazo prescricional `[A CONFIRMAR]`, depois excluída |
| Registros financeiros/fiscais | Obrigação legal (não armazenamos cartão — §7 Privacidade) | Conforme prazo fiscal `[A CONFIRMAR]` |
| Logs de segurança/auditoria | Segurança e cumprimento legal | **Anonimizados**, sem vincular a você |

Fora dessas exceções, os dados são **eliminados** (não apenas inativados).

## 6. Prazos

- **Confirmação do recebimento:** imediata (canais 1, 2, 4) ou em até 48h (e-mail).
- **Conclusão da exclusão:** **em até 30 dias**, podendo ser estendido apenas quando a lei exigir, com aviso a você.

## 7. Confirmação

Ao concluir, registramos a operação e disponibilizamos um **código de confirmação** e, quando via Meta, uma **URL de acompanhamento** do status (Anexo A).

## 8. Canais Meta / WhatsApp

Quando você usa nossos canais Meta, a exclusão remove os identificadores e o histórico vinculados (ex.: `wa_id`). Reforçando a Política de Privacidade §6: dados de bem-estar **nunca** foram enviados a ferramentas de publicidade da Meta — portanto não há o que apagar lá.

## 9. Seus direitos por regime

- **Brasil (LGPD art. 18):** eliminação dos dados tratados com consentimento.
- **UE/EEA (GDPR art. 17):** direito ao apagamento ("direito a ser esquecido"), com as exceções do art. 17(3).
- **EUA (CCPA/CPRA):** direito de exclusão, com exceções legais.
- Demais países: ver Anexo da [Política de Privacidade](POLITICA_DE_PRIVACIDADE.md).

## 10. Contato

Exclusão e privacidade: **contato@podiumtec.com.br** · DPO `[________]`.

---

# Anexo A — Especificação técnica do callback `/delete-data` (amarra no D1)

> Implementação **FastAPI-nativa** na VM Oracle (`api.podiumtec.com.br`) — **sem n8n** (decisão do projeto). Esta spec orienta o D2 (orquestração) e o D1 (schema).

### A.1 Requisição da Meta

A Meta envia, ao remover o app/integração:

```
POST /delete-data
Content-Type: application/x-www-form-urlencoded

signed_request=<payload_base64url>.<assinatura_base64url>
```

### A.2 Verificação obrigatória (segurança)

1. Separar `signed_request` em **assinatura** e **payload** pelo `.`.
2. Recalcular `HMAC-SHA256(payload, META_APP_SECRET)` e comparar (base64url) com a assinatura recebida.
3. **Rejeitar (400)** se não conferir — impede pedidos de exclusão forjados.
4. Decodificar o `payload` (JSON base64url) e extrair o identificador do usuário Meta.

### A.3 Resposta exigida pela Meta

Responder **HTTP 200** com JSON:

```json
{
  "url": "https://podiumtec.com.br/delete-status?code=<confirmation_code>",
  "confirmation_code": "<confirmation_code>"
}
```

A Meta exibe ao usuário a URL e o código. A URL de status deve permitir consultar o andamento.

### A.4 Mapa de exclusão por tabela (referência para o D1)

| Tabela (D1) | Ação na exclusão |
|---|---|
| `optins` | reter prova mínima pelo prazo legal, depois excluir (§5) |
| `business_agent_logs` | anonimizar (remover vínculo `wa_id`) ou excluir |
| `widget_interactions` | excluir PII (`ip_address`, `user_agent`); manter agregado anônimo |
| `conversas` (CRM) | excluir |
| dados de bem-estar (iVi, diário — cifrados AES-256-GCM) | excluir |
| autenticação/conta (Supabase Auth) | excluir conta |
| `audit_logs` | reter **anonimizado** para segurança/legal |
| pagamentos (Stripe/Paystack) | não armazenamos cartão; reter registro fiscal mínimo |

### A.5 Fluxo dos canais diretos (app / e-mail)

Mesmo *job* de exclusão da Meta, com identidade verificada por sessão autenticada (app) ou confirmação por e-mail. Tudo registrado para auditoria (operação, data/hora, código).

---

*Rascunho técnico-jurídico para revisão. Não constitui aconselhamento jurídico. Antes da publicação, exige revisão de conformidade Meta e de advogado habilitado por jurisdição.*
