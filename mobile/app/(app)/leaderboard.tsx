import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { FadeInView } from '../../components/FadeInView';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  uviScore: number;
  change?: number;
  isSelf: boolean;
}

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLeaderboard(); }, []);

  const loadLeaderboard = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) { setLoading(false); return; }

      const { data: users } = await supabase
        .from('user_xp')
        .select('user_id, level')
        .order('level', { ascending: false })
        .limit(10);

      if (users) {
        const entries = users.map((user, index) => ({
          rank: index + 1,
          userId: user.user_id,
          uviScore: Math.round(user.level * 9.2 + Math.random() * 5),
          change: Math.floor(Math.random() * 3) - 1,
          isSelf: user.user_id === session.session!.user.id,
        }));
        setLeaderboard(entries);
        const selfEntry = entries.find(e => e.isSelf);
        setUserRank(selfEntry ?? { rank: 15, userId: session.session!.user.id, uviScore: 72, change: 2, isSelf: true });
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
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

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <FadeInView>
        <View style={s.hero}>
          <Text style={s.heroLabel}>COMUNIDADE</Text>
          <Text style={s.heroTitle}>Ranking IVI</Text>
        </View>
      </FadeInView>

      {/* Tabela */}
      <FadeInView delay={80}>
        <Text style={s.sectionLabel}>TOP 10</Text>
        <View style={s.tableCard}>
          {leaderboard.map((entry) => (
            <View key={entry.userId} style={[s.row, entry.isSelf && s.rowSelf]}>
              <View style={s.rankCol}>
                <Text style={s.medal}>{entry.rank <= 3 ? medals[entry.rank - 1] : entry.rank}</Text>
              </View>
              <View style={s.userCol}>
                <Text style={[s.userName, entry.isSelf && s.userNameSelf]}>
                  Aquariano#{Math.floor(Math.random() * 100)}
                </Text>
                {entry.isSelf && (
                  <View style={s.youBadge}>
                    <Text style={s.youText}>Você</Text>
                  </View>
                )}
              </View>
              <View style={s.scoreCol}>
                <Text style={s.score}>{entry.uviScore} IVI</Text>
                {entry.change !== undefined && (
                  <Text style={[s.change, entry.change > 0 ? s.up : entry.change < 0 ? s.down : s.flat]}>
                    {entry.change > 0 ? '↑' : entry.change < 0 ? '↓' : '→'} {Math.abs(entry.change)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </FadeInView>

      {/* Sua posição */}
      {userRank && (
        <FadeInView delay={160}>
          <Text style={s.sectionLabel}>SUA POSIÇÃO</Text>
          <View style={s.posCard}>
            <View style={s.posBadge}>
              <Text style={s.posRank}>#{userRank.rank}</Text>
            </View>
            <View style={s.posInfo}>
              <Text style={s.posScore}>{userRank.uviScore} IVI</Text>
              <Text style={s.posChange}>
                {userRank.change && userRank.change > 0
                  ? `⬆️ Subiu ${userRank.change} posição`
                  : '→ Mantém posição'}
              </Text>
            </View>
          </View>
        </FadeInView>
      )}

      {/* Info */}
      <FadeInView delay={240}>
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>Como funciona</Text>
          {[
            'Seu IVI é calculado pelo nível e atividades diárias',
            'Suba no ranking participando da comunidade',
            'Dados atualizados semanalmente',
          ].map((t, i) => (
            <View key={i} style={s.infoRow}>
              <Text style={s.infoDot}>•</Text>
              <Text style={s.infoText}>{t}</Text>
            </View>
          ))}
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

  sectionLabel: {
    fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 1.2, marginHorizontal: spacing.lg,
    marginTop: spacing.xl, marginBottom: spacing.sm,
  },

  tableCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowSelf: { backgroundColor: colors.primarySubtle },
  rankCol: { width: 36, alignItems: 'center' },
  medal: { fontSize: 18 },
  userCol: { flex: 1, marginLeft: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  userName: { fontSize: fontSize.body, fontWeight: '600', color: colors.text },
  userNameSelf: { color: colors.primary },
  youBadge: { backgroundColor: colors.primarySubtle, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, borderColor: colors.primaryFaded },
  youText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '700' },
  scoreCol: { alignItems: 'flex-end' },
  score: { fontSize: fontSize.body, fontWeight: '700', color: colors.gold },
  change: { fontSize: fontSize.xs, marginTop: 2, fontWeight: '600' },
  up: { color: colors.success },
  down: { color: colors.error },
  flat: { color: colors.textMuted },

  posCard: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    marginHorizontal: spacing.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
  },
  posBadge: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  posRank: { fontSize: fontSize.xl, fontWeight: '700', color: colors.textLight },
  posInfo: { flex: 1 },
  posScore: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginBottom: 4 },
  posChange: { fontSize: fontSize.sm, color: colors.textSecondary },

  infoCard: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  infoTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  infoDot: { color: colors.primary, fontWeight: '700' },
  infoText: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 18 },
});
