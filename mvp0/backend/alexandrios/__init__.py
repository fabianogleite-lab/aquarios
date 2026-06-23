"""AlexandriOS — ajuda conversacional do MVP1 (Item 5).

3 públicos: usuario | admin | integrador. Conteúdo de ajuda em `alexandrios_kb` (Supabase),
leitura pública. O app mobile (`mobile/services/alexandrios.ts`) chama a API e cai pro
`faqs.json` local se ela estiver fora — degradação graciosa.
"""
