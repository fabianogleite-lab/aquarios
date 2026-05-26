-- Simpler persona posts insert
INSERT INTO shares (user_id, content, is_public, created_at) VALUES
((SELECT id FROM profiles WHERE username = 'carlos.mendes' LIMIT 1), 'Reflexao: qual e meu proposito? HygeiOS mostra que Bio+Mental+Spirit precisam harmonia.', true, now() - INTERVAL '6 days'),
((SELECT id FROM profiles WHERE username = 'maria.silva' LIMIT 1), 'Gratidao pelas pessoas aqui. Aquarios se conectam.', true, now() - INTERVAL '5 days'),
((SELECT id FROM profiles WHERE username = 'roberto.santos' LIMIT 1), 'Refeicao com atencao plena. Nutricao e ritual.', true, now() - INTERVAL '4 days'),
((SELECT id FROM profiles WHERE username = 'lucas.oliveira' LIMIT 1), 'Wonder Night transformador. Meditacao profunda.', true, now() - INTERVAL '3 days'),
((SELECT id FROM profiles WHERE username = 'fernanda.rocha' LIMIT 1), 'Como lidam com pressa? Testando: parar e respirar.', true, now() - INTERVAL '2 days'),
((SELECT id FROM profiles WHERE username = 'jose.cardoso' LIMIT 1), 'Diario: Quem sou quando ninguem ve?', true, now() - INTERVAL '1 days'),
((SELECT id FROM profiles WHERE username = 'ana.lima' LIMIT 1), 'IVI subiu com diario. Consistencia e magica!', true, now() - INTERVAL '6 days'),
((SELECT id FROM profiles WHERE username = 'ricardo.ferreira' LIMIT 1), 'ProteOS e espelho. Conversas revelam padroes.', true, now() - INTERVAL '5 days'),
((SELECT id FROM profiles WHERE username = 'sandra.moraes' LIMIT 1), 'Ciclo: pressa-nutricao-energia. Quebrei.', true, now() - INTERVAL '4 days'),
((SELECT id FROM profiles WHERE username = 'bruno.alves' LIMIT 1), 'Comunidades sao melhores! Aquarios.', true, now() - INTERVAL '3 days');
