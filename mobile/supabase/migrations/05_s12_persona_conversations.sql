-- S12: Populate Community with Persona Conversations
INSERT INTO shares (user_id, content, is_public, created_at)
SELECT p.id, posts.content, true, now() - (INTERVAL '1 day' * (random() * 7)::int)
FROM (VALUES
  ('carlos.mendes', 'Comecei com reflexao: qual e meu proposito? HygeiOS mostra que Bio+Mental+Spirit precisam harmonia.'),
  ('maria.silva', 'Gratidao pelas pessoas aqui. Era de Aquario, somos conectados.'),
  ('roberto.santos', 'Refeicao com atencao plena. Nutricao nao e numeros, e ritual.'),
  ('lucas.oliveira', 'Wonder Night foi transformador. 20min meditacao. Viagem incrivel!'),
  ('fernanda.rocha', 'Como lidam com pressa? Testando: parar 2h e respirar fundo 3x.'),
  ('jose.cardoso', 'Diario: Quem sou quando ninguem ve? Investigando.'),
  ('ana.lima', 'IVI subiu com diario diario. Consistencia e magica!'),
  ('ricardo.ferreira', 'ProteOS e espelho. Conversas revelam padroes antigos.'),
  ('sandra.moraes', 'Ciclo: pressa-nutricao-energia-pressa. Quebrei com acoes pequenas.'),
  ('bruno.alves', 'Comunidades sao melhores! Aquarios se reconhecem!')
) posts(username, content)
JOIN profiles p ON p.username = posts.username
WHERE p.id IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO shares (user_id, content, is_public, created_at)
SELECT p.id, posts.content, true, now() - (INTERVAL '1 day' * (random() * 5)::int)
FROM (VALUES
  ('maria.silva', 'Tem estrategia para manter streak 30 dias? Dia 8 e ja sinto beneficios!'),
  ('lucas.oliveira', 'IVI genial porque nao julga. Critico, Alerta, Atencao... tudo e oportunidade.'),
  ('fernanda.rocha', 'ProteOS me ajudou ver que pressa e mecanismo. Entendo padroes.'),
  ('ana.lima', 'Nutricao mental = nutricao corporal. Diario fez perceber.'),
  ('ricardo.ferreira', 'Aquario aqui! Conexao telepatica com comunidade?'),
  ('sandra.moraes', 'Desafio: 7 dias alimentos integrais. Energia UP Disposicao UP.'),
  ('bruno.alves', 'Consistencia bate intensidade. Todo dia > esporadico.'),
  ('carlos.mendes', 'HygeiOS Spirit critico. Meditacao 3 semanas subiu. Pratica = resultado.'),
  ('roberto.santos', 'Como comecar do zero? Alguns comecaram assim?'),
  ('jose.cardoso', 'Gratidao por espaco. Sem julgamento, so amor evolucao.')
) posts(username, content)
JOIN profiles p ON p.username = posts.username
WHERE p.id IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO likes (share_id, user_id)
SELECT s.id, p.id
FROM shares s
JOIN profiles p ON p.username IN ('carlos.mendes', 'maria.silva', 'roberto.santos', 'lucas.oliveira', 'fernanda.rocha', 'jose.cardoso', 'ana.lima', 'ricardo.ferreira', 'sandra.moraes', 'bruno.alves')
WHERE s.is_public = true AND s.user_id != p.id AND random() < 0.3
ON CONFLICT DO NOTHING;
