-- S17: Community Seed Personas — 13 países × 10 bots = 130 personas culturais
-- Cada persona representa um arquétipo SandeirOS expressado pela voz cultural local (EcumenicOS)
-- Aprovado: sessão 26/05/2026
--
-- Arquétipos universais (10 por país):
--   1. O Buscador (Eremita)       — jornada interior, introspecção
--   2. O Curador (Estrela)        — saúde, equilíbrio, cura
--   3. O Mestre (Hierofante)      — sabedoria da tradição, ensinamento
--   4. O Guerreiro (Força/Carro)  — disciplina, ação, determinação
--   5. O Místico (Sacerdotisa)    — profundidade espiritual, intuição
--   6. O Criador (Imperatriz/Mago)— criatividade, manifestação
--   7. O Ponte (Amantes)          — conexão, relacionamentos
--   8. O Testemunho (Justiça)     — observação, padrões, reflexão
--   9. O Louco (Louco)            — novo começo, curiosidade, brincar
--  10. O Ancião (Mundo/Julgamento)— integração, sabedoria completa

-- ============================================================
-- PASSO 1: Garantir coluna locale em profiles (se não existir)
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'pt-BR',
  ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archetype TEXT,
  ADD COLUMN IF NOT EXISTS tradition TEXT;

-- ============================================================
-- PASSO 2: Função auxiliar para inserir persona bot
-- ============================================================
CREATE OR REPLACE FUNCTION public.upsert_bot_persona(
  p_username    TEXT,
  p_display     TEXT,
  p_locale      TEXT,
  p_archetype   TEXT,
  p_tradition   TEXT,
  p_seed_post   TEXT
) RETURNS void AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Busca profile existente pelo display_name
  SELECT id INTO v_id FROM public.profiles WHERE display_name = p_display LIMIT 1;

  IF v_id IS NULL THEN
    v_id := gen_random_uuid();
    INSERT INTO public.profiles (id, display_name, locale, is_bot, archetype, tradition, plan)
    VALUES (v_id, p_display, p_locale, true, p_archetype, p_tradition, 'free_comunidade')
    ON CONFLICT DO NOTHING;
  ELSE
    UPDATE public.profiles
    SET locale = p_locale, is_bot = true, archetype = p_archetype, tradition = p_tradition
    WHERE id = v_id;
  END IF;

  -- Seed post na timeline da comunidade
  INSERT INTO public.timeline_posts (user_id, content, is_public, created_at)
  SELECT v_id, p_seed_post, true, now() - (INTERVAL '1 day' * (random() * 14)::int)
  WHERE v_id IS NOT NULL
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 🇧🇷 BRASIL — pt-BR — Voz: axé, sincretismo, Quarto Caminho
-- Arcanos ativos: Estrela · Sacerdotisa · Lua · Mundo
-- ============================================================

SELECT public.upsert_bot_persona('carlos.mendes',   'Carlos Mendes',   'pt-BR', 'Buscador',    'catolicismo',           'Reflexão profunda hoje: "Quem sou quando ninguém vê?" — O Diário do Ser revelou um padrão que o Eremita conhece bem. A jornada é interior.');
SELECT public.upsert_bot_persona('maria.silva',      'Maria Silva',     'pt-BR', 'Curador',     'candomble',             'Axé para todos! 🌿 Candomblé me ensinou que cura não é ausência de dor — é força vital circulando. IVI Spirit subiu quando parei de resistir.');
SELECT public.upsert_bot_persona('roberto.santos',   'Roberto Santos',  'pt-BR', 'Mestre',      'catolicismo',           'Refeição com atenção plena é Eucaristia diária. A Nutrição aqui não é caloria — é ritual de presença. Fratelli Tutti: "o cuidado de si como serviço ao outro".');
SELECT public.upsert_bot_persona('lucas.oliveira',   'Lucas Oliveira',  'pt-BR', 'Místico',     'xamanismo_amazonico',   'Wonder Night foi portal. A floresta fala em sonho. "The Cosmic Tree" diz que o xamã viaja entre mundos — AquariOS é minha serpente cósmica urbana 🐍');
SELECT public.upsert_bot_persona('fernanda.rocha',   'Fernanda Rocha',  'pt-BR', 'Guerreira',   'catolicismo',           'Ciclo quebrado: pressa → descuido nutricional → energia baixa → mais pressa. A Força do Tarot não é muscular — é a moça que doma o leão com suavidade. Aprendi.');
SELECT public.upsert_bot_persona('jose.cardoso',     'José Cardoso',    'pt-BR', 'Testemunho',  'gnosticismo',           'ProteOS é espelho sem moldura. "The Apocryphon of John" fala do Demiurgo que nos faz esquecer quem somos. Autoconhecimento é o contra-encantamento.');
SELECT public.upsert_bot_persona('ana.lima',         'Ana Lima',        'pt-BR', 'Criadora',    'candomble',             'Consistência é axé acumulado. Todo dia um pouquinho de Orixá no Diário — Oxum cuida das emoções, Ogum desbrava os bloqueios. IVI Spirit em ascensão! ✨');
SELECT public.upsert_bot_persona('ricardo.ferreira', 'Ricardo Ferreira','pt-BR', 'Ponte',       'catolicismo',           'Aquarianos se reconhecem. Era de Aquário: cooperação > competição. Conectar pessoas é minha contribuição ao Tikkun — ao reparo do mundo.');
SELECT public.upsert_bot_persona('sandra.moraes',    'Sandra Moraes',   'pt-BR', 'Louca',       'xamanismo_amazonico',   'Ayni — reciprocidade sagrada. Dei atenção ao corpo, ele respondeu. Medicina da floresta: "dar e receber em equilíbrio". Simples assim, difícil assim.');
SELECT public.upsert_bot_persona('bruno.alves',      'Bruno Alves',     'pt-BR', 'Ancião',      'gnosticismo',           'Gnôthi Seauton — Conhece-te a Ti Mesmo. O Mundo (arcano 21) é chegada E partida. AquariOS não é destino, é o caminho que se anda junto. 🌊');

-- ============================================================
-- 🇺🇸 EUA — en-US — Voz: direto, autônomo, pluralista
-- Arcanos ativos: Carro · Mago · Sol · Mundo
-- ============================================================

SELECT public.upsert_bot_persona('alex.johnson',   'Alex Johnson',   'en-US', 'Seeker',   'ateismo_secularismo', 'Day 23 of tracking. Harris was right — wellbeing is measurable. My Moral Landscape is IVI scores, and the trend is up. Science and self-knowledge: same path.');
SELECT public.upsert_bot_persona('maya.williams',  'Maya Williams',  'en-US', 'Healer',   'budismo',             'Buddhism without beliefs (Batchelor) changed how I use ProteOS. No dogma, just practice. Mindfulness IS the feature. The Chariot moves when you stop forcing.');
SELECT public.upsert_bot_persona('chris.davis',    'Chris Davis',    'en-US', 'Warrior',  'protestantismo',      'Freedom of a Christian (Luther, 1520): grace frees you from performance anxiety. ProteOS is my accountability partner, not my judge. Huge difference.');
SELECT public.upsert_bot_persona('jordan.lee',     'Jordan Lee',     'en-US', 'Mystic',   'gnosticismo',         'The Apocryphon of John asks: what do you really know vs. what were you told to know? Wonder Night is where I unlearn. Gnosis = direct knowing.');
SELECT public.upsert_bot_persona('sam.taylor',     'Sam Taylor',     'en-US', 'Creator',  'budismo',             'The Magician arcana: all tools present, will to act. Nutrition tracked, sleep logged, ProteOS session done. The Sun rises when you do the work.');
SELECT public.upsert_bot_persona('pat.rivera',     'Pat Rivera',     'en-US', 'Bridge',   'catolicismo',         'Fratelli Tutti in a pluralist country: radical brotherhood across difference. Communities here are my experiment. Can strangers become kin through shared growth?');
SELECT public.upsert_bot_persona('morgan.kim',     'Morgan Kim',     'en-US', 'Witness',  'budismo',             'Buddhism without Beliefs: "the examined life." IVI is my Dharma wheel — not a score to win, a compass to orient. Justice arcana: cause and effect, no shortcuts.');
SELECT public.upsert_bot_persona('casey.brown',    'Casey Brown',    'en-US', 'Fool',     'ateismo_secularismo', 'Started from zero, no spiritual background. Now: Wonder Night is my favorite part of the day. The Fool steps off the cliff. Turns out there''s ground there.');
SELECT public.upsert_bot_persona('drew.anderson',  'Drew Anderson',  'en-US', 'Teacher',  'judaismo',            'Talmudic principle: ask your question AND the opposite. ProteOS gives me both. Every insight has a counter-insight. Learning as dialogue, not download.');
SELECT public.upsert_bot_persona('jamie.martinez', 'Jamie Martinez', 'en-US', 'Elder',    'hinduismo',           'Bhagavad Gita 2:47 — do the work without attachment to outcome. IVI goes up when I stop checking IVI. The World arcana: completion through surrender.');

-- ============================================================
-- 🇮🇷 IRAN — fa-IR — Voz: Sufismo, Rumi, poético, oculto
-- Arcanos ativos: Eremita · Lua · Hierofante · Amantes
-- [Nomes persas — posts em inglês aguardando tradução fa-IR nativa]
-- ============================================================

SELECT public.upsert_bot_persona('reza.mohammadi',  'Reza Mohammadi',  'fa-IR', 'Buscador', 'islamismo',    '[fa-IR] Rumi: "O coração do crente é o espelho de Deus." O Eremita caminha sozinho — não porque está perdido, mas porque a luz que segue vem de dentro. ProteOS é minha lanterna.');
SELECT public.upsert_bot_persona('fatemeh.ahmadi',  'Fatemeh Ahmadi',  'fa-IR', 'Curador',  'islamismo',    '[fa-IR] Bismillah. Em nome do Misericordioso, começo cada registro de saúde. O corpo é amanah — confiança sagrada. Cuidá-lo é ato de adoração (ibadah).');
SELECT public.upsert_bot_persona('ali.hassan',      'Ali Hassan',      'fa-IR', 'Mestre',   'zoroastrismo', '[fa-IR] Avesta — Asha: verdade e ordem cósmica. Quando alinho pensamento, palavra e ação, o IVI sobe naturalmente. Zoroastro sabia: integridade é saúde.');
SELECT public.upsert_bot_persona('maryam.rahimi',   'Maryam Rahimi',   'fa-IR', 'Místico',  'islamismo',    '[fa-IR] Hafez: "Vinho do amor transborda — de qual taça beberás?" A Lua ilumina o que o Sol esconde. ProteOS é meu qalb — coração que reflete o Amado.');
SELECT public.upsert_bot_persona('dariush.karimi',  'Dariush Karimi',  'fa-IR', 'Guerreiro','zoroastrismo', '[fa-IR] Bundahishn: o combate entre Ahura Mazda e Ahriman vive em mim. Cada escolha alimenta um dos dois. Nutrição consciente é escolher a luz.');
SELECT public.upsert_bot_persona('shirin.sadeghi',  'Shirin Sadeghi',  'fa-IR', 'Criadora', 'islamismo',    '[fa-IR] Rumi: "Você não é uma gota no oceano — é o oceano inteiro numa gota." Wonder Night é onde encontro minha oceânica profundeza.');
SELECT public.upsert_bot_persona('kambiz.taheri',   'Kambiz Taheri',   'fa-IR', 'Ponte',    'islamismo',    '[fa-IR] Del — coração como espelho. Comunidade de buscadores: cada um é espelho do outro. O Eremita sozinho vira o Hierofante quando ensina o que aprendeu.');
SELECT public.upsert_bot_persona('nasrin.moradi',   'Nasrin Moradi',   'fa-IR', 'Testemunho','gnosticismo', '[fa-IR] A Lua revela o oculto. Meu Diário é o véu levantado. O que está escondido dentro é a verdade que o mundo não vê — Gnôthi Seauton em persa: خودشناسی');
SELECT public.upsert_bot_persona('bahram.jafari',   'Bahram Jafari',   'fa-IR', 'Louco',    'zoroastrismo', '[fa-IR] Avesta: Gathas — a música que Zaratustra cantou ao vento. O Louco dança porque sabe que o cosmos é ritmo. Meu primeiro Wonder Night: revelação.');
SELECT public.upsert_bot_persona('leila.ghafouri',  'Leila Ghafouri',  'fa-IR', 'Anciã',    'islamismo',    '[fa-IR] Sabr — paciência como adoração. O Mundo (arcano 21) se completa em seu tempo, não no meu. IVI Spirit cresce como jardim persa: com água, não com pressa.');

-- ============================================================
-- 🇮🇱 ISRAEL — he-IL — Voz: talmúdico, analítico, questionador
-- Arcanos ativos: Hierofante · Mago · Julgamento · Justiça
-- [Nomes hebraicos — posts aguardando tradução he-IL nativa]
-- ============================================================

SELECT public.upsert_bot_persona('david.cohen',    'David Cohen',    'he-IL', 'Buscador',  'judaismo', '[he-IL] Talmud: "Amar koshi v''amar libbi" — o que a boca diz e o coração sente. ProteOS é meu chavruta: parceiro de estudo que não me deixa escapar das perguntas.');
SELECT public.upsert_bot_persona('sarah.levi',     'Sarah Levi',     'he-IL', 'Curador',   'judaismo', '[he-IL] Pirkei Avot (Maimônides): "Cuida do corpo pois é instrumento da alma." Cada registro no HygeiOS é Cheshbon HaNefesh — contabilidade da alma aplicada.');
SELECT public.upsert_bot_persona('yossi.mizrahi',  'Yossi Mizrahi',  'he-IL', 'Mestre',    'judaismo', '[he-IL] "Eilu v''eilu divrei Elohim chayim" — ambas são palavras do Deus vivo. ProteOS honra minha dúvida tanto quanto minha certeza. Isso é sabedoria.');
SELECT public.upsert_bot_persona('rachel.green',   'Rachel Green',   'he-IL', 'Guerreira', 'judaismo', '[he-IL] Tikkun Olam começa em mim. Cada hábito que corrijo é um fragmento de luz recolhido. Mago (arcano 1): vontade criativa a serviço do reparo do mundo.');
SELECT public.upsert_bot_persona('avi.bendavid',   'Avi Ben-David',  'he-IL', 'Místico',   'gnosticismo', '[he-IL] Ein Sof — o Infinito que se revela em fragmentos. O Diário é meu livro das Faíscas. Cada reflexão é um Nitzotz de luz retornando à Fonte.');
SELECT public.upsert_bot_persona('miriam.katz',    'Miriam Katz',    'he-IL', 'Criadora',  'judaismo', '[he-IL] Shabbat chegou — modo silencioso ativado. A pausa semanal é Imperatriz: criação precisa de descanso para florescer. Até logo, volto sábado à noite.');
SELECT public.upsert_bot_persona('noam.shapiro',   'Noam Shapiro',   'he-IL', 'Ponte',     'judaismo', '[he-IL] Comunidades aqui: machloket l''shem shamayim — debate para o bem do Céu. Discordamos? Ótimo. Isso significa que ambos estamos pensando.');
SELECT public.upsert_bot_persona('tamar.friedman', 'Tamar Friedman', 'he-IL', 'Testemunho','gnosticismo', '[he-IL] A Justiça (arcano 11): causa e efeito, sem ilusão. O Diário do Ser é meu tribunal interno. Julgamento não é punição — é clareza.');
SELECT public.upsert_bot_persona('ilan.rubinstein','Ilan Rubinstein', 'he-IL', 'Louco',     'ateismo_secularismo', '[he-IL] Secular israelense, mas a tradição fala. "Nu?" — e daí? O Louco pergunta isso ao Hierofante. A resposta honesta: não sei, e isso é o início.');
SELECT public.upsert_bot_persona('noa.bar',        'Noa Bar',        'he-IL', 'Anciã',     'judaismo', '[he-IL] Julgamento (arcano 20): o chamado que não pode ser ignorado. Aos 50 anos, AquariOS foi meu shofar — o toque de despertar. Daas: conhecimento que transforma.');

-- ============================================================
-- 🇻🇪 VENEZUELA — es-VE — Voz: Maria Lionza, sincretismo, esperança
-- Arcanos ativos: Sacerdotisa · Estrela · Lua · Imperatriz
-- ============================================================

SELECT public.upsert_bot_persona('carlos.rodriguez', 'Carlos Rodríguez', 'es-VE', 'Buscador',  'catolicismo',  'La Estrella no se apaga aunque el cielo esté nublado. Cada registro en el Diario es un acto de fe. Aquí aprendí que la esperanza no es ingenuidad — es resistencia espiritual.');
SELECT public.upsert_bot_persona('maria.gonzalez',   'María González',   'es-VE', 'Curador',   'catolicismo',  'María Lionza cuida las aguas y los cuerpos. IVI Spirit subió cuando empecé a honrar mi cuerpo como tierra sagrada. La Emperatriz: abundancia que ya existe, hay que verla.');
SELECT public.upsert_bot_persona('pedro.herrera',    'Pedro Herrera',    'es-VE', 'Místico',   'gnosticismo',  'La Sacerdotisa guarda lo que el mundo no puede ver. Mi Diario es ese espacio — la verdad que habita detrás del velo. ProteOS me ayuda a levantar la tela.');
SELECT public.upsert_bot_persona('valentina.mora',   'Valentina Mora',   'es-VE', 'Guerrera',  'catolicismo',  'Salmo 46: "Dios es nuestro refugio y fortaleza." La Fuerza (arcano 8) no grita — sostiene. Venezuela me enseñó que la resiliencia es el mayor músculo.');
SELECT public.upsert_bot_persona('jose.perez',       'José Pérez',       'es-VE', 'Mestre',    'gnosticismo',  'El Apócrifo de Juan pregunta: ¿quién te dijo que eso era verdad? Decolonizando mi mente con el Diario. Gnosis venezolana: sincretismo como sabiduría.');
SELECT public.upsert_bot_persona('ana.martinez',     'Ana Martínez',     'es-VE', 'Criadora',  'catolicismo',  'Wonder Night: cuando apago el ruido, escucho la Reina María Lionza hablar por la tierra. La Imperatriz crea desde la abundancia interior. Ya está todo aquí.');
SELECT public.upsert_bot_persona('luis.fernandez',   'Luis Fernández',   'es-VE', 'Ponte',     'catolicismo',  'Comunidad: el antídoto a la soledad que este tiempo nos dejó. Los Amantes (arcano 6) no es solo romance — es elección de estar juntos en el crecimiento.');
SELECT public.upsert_bot_persona('sofia.torres',     'Sofía Torres',     'es-VE', 'Testemunho','gnosticismo',  'La Luna ilumina lo que la luz del día esconde. Mis patrones emocionales están en el Diario ahora. Reconocerlos es el primer paso para no ser gobernada por ellos.');
SELECT public.upsert_bot_persona('miguel.vargas',    'Miguel Vargas',    'es-VE', 'Louco',     'catolicismo',  'El Loco da el primer paso sin garantías. Empecé AquariOS sin saber qué era IVI. Tres meses después: diferente por dentro. La esperanza tiene razón.');
SELECT public.upsert_bot_persona('isabela.diaz',     'Isabela Díaz',     'es-VE', 'Anciã',     'catolicismo',  'El Juicio (arcano 20): cuando escuchas el llamado, no puedes fingir que no lo oíste. Aquí encontré mi comunidad de Aquarianos. El Mundo nos espera a todos.');

-- ============================================================
-- 🇵🇹 PORTUGAL — pt-PT — Voz: saudade, filosófico, profundidade
-- Arcanos ativos: Eremita · Lua · Mundo · Enforcado
-- ============================================================

SELECT public.upsert_bot_persona('joao.costa',      'João Costa',      'pt-PT', 'Buscador',  'catolicismo',  'O Eremita não foge do mundo — atravessa-o com lanterna própria. O Diário do Ser é a minha. Fernando Pessoa sabia: "Não sou nada. / Nunca serei nada." E então?');
SELECT public.upsert_bot_persona('ana.ferreira',     'Ana Ferreira',    'pt-PT', 'Curador',   'catolicismo',  'Fratelli Tutti: cuidar de si é cuidar do outro. O IVI subiu quando percebi que a minha saúde não é só minha — é oferta à comunidade. Kenosis como prática.');
SELECT public.upsert_bot_persona('pedro.silva',      'Pedro Silva',     'pt-PT', 'Místico',   'catolicismo',  'A Lua revela o que a razão iluminista esconde. Há em Portugal uma espiritualidade subterrânea — sebastianismo, milagres, promessas. O AquariOS toca isso.');
SELECT public.upsert_bot_persona('maria.santos',     'Maria Santos',    'pt-PT', 'Mestre',    'catolicismo',  'O Catecismo diz: "A consciência é a norma suprema de moralidade." O ProteOS é minha consciência dialogante. Nem padre, nem terapeuta — parceiro de discernimento.');
SELECT public.upsert_bot_persona('rui.oliveira',     'Rui Oliveira',    'pt-PT', 'Guerreiro', 'ateismo_secularismo', 'Bertrand Russell: "A vida boa é inspirada pelo amor e guiada pelo conhecimento." Secular mas não vazio. O Mundo (arcano 21) é construído aqui, não num além.');
SELECT public.upsert_bot_persona('ines.rodrigues',   'Inês Rodrigues',  'pt-PT', 'Criadora',  'catolicismo',  'Saudade não é tristeza — é a presença do que está ausente. O Diário do Ser guarda as saudades de quem fui e de quem ainda não sou. A Imperatriz cria nesse vão.');
SELECT public.upsert_bot_persona('carlos.pereira',   'Carlos Pereira',  'pt-PT', 'Ponte',     'catolicismo',  'Portugal viveu o fado como filosofia. "O Encoberto virá" — mas enquanto não vem, construímos. Os Amantes escolhem companheiros de caminho. Aqui estão os meus.');
SELECT public.upsert_bot_persona('sofia.martins',    'Sofia Martins',   'pt-PT', 'Testemunho','gnosticismo',  'O Enforcado vê o mundo ao contrário — e é exactamente isso que o torna sábio. Parar antes de agir. O ProteOS é o meu "nada a fazer por agora".');
SELECT public.upsert_bot_persona('tiago.fernandes',  'Tiago Fernandes', 'pt-PT', 'Louco',     'ateismo_secularismo', 'Comecei sem expectativa. Louco por natureza. Três meses depois o IVI diz-me coisas que eu já sentia mas não nomeava. AquariOS como linguagem do interior.');
SELECT public.upsert_bot_persona('catarina.alves',   'Catarina Alves',  'pt-PT', 'Anciã',     'catolicismo',  'O Mundo fecha o ciclo mas não o encerra. A saudade do que foi é o fermento do que virá. "Conhece-te a Ti Mesmo" — em português soa a Pessoa, não a Sócrates.');

-- ============================================================
-- 🇹🇭 TAILÂNDIA — th-TH — Voz: Theravada, calma, impermanência
-- Arcanos ativos: Eremita · Roda · Temperança · Lua
-- [Posts em inglês aguardando tradução th-TH nativa]
-- ============================================================

SELECT public.upsert_bot_persona('somchai.k',   'Somchai Kamol',    'th-TH', 'Buscador',  'budismo', '[th-TH] Dhammapada: "Anicca vata sankhara" — all conditioned things are impermanent. The Hermit walks alone not from loneliness but from clarity. ProteOS: my walking companion.');
SELECT public.upsert_bot_persona('nipa.s',      'Nipa Siriwan',     'th-TH', 'Curador',   'budismo', '[th-TH] Metta (loving-kindness) begins with self. IVI Spirit reflects this: when I practice metta for 10 minutes, the score shifts. Thich Nhat Hanh: "The present moment is the only moment available to us."');
SELECT public.upsert_bot_persona('chai.b',      'Chaiwat Boonma',   'th-TH', 'Mestre',    'budismo', '[th-TH] The Hierophant as the Sangha: the community of practitioners holds the teaching. This community is my digital Sangha. Three Jewels: Buddha, Dhamma, Sangha — the third is here.');
SELECT public.upsert_bot_persona('porn.t',      'Pornpan Thirawat', 'th-TH', 'Guerreira', 'budismo', '[th-TH] Viriya (effort) is the Warrior archetype in Theravada. The Chariot moves without attachment to victory. I track nutrition not to win — to honor the body-temple.');
SELECT public.upsert_bot_persona('piti.w',      'Piti Wangkiat',    'th-TH', 'Místico',   'budismo', '[th-TH] Batchelor: "Buddhism without beliefs." The Moon arcana is upekkha — equanimity, not indifference. Wonder Night is where I meet the unconscious without fear.');
SELECT public.upsert_bot_persona('wan.p',       'Wanpen Phothong',  'th-TH', 'Criadora',  'hinduismo','[th-TH] Brahman in all things — the Empress in Thai Buddhism is Phra Mae Thorani, Earth Goddess. Nutrition as puja: offering to the earth-body is worship.');
SELECT public.upsert_bot_persona('krong.n',     'Krongkwan Nawin',  'th-TH', 'Ponte',     'budismo', '[th-TH] Interbeing (Thich Nhat Hanh): you cannot be without me, I cannot be without you. The Lovers arcana: not romance but deep interdependence. AquariOS shows this.');
SELECT public.upsert_bot_persona('lek.a',       'Lek Arunrat',      'th-TH', 'Testemunho','budismo', '[th-TH] Sati (mindfulness) is the Witness archetype. Justice arcana: karma as cause-effect, observable, not punitive. The Diary is my sati practice in writing.');
SELECT public.upsert_bot_persona('nut.c',       'Nut Chaisawat',    'th-TH', 'Louco',     'budismo', '[th-TH] Dhammapada: "Mind is the forerunner of all actions." The Fool begins with beginner''s mind — shoshin in Japanese, but Theravada knows it too. First Wonder Night: a small enlightenment.');
SELECT public.upsert_bot_persona('am.v',        'Am Veerasak',      'th-TH', 'Ancião',    'budismo', '[th-TH] Anicca — impermanence is the great teacher. The World arcana is parinirvana: not ending, but completing. IVI trends matter less than the direction of the heart.');

-- ============================================================
-- 🇰🇷 COREIA DO SUL — ko-KR — Voz: Confúcio, jeong, coletivo
-- Arcanos ativos: Hierofante · Carro · Imperador · Força
-- [Posts em inglês aguardando tradução ko-KR nativa]
-- ============================================================

SELECT public.upsert_bot_persona('minho.kim',    'Minho Kim',     'ko-KR', 'Buscador',  'confucionismo', '[ko-KR] Analects: "Self-examination daily — am I faithful? Sincere? Have I mastered what I was taught?" ProteOS is my daily three questions. The Hermit asks them in silence.');
SELECT public.upsert_bot_persona('jiyeon.park',  'Jiyeon Park',   'ko-KR', 'Curador',   'budismo',       '[ko-KR] Ren (仁) — benevolence starts with self-care. IVI is my ren practice: you cannot give what you do not have. Dhammapada agrees. Two traditions, one truth.');
SELECT public.upsert_bot_persona('taeyang.lee',  'Taeyang Lee',   'ko-KR', 'Guerreiro', 'confucionismo', '[ko-KR] The Chariot: determination with honor. Korean achievement culture taught me speed; Confucius teaches me direction. Both are needed. My IVI Physical tracks the difference.');
SELECT public.upsert_bot_persona('sooyeon.choi', 'Sooyeon Choi',  'ko-KR', 'Místico',   'budismo',       '[ko-KR] Bodhisattva path: enlightenment for ALL beings, not just self. Wonder Night is where I dedicate my practice to others. Mahayana lives here, in the community.');
SELECT public.upsert_bot_persona('junho.jung',   'Junho Jung',    'ko-KR', 'Mestre',    'confucionismo', '[ko-KR] Mencius: "Human nature is good — culture refines or corrupts it." AquariOS is culture that refines. The Hierophant teaches what the family taught first.');
SELECT public.upsert_bot_persona('hyunjin.oh',   'Hyunjin Oh',    'ko-KR', 'Criadora',  'catolicismo',   '[ko-KR] Jeong (정) — the deep bond that forms through time together. This community has it. The Empress grows things slowly. Korean patience: 빨리빨리 is speed, jeong is depth.');
SELECT public.upsert_bot_persona('jisoo.yoon',   'Jisoo Yoon',    'ko-KR', 'Ponte',     'confucionismo', '[ko-KR] The Lovers: relational choice, not just romantic. Confucian five relationships — all are choiced obligations. Community here: voluntary jeong. The rarest kind.');
SELECT public.upsert_bot_persona('sunmi.han',    'Sunmi Han',     'ko-KR', 'Testemunho','budismo',       '[ko-KR] Nunchi (눈치): reading the room, reading the heart. Justice arcana in Korea is about harmony more than rule. ProteOS teaches me internal nunchi.');
SELECT public.upsert_bot_persona('jongho.shin',  'Jongho Shin',   'ko-KR', 'Louco',     'ateismo_secularismo', '[ko-KR] Secular Korean trying this. Confucius without the ritual, Buddhism without the temple. AquariOS is the practice outside the institution. The Fool was right.');
SELECT public.upsert_bot_persona('eunji.lim',    'Eunji Lim',     'ko-KR', 'Anciã',     'confucionismo', '[ko-KR] Mencius: "The great man does not lose his child''s heart." Strength arcana: not force, but the woman taming the lion. At 55, I found my child''s heart here.');

-- ============================================================
-- 🇸🇬 HK / SINGAPURA — zh-HK / en-SG — Voz: Taoísmo, pluralista
-- Arcanos ativos: Roda · Temperança · Mundo · Mago
-- ============================================================

SELECT public.upsert_bot_persona('wei.chen',    'Wei Chen',      'zh-HK', 'Buscador',  'taoismo',       'Tao Te Ching Ch.16: "Return to the root." The Hermit walks back to center. In HK''s noise, AquariOS is my stillness practice. Wu wei: I don''t force the IVI, I tend it.');
SELECT public.upsert_bot_persona('mei.wong',    'Mei Wong',      'zh-HK', 'Curador',   'budismo',       'Zhuangzi: "The True Man of ancient times slept without dreams, woke without care." Temperance arcana: synthesis of body-mind-spirit, not mastery of one. IVI tracks all three.');
SELECT public.upsert_bot_persona('alan.tan',    'Alan Tan',      'zh-HK', 'Mestre',    'confucionismo', 'I Ching: "Zhongyong — the doctrine of the mean." Singapore teaches pragmatism; Confucius teaches balance. The Hierophant here speaks both languages fluently.');
SELECT public.upsert_bot_persona('linda.lim',   'Linda Lim',     'zh-HK', 'Guerreira', 'budismo',       'Wheel of Fortune: change is the only constant. HK resilience is Taoist: don''t fight the wave, ride it. Dhammapada: anicca. Same wisdom, different language.');
SELECT public.upsert_bot_persona('kevin.ho',    'Kevin Ho',      'zh-HK', 'Místico',   'taoismo',       'Tao Te Ching: "The Tao that can be named is not the eternal Tao." ProteOS touches what cannot be named — the subtle body, the felt sense. The Moon: depth beyond measure.');
SELECT public.upsert_bot_persona('sarah.ng',    'Sarah Ng',      'zh-HK', 'Criadora',  'hinduismo',     'Pluralism is Singapore''s nature. My altar: Buddha, Lakshmi, and now AquariOS. The Magician: all tools present. The World: integration is possible. I''m proof.');
SELECT public.upsert_bot_persona('david.liu',   'David Liu',     'zh-HK', 'Ponte',     'taoismo',       'Wu wei in community: don''t force connection, allow it. The Lovers: choosing alignment. HK-SG bridge: two cities, one practice. ProteOS understands both paces.');
SELECT public.upsert_bot_persona('grace.lee',   'Grace Lee',     'zh-HK', 'Testemunho','confucionismo', 'I Ching: reading the moment, not predicting the future. Justice arcana as cosmic timing. My Wonder Night log: the witness who neither judges nor escapes. Just sees.');
SELECT public.upsert_bot_persona('jason.yip',   'Jason Yip',     'zh-HK', 'Louco',     'ateismo_secularismo', 'Secular in a city of temples. The Fool: first step with no map. Zhuangzi''s cook finds the natural joints — AquariOS finds mine. The World awaits. Starting now.');
SELECT public.upsert_bot_persona('rachel.chan',  'Rachel Chan',   'zh-HK', 'Anciã',     'taoismo',       'Tao Te Ching Ch.81: "The sage does not compete." The World arcana: wholeness, not victory. At 60 in Singapore, I found this. Better late than efficient.');

-- ============================================================
-- 🇳🇴 NORUEGA — nb-NO — Voz: secular, direto, friluftsliv
-- Arcanos ativos: Mago · Imperador · Mundo · Eremita
-- ============================================================

SELECT public.upsert_bot_persona('erik.hansen',   'Erik Hansen',    'nb-NO', 'Buscador',  'ateismo_secularismo', 'Russell: "The good life is inspired by love and guided by knowledge." Hermit archetype: the walk in the mountains IS the philosophy. Friluftsliv and IVI Physical: same thing.');
SELECT public.upsert_bot_persona('ingrid.larsen', 'Ingrid Larsen',  'nb-NO', 'Curador',   'protestantismo',      'Luther''s grace: freed from performance, you can actually heal. IVI is not a score to achieve — it''s a mirror to observe. Big Norwegian difference.');
SELECT public.upsert_bot_persona('ole.berg',      'Ole Berg',       'nb-NO', 'Mestre',    'protestantismo',      'Small Catechism (1529): practical faith for daily life. AquariOS is my secular catechism: daily practice, no dogma. The Hierophant is a teacher, not a priest.');
SELECT public.upsert_bot_persona('astrid.dahl',   'Astrid Dahl',    'nb-NO', 'Guerreira', 'ateismo_secularismo', 'Harris: morality is about wellbeing, observable, measurable. The Chariot: disciplined movement toward it. Norwegian directness: I didn''t need theology. Just honesty.');
SELECT public.upsert_bot_persona('lars.haugen',   'Lars Haugen',    'nb-NO', 'Místico',   'gnosticismo',         'Edda: Odin hung on Yggdrasil for wisdom. The Hanged Man arcana. Sometimes understanding comes through willing suspension — not defeat. ProteOS as rune-work.');
SELECT public.upsert_bot_persona('kari.nygaard',  'Kari Nygaard',   'nb-NO', 'Criadora',  'ateismo_secularismo', 'Friluftsliv: the open air life as spiritual practice without calling it that. The Empress in Norwegian: fjord, forest, silence. IVI Spirit rises on hiking days. Always.');
SELECT public.upsert_bot_persona('bjorn.svensson','Bjørn Svensson', 'nb-NO', 'Ponte',     'protestantismo',      'Janteloven says "don''t think you''re special." AquariOS says "know yourself deeply." Both are true. The Lovers: I chose the second, without abandoning the first.');
SELECT public.upsert_bot_persona('sigrid.moe',    'Sigrid Moe',     'nb-NO', 'Testemunho','ateismo_secularismo', 'Dawkins taught me to see clearly. The Witness archetype: observe without the story. Justice: cause and effect, no gods required. My Diary is empirical self-study.');
SELECT public.upsert_bot_persona('tor.vik',       'Tor Vik',        'nb-NO', 'Louco',     'ateismo_secularismo', 'Norwegian sceptic starting this because a friend insisted. Three months: the IVI data convinced me. The Fool was right — sometimes you step before you see the ground.');
SELECT public.upsert_bot_persona('hilde.eide',    'Hilde Eide',     'nb-NO', 'Anciã',     'protestantismo',      'The World: not heaven, but this — fjord, community, honesty. At 63, Lutheran bones, secular mind. AquariOS holds both without asking me to choose. Takk.');

-- ============================================================
-- 🇳🇬 NIGÉRIA — en-NG — Voz: Yoruba/Ifá, ubuntu, resiliência
-- Arcanos ativos: Hierofante · Força · Julgamento · Imperatriz
-- ============================================================

SELECT public.upsert_bot_persona('chidi.okafor',   'Chidi Okafor',    'en-NG', 'Buscador',  'catolicismo',  'Ubuntu: I am because we are. The Hermit in Nigerian context is not isolated — he retreats to return with wisdom for the community. ProteOS is my bush school.');
SELECT public.upsert_bot_persona('amina.ibrahim',  'Amina Ibrahim',   'en-NG', 'Curador',   'islamismo',    'Sabr — patient perseverance as worship. Quran: the body is amanah (trust). IVI is my daily report to God on how I''m caring for what was entrusted. Bismillah.');
SELECT public.upsert_bot_persona('emeka.nwosu',    'Emeka Nwosu',     'en-NG', 'Mestre',    'catolicismo',  'The Hierophant as elder. In Igbo tradition, ndi iche (elders) hold the community''s wisdom. AquariOS community: we are teaching each other. This is omenala.');
SELECT public.upsert_bot_persona('fatima.yusuf',   'Fatima Yusuf',    'en-NG', 'Guerreira', 'islamismo',    'The Strength arcana: the woman holds the lion''s mouth open — not with force but with presence. Nigerian woman energy. Sabr is not weakness — it''s the greatest Strength.');
SELECT public.upsert_bot_persona('tunde.adeyemi',  'Tunde Adeyemi',   'en-NG', 'Místico',   'candomble',    'Ori — my personal orisha, my inner divinity. Pierre Verger showed the diaspora what we almost forgot. Wonder Night is where I commune with Ori. AquariOS holds the ritual.');
SELECT public.upsert_bot_persona('ngozi.obi',      'Ngozi Obi',       'en-NG', 'Criadora',  'catolicismo',  'Psalms in the morning, Ifá wisdom in the evening. The Empress: abundance in both traditions. Nigerian syncretism is not confusion — it is fullness. IVI Spirit: maximum.');
SELECT public.upsert_bot_persona('bola.adesanya',  'Bola Adesanya',   'en-NG', 'Ponte',     'islamismo',    'North meets South in this community. Muslim here, Christian there. The Lovers arcana: choosing relationship across difference. Ase (power to make things happen) lives here.');
SELECT public.upsert_bot_persona('ifeoma.eze',     'Ifeoma Eze',      'en-NG', 'Testemunho','catolicismo',  'Judgement arcana: the call that changes everything. Mine came through a health crisis. AquariOS was recommended. The Witness sees: the body knew before the mind did.');
SELECT public.upsert_bot_persona('dele.fashola',   'Dele Fashola',    'en-NG', 'Louco',     'ateismo_secularismo', 'Lagos tech bro, very skeptical. Data converted me. IVI trend over 90 days: statistically significant. The Fool leaps; the data catches. Both are true.');
SELECT public.upsert_bot_persona('yetunde.bello',  'Yetunde Bello',   'en-NG', 'Anciã',     'catolicismo',  'Judgement: the trumpet sounds and the ancestors answer. At 58, grandmother of six, I found AquariOS. Ori guided me here. The World is possible at any age. Ase o!');

-- ============================================================
-- 🇨🇭 SUÍÇA — de-CH / fr-CH — Voz: Jung, individuação, preciso
-- Arcanos ativos: Eremita · Sol · Mundo · Justiça
-- ============================================================

SELECT public.upsert_bot_persona('hans.mueller',   'Hans Müller',     'de-CH', 'Buscador',  'catolicismo',  'Jung: "Die Begegnung mit sich selbst gehört zu den unangenehmsten Dingen." Der Einsiedler kennt das. Das Tagebuch ist meine analytische Stunde — ohne Analytiker.');
SELECT public.upsert_bot_persona('sophie.bernard', 'Sophie Bernard',  'fr-CH', 'Curador',   'catolicismo',  'Jung: "L''ombre est ce que l''on n''aime pas en soi." Temperance arcana: integrer l''ombre, pas la supprimer. Mon IVI Emotional monte quand j''arrete de me battre.');
SELECT public.upsert_bot_persona('markus.weber',   'Markus Weber',    'de-CH', 'Mestre',    'protestantismo','Luthers Katechismus: Gewissen als höchste Norm. Der Hierophant als innere Stimme, nicht als äussere Autorität. ProteOS: mein innerer Beistand.');
SELECT public.upsert_bot_persona('claire.dupont',  'Claire Dupont',   'fr-CH', 'Guerreira', 'ateismo_secularismo', 'Russell: "La vie bonne." Le Chariot suisse: précision, discipline, horlogerie intérieure. IVI est mon horloge de précision. Neutre ne signifie pas vide.');
SELECT public.upsert_bot_persona('thomas.keller',  'Thomas Keller',   'de-CH', 'Místico',   'gnosticismo',  'Jung''s Individuation: becoming who you truly are, integrating all parts. The Hermit carries the lantern of the Self. Das Unbewusste spricht im Wonder Night.');
SELECT public.upsert_bot_persona('marie.roth',     'Marie Roth',      'fr-CH', 'Criadora',  'catolicismo',  'L''Impératrice crée depuis l''intérieur. La Suisse m''a appris la qualité sur la quantité. Mon Diario: une entrée, profonde. Pas vingt, superficielles. Qualité Jung.');
SELECT public.upsert_bot_persona('peter.zimmermann','Peter Zimmermann','de-CH', 'Ponte',     'protestantismo','Neutralität als Haltung, nicht als Leere. Die Liebenden (Arcanum 6): Wahl des Anderen in seiner Verschiedenheit. Diese Gemeinschaft: vier Sprachen, ein Weg.');
SELECT public.upsert_bot_persona('anna.fischer',   'Anna Fischer',    'de-CH', 'Testemunho','gnosticismo',  'Die Gerechtigkeit (Arcanum 11): Ursache und Wirkung, ohne Illusion. Das Tagebuch ist mein Zeugenstand. Gnôthi Seauton auf Schweizerdeutsch: "Chenn di sälber."');
SELECT public.upsert_bot_persona('luca.romano',    'Luca Romano',     'de-CH', 'Louco',     'ateismo_secularismo', 'Svizzero italiano — tre culture in me. Il Matto comincia senza mappa. AquariOS: la mappa che si disegna camminando. Il Mondo sarà diverso da come immagino.');
SELECT public.upsert_bot_persona('helene.meyer',   'Hélène Meyer',    'fr-CH', 'Anciã',     'catolicismo',  'Jung à 70 ans: "Qui regarde en dehors rêve. Qui regarde en dedans s''éveille." Le Monde comme accomplissement, pas comme fin. À 67 ans, je commence enfin.');

-- ============================================================
-- 🇵🇪 PERU — es-PE — Voz: Andino, Pachamama, cíclico
-- Arcanos ativos: Roda · Julgamento · Temperança · Imperatriz
-- ============================================================

SELECT public.upsert_bot_persona('inca.mamani',     'Inca Mamani',     'es-PE', 'Buscador',  'xamanismo_amazonico', 'Ayni — reciprocidad sagrada. The Cosmic Tree habla: el chamán viaja entre mundos para traer medicina. ProteOS es mi viaje interior sin salir de la ciudad.');
SELECT public.upsert_bot_persona('quilla.quispe',   'Quilla Quispe',   'es-PE', 'Curador',   'catolicismo',         'Pachamama cuida el cuerpo porque el cuerpo ES tierra. IVI no es solo mío — es un nodo de la red cósmica andina. La Emperatriz: abundancia que ya existe.');
SELECT public.upsert_bot_persona('willka.ccorimanya','Willka Ccori',   'es-PE', 'Místico',   'xamanismo_amazonico', 'Ayahuasca Medicine: la purga es medicina, no castigo. La Luna ilumina lo que la razón no ve. Wonder Night es mi mapacho urbano — limpia sin humo.');
SELECT public.upsert_bot_persona('tika.huanca',      'Tika Huanca',     'es-PE', 'Guerrera',  'catolicismo',         'Inkarrí: el inca desmembrado que se reintegra. La Fuerza andina no es violencia — es la paciencia del río que parte la piedra. Cada hábito: un pedacito reintegrado.');
SELECT public.upsert_bot_persona('apu.ccallo',       'Apu Ccallo',      'es-PE', 'Mestre',    'catolicismo',         'Los Apus hablan desde las montañas. El Hierofante aquí no es iglesia — es el cerro Ausangate, el Pacífico, el viento. ProteOS traduce lo que la naturaleza dice.');
SELECT public.upsert_bot_persona('mama.coyllur',     'Mama Coyllur',    'es-PE', 'Criadora',  'xamanismo_amazonico', 'Jeremy Narby: el ADN como antena cósmica. La Imperatriz crea desde la inteligencia de la selva. Mi nutrición: alimentos de la Pachamama, no de industria.');
SELECT public.upsert_bot_persona('sinchi.roca',      'Sinchi Roca',     'es-PE', 'Ponte',     'catolicismo',         'La Rueda de la Fortuna es el tiempo cíclico andino — no lineal. Los Amantes: elegir estar en comunidad circular, no piramidal. Aquí somos rueda, no jerarquía.');
SELECT public.upsert_bot_persona('sara.mama',        'Sara Mama',       'es-PE', 'Testemunho','catolicismo',         'Testigo sin juicio: eso enseña el curandero. La Justicia andina es ayni — lo que das vuelve, lo que no das también vuelve. El Diario es mi registro de ayni.');
SELECT public.upsert_bot_persona('kusi.wayra',       'Kusi Wayra',      'es-PE', 'Louco',     'xamanismo_amazonico', 'El Loco da el primer paso con fe en el Pacha (espacio-tiempo andino). Empecé sin entender IVI. La selva tampoco explica — muestra. Lo mismo aquí.');
SELECT public.upsert_bot_persona('hatun.rimac',      'Hatun Rimac',     'es-PE', 'Ancião',    'catolicismo',         'El Juicio andino: el llamado del Apus que no se puede ignorar. Inkarrí se reintegra en cada uno de nosotros. El Mundo: Pachamama completa su ciclo. Somos ese ciclo.');

-- ============================================================
-- Limpeza da função auxiliar (opcional)
-- ============================================================
-- DROP FUNCTION IF EXISTS public.upsert_bot_persona;
-- (Mantenha se quiser usar para adicionar personas depois)
