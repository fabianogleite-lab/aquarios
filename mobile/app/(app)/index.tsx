import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Animated, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { spacing } from '../../lib/theme';

// ─── Paleta clara/contemporânea da home (escopo local — não afeta outras telas) ──
const P = {
  bg: '#F6F4F0',
  card: '#FFFFFF',
  text: '#2B2A26',
  textSecondary: '#5C5A53',
  textMuted: '#8A8678',
  textDimmed: '#9C998F',
  textFaint: '#A6A296',
  border: '#ECE9E2',
  link: '#378ADD',
  gold: '#B8952A',
  good: '#3B8C6B',
};

const DIM_COLORS: Record<string, string> = {
  bio: '#3B8C6B', mental: '#7F77DD', spirit: '#D85A30', social: '#378ADD',
};

// ─── IVI helpers (espelhado do hygeios.tsx) ───────────────────────────────────
interface Scores { bio: number; mental: number; spirit: number; social: number; overall: number }

function calcIVI(mealsToday: number, mealsWeek: number, diaryWeek: number, diaryUnique: number, wonderMonth: number, postsMonth: number, streak: number, moodScore: number = 0, gratitudeScore: number = 0, hydrationScore: number = 0, relationshipScore: number = 0): Scores {
  let   bio    = Math.min(100, Math.round((mealsWeek / 21) * 70 + (mealsToday / 3) * 30));
  if (hydrationScore > 0) bio = Math.round(bio * 0.6 + hydrationScore * 0.4);
  let   mental = Math.min(100, Math.round((diaryWeek / 5) * 60 + (diaryUnique / 15) * 40));
  if (moodScore > 0) mental = Math.round(mental * 0.6 + moodScore * 0.4);
  let   spirit = Math.min(100, Math.round((wonderMonth / 4) * 50 + (diaryUnique / 10) * 50));
  if (gratitudeScore > 0) spirit = Math.round(spirit * 0.6 + gratitudeScore * 0.4);
  let   social = Math.min(100, Math.round((postsMonth / 10) * 60 + Math.min(streak, 30) / 30 * 40));
  if (relationshipScore > 0) social = Math.round(social * 0.6 + relationshipScore * 0.4);
  const overall = Math.round(bio * 0.35 + mental * 0.30 + spirit * 0.20 + social * 0.15);
  return { bio, mental, spirit, social, overall };
}

function greeting(name: string, t: any): string {
  const h = new Date().getHours();
  const n = name.toUpperCase();
  if (h < 12) return t('homeUI.morning', { name: n });
  if (h < 18) return t('homeUI.afternoon', { name: n });
  return t('homeUI.evening', { name: n });
}

function iviLabel(s: number) {
  if (s >= 81) return { key: 'excellent', color: P.good };
  if (s >= 61) return { key: 'good',       color: P.good };
  if (s >= 41) return { key: 'attention',  color: P.gold };
  if (s >= 21) return { key: 'alert',      color: '#D85A30' };
  return           { key: 'critical',      color: '#C0392B' };
}

function iviDescription(scores: Scores, t: any): string {
  const dn = (k: string) => t(`homeUI.dims.${k}.label`);
  const map: Array<[keyof Scores, string]> = [['bio','fisico'],['mental','mental'],['social','social'],['spirit','espiritual']];
  const weak = map.filter(([sk]) => (scores[sk] as number) < 50).map(([, dk]) => dn(dk));
  if (weak.length === 0) return t('homeUI.allStable');
  const strongEntry = map.find(([sk, dk]) => !weak.includes(dn(dk)) && (scores[sk] as number) > 65);
  const strong = strongEntry ? dn(strongEntry[1]) : null;
  return `${strong ? t('homeUI.strongIn', { dim: strong }) : ''}${t('homeUI.attentionIn', { dims: weak.join(' · ') })}`;
}

// ─── Módulos (drawer) ──────────────────────────────────────────────────────────
type HomeModule = { slug: string; icon: string; title: string; desc: string; status: string };

const ROUTE_MAP: Record<string, string> = {
  proteos: '/proteos', hygeios: '/hygeios', humor: '/humor', gratidao: '/gratidao', diario: '/diario',
  nutricao: '/nutricao', comunidades: '/comunidades', wonder: '/wonder-night',
  hidratacao: '/hidratacao', relacionamentos: '/relacionamentos', jornada: '/jornada',
  asclepios: '/telemedicina', rapidoc: '/telemedicina', panaceia: '/store', tokens: '/store',
};

const FALLBACK_MODULES: HomeModule[] = [
  { slug: 'humor',       icon: '😊', title: 'Check-in de Humor', desc: '',  status: 'active' },
  { slug: 'gratidao',    icon: '🙏', title: 'Gratidão',          desc: '',  status: 'active' },
  { slug: 'diario',      icon: '✎',  title: 'Diário do Ser',     desc: '',  status: 'active' },
  { slug: 'nutricao',    icon: '🥗', title: 'Nutrição',          desc: '',  status: 'active' },
  { slug: 'comunidades', icon: '👥', title: 'Comunidades',       desc: '',  status: 'active' },
  { slug: 'wonder',      icon: '🌙', title: 'Descanso',          desc: '',  status: 'active' },
  { slug: 'hidratacao',  icon: '💧', title: 'Hidratação',        desc: '',  status: 'active' },
  { slug: 'relacionamentos', icon: '🫂', title: 'Relacionamentos', desc: '', status: 'active' },
  { slug: 'jornada',     icon: '🔮', title: 'Jornada',           desc: '',  status: 'active' },
  { slug: 'asclepios',   icon: '⚕',  title: 'Saúde',             desc: '',  status: 'active' },
];

// ─── Conteúdo "Pra você" — curado por ora; seam pra plugar o motor de cache de
// 1000+ prompts/notícias quando o pipeline de conteúdo estiver pronto ─────────
const PRA_VOCE_FALLBACK = [
  'Sono e cortisol: o que a ciência diz sobre dormir tarde',
  '5 perguntas pra entender sua relação com comida',
  'Magnésio e sono: vale a suplementação?',
  '3 sinais de que você está em sobrecarga mental',
  'Respiração 4-7-8: técnica simples pra ansiedade leve',
  'Como a luz da manhã regula seu sono',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Chip horizontal com barra de progresso discreta ──────────────────────────
function ChipRow({ children, onScroll }: { children: React.ReactNode; onScroll: (pct: number, visibleFrac: number) => void }) {
  const thumbX = useRef(new Animated.Value(0)).current;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      onScroll={(e) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
        const max = contentSize.width - layoutMeasurement.width;
        const pct = max > 0 ? contentOffset.x / max : 0;
        const visibleFrac = Math.min(1, layoutMeasurement.width / contentSize.width);
        onScroll(pct, visibleFrac);
      }}
      scrollEventThrottle={16}
      contentContainerStyle={{ gap: 10, paddingRight: 8 }}
    >
      {children}
    </ScrollView>
  );
}

function ProgressTrack({ pct, frac }: { pct: number; frac: number }) {
  const widthPct = Math.max(12, Math.min(100, frac * 100));
  const leftPct = pct * (100 - widthPct);
  return (
    <View style={s.track}>
      <View style={[s.thumb, { width: `${widthPct}%`, left: `${leftPct}%` }]} />
    </View>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Aquariano';

  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Scores>({ bio: 0, mental: 0, spirit: 0, social: 0, overall: 0 });
  const [streak, setStreak] = useState(0);
  const [modules, setModules] = useState<HomeModule[]>(FALLBACK_MODULES);
  const [praVoce, setPraVoce] = useState<string[]>(PRA_VOCE_FALLBACK);
  const [comunidadeItens, setComunidadeItens] = useState<string[]>([]);
  const [sinaisChips, setSinaisChips] = useState<Array<{ key: string; kind: 'info' | 'quiz'; text?: string; question?: string; group?: string; opts?: [string, string][] }>>([]);
  const [chipAnswers, setChipAnswers] = useState<Record<string, string>>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerX = useRef(new Animated.Value(-320)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const [message, setMessage] = useState('');
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);

  const [progress, setProgress] = useState<Record<string, { pct: number; frac: number }>>({
    sinais: { pct: 0, frac: 1 }, comunidades: { pct: 0, frac: 1 }, pravoce: { pct: 0, frac: 1 },
  });

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.timing(drawerX, { toValue: 0, duration: 320, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
  };
  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(drawerX, { toValue: -320, duration: 280, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };

  const loadData = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const weekAgo  = new Date(now.getTime() - 7  * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000);

    const [mt, mw, dw, wm, dd, md, posts, moodRes, gratRes, hydRes, relRes, modsRes, communityRes] = await Promise.all([
      supabase.from('meals').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',todayStart.toISOString()),
      supabase.from('meals').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',weekAgo.toISOString()),
      supabase.from('diario_entries').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',weekAgo.toISOString()),
      supabase.from('wonder_night_purchases').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',monthAgo.toISOString()),
      supabase.from('diario_entries').select('created_at').eq('user_id',user.id).gte('created_at',ninetyDaysAgo.toISOString()),
      supabase.from('meals').select('created_at').eq('user_id',user.id).gte('created_at',ninetyDaysAgo.toISOString()),
      supabase.from('community_posts').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',monthAgo.toISOString()),
      supabase.from('mood_logs').select('mood').eq('user_id',user.id).gte('created_at',weekAgo.toISOString()),
      supabase.from('gratitude_logs').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',weekAgo.toISOString()),
      supabase.from('hydration_logs').select('amount_ml').eq('user_id',user.id).gte('created_at',todayStart.toISOString()),
      supabase.from('relationship_logs').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',weekAgo.toISOString()),
      supabase.from('aquarios_modules').select('slug,status'),
      supabase.from('community_posts').select('title').order('created_at',{ascending:false}).limit(6),
    ]);

    const diaryUnique = new Set((dd.data||[]).filter((r:any) => new Date(r.created_at) >= monthAgo).map((r:any) => new Date(r.created_at).toDateString())).size;
    const allDates = [...(dd.data||[]).map((r:any)=>r.created_at),...(md.data||[]).map((r:any)=>r.created_at)];
    const unique = [...new Set(allDates.map(d=>new Date(d).toDateString()))].sort().reverse();
    let str = 0;
    for (let i = 0; i < unique.length; i++) {
      const exp = new Date(Date.now() - i * 86400000).toDateString();
      if (unique[i] === exp) str++; else break;
    }
    setStreak(str);
    const moodVals = (moodRes.data || []).map((m: any) => m.mood).filter((n: any) => typeof n === 'number');
    const moodScore = moodVals.length ? (moodVals.reduce((a: number, b: number) => a + b, 0) / moodVals.length) * 10 : 0;
    const gratitudeScore = Math.min(100, ((gratRes.count ?? 0) / 7) * 100);
    const hydMlToday = (hydRes.data || []).reduce((a: number, r: any) => a + (r.amount_ml || 0), 0);
    const hydrationScore = Math.min(100, (hydMlToday / 2000) * 100);
    const relationshipScore = Math.min(100, ((relRes.count ?? 0) / 7) * 100);
    const computed = calcIVI(mt.count??0, mw.count??0, dw.count??0, diaryUnique, wm.count??0, posts.count??0, str, moodScore, gratitudeScore, hydrationScore, relationshipScore);
    setScores(computed);
    if (modsRes.data && modsRes.data.length) {
      const statusBySlug: Record<string, string> = {};
      modsRes.data.forEach((m: any) => { statusBySlug[m.slug] = m.status; });
      setModules(FALLBACK_MODULES.map(m => ({ ...m, status: statusBySlug[m.slug] ?? m.status })));
    }

    const titles = (communityRes.data || []).map((p: any) => p.title).filter(Boolean);
    setComunidadeItens(titles.length ? titles : [
      'Novo tema no círculo Bem-estar Físico: jejum intermitente',
      '3 pessoas perto de você completaram a meta da semana',
      'Pergunta em aberto no círculo Espiritual',
    ]);
    setPraVoce(shuffle(PRA_VOCE_FALLBACK));

    const infoSignals: { key: string; kind: 'info'; text: string }[] = [];
    if (str >= 3) infoSignals.push({ key: 'sig-streak', kind: 'info', text: `${str} dias seguidos com registro de hábitos` });
    if (computed.bio > 70) infoSignals.push({ key: 'sig-bio', kind: 'info', text: 'Físico estável — continue assim' });
    if (computed.social < 40) infoSignals.push({ key: 'sig-social', kind: 'info', text: 'Pouca interação social essa semana' });
    if (computed.spirit > 75) infoSignals.push({ key: 'sig-spirit', kind: 'info', text: 'Espiritual em alta' });
    if (infoSignals.length === 0) infoSignals.push({ key: 'sig-stable', kind: 'info', text: 'Tudo estável por aqui' });

    const quizChips: { key: string; kind: 'quiz'; question: string; group: string; opts: [string, string][] }[] = [
      { key: 'quiz-mood', kind: 'quiz', question: 'Como você está agora?', group: 'mood', opts: [['2','😞'],['5','😐'],['7','🙂'],['10','😄']] },
      { key: 'quiz-hidrat', kind: 'quiz', question: 'Bebeu água hoje?', group: 'hidrat', opts: [['0','Não'],['500','Pouco'],['1500','Bastante']] },
      { key: 'quiz-social', kind: 'quiz', question: 'Conversou com alguém de verdade hoje?', group: 'social', opts: [['nao','Não'],['sim','Sim']] },
      { key: 'quiz-espirito', kind: 'quiz', question: 'Teve um momento de pausa hoje?', group: 'espirito', opts: [['nao','Não'],['sim','Sim']] },
    ];

    setSinaisChips(shuffle([...infoSignals, ...quizChips]));
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadData(); }, [user?.id]));

  const level = iviLabel(scores.overall);

  const answerChip = async (group: string, val: string) => {
    setChipAnswers((prev) => ({ ...prev, [group]: val }));
    if (!user?.id) return;
    try {
      if (group === 'mood') {
        await supabase.from('mood_logs').insert({ user_id: user.id, mood: Number(val), energy: null, intention: null });
      } else if (group === 'hidrat') {
        await supabase.from('hydration_logs').insert({ user_id: user.id, amount_ml: Number(val) });
      } else if (group === 'social') {
        await supabase.from('relationship_logs').insert({ user_id: user.id, person: null, kind: 'conversa', quality: val === 'sim' ? 8 : 3, note: null });
      } else if (group === 'espirito') {
        await supabase.from('diario_entries').insert({ user_id: user.id, content: val === 'sim' ? 'Tive um momento de pausa hoje.' : 'Não tive pausa hoje.', category: 'pausa' });
      }
    } catch {
      // resposta rápida nunca deve travar a UI — falha silenciosa, próximo loadData reconcilia
    }
  };

  const goProteos = (params: Record<string, string>) => {
    setMessage('');
    setAttachMenuOpen(false);
    router.push({ pathname: '/proteos', params } as any);
  };

  const sendFromHome = () => {
    if (!message.trim()) return;
    goProteos({ initialText: message.trim() });
  };

  const openCameraFromHome = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissão negada', 'Permita acesso à câmera nas configurações.'); return; }
    goProteos({ autoCamera: '1' });
  };
  const openGalleryFromHome = () => goProteos({ autoGallery: '1' });
  const openDocumentFromHome = () => goProteos({ autoDocument: '1' });

  return (
    <View style={{ flex: 1, backgroundColor: P.bg }}>
      <ScrollView style={s.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        <View style={s.headerRow}>
          <TouchableOpacity onPress={openDrawer} style={s.menuBtn} accessibilityLabel="Abrir menu de módulos">
            <Text style={s.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.greeting}>{greeting(displayName, t)}</Text>
            <Text style={s.title}>{t('homeUI.heroTitle')}</Text>
          </View>
        </View>

        <TouchableOpacity style={s.iviRow} onPress={() => router.push('/hygeios' as any)}>
          <Text style={s.iviLabel}>iVi</Text>
          {loading
            ? <ActivityIndicator size="small" color={P.text} />
            : <>
                <Text style={s.iviScore}>{scores.overall}</Text>
                <Text style={[s.iviBand, { color: level.color }]}>· {t('homeUI.bands.' + level.key)}</Text>
                <Text style={s.iviDesc} numberOfLines={1}>· {iviDescription(scores, t)}</Text>
              </>
          }
          <Text style={s.chev}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.proCta} onPress={() => router.push('/store' as any)}>
          <Text style={s.proCtaSpark}>✦</Text>
          <Text style={s.proCtaText}>Recursos avançados com o</Text>
          <Text style={s.proCtaGold}>Plano Pro</Text>
          <Text style={s.proCtaChev}>›</Text>
        </TouchableOpacity>

        <View style={s.section}>
          <Text style={s.sectionLabel}>{t('homeUI.signalsActive')}</Text>
          <ChipRow onScroll={(pct, frac) => setProgress(p => ({ ...p, sinais: { pct, frac } }))}>
            {sinaisChips.map((c) => c.kind === 'info' ? (
              <View key={c.key} style={s.chip}>
                <Text style={s.chipText}>{c.text}</Text>
                <Text style={s.chipHint}>sinal automático</Text>
              </View>
            ) : (
              <View key={c.key} style={s.chip}>
                <Text style={s.chipText}>{c.question}</Text>
                <View style={s.optRow}>
                  {c.opts!.map(([val, label]) => (
                    <Pressable
                      key={val}
                      onPress={() => answerChip(c.group!, val)}
                      style={[s.opt, chipAnswers[c.group!] === val && s.optSel]}
                    >
                      <Text style={[s.optText, chipAnswers[c.group!] === val && s.optTextSel]}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </ChipRow>
          <ProgressTrack pct={progress.sinais.pct} frac={progress.sinais.frac} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Comunidades</Text>
          <ChipRow onScroll={(pct, frac) => setProgress(p => ({ ...p, comunidades: { pct, frac } }))}>
            {comunidadeItens.map((txt, i) => (
              <TouchableOpacity key={i} style={s.chip} onPress={() => router.push('/comunidades' as any)}>
                <Text style={s.chipLinkText}>{txt}</Text>
              </TouchableOpacity>
            ))}
          </ChipRow>
          <ProgressTrack pct={progress.comunidades.pct} frac={progress.comunidades.frac} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Pra você</Text>
          <ChipRow onScroll={(pct, frac) => setProgress(p => ({ ...p, pravoce: { pct, frac } }))}>
            {praVoce.map((txt, i) => (
              <TouchableOpacity key={i} style={s.chip} onPress={() => goProteos({ initialText: txt })}>
                <Text style={s.chipLinkText}>{txt}</Text>
              </TouchableOpacity>
            ))}
          </ChipRow>
          <ProgressTrack pct={progress.pravoce.pct} frac={progress.pravoce.frac} />
        </View>

      </ScrollView>

      {/* ── Barra do ProteOS — entrada única de texto/voz/imagem/arquivo ── */}
      <View style={s.bottomBarWrap}>
        {attachMenuOpen && (
          <View style={s.attachMenu}>
            <TouchableOpacity style={s.attachItem} onPress={openCameraFromHome}>
              <Text style={s.attachIcon}>📷</Text><Text style={s.attachLabel}>Câmera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.attachItem} onPress={openGalleryFromHome}>
              <Text style={s.attachIcon}>🖼️</Text><Text style={s.attachLabel}>Foto/Vídeo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.attachItem} onPress={openDocumentFromHome}>
              <Text style={s.attachIcon}>📄</Text><Text style={s.attachLabel}>Arquivo</Text>
              <Text style={s.attachHint}>converte p/ texto</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={s.bottomBar}>
          <TouchableOpacity style={s.plusBtn} onPress={() => setAttachMenuOpen((v) => !v)} accessibilityLabel="Anexar arquivo, foto ou vídeo">
            <Text style={s.plusIcon}>+</Text>
          </TouchableOpacity>
          <TextInput
            style={s.bottomInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Pergunte ao ProteOS..."
            placeholderTextColor={P.textFaint}
            onFocus={() => setAttachMenuOpen(false)}
          />
          <TouchableOpacity style={s.micBtn} onPress={() => goProteos({})} accessibilityLabel="Falar por voz">
            <Text style={s.micIcon}>🎙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.sendBtn} onPress={sendFromHome} disabled={!message.trim()} accessibilityLabel="Enviar mensagem">
            <Text style={s.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Gaveta lateral de módulos ── */}
      {drawerOpen && (
        <Pressable style={s.overlay} onPress={closeDrawer}>
          <Animated.View style={[s.overlayFill, { opacity: overlayOpacity }]} />
        </Pressable>
      )}
      <Animated.View style={[s.drawer, { transform: [{ translateX: drawerX }] }]}>
        <View style={s.drawerHeader}>
          <Text style={s.drawerTitle}>Módulos</Text>
          <TouchableOpacity onPress={closeDrawer} accessibilityLabel="Fechar menu">
            <Text style={s.drawerClose}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }}>
          {modules.map((mod) => {
            const route = ROUTE_MAP[mod.slug];
            const live = mod.status === 'active' && !!route;
            return (
              <TouchableOpacity
                key={mod.slug}
                style={s.drawerItem}
                onPress={() => {
                  closeDrawer();
                  if (live) router.push(route as any);
                  else router.push({ pathname: '/coming-soon', params: { module: mod.slug } } as any);
                }}
              >
                <Text style={s.drawerIcon}>{mod.icon}</Text>
                <Text style={s.drawerItemText}>{t('homeUI.modTitles.' + mod.slug, mod.title)}</Text>
                {!live && <Text style={s.drawerSoon}>em breve</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={s.drawerFooter}>
          <TouchableOpacity style={s.drawerItem} onPress={() => { closeDrawer(); router.push('/store' as any); }}>
            <Text style={s.drawerIcon}>👑</Text>
            <Text style={[s.drawerItemText, { color: P.gold }]}>Plano Pro</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.drawerItem} onPress={() => { closeDrawer(); router.push('/configuracoes' as any); }}>
            <Text style={s.drawerIcon}>⚙</Text>
            <Text style={s.drawerItemText}>Configurações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.drawerItem} onPress={() => { closeDrawer(); router.push('/divergencias' as any); }}>
            <Text style={s.drawerIcon}>📊</Text>
            <Text style={s.drawerItemText}>Divergências DEVPACK v4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.drawerItem} onPress={() => { closeDrawer(); router.push('/arkhe' as any); }}>
            <Text style={s.drawerIcon}>🏛</Text>
            <Text style={s.drawerItemText}>Arkhe Labs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.drawerItem, { borderBottomWidth: 0 }]} onPress={() => { closeDrawer(); router.push({ pathname: '/coming-soon', params: { module: 'ajuda' } } as any); }}>
            <Text style={s.drawerIcon}>❓</Text>
            <Text style={s.drawerItemText}>Ajuda</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, marginBottom: 16 },
  menuBtn: { padding: 6, marginLeft: -6 },
  menuIcon: { fontSize: 22, color: P.text },
  greeting: { fontSize: 11, color: P.textDimmed, letterSpacing: 0.5, marginBottom: 4 },
  title: { fontSize: 17, fontWeight: '600', color: P.text },

  iviRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.lg, marginBottom: 14 },
  iviLabel: { fontSize: 13, color: P.textSecondary },
  iviScore: { fontSize: 15, fontWeight: '700', color: P.text },
  iviBand: { fontSize: 13, fontWeight: '600' },
  iviDesc: { fontSize: 13, color: P.textFaint, flexShrink: 1 },
  chev: { fontSize: 14, color: P.textFaint, marginLeft: 'auto' },

  proCta: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.lg, marginBottom: 18 },
  proCtaSpark: { fontSize: 13, color: P.gold },
  proCtaText: { fontSize: 12, color: P.textMuted },
  proCtaGold: { fontSize: 12, color: P.gold, fontWeight: '600' },
  proCtaChev: { fontSize: 11, color: P.gold },

  section: { marginBottom: 18, paddingLeft: spacing.lg },
  sectionLabel: { fontSize: 11.5, color: P.textDimmed, letterSpacing: 0.5, marginBottom: 8 },

  chip: { width: 150, backgroundColor: P.card, borderRadius: 14, padding: 12 },
  chipText: { fontSize: 12.5, color: P.textSecondary, lineHeight: 17, marginBottom: 8 },
  chipLinkText: { fontSize: 12.5, color: P.textSecondary, lineHeight: 18 },
  chipHint: { fontSize: 11, color: P.textDimmed },
  optRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  opt: { borderWidth: 0.5, borderColor: '#E2DDD8', backgroundColor: '#FAF9F6', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 },
  optSel: { backgroundColor: P.text, borderColor: P.text },
  optText: { fontSize: 12, color: P.textSecondary },
  optTextSel: { color: P.bg },

  track: { height: 3, backgroundColor: '#E6E2D8', borderRadius: 2, marginTop: 6, marginRight: spacing.lg, overflow: 'hidden' },
  thumb: { position: 'absolute', top: 0, height: '100%', backgroundColor: '#C8C3B6', borderRadius: 2 },

  bottomBarWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingBottom: 18, paddingTop: 8 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: P.card, borderRadius: 24, paddingHorizontal: 8, paddingVertical: 6 },
  plusBtn: { padding: 8 },
  plusIcon: { fontSize: 20, color: P.textMuted },
  bottomInput: { flex: 1, fontSize: 14, color: P.text, paddingHorizontal: 4 },
  micBtn: { padding: 8 },
  micIcon: { fontSize: 16 },
  sendBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: P.text, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { fontSize: 16, color: P.bg, fontWeight: '700' },

  attachMenu: { backgroundColor: P.card, borderRadius: 16, padding: 8, marginBottom: 8, alignSelf: 'flex-start', minWidth: 190 },
  attachItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12 },
  attachIcon: { fontSize: 16 },
  attachLabel: { fontSize: 13.5, color: P.text },
  attachHint: { fontSize: 10, color: P.textDimmed, marginLeft: 'auto' },

  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 },
  overlayFill: { flex: 1, backgroundColor: 'rgba(43,42,38,0.35)' },

  drawer: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 300, backgroundColor: P.card, zIndex: 20, paddingTop: 48, paddingHorizontal: 20, paddingBottom: 20 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  drawerTitle: { fontSize: 15, fontWeight: '600', color: P.text },
  drawerClose: { fontSize: 16, color: P.textMuted, padding: 6 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: P.border },
  drawerIcon: { fontSize: 18, width: 26 },
  drawerItemText: { fontSize: 14, color: P.text, flex: 1 },
  drawerSoon: { fontSize: 10, color: P.gold, fontWeight: '700', textTransform: 'uppercase' },
  drawerFooter: { borderTopWidth: 0.5, borderTopColor: P.border, paddingTop: 4 },
});
