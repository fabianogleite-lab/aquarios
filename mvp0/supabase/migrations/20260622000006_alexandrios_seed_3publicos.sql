-- AlexandriOS — seed de ajuda para os públicos ADMIN e INTEGRADOR (Item 5 MVP1 / WS2).
-- "O fundador não será o admin para sempre": transferência de conhecimento.
--
-- 🔒 Esta tabela tem leitura PÚBLICA (RLS USING true). Portanto este conteúdo é
--    propositalmente CONCEITUAL/OPERACIONAL: explica O QUE cada peça faz e COMO operar os
--    consoles — NUNCA segredos, IPs reais, valores de chave, schema interno, nem o mecanismo
--    do gate admin oculto (ver migration 20260621020000) nem as fontes do humanizador (sigilo).
--    Detalhes sensíveis (runbook, IPs, datas) vivem em docs locais gated (INFRA_HARDWARE_MAP).
--
-- Idempotente: ON CONFLICT (slug) DO UPDATE. Re-rodar é seguro.

INSERT INTO public.alexandrios_kb
  (slug, publico, category, question, answer, tone, qualis_level, is_canonical, anchor)
VALUES
-- ===================== ADMIN =====================
('admin-deploy', 'admin', 'OPERACAO',
 'Como o backend do AquariOS é publicado (deploy)?',
 'O backend é uma API FastAPI empacotada em imagem Docker, enviada ao registro de container (ACR) e servida por um Azure Container App. O deploy reusa a imagem `aquarios:latest`; a saúde é confirmada em GET /health (lista os módulos no ar). Builds usam contexto limpo + `--progress-bar off` (lição registrada no runbook interno).',
 'INSTRUCTIONAL', 'general', true, 'admin/deploy'),

('admin-settings', 'admin', 'OPERACAO',
 'O que são as configurações dinâmicas (admin_settings)?',
 'É a base config-first: toda decisão com mais de duas opções vira um ajuste no console em vez de virar código fixo. O app lê essas chaves na inicialização. Endpoints: GET /admin/settings (lê tudo) e PUT /admin/settings/{chave} (atualiza uma). Regra: configurável por tempo, usuário e região.',
 'INSTRUCTIONAL', 'general', true, 'admin/settings'),

('admin-servers', 'admin', 'INFRA',
 'Quantos servidores o AquariOS usa e por quê?',
 'O alvo é 1 servidor por país (latência + soberania de dados/LGPD), girando camadas gratuitas para manter custo baixo. O mapa de nós e a estratégia de rotação ficam num runbook interno; o console mostra disponibilidade e contagem regressiva de cada nó. Escala = acionar 1 nó por vez quando um passa de um limiar de uso.',
 'INSTRUCTIONAL', 'general', true, 'admin/servers'),

('admin-server-switch', 'admin', 'INFRA',
 'Como funciona "trocar de servidor trilha a trilha"?',
 'É um failover/rotação controlado: cada trilha (módulo, rota ou país) pode ser apontada para um nó diferente sem derrubar as demais. No console isso aparece como um conjunto de chaves — você move uma trilha por vez, verifica a saúde, e só então move a próxima. Evita migração em bloco e isola risco.',
 'INSTRUCTIONAL', 'general', true, 'admin/server-switch'),

('admin-cost-cascade', 'admin', 'CUSTO',
 'Por que o custo de IA é quase zero? (cascata)',
 'As respostas passam por uma cascata: primeiro um cache semântico responde o que já foi visto; depois uma camada local de reescrita dá naturalidade; um modelo local assume casos intermediários; e só uma fração mínima chega a um modelo de nuvem pago. Resultado: a grande maioria das respostas não toca a API paga.',
 'INSTRUCTIONAL', 'general', true, 'admin/cost'),

('admin-slo', 'admin', 'OPERACAO',
 'Como sei se o sistema está saudável?',
 'Cada módulo expõe um health check. O geral é GET /health (retorna ok + versão + módulos). Há ainda health por módulo (ex: /alexandrios/health informa se a base de ajuda está credenciada). O console resume esses sinais; um agendamento diário avisa indisponibilidade e prazos de crédito de infraestrutura.',
 'INSTRUCTIONAL', 'general', true, 'admin/slo'),

('admin-backoffice', 'admin', 'OPERACAO',
 'O que é o backoffice e quem opera?',
 'É o painel web do admin (página dedicada nos sites) para operar o AquariOS sem mexer no código: ligar/desligar features por tempo/usuário/região, ver saúde dos serviços e acionar a troca de servidor por trilha. Foi feito para ser operável por terceiros — porque o fundador não será o admin para sempre.',
 'INSTRUCTIONAL', 'general', true, 'backoffice'),

('admin-secrets', 'admin', 'SEGURANCA',
 'Onde ficam as chaves e segredos?',
 'Segredos nunca vivem em arquivos do repositório. No servidor/serviço eles entram como "secret" do ambiente (ex: secret do Container App, ou arquivo de ambiente no servidor). Chaves de voz e de serviço ficam só no lado servidor — nunca embutidas no app. Para rotacionar, troque no painel da plataforma e re-aponte o secret.',
 'INSTRUCTIONAL', 'general', true, 'admin/secrets'),

('admin-migrations', 'admin', 'OPERACAO',
 'Como o banco de dados evolui?',
 'Por migrations versionadas (pasta supabase/migrations). Cada arquivo é idempotente (CREATE/ALTER ... IF NOT EXISTS) e aplicado em ordem de data. O histórico local x remoto é comparável; aplicar = publicar as pendentes. Nunca se edita uma migration já aplicada — cria-se a próxima.',
 'INSTRUCTIONAL', 'general', true, 'admin/migrations'),

('admin-modules', 'admin', 'ARQUITETURA',
 'Quais módulos o backend expõe?',
 'O MVP1 converge seis frentes na mesma API: SandeirOS (respostas em cascata), HygeiOS (sinais/insights), Admin (configurações), Skin B (Tool Bus), Shopify (webhook) e AlexandriOS (esta ajuda). Cada um é um router montado no app; /health lista todos os que estão no ar.',
 'INSTRUCTIONAL', 'general', true, 'admin/modules'),

-- ===================== INTEGRADOR =====================
('integ-skinb-tools', 'integrador', 'INTEGRACAO',
 'O que é o Skin B / Tool Bus?',
 'Skin B é a "pele" de integração: um barramento de ferramentas (Tool Bus) que deixa parceiros e sistemas externos acionarem capacidades do AquariOS por chamadas de API padronizadas, sem acoplar à interface do usuário. Pense nele como o ponto de entrada B2B do mesmo motor.',
 'TECHNICAL', 'general', true, 'skin-b/tools'),

('integ-shopify', 'integrador', 'INTEGRACAO',
 'Como integrar uma loja Shopify?',
 'Há um endpoint de webhook que recebe eventos da loja (ex: pedido criado) e os encaminha ao fluxo do AquariOS. A integração é configurada com a URL do webhook do lado da loja; a verificação de assinatura garante que só eventos legítimos sejam processados.',
 'TECHNICAL', 'general', true, 'skin-b/shopify'),

('integ-email', 'integrador', 'INTEGRACAO',
 'Como o AquariOS envia e-mails? (adapter)',
 'Por um adapter de e-mail desacoplado (backend/tools): a aplicação chama uma interface única e o adapter cuida do provedor real. Trocar de provedor não muda o código que chama — só a configuração do adapter.',
 'TECHNICAL', 'general', true, 'integra/email'),

('integ-messaging', 'integrador', 'INTEGRACAO',
 'Como o AquariOS envia mensagens (WhatsApp/SMS)? (adapter)',
 'Mesmo padrão do e-mail: um adapter de mensagens (backend/tools) expõe uma interface única e encapsula o canal real (ex: WhatsApp). Isso mantém o roteamento por país/idioma separado da entrega.',
 'TECHNICAL', 'general', true, 'integra/messaging'),

('integ-business-agent', 'integrador', 'INTEGRACAO',
 'O que é o business-agent?',
 'É o conjunto de peças voltadas a marketing/operação de negócio: captura de leads, motor de campanhas, autenticação e roteamento (DDI→país, idioma/voz, multicanal) e proxy de voz. Serve a porta de entrada por canais externos, reusando o mesmo motor do AquariOS.',
 'TECHNICAL', 'general', true, 'integra/business-agent'),

('integ-voice', 'integrador', 'INTEGRACAO',
 'Como funciona a ponte de voz (WhatsApp ↔ TTS/STT)?',
 'Um proxy de voz no servidor transcreve o áudio recebido e converte o texto de resposta em voz, mantendo a chave do provedor de voz só no lado servidor. Assim o app nunca embute credencial de voz, e o canal de WhatsApp pode conversar por áudio nos dois sentidos.',
 'TECHNICAL', 'general', true, 'integra/voice'),

('integ-api', 'integrador', 'INTEGRACAO',
 'Quais são os principais endpoints da API?',
 'GET /health e GET / (status); /sandeiros/responder (resposta em cascata); /hygeios/* (sinais); /admin/settings (config); /skin-b/* (Tool Bus); /shopify/* (webhook); /alexandrios/search (esta ajuda, com filtros publico/persona/category/anchor). Todos respondem JSON.',
 'TECHNICAL', 'general', true, 'integra/api'),

('integ-cerber', 'integrador', 'SEGURANCA',
 'Existe uma camada de proteção nas integrações?',
 'Sim: um "shield" valida e filtra o tráfego de entrada das integrações (defesa em camadas) antes de chegar ao motor. A ideia é que parceiros consumam a API por um caminho protegido, com verificação de origem e limites.',
 'TECHNICAL', 'general', true, 'integra/cerber')

ON CONFLICT (slug) DO UPDATE SET
  publico      = EXCLUDED.publico,
  category     = EXCLUDED.category,
  question     = EXCLUDED.question,
  answer       = EXCLUDED.answer,
  tone         = EXCLUDED.tone,
  qualis_level = EXCLUDED.qualis_level,
  is_canonical = EXCLUDED.is_canonical,
  anchor       = EXCLUDED.anchor;
