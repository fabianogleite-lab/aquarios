import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors, fontSize } from '../lib/theme';

interface Gate {
  type: 'xp' | 'plan' | 'tokens';
  min_level?: number;
  min_plan?: string;
  min_tokens?: number;
}

interface Props {
  gate: Gate;
  currentValue: number;
  reason?: string;
  onUpgrade?: () => void;
  children?: React.ReactNode;
}

export function TokenGate({ gate, currentValue, reason, onUpgrade, children }: Props) {
  const getRequirement = () => {
    switch (gate.type) {
      case 'xp':
        return `Nível ${gate.min_level || 0}`;
      case 'plan':
        return `Plano ${gate.min_plan || 'Premium'}`;
      case 'tokens':
        return `${gate.min_tokens || 0} Tokens`;
      default:
        return 'Acesso restrito';
    }
  };

  const getMessage = () => {
    if (reason) return reason;
    switch (gate.type) {
      case 'xp':
        return `Desbloqueável ao atingir nível ${gate.min_level || 0}. Continue progredindo!`;
      case 'plan':
        return `Requer plano ${gate.min_plan || 'Premium'} ou superior.`;
      case 'tokens':
        return `Requer ${gate.min_tokens || 0} tokens para acessar.`;
      default:
        return 'Este módulo está bloqueado.';
    }
  };

  // Se não estiver bloqueado, renderiza children
  if (children && currentValue >= (gate.min_level || gate.min_tokens || 0)) {
    return <>{children}</>;
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.contentContainer}>
      <View style={s.paywallContainer}>
        <Text style={s.lockIcon}>🔒</Text>
        <Text style={s.title}>Módulo Bloqueado</Text>
        <Text style={s.requirement}>{getRequirement()}</Text>

        <View style={s.messageBox}>
          <Text style={s.message}>{getMessage()}</Text>
        </View>

        <View style={s.statsContainer}>
          <View style={s.stat}>
            <Text style={s.statLabel}>{gate.type === 'xp' ? 'Seu Nível' : 'Seu Saldo'}</Text>
            <Text style={s.statValue}>{currentValue}</Text>
          </View>
          <Text style={s.statDivider}>→</Text>
          <View style={s.stat}>
            <Text style={s.statLabel}>Necessário</Text>
            <Text style={s.statValue}>{gate.min_level || gate.min_tokens || 0}</Text>
          </View>
        </View>

        {onUpgrade && (
          <Pressable style={s.button} onPress={onUpgrade}>
            <Text style={s.buttonText}>
              {gate.type === 'tokens' ? '💳 Comprar Tokens' : '⬆️ Aumentar Nível'}
            </Text>
          </Pressable>
        )}

        <Text style={s.hint}>
          {gate.type === 'xp'
            ? 'Complete ações no app para ganhar XP'
            : 'Visite a loja para adquirir o que precisa'}
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  paywallContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: fontSize.heading,
    fontWeight: '700',
    color: colors.text,
  },
  requirement: {
    fontSize: fontSize.bodyLarge,
    fontWeight: '600',
    color: colors.primary,
  },
  messageBox: {
    backgroundColor: colors.bg,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 8,
  },
  message: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.bg,
    paddingVertical: 12,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: fontSize.heading,
    fontWeight: '700',
    color: colors.primary,
  },
  statDivider: {
    fontSize: 20,
    color: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.bg,
  },
  hint: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
