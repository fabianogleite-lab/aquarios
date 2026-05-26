import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface XPBarProps {
  currentXP: number;
  currentLevel: number;
  xpPerLevel?: number;
}

export default function XPBar({ currentXP, currentLevel, xpPerLevel = 1000 }: XPBarProps) {
  const xpInLevel = currentXP % xpPerLevel;
  const progressPercent = (xpInLevel / xpPerLevel) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Nível {currentLevel}</Text>
        <Text style={styles.xpText}>{xpInLevel} / {xpPerLevel} XP</Text>
      </View>

      <LinearGradient
        colors={['#4ade80', '#22c55e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.barFill, { width: `${progressPercent}%` }]}
      />

      <View style={styles.barBackground} />

      <Text style={styles.nextLevel}>
        {currentLevel + 1 > currentLevel ? `→ Nível ${currentLevel + 1}` : 'Máximo'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '600',
  },
  xpText: {
    color: '#888',
    fontSize: 12,
  },
  barBackground: {
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barFill: {
    position: 'absolute',
    height: 8,
    backgroundColor: '#4ade80',
    borderRadius: 4,
    top: 32,
  },
  nextLevel: {
    color: '#666',
    fontSize: 11,
    marginTop: 4,
  },
});
