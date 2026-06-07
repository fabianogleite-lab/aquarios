import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

// IVI 4D — V2.0604 (Físico×0.35 + Mental×0.30 + Espiritual×0.20 + Social×0.15)
interface IVIScores {
  bio: number;    // Físico
  mental: number; // Mental
  spirit: number; // Espiritual
  social: number; // Social
  overall: number;
}

interface IVIData {
  mealsToday: number;
  mealsWeek: number;
  diaryWeek: number;
  diaryUniqueDays: number; // FIX-4: unique days with diary activity, caps at 1/day
  wonderMonth: number;
  postsMonth: number;      // Social: posts em comunidades no último mês
  streak: number;          // Social: dias consecutivos — espelha index.tsx
}

function calcIVI(data: IVIData): IVIScores {
  const bio    = Math.min(100, Math.round((data.mealsWeek / 21) * 70 + (data.mealsToday / 3) * 30));
  const mental = Math.min(100, Math.round((data.diaryWeek / 5) * 60 + (data.diaryUniqueDays / 15) * 40));
  // FIX-4: spirit uses unique diary days — max +5 spirit pts/day, prevents gaming
  const spirit = Math.min(100, Math.round((data.wonderMonth / 4) * 50 + (data.diaryUniqueDays / 10) * 50));
  // Social — padronizado com index.tsx (Decisão Conflito 2 / S24): 60% volume de posts + 40% consistência (streak, cap 30d)
  const social = Math.min(100, Math.round((data.postsMonth / 10) * 60 + Math.min(data.streak, 30) / 30 * 40));
  // Fórmula 4D aprovada — V2.0604
  const overall = Math.round(bio * 0.35 + mental * 0.30 + spirit * 0.20 + social * 0.15);
  return { bio, mental, spirit, social, overall };
}

// Faixas V1.0512: 0-20 CRÍTICO · 21-40 ALERTA · 41-60 ATENÇÃO · 61-80 BOM · 81-100 EXCELENTE
function getIVILevel(score: number): { label: string; status: string; color: string; action: string } {
  if (score >= 81) return { label: 'Excelente', status: 'EXCELENTE', color: '#2ecc71', action: 'Comunidades Excellence + badges desbloqueados' };
  if (score >= 61) return { label: 'Bom', status: 'BOM', color: colors.primary, action: 'Reforço positivo — mantenha o ritmo' };
  if (score >= 41) return { label: 'Atenção', status: 'ATENÇÃO', color: '#f39c12', action: 'Monitoramento silencioso ativo' };
  if (score >= 21) return { label: 'Alerta', status: 'ALERTA', color: '#e67e22', action: 'ProteOS: ajuste comportamental recomendado' };
  return { label: 'Crítico', status: 'CRÍTICO', color: colors.error, action: 'Intervenção — consulte um profissional' };
}

// Níveis Evolutivos V1.0512: Semente → Raiz → Tronco → Galho → Flor → Fruto → Semente Mestre
function getEvolutionLevel(streak: number): { name: string; icon: string; next: number } {
  if (streak >= 90) return { name: 'Semente Mestre', icon: '🌟', next: 0 };
  if (streak >= 60) return { name: 'Fruto', icon: '🍎', next: 90 };
  if (streak >= 30) return { name: 'Flor', icon: '🌸', next: 60 };
  if (streak >= 14) return { name: 'Galho', icon: '🌿', next: 30 };
  if (streak >= 7)  return { name: 'Tronco', icon: '🪵', next: 14 };
  if (streak >= 3)  return { name: 'Raiz', icon: '🌱', next: 7 };
  return { name: 'Semente', icon: '🌰', next: 3 };
}

function calcStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const unique = [...new Set(dates.map(d => new Date(d).toDateString()))].sort().reverse();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (unique[0] !== today && unique[0] !== yesterday) return 0;
  let streak = 0;
  for (let i = 0; i < unique.length; i++) {
    const expected = new Date(Date.now() - i * 86400000).toDateString();
    if (unique[i] === expected) streak++;
    else break;
  }
  return streak;
}

function RingScore({ score, label, icon, delay }: { score: number; label: string; icon: string; delay: number }) {
  const level = getIVILevel(score);
  const size = 90;
  const stroke = 7;

  return (
    <FadeInView delay={delay}>
      <View style={ring.wrap}>
        <View style={[ring.circle, { width: size, height: size }]}>
          <View style={[ring.bg, { borderRadius: size / 2, borderWidth: stroke, borderColor: colors.border }]} />
          <View
            style={[
              ring.fill,
              {
                borderRadius: size / 2,
                borderWidth: stroke,
                borderColor: level.color,
                borderTopColor: score > 25 ? level.color : 'transparent',
                borderRightColor: score > 50 ? level.color : 'transparent',
                borderBottomColor: score > 75 ? level.color : 'transparent',
                borderLeftColor: score > 0 ? level.color : 'transparent',
                transform: [{ rotate: '-90deg' }],
              },
            ]}
          />
          <Text style={ring.icon}>{icon}</Text>
        </View>
        <Text style={ring.score}>{score}</Text>
        <Text style={ring.label}>{label}</Text>
        <Text style={[ring.level, { color: level.color }]}>{level.label}</Text>
      </View>
    </FadeInView>
  );
}

export default function HygeiOSScreen() {
  const [scores, setScores] = useState<IVIScores>({ bio: 0, mental: 0, spirit: 0, social: 0, overall: 0 });
  const [streak, setStreak] = useState(0);
  const [hasEnoughData, setHasEnoughData] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const loadIVI = async () => {
    if (!user?.id) return;
    setLoading(true);

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000);

    const [mealsToday, mealsWeek, diaryWeek, wonderMonth, diaryDates, mealDates, postsMonth] = await Promise.all([
      supabase.from('meals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', todayStart.toISOString()),
      supabase.from('meals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', weekAgo.toISOString()),
      supabase.from('diario_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', weekAgo.toISOString()),
      supabase.from('wonder_night_purchases').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', monthAgo.toISOString()),
      supabase.from('diario_entries').select('created_at').eq('user_id', user.id).gte('created_at', ninetyDaysAgo.toISOString()),
      supabase.from('meals').select('created_at').eq('user_id', user.id).gte('created_at', ninetyDaysAgo.toISOString()),
      supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', monthAgo.toISOString()),
    ]);

    // FIX-4: unique diary days in last 30d (one entry max per day)
    const diaryUniqueDays = new Set(
      (diaryDates.data || [])
        .filter((r: any) => new Date(r.created_at) >= monthAgo)
        .map((r: any) => new Date(r.created_at).toDateString())
    ).size;

    const allDates = [
      ...((diaryDates.data || []).map((r: any) => r.created_at)),
      ...((mealDates.data || []).map((r: any) => r.created_at)),
    ];

    // FIX-1: IVI only meaningful after 7 unique active days
    const uniqueActiveDays = new Set(allDates.map(d => new Date(d).toDateString())).size;
    setHasEnoughData(uniqueActiveDays >= 7);
    const currentStreak = calcStreak(allDates);
    setStreak(currentStreak);
    setScores(calcIVI({
      mealsToday: mealsToday.count ?? 0,
      mealsWeek: mealsWeek.count ?? 0,
      diaryWeek: diaryWeek.count ?? 0,
      diaryUniqueDays,
      wonderMonth: wonderMonth.count ?? 0,
      postsMonth: postsMonth.count ?? 0,
      streak: currentStreak,
    }));
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadIVI(); }, [user]));

  const overallLevel = getIVILevel(scores.overall);
  const evolution = getEvolutionLevel(streak);

  return (
    <ScrollView style={s.container}>
      <FadeInView>
        <View style={s.header}>
          <Text style={s.icon}>🧬</Text>
          <Text style={s.title}>HygeiOS</Text>
          <Text style={s.subtitle}>Índice de Vitalidade Integral</Text>
        </View>
      </FadeInView>

      {/* FIX-1: calibrating notice when < 7 active days */}
      {!hasEnoughData && !loading && (
        <FadeInView delay={80}>
          <View style={s.calibratingBanner}>
            <Text style={s.calibratingText}>⏳ Calibrando — use o app por 7+ dias para IVI preciso</Text>
          </View>
        </FadeInView>
      )}

      {/* IVI Geral */}
      <FadeInView delay={100}>
        <View style={s.overallCard}>
          <Text style={s.overallLabel}>IVI Geral</Text>
          <Text style={[s.overallScore, { color: overallLevel.color }]}>{loading ? '—' : scores.overall}</Text>
          <View style={s.statusRow}>
            <View style={[s.statusBadge, { backgroundColor: overallLevel.color + '22', borderColor: overallLevel.color + '55' }]}>
              <Text style={[s.statusText, { color: overallLevel.color }]}>{loading ? '···' : overallLevel.status}</Text>
            </View>
          </View>
          <View style={s.overallBar}>
            <View style={[s.overallFill, { width: `${scores.overall}%`, backgroundColor: overallLevel.color }]} />
          </View>
        </View>
      </FadeInView>

      {/* Card AsclepiOS — ação por faixa */}
      <FadeInView delay={150}>
        <View style={[s.actionCard, { borderColor: overallLevel.color + '55' }]}>
          <Text style={s.actionHeader}>◆ AsclepiOS</Text>
          <Text style={[s.actionText, { color: overallLevel.color }]}>{loading ? 'Calculando ação...' : overallLevel.action}</Text>
        </View>
      </FadeInView>

      {/* Rings Físico / Mental / Espiritual / Social — IVI 4D V2.0604 */}
      <View style={s.rings}>
        <RingScore score={scores.bio}    label="Físico"     icon="🫀" delay={200} />
        <RingScore score={scores.mental} label="Mental"     icon="🧠" delay={300} />
        <RingScore score={scores.spirit} label="Espiritual" icon="✦"  delay={400} />
        <RingScore score={scores.social} label="Social"     icon="👥" delay={500} />
      </View>

      {/* Streak + Nível Evolutivo */}
      <FadeInView delay={450}>
        <View style={s.evolutionCard}>
          <View style={s.evolutionLeft}>
            <Text style={s.evolutionIcon}>{evolution.icon}</Text>
            <View>
              <Text style={s.evolutionName}>{evolution.name}</Text>
              <Text style={s.evolutionSub}>Nível Evolutivo</Text>
            </View>
          </View>
          <View style={s.evolutionRight}>
            <Text style={[s.streakNum, streak >= 7 ? { color: '#f39c12' } : {}]}>{streak}</Text>
            <Text style={s.streakLabel}>dias seguidos</Text>
            {evolution.next > 0 && (
              <Text style={s.streakNext}>{evolution.next - streak}d para {getEvolutionLevel(evolution.next).name}</Text>
            )}
          </View>
        </View>
      </FadeInView>

      {/* Streaks badges */}
      <FadeInView delay={500}>
        <View style={s.streakRow}>
          {[
            { days: 7, label: '7 dias', icon: '🔥' },
            { days: 30, label: '30 dias', icon: '⚡' },
            { days: 90, label: '90 dias', icon: '👑' },
          ].map((s2) => (
            <View key={s2.days} style={[s.streakBadge, streak >= s2.days && s.streakBadgeActive]}>
              <Text style={s.streakBadgeIcon}>{s2.icon}</Text>
              <Text style={[s.streakBadgeLabel, streak >= s2.days && s.streakBadgeLabelActive]}>{s2.label}</Text>
            </View>
          ))}
        </View>
      </FadeInView>

      {/* Como é calculado */}
      <FadeInView delay={550}>
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>Como o IVI é calculado</Text>
          <View style={s.infoRow}>
            <Text style={s.infoBullet}>🫀</Text>
            <Text style={s.infoText}><Text style={s.infoBold}>Bio (40%)</Text> — Refeições registradas na semana e hoje</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoBullet}>🧠</Text>
            <Text style={s.infoText}><Text style={s.infoBold}>Mental (35%)</Text> — Entradas no Diário do Ser</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoBullet}>✦</Text>
            <Text style={s.infoText}><Text style={s.infoBold}>Spirit (25%)</Text> — Wonder Night e prática reflexiva</Text>
          </View>
          <View style={[s.infoRow, { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={s.infoBullet}>📊</Text>
            <Text style={s.infoText}>Spirit conta <Text style={s.infoBold}>dias únicos</Text> de prática (cap: 1×/dia). Streak dos últimos 90 dias.</Text>
          </View>
        </View>
      </FadeInView>

      {/* Em breve */}
      <FadeInView delay={620}>
        <View style={s.futureCard}>
          <Text style={s.futureTitle}>Em breve no HygeiOS</Text>
          <Text style={s.futureItem}>◆ Integração AsclepiOS (exames médicos)</Text>
          <Text style={s.futureItem}>◆ Métricas biométricas EteriOS (wearables)</Text>
          <Text style={s.futureItem}>◆ Pipeline ETL automático a cada 6h</Text>
          <Text style={s.futureItem}>◆ Histórico longitudinal do IVI</Text>
        </View>
      </FadeInView>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const ring = StyleSheet.create({
  wrap: { alignItems: 'center', width: 100 },
  circle: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
  bg: { position: 'absolute', width: '100%', height: '100%' },
  fill: { position: 'absolute', width: '100%', height: '100%' },
  icon: { fontSize: 28 },
  score: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  label: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: 2 },
  level: { fontSize: fontSize.xs, fontWeight: '600', marginTop: 2 },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { alignItems: 'center', paddingTop: 32, paddingBottom: spacing.lg },
  icon: { fontSize: 56, marginBottom: spacing.sm },
  title: { fontSize: fontSize.hero, fontWeight: '700', color: colors.primary, letterSpacing: 1 },
  subtitle: { fontSize: fontSize.body, color: colors.textSecondary, marginTop: spacing.xs },

  overallCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  overallLabel: { fontSize: fontSize.md, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 2 },
  overallScore: { fontSize: 56, fontWeight: '700', marginVertical: spacing.xs },
  statusRow: { marginBottom: spacing.md },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  statusText: { fontSize: fontSize.sm, fontWeight: '700', letterSpacing: 1.5 },
  overallBar: { width: '100%', height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  overallFill: { height: '100%', borderRadius: 3 },

  actionCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionHeader: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 1 },
  actionText: { fontSize: fontSize.body, fontWeight: '500', flex: 1 },

  rings: { flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: spacing.xxl },

  evolutionCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evolutionLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  evolutionIcon: { fontSize: 36 },
  evolutionName: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  evolutionSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  evolutionRight: { alignItems: 'flex-end' },
  streakNum: { fontSize: 32, fontWeight: '700', color: colors.text },
  streakLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  streakNext: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
    opacity: 0.5,
  },
  streakBadgeActive: { opacity: 1, borderColor: '#f39c12' },
  streakBadgeIcon: { fontSize: 22 },
  streakBadgeLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  streakBadgeLabelActive: { color: '#f39c12', fontWeight: '600' },

  infoCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  infoTitle: { fontSize: fontSize.xl, fontWeight: '600', color: colors.text, marginBottom: spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  infoBullet: { fontSize: 18, marginRight: spacing.sm },
  infoText: { flex: 1, fontSize: fontSize.body, color: colors.textSecondary, lineHeight: 20 },
  infoBold: { color: colors.text, fontWeight: '600' },

  calibratingBanner: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryFaded,
  },
  calibratingText: { color: colors.primary, fontSize: fontSize.sm, textAlign: 'center' },

  futureCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primaryFaded,
  },
  futureTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.primary, marginBottom: spacing.md },
  futureItem: { fontSize: fontSize.body, color: colors.textSecondary, lineHeight: 24 },
});
