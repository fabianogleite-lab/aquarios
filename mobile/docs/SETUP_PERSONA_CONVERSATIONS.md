# Populando Conversas na Comunidade com Personas

## ⚠️ Pré-requisito

As **10 personas** precisam existir no banco como usuários:

```
1. carlos.mendes   — Carlos Mendes (Clínico)
2. maria.silva     — Maria da Silva (Suporte)
3. roberto.santos  — Roberto Santos (Pragmático)
4. lucas.oliveira  — Lucas Oliveira (ProteOS)
5. fernanda.rocha  — Fernanda Rocha (Suporte)
6. jose.cardoso    — José Cardoso (Pragmático)
7. ana.lima        — Ana Paula Lima (Suporte)
8. ricardo.ferreira — Ricardo Ferreira (ProteOS)
9. sandra.moraes   — Sandra Moraes (Clínico)
10. bruno.alves    — Bruno Alves (ProteOS)
```

Se não tiverem sido criadas, execute o `seed-bots` Edge Function no admin panel do app.

---

## Executar o SQL

1. **Abra Supabase Dashboard**: https://app.supabase.com/projects/agebsmjsjrmazbozphnh
2. **SQL Editor** → **New Query**
3. **Cole o conteúdo** de: `mobile/supabase/migrations/05_s12_persona_conversations.sql`
4. **Clique "Run"**

---

## O que vai acontecer

### Posts criados: ~20 posts
- Cada persona faz 2 posts com conteúdo realista sobre:
  - HygeiOS / IVI
  - Nutrição (refeições conscientes)
  - Diário (reflexões, autoconhecimento)
  - Wonder Night (meditação, rituais)
  - Comunidade (conexão, apoio)

### Likes criados: ~40-50 likes
- Cada persona curte ~30% dos posts das outras
- Simula interação orgânica entre elas

### Timestamps
- Posts espalhados nos últimos 7 dias
- Parecem conversas naturais (não tudo no mesmo dia)

---

## Verificar resultado

No Supabase **Table Editor**:

1. Abra `shares` → vê 20 novos posts
2. Abra `likes` → vê 40-50 likes entre personas
3. No app, acesse **Comunidades → Feed** → vê conversas aparecendo

---

## O que vocês podem fazer agora

- Testar o timeline da comunidade
- Vê cuomo as personas interagem
- Adicionar seu próprio post para testar
- Testar follow/unfollow com personas
- Simular um cenário real de uso

---

## Próximas etapas

- S13: Economia + Loja (tokens gastáveis em produtos)
- S14: Gamificação (badges + leaderboard)
- S15: Launch na Play Store
