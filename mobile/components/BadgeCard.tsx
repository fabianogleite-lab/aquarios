import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fontSize } from '../lib/theme';
import { formatDate } from '../lib/locale';

interface Badge {
  key: string;
  icon: string;
  name: string;
  description: string;
  requirement?: string;
}

interface Props {
  badge: Badge;
  unlocked: boolean;
  unlockedAt?: string;
  onPress?: () => void;
}

export function BadgeCard({ badge, unlocked, unlockedAt, onPress }: Props) {
  const dateStr = unlockedAt ? formatDate(unlockedAt) : null;

  return (
    <Pressable
      style={[s.container, unlocked && s.containerUnlocked, !unlocked && s.containerLocked]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[s.iconContainer, unlocked && s.iconContainerUnlocked]}>
        <Text style={s.icon}>{badge.icon}</Text>
        {unlocked && <View style={s.glowRing} />}
      </View>

      <View style={s.content}>
        <Text style={[s.name, !unlocked && s.nameLocked]}>{badge.name}</Text>
        <Text style={[s.description, !unlocked && s.descriptionLocked]}>{badge.description}</Text>

        {unlocked && dateStr && <Text style={s.unlockedDate}>Desbloqueado em {dateStr}</Text>}

        {!unlocked && badge.requirement && <Text style={s.requirement}>🎯 {badge.requirement}</Text>}
      </View>

      {unlocked && <Text style={s.badge}>✨</Text>}
      {!unlocked && <Text style={s.locked}>🔒</Text>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerUnlocked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  containerLocked: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainerUnlocked: {
    backgroundColor: colors.primary + '20',
  },
  icon: {
    fontSize: 40,
  },
  glowRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: colors.primary,
    opacity: 0.3,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.bodyLarge,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  nameLocked: {
    color: colors.textMuted,
  },
  description: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginBottom: 4,
  },
  descriptionLocked: {
    color: colors.textMuted,
  },
  unlockedDate: {
    fontSize: fontSize.caption,
    color: colors.success,
    fontWeight: '600',
  },
  requirement: {
    fontSize: fontSize.caption,
    color: colors.warning,
    fontWeight: '600',
  },
  badge: {
    fontSize: 28,
  },
  locked: {
    fontSize: 24,
  },
});
