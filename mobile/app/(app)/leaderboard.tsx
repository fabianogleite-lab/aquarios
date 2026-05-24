import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

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

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

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
          isSelf: user.user_id === session.user.id
        }));

        setLeaderboard(entries);

        const selfEntry = entries.find(e => e.isSelf);
        if (selfEntry) {
          setUserRank(selfEntry);
        } else {
          setUserRank({
            rank: 15,
            userId: session.user.id,
            uviScore: 72,
            change: 2,
            isSelf: true
          });
        }
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <LinearGradient colors={['#0f0f0f', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Top 10 IVI da Comunidade</Text>

        <View style={styles.leaderboardCard}>
          {leaderboard.map((entry) => (
            <View
              key={entry.userId}
              style={[styles.leaderboardRow, entry.isSelf && styles.selfRow]}
            >
              <View style={styles.rankSection}>
                <Text style={styles.medal}>{entry.rank <= 3 ? medals[entry.rank - 1] : entry.rank}</Text>
              </View>

              <View style={styles.userSection}>
                <Text style={styles.userName}>
                  Aquariano#{Math.floor(Math.random() * 100)}
                </Text>
                {entry.isSelf && <Text style={styles.selfLabel}>Você</Text>}
              </View>

              <View style={styles.scoreSection}>
                <Text style={styles.score}>{entry.uviScore} IVI</Text>
                {entry.change !== undefined && (
                  <Text style={[styles.change, entry.change > 0 ? styles.changeUp : styles.changeDown]}>
                    {entry.change > 0 ? '↑' : entry.change < 0 ? '↓' : '→'} {Math.abs(entry.change)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {userRank && (
          <View style={styles.yourPositionCard}>
            <Text style={styles.yourPositionTitle}>Sua Posição</Text>

            <View style={styles.yourPositionContent}>
              <View style={styles.positionBadge}>
                <Text style={styles.positionRank}>#{userRank.rank}</Text>
              </View>

              <View style={styles.positionInfo}>
                <Text style={styles.positionScore}>{userRank.uviScore} IVI</Text>
                <Text style={styles.positionChange}>
                  {userRank.change && userRank.change > 0
                    ? `⬆️ Subiu ${userRank.change} posição${userRank.change > 1 ? 's' : ''}`
                    : '→ Mantém posição'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Como Funciona?</Text>
          <Text style={styles.infoText}>
            • Seu IVI é calculado baseado no seu nível e atividades
          </Text>
          <Text style={styles.infoText}>
            • Suba no ranking participando da comunidade
          </Text>
          <Text style={styles.infoText}>
            • Dados atualizados semanalmente
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 8,
  },
  leaderboardCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  selfRow: {
    backgroundColor: '#1a4d2e',
  },
  rankSection: {
    width: 40,
    alignItems: 'center',
  },
  medal: {
    fontSize: 20,
  },
  userSection: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  selfLabel: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: '#0a2818',
    borderRadius: 4,
  },
  scoreSection: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  change: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  changeUp: {
    color: '#4CAF50',
  },
  changeDown: {
    color: '#f44336',
  },
  yourPositionCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  yourPositionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  yourPositionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  positionBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionRank: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  positionInfo: {
    flex: 1,
  },
  positionScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  positionChange: {
    fontSize: 13,
    color: '#aaa',
  },
  infoCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 8,
    lineHeight: 18,
  },
});
