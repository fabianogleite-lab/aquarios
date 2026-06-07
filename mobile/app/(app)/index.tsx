import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { FadeInView } from '../../components/FadeInView';
import { PressableScale } from '../../components/PressableScale';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

// ─── IVI helpers (espelhado do hygeios.tsx) ───────────────────────────────────
interface Scores { fisico: number; mental: number; espiritual: number; social: number; overall: number }

function calcIVI(mealsToday: number, mealsWeek: number, diaryWeek: number, diaryUnique: number, wonderMonth: number, postsMonth: number, streak: number, moodScore: number = 0, gratitudeScore: number = 0, hydrationScore: number = 0, relationshipScore: number = 0): Scores {
  let   fisico    = Math.min(100, Math.round((mealsWeek / 21) * 70 + (mealsToday / 3) * 30));
  if (hydrationScore > 0) fisico = Math.round(fisico * 0.6 + hydrationScore * 0.4); // Hidratação entra no Físico
  let   mental = Math.min(100, Math.round((diaryWeek / 5) * 60 + (diaryUnique / 15) * 40));
  if (moodScore > 0) mental = Math.round(mental * 0.6 + moodScore * 0.4); // Check-in de Humor entra no Mental
  let   espiritual = Math.min(100, Math.round((wonderMonth / 4) * 50 + (diaryUnique / 10) * 50));
  if (gratitudeScore > 0) espiritual = Math.round(espiritual * 0.6 + gratitudeScore * 0.4); // Gratidão entra no Espiritual
  let   social = Math.min(100, Math.round((postsMonth / 10) * 60 + Math.min(streak, 30) / 30 * 40));
  if (relationshipScore > 0) social = Math.round(social * 0.6 + relationshipScore * 0.4); // Relacionamentos entram no Social
  const overall = Math.round(fisico * 0.35 + mental * 0.30 + espiritual * 0.20 + social * 0.15);
  return { fisico, mental, espiritual, social, overall };
}

function greeting(name: string, t: any): string {
  const h = new Date().getHours();
  const n = name.toUpperCase();
  if (h < 12) return t('homeUI.morning', { name: n });
  if (h < 18) return t('homeUI.afternoon', { name: n });
  return t('homeUI.evening', { name: n });
}

function iviLabel(s: number) {
  if (s >= 81) return { key: 'excellent', color: colors.espiritual };
  if (s >= 61) return { key: 'good',       color: colors.primary };
  if (s >= 41) return { key: 'attention',  color: colors.warning };
  if (s >= 21) return { key: 'alert',      color: colors.social };
  return           { key: 'critical',      color: colors.error };
}

function iviDescription(scores: Scores, t: any): string {
  const dn = (k: string) => t(`homeUI.dims.${k}.label`);
  const map: Array<[keyof Scores, string]> = [['fisico','fisico'],['mental','mental'],['social','social'],['espiritual','espiritual']];
  const weak = map.filter(([sk]) => (scores[sk] as number) < 50).map(([, dk]) => dn(dk));
  if (weak.length === 0) return t('homeUI.allStable');
  const strongEntry = map.find(([sk, dk]) => !weak.includes(dn(dk)) && (scores[sk] as number) > 65);
  const strong = strongEntry ? dn(strongEntry[1]) : null;
  return `${strong ? t('homeUI.strongIn', { dim: strong }) : ''}${t('homeUI.attentionIn', { dims: weak.join(' · ') })}`;
}

// ─── Dimensões IVI 4D — V2.0604 ──────────────────────────────────────────────
const DIMS = [
  { key: 'fisico'    as const, i18n: 'fisico',     color: colors.fisico,    icon: '🫀' },
  { key: 'mental'    as const, i18n: 'mental',     color: colors.mental,    icon: '🧠' },
  { key: 'social'    as const, i18n: 'social',     color: colors.social,    icon: '👥' },
  { key: 'espiritual' as const, i18n: 'espiritual', color: colors.espiritual, icon: '✦' },
];

// ─── Módulos (dashboard-driven: status vem da tabela aquarios_modules) ─────────
type HomeModule = { slug: string; icon: string; title: string; desc: string; status: string };

// slug → rota real das ferramentas já construídas
const ROUTE_MAP: Record<string, string> = {
  proteos: '/proteos', hygeios: '/hygeios', humor: '/humor', gratidao: '/gratidao', diario: '/diario',
  nutricao: '/nutricao', comunidades: '/comunidades', wonder: '/wonder-night',
  hidratacao: '/hidratacao', relacionamentos: '/relacionamentos', jornada: '/jornada',
  asclepios: '/telemedicina', rapidoc: '/telemedicina', panaceia: '/store', tokens: '/store',
};

// Catálogo curado (fallback). O status efetivo é lido da tabela e mesclado por slug.
const FALLBACK_MODULES: HomeModule[] = [
  { slug: 'proteos',     icon: '💬', title: 'ProteOS',           desc: 'Assistente IA pessoal com memória',     status: 'active' },
  { slug: 'hygeios',     icon: '🧬', title: 'iVi',               desc: 'Índice de Vitalidade Integral',         status: 'active' },
  { slug: 'humor',       icon: '😊', title: 'Check-in de Humor', desc: 'Como você está agora — 5 segundos',     status: 'active' },
  { slug: 'gratidao',    icon: '🙏', title: 'Gratidão',          desc: 'Três coisas boas do seu dia',           status: 'active' },
  { slug: 'diario',      icon: '✎',  title: 'Diário do Ser',     desc: 'Reflexões diárias e autoconhecimento',  status: 'active' },
  { slug: 'nutricao',    icon: '🥗', title: 'Nutrição',          desc: 'Tracking nutricional inteligente',      status: 'active' },
  { slug: 'comunidades', icon: '👥', title: 'Comunidades',       desc: 'Círculos de crescimento coletivo',      status: 'active' },
  { slug: 'wonder',      icon: '🌙', title: 'Descanso',          desc: 'Rituais noturnos de transformação',     status: 'active' },
  { slug: 'hidratacao',  icon: '💧', title: 'Hidratação',        desc: 'Água do dia — meta diária',             status: 'active' },
  { slug: 'relacionamentos', icon: '🫂', title: 'Relacionamentos', desc: 'Conexões reais que importam',          status: 'active' },
  { slug: 'jornada',     icon: '🔮', title: 'Jornada',           desc: 'Arcano do dia · autoconhecimento',      status: 'active' },
  { slug: 'asclepios',   icon: '⚕',  title: 'Saúde',             desc: 'Consultas · Odontolar · Rapidoc',       status: 'active' },
  { slug: 'panaceia',    icon: '🛒', title: 'Loja',              desc: 'Produtos e recompensas do ecossistema', status: 'active' },
];

// ─── Componente ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Aquariano';

  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Scores>({ fisico: 0, mental: 0, espiritual: 0, social: 0, overall: 0 });
  const [streak, setStreak] = useState(0);
  const [modules, setModules] = useState<HomeModule[]>(FALLBACK_MODULES);

  const loadData = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const weekAgo  = new Date(now.getTime() - 7  * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000);

    const [mt, mw, dw, wm, dd, md, posts, moodRes, gratRes, hydRes, relRes, modsRes] = await Promise.all([
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
    setScores(calcIVI(mt.count??0, mw.count??0, dw.count??0, diaryUnique, wm.count??0, posts.count??0, str, moodScore, gratitudeScore, hydrationScore, relationshipScore));
    if (modsRes.data && modsRes.data.length) {
      const statusBySlug: Record<string, string> = {};
      modsRes.data.forEach((m: any) => { statusBySlug[m.slug] = m.status; });
      setModules(FALLBACK_MODULES.map(m => ({ ...m, status: statusBySlug[m.slug] ?? m.status })));
    }
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadData(); }, [user?.id]));

  const level = iviLabel(scores.overall);

  // Sinais ativos
  const signals: { color: string; text: string }[] = [];
  if (!loading) {
    if (scores.mental < 50) signals.push({ color: colors.error,      text: t('homeUI.sig.mentalLow', { score: scores.mental }) });
    if (scores.fisico    > 70) signals.push({ color: colors.fisico,     text: t('homeUI.sig.physicalStable', { streak }) });
    if (scores.social    < 40) signals.push({ color: colors.social,     text: t('homeUI.sig.joinCommunity') });
    if (scores.espiritual > 75) signals.push({ color: colors.espiritual,text: t('homeUI.sig.spiritHigh') });
    if (signals.length === 0) signals.push({ color: colors.espiritual, text: t('homeUI.sig.allStable') });
  }

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* ── HERO DARK ── */}
      <FadeInView>
        <View style={s.hero}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroGreeting}>{greeting(displayName, t)}</Text>
              <Text style={s.heroTitle}>{t('homeUI.heroTitle')}</Text>
            </View>
            <View style={s.shieldBadge}>
              <Text style={s.shieldIcon}>🛡</Text>
            </View>
          </View>

          <View style={s.iviRow}>
            <View style={s.iviCircle}>
              {loading
                ? <ActivityIndicator color={colors.textLight} size="small" />
                : <>
                    <Text style={s.iviScore}>{scores.overall}</Text>
                    <Text style={s.iviLabel}>{t('homeUI.integral')}</Text>
                  </>
              }
            </View>
            <View style={s.iviMeta}>
              <View style={[s.iviBadge, { backgroundColor: level.color + '33', borderColor: level.color + '66' }]}>
                <Text style={[s.iviBadgeText, { color: level.color }]}>{t('homeUI.bands.' + level.key)}</Text>
              </View>
              <Text style={s.iviDesc}>{loading ? t('homeUI.calculating') : iviDescription(scores, t)}</Text>
            </View>
          </View>
        </View>
      </FadeInView>

      {/* ── DIMENSÕES 2×2 ── */}
      <FadeInView delay={80}>
        <Text style={s.sectionLabel}>{t('homeUI.dimensionsActive')}</Text>
        <View style={s.dimGrid}>
          {DIMS.map((d) => {
            const score = scores[d.key as keyof Scores] as number;
            return (
              <View key={d.key} style={s.dimCard}>
                <View style={s.dimTop}>
                  <Text style={s.dimIcon}>{d.icon}</Text>
                  <Text style={s.dimScore}>{loading ? '—' : score}</Text>
                </View>
                <Text style={s.dimLabel}>{t('homeUI.dims.' + d.i18n + '.label')}</Text>
                <Text style={s.dimSub}>{t('homeUI.dims.' + d.i18n + '.sub')}</Text>
                <View style={s.dimTrack}>
                  <View style={[s.dimFill, { width: `${loading ? 0 : score}%`, backgroundColor: d.color }]} />
                </View>
              </View>
            );
          })}
        </View>
      </FadeInView>

      {/* ── SINAIS ATIVOS ── */}
      <FadeInView delay={160}>
        <Text style={s.sectionLabel}>{t('homeUI.signalsActive')}</Text>
        <View style={s.signalsCard}>
          {loading
            ? <ActivityIndicator color={colors.primary} />
            : signals.map((sig, i) => (
                <View key={i} style={[s.signalRow, i < signals.length - 1 && s.signalBorder]}>
                  <View style={[s.signalDot, { backgroundColor: sig.color }]} />
                  <Text style={s.signalText}>{sig.text}</Text>
                </View>
              ))
          }
        </View>
      </FadeInView>

      {/* ── MÓDULOS ── */}
      <FadeInView delay={240}>
        <Text style={s.sectionLabel}>{t('homeUI.modulesLabel')}</Text>
        {modules.map((mod, i) => {
          const route = ROUTE_MAP[mod.slug];
          const live = mod.status === 'active' && !!route;
          return (
            <FadeInView key={mod.slug} delay={240 + i * 50}>
              <PressableScale
                style={s.modCard}
                onPress={() => live
                  ? router.push(route as any)
                  : router.push({ pathname: '/coming-soon', params: { module: mod.slug } } as any)}
              >
                <Text style={s.modIcon}>{mod.icon}</Text>
                <View style={s.modContent}>
                  <Text style={s.modTitle}>{t('homeUI.modTitles.' + mod.slug, mod.title)}</Text>
                  <Text style={s.modDesc}>{t('homeUI.mods.' + mod.slug, mod.desc)}</Text>
                </View>
                {!live && <Text style={s.modSoon}>em breve</Text>}
                <Text style={s.modChevron}>›</Text>
              </PressableScale>
            </FadeInView>
          );
        })}
      </FadeInView>

      <View style={s.footer}>
        <Text style={s.footerText}>{t('homeUI.footer')}</Text>
        <Text style={s.footerSub}>{t('homeUI.footerSub')}</Text>
      </View>
    </ScrollView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Hero dark
  hero: { backgroundColor: colors.cardDark, padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  heroGreeting: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: spacing.xs },
  heroTitle: { fontSize: fontSize.title, fontWeight: '700', color: colors.textLight },
  shieldBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  shieldIcon: { fontSize: 18 },

  // IVI circle
  iviRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  iviCircle: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  iviScore: { fontSize: fontSize.hero, fontWeight: '700', color: colors.textLight, lineHeight: 28 },
  iviLabel: { fontSize: 9, fontWeight: '700', color: colors.textMuted, letterSpacing: 1 },
  iviMeta: { flex: 1 },
  iviBadge: { alignSelf: 'flex-start', borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 3, marginBottom: spacing.sm },
  iviBadgeText: { fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 0.5 },
  iviDesc: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 18 },

  // Seção labels
  sectionLabel: {
    fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 1.5, marginHorizontal: spacing.lg,
    marginTop: spacing.xl, marginBottom: spacing.md,
  },

  // Dimensões 2×2
  dimGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.md },
  dimCard: {
    width: '47%', backgroundColor: colors.card,
    borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  dimTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  dimIcon: { fontSize: 18 },
  dimScore: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  dimLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 2 },
  dimSub: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing.sm },
  dimTrack: { height: 3, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  dimFill: { height: '100%', borderRadius: 2 },

  // Sinais
  signalsCard: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    marginHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border,
    paddingVertical: spacing.xs,
  },
  signalRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  signalBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  signalDot: { width: 8, height: 8, borderRadius: 4 },
  signalText: { flex: 1, fontSize: fontSize.sm, color: colors.text },

  // Módulos
  modCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  modIcon: { fontSize: 22, marginRight: spacing.md },
  modContent: { flex: 1 },
  modTitle: { fontSize: fontSize.xl, fontWeight: '600', color: colors.text },
  modDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  modChevron: { fontSize: 22, color: colors.textMuted, marginLeft: spacing.sm },
  modSoon: { fontSize: fontSize.xs, color: colors.warning, fontWeight: '700', marginRight: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Footer
  footer: { alignItems: 'center', paddingVertical: spacing.xxxl, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xl },
  footerText: { color: colors.textMuted, fontSize: fontSize.sm },
  footerSub: { color: colors.textDimmed, fontSize: fontSize.xs, marginTop: spacing.xs, fontStyle: 'italic' },
});
