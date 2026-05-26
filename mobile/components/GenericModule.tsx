import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, fontSize } from '../lib/theme';

interface Lot {
  id: number;
  name: string;
  xp_required: number;
  features: string[];
}

interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'active' | 'coming_soon' | 'locked';
  gate?: { type: 'xp' | 'plan' | 'tokens'; min_level?: number; min_plan?: string };
  lotes: Lot[];
}

interface Props {
  config: ModuleConfig;
  currentXP?: number;
  onSelectLot?: (lot: Lot) => void;
}

export function GenericModule({ config, currentXP = 0, onSelectLot }: Props) {
  const isLocked = config.status === 'locked';

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.icon}>{config.icon}</Text>
        <Text style={s.title}>{config.name}</Text>
        <Text style={s.description}>{config.description}</Text>
      </View>

      {/* Status Badge */}
      <View style={[s.badge, config.status === 'coming_soon' && s.badgeComingSoon]}>
        <Text style={s.badgeText}>
          {config.status === 'coming_soon' ? '🔜 Em Breve' : config.status === 'locked' ? '🔒 Bloqueado' : '✅ Ativo'}
        </Text>
      </View>

      {/* Lots */}
      <View style={s.lotsContainer}>
        {config.lotes.map((lot) => {
          const progress = Math.min(currentXP / lot.xp_required, 1);
          const isUnlocked = currentXP >= lot.xp_required;

          return (
            <Pressable
              key={lot.id}
              style={[s.lotCard, !isUnlocked && s.lotCardLocked]}
              onPress={() => onSelectLot?.(lot)}
              disabled={!isUnlocked}
            >
              <View style={s.lotHeader}>
                <Text style={s.lotNumber}>Lote {lot.id}</Text>
                <Text style={s.lotName}>{lot.name}</Text>
              </View>

              <Text style={s.lotRequirement}>
                {lot.xp_required} XP {isUnlocked ? '✅' : '🔒'}
              </Text>

              {/* Progress Bar */}
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
              </View>

              <Text style={s.progressText}>
                {currentXP.toFixed(0)} / {lot.xp_required} XP
              </Text>

              {/* Features */}
              {lot.features && lot.features.length > 0 && (
                <View style={s.featuresContainer}>
                  {lot.features.slice(0, 2).map((feature, i) => (
                    <Text key={i} style={s.featureItem}>
                      • {feature}
                    </Text>
                  ))}
                  {lot.features.length > 2 && <Text style={s.featureItem}>• +{lot.features.length - 2} mais</Text>}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 60,
    marginBottom: 12,
  },
  title: {
    fontSize: fontSize.heading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  badgeComingSoon: {
    backgroundColor: colors.warning + '20',
  },
  badgeText: {
    fontSize: fontSize.caption,
    color: colors.text,
    fontWeight: '600',
  },
  lotsContainer: {
    gap: 12,
  },
  lotCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  lotCardLocked: {
    opacity: 0.6,
    borderLeftColor: colors.error,
  },
  lotHeader: {
    marginBottom: 8,
  },
  lotNumber: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  lotName: {
    fontSize: fontSize.bodyLarge,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  lotRequirement: {
    fontSize: fontSize.body,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginBottom: 8,
  },
  featuresContainer: {
    marginTop: 8,
    gap: 4,
  },
  featureItem: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
});
