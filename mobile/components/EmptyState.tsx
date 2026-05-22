import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '../lib/theme';

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <View style={s.container}>
      {icon && <Text style={s.icon}>{icon}</Text>}
      <Text style={s.title}>{title}</Text>
      {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  icon: { fontSize: 48, marginBottom: spacing.lg },
  title: { color: colors.textMuted, fontSize: fontSize.xl, marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted, fontSize: fontSize.md },
});
