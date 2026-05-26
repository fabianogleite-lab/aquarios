import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

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
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      const { data: userBadges } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', session.user.id)
        .order('unlocked_at', { ascending: false });

      const { data: userXP } = await supabase
        .from('user_xp')
        .select('level')
        .eq('user_id', session.user.id)
        .single();

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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const allBadges = [
    { id: '1', name: 'Semente', icon: '🌱', unlocked: badges.length > 0 },
    { id: '2', name: 'Raiz', icon: '🌿', unlocked: badges.length > 1 },
    { id: '3', name: 'Tronco', icon: '🌳', unlocked: badges.length > 2 },
    { id: '4', name: 'Fruto', icon: '🍎', unlocked: badges.length > 3, progress: '32/50' },
    { id: '5', name: 'Flor', icon: '🌸', unlocked: badges.length > 4, progress: '0/100' },
    { id: '6', name: 'Transcendência', icon: '✨', unlocked: badges.length > 5 }
  ];

  return (
    <LinearGradient colors={['#0f0f0f', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Minhas Conquistas</Text>

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Progresso Geral</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}% — {totalBadges} badges desbloqueadas</Text>
        </View>

        <View style={styles.badgesGrid}>
          {allBadges.map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              <View style={[styles.badgeIcon, badge.unlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
                <Text style={styles.badgeEmoji}>{badge.unlocked ? badge.icon : '🔒'}</Text>
              </View>
              <Text style={styles.badgeName}>{badge.name}</Text>
              {badge.progress && (
                <Text style={styles.badgeProgress}>{badge.progress}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Estatísticas</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total de Badges:</Text>
            <Text style={styles.statValue}>{totalBadges}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Próximo Desbloqueio:</Text>
            <Text style={styles.statValue}>3 XP</Text>
          </View>
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
  progressCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#aaa',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  badgeItem: {
    width: '31%',
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
  },
  badgeUnlocked: {
    backgroundColor: '#4CAF50',
    borderColor: '#45a049',
  },
  badgeLocked: {
    backgroundColor: '#3a3a3a',
    borderColor: '#2a2a2a',
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  badgeProgress: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
