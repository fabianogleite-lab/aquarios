import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { FadeInView } from '../../components/FadeInView';

interface Badge {
  id: string;
  name: string;
  icon: string;
  unlocked_at: string;
}

export default function AchievementsScreen() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBadges, setTotalBadges] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) { setLoading(false); return; }

      const { data: userBadges } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', session.session!.user.id)
        .order('unlocked_at', { ascending: false });

      setBadges(userBadges || []);
      setTotalBadges(userBadges?.length || 0);
      const maxBadges = 20;
      setProgress(Math.round(((userBadges?.length || 0) / maxBadges) * 100));
    } catch (err) {
      console.error('Error loading badges:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const allBadges = [
    { id: '1', name: 'Semente',       icon: '🌱', unlocked: badges.length > 0 },
    { id: '2', name: 'Raiz',          icon: '🌿', unlocked: badges.length > 1 },
    { id: '3', name: 'Tronco',        icon: '🌳', unlocked: badges.length > 2 },
    { id: '4', name: 'Fruto',         icon: '🍎', unlocked: badges.length > 3, progress: '32/50' },
    { id: '5', name: 'Flor',          icon: '🌸', unlocked: badges.length > 4, progress: '0/100' },
    { id: '6', name: 'Transcendência',icon: '✨', unlocked: badges.length > 5 },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <FadeInView>
        <View style={s.hero}>
          <Text style={s.heroLabel}>JORNADA</Text>
          <Text style={s.heroTitle}>Minhas Conquistas</Text>
        </View>
      </FadeInView>

      {/* Progresso */}
      <FadeInView delay={80}>
        <View style={s.card}>
          <Text style={s.cardLabel}>PROGRESSO GERAL</Text>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={s.progressText}>{progress}% — {totalBadges} badges desbloqueadas</Text>
        </View>
      </FadeInView>

      {/* Grid de badges */}
      <FadeInView delay={160}>
        <Text style={s.sectionLabel}>NÍVEIS DA JORNADA</Text>
        <View style={s.grid}>
          {allBadges.map((badge) => (
            <View key={badge.id} style={s.badgeItem}>
              <View style={[s.badgeCircle, badge.unlocked ? s.badgeUnlocked : s.badgeLocked]}>
                <Text style={s.badgeEmoji}>{badge.unlocked ? badge.icon : '🔒'}</Text>
              </View>
              <Text style={[s.badgeName, !badge.unlocked && s.badgeNameLocked]}>{badge.name}</Text>
              {badge.progress && <Text style={s.badgeProgress}>{badge.progress}</Text>}
            </View>
          ))}
        </View>
      </FadeInView>

      {/* Estatísticas */}
      <FadeInView delay={240}>
        <View style={s.card}>
          <Text style={s.cardLabel}>ESTATÍSTICAS</Text>
          <View style={s.statRow}>
            <Text style={s.statKey}>Total de badges</Text>
            <Text style={s.statVal}>{totalBadges}</Text>
          </View>
          <View style={s.statRow}>
            <Text style={s.statKey}>Próximo desbloqueio</Text>
            <Text style={s.statVal}>3 XP</Text>
          </View>
          <View style={s.statRow}>
            <Text style={s.statKey}>Meta</Text>
            <Text style={s.statVal}>20 badges</Text>
          </View>
        </View>
      </FadeInView>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },

  hero: {
    backgroundColor: colors.cardDark,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heroLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: spacing.xs },
  heroTitle: { fontSize: fontSize.title, fontWeight: '700', color: colors.textLight },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.2, marginBottom: spacing.md },

  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: { height: '100%', backgroundColor: colors.espiritual, borderRadius: 4 },
  progressText: { fontSize: fontSize.sm, color: colors.textSecondary },

  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  badgeItem: { width: '30%', alignItems: 'center', marginBottom: spacing.md },
  badgeCircle: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm, borderWidth: 2,
  },
  badgeUnlocked: { backgroundColor: colors.primarySubtle, borderColor: colors.primary },
  badgeLocked: { backgroundColor: colors.cardActive, borderColor: colors.border },
  badgeEmoji: { fontSize: 26 },
  badgeName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, textAlign: 'center' },
  badgeNameLocked: { color: colors.textMuted },
  badgeProgress: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  statKey: { fontSize: fontSize.body, color: colors.textSecondary },
  statVal: { fontSize: fontSize.body, fontWeight: '700', color: colors.text },
});
