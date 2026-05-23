import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth';
import { FadeInView } from '../../components/FadeInView';
import { PressableScale } from '../../components/PressableScale';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

const MODULES = [
  { icon: '💬', title: 'ProteOS', desc: 'Assistente IA pessoal com memória', route: '/proteos' as const },
  { icon: '🧬', title: 'HygeiOS', desc: 'Índice de Vitalidade Integral', route: '/hygeios' as const },
  { icon: '✎', title: 'Diário do Ser', desc: 'Reflexões diárias e autoconhecimento', route: '/diario' as const },
  { icon: '🥗', title: 'Nutrição', desc: 'Tracking nutricional inteligente', route: '/nutricao' as const },
  { icon: '👥', title: 'Comunidades', desc: 'Círculos de crescimento coletivo', route: '/comunidades' as const },
  { icon: '🌙', title: 'Wonder Night', desc: 'Rituais noturnos de transformação', route: '/wonder-night' as const },
];

const COMING_SOON = [
  { icon: '🔮', title: 'SandeirOS', desc: 'Engine simbólica dos 22 arcanos', module: 'sandeiros' },
  { icon: '⚕', title: 'AsclepiOS', desc: 'Módulo médico inteligente', module: 'asclepios' },
  { icon: '💰', title: 'HermeOS', desc: 'Inteligência financeira pessoal', module: 'hermeos' },
  { icon: '📡', title: 'EteriOS', desc: 'Conexão com wearables e IoT', module: 'eterios' },
  { icon: '☯', title: 'EcumenicOS', desc: 'Sabedoria inter-religiosa', module: 'ecumenicos' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Aquariano';

  return (
    <ScrollView style={s.container}>
      <FadeInView>
        <View style={s.hero}>
          <Text style={s.logo}>{'⚗'}</Text>
          <Text style={s.title}>AquariOS</Text>
          <Text style={s.greeting}>Olá, {displayName}</Text>
          <Text style={s.subtitle}>Sistema Operacional Pessoal</Text>
        </View>
      </FadeInView>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Módulos Ativos</Text>
        {MODULES.map((mod, i) => (
          <FadeInView key={mod.title} delay={100 + i * 80}>
            <PressableScale style={s.card} onPress={() => router.push(mod.route)}>
              <Text style={s.cardIcon}>{mod.icon}</Text>
              <View style={s.cardContent}>
                <Text style={s.cardTitle}>{mod.title}</Text>
                <Text style={s.cardDesc}>{mod.desc}</Text>
              </View>
            </PressableScale>
          </FadeInView>
        ))}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Em Breve</Text>
        {COMING_SOON.map((mod, i) => (
          <FadeInView key={mod.title} delay={100 + i * 80}>
            <PressableScale style={s.card} onPress={() => router.push({ pathname: '/coming-soon', params: { module: mod.module } })}>
              <Text style={s.cardIcon}>{mod.icon}</Text>
              <View style={s.cardContent}>
                <Text style={s.cardTitle}>{mod.title}</Text>
                <Text style={s.cardDesc}>{mod.desc}</Text>
              </View>
              <View style={s.badge}>
                <Text style={s.badgeText}>EM BREVE</Text>
              </View>
            </PressableScale>
          </FadeInView>
        ))}
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>Arkhe Labs · 2024-2026</Text>
        <Text style={s.footerSub}>Consciência como tecnologia</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: 'center', paddingVertical: 40, borderBottomWidth: 1, borderBottomColor: colors.border },
  logo: { fontSize: 64, marginBottom: spacing.md },
  title: { fontSize: fontSize.display, fontWeight: '700', color: colors.primary, letterSpacing: 2 },
  greeting: { fontSize: fontSize.xl, color: colors.text, marginTop: spacing.sm },
  subtitle: { fontSize: fontSize.body, color: colors.textSecondary, marginTop: spacing.xs },
  section: { padding: spacing.xl },
  sectionTitle: { fontSize: fontSize.xxl, fontWeight: '600', color: colors.text, marginBottom: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIcon: { fontSize: 28, marginRight: spacing.lg },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: fontSize.xl, fontWeight: '600', color: colors.text },
  cardDesc: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: 2 },
  badge: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  badgeText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 0.5 },
  footer: { alignItems: 'center', paddingVertical: 30, borderTopWidth: 1, borderTopColor: colors.border },
  footerText: { color: colors.textMuted, fontSize: fontSize.sm },
  footerSub: { color: colors.textDimmed, fontSize: fontSize.xs, marginTop: spacing.xs, fontStyle: 'italic' },
});
