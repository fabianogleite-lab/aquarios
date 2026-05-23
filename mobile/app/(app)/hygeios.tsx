import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

interface IVIScores {
  bio: number;
  mental: number;
  spirit: number;
  overall: number;
}

interface IVIData {
  mealsToday: number;
  mealsWeek: number;
  diaryWeek: number;
  diaryMonth: number;
  wonderMonth: number;
}

function calcIVI(data: IVIData): IVIScores {
  const bio = Math.min(100, Math.round((data.mealsWeek / 21) * 70 + (data.mealsToday / 3) * 30));
  const mental = Math.min(100, Math.round((data.diaryWeek / 5) * 60 + (data.diaryMonth / 15) * 40));
  const spirit = Math.min(100, Math.round((data.wonderMonth / 4) * 50 + (data.diaryMonth / 10) * 50));
  const overall = Math.round(bio * 0.4 + mental * 0.35 + spirit * 0.25);
  return { bio, mental, spirit, overall };
}

function getIVILevel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excelente', color: '#2ecc71' };
  if (score >= 60) return { label: 'Bom', color: colors.primary };
  if (score >= 40) return { label: 'Regular', color: '#f39c12' };
  if (score >= 20) return { label: 'Atenção', color: '#e67e22' };
  return { label: 'Crítico', color: colors.error };
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
  const [scores, setScores] = useState<IVIScores>({ bio: 0, mental: 0, spirit: 0, overall: 0 });
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

    const [mealsToday, mealsWeek, diaryWeek, diaryMonth, wonderMonth] = await Promise.all([
      supabase.from('meals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', todayStart.toISOString()),
      supabase.from('meals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', weekAgo.toISOString()),
      supabase.from('diary_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', weekAgo.toISOString()),
      supabase.from('diary_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', monthAgo.toISOString()),
      supabase.from('wonder_purchases').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', monthAgo.toISOString()),
    ]);

    const data: IVIData = {
      mealsToday: mealsToday.count ?? 0,
      mealsWeek: mealsWeek.count ?? 0,
      diaryWeek: diaryWeek.count ?? 0,
      diaryMonth: diaryMonth.count ?? 0,
      wonderMonth: wonderMonth.count ?? 0,
    };

    setScores(calcIVI(data));
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadIVI(); }, [user]));

  const overallLevel = getIVILevel(scores.overall);

  return (
    <ScrollView style={s.container}>
      <FadeInView>
        <View style={s.header}>
          <Text style={s.icon}>🧬</Text>
          <Text style={s.title}>HygeiOS</Text>
          <Text style={s.subtitle}>Índice de Vitalidade Integral</Text>
        </View>
      </FadeInView>

      <FadeInView delay={100}>
        <View style={s.overallCard}>
          <Text style={s.overallLabel}>IVI Geral</Text>
          <Text style={[s.overallScore, { color: overallLevel.color }]}>{loading ? '—' : scores.overall}</Text>
          <Text style={[s.overallLevel, { color: overallLevel.color }]}>{loading ? 'Calculando...' : overallLevel.label}</Text>
          <View style={s.overallBar}>
            <View style={[s.overallFill, { width: `${scores.overall}%`, backgroundColor: overallLevel.color }]} />
          </View>
        </View>
      </FadeInView>

      <View style={s.rings}>
        <RingScore score={scores.bio} label="Bio" icon="🫀" delay={200} />
        <RingScore score={scores.mental} label="Mental" icon="🧠" delay={300} />
        <RingScore score={scores.spirit} label="Spirit" icon="✦" delay={400} />
      </View>

      <FadeInView delay={500}>
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>Como o IVI é calculado</Text>
          <View style={s.infoRow}>
            <Text style={s.infoBullet}>🫀</Text>
            <Text style={s.infoText}><Text style={s.infoBold}>Bio</Text> — Refeições registradas na semana e hoje (meta: 3/dia)</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoBullet}>🧠</Text>
            <Text style={s.infoText}><Text style={s.infoBold}>Mental</Text> — Entradas no Diário do Ser na semana e no mês</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoBullet}>✦</Text>
            <Text style={s.infoText}><Text style={s.infoBold}>Spirit</Text> — Participação em Wonder Night e prática reflexiva</Text>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={600}>
        <View style={s.futureCard}>
          <Text style={s.futureTitle}>Em breve no HygeiOS</Text>
          <Text style={s.futureItem}>◆ Integração com AsclepiOS (exames médicos)</Text>
          <Text style={s.futureItem}>◆ Métricas biométricas via EteriOS (wearables)</Text>
          <Text style={s.futureItem}>◆ Analytics avançado com Data Lake</Text>
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
  overallLevel: { fontSize: fontSize.xl, fontWeight: '600', marginBottom: spacing.md },
  overallBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  overallFill: { height: '100%', borderRadius: 3 },
  rings: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: spacing.xxl,
  },
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
