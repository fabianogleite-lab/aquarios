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

const NEW_MODULES = [
  { icon: '🏛', title: 'AeropagOS', desc: 'Gamificação desbloqueável por lotes', module: 'aeropagos' },
  { icon: '💰', title: 'Token Economy', desc: 'Sistema de economia interna', module: 'token_economy' },
  { icon: '🛒', title: 'PanaceIA', desc: 'Marketplace consciente de bem-estar', module: 'panaceia' },
  { icon: '🔐', title: 'CerberOS', desc: 'Segurança ativa em 7 camadas', module: 'cerberos' },
];

const COMING_SOON = [
  { icon: '🔮', title: 'SandeirOS', desc: 'Engine simbólica dos 22 arcanos', module: 'sandeiros' },
  { icon: '⚕', title: 'AsclepiOS', desc: 'Módulo médico inteligente', module: 'asclepios' },
  { icon: '💰', title: 'HermeOS', desc: 'Inteligência financeira pessoal', module: 'hermeos' },
  { icon: '📡', title: 'EteriOS', desc: 'Conexão com wearables e IoT', module: 'eterios' },
  { icon: '☯', title: 'EcumenicOS', desc: 'Sabedoria inter-religiosa', module: 'ecumenicos' },
  { icon: '🏢', title: 'Beck Office', desc: 'Plataforma B2B para clínicas e empresas', module: 'beck-office' },
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
        <Text style={s.sectionTitle}>Novos Módulos</Text>
        {NEW_MODULES.map((mod, i) => (
          <FadeInView key={mod.title} delay={100 + i * 80}>
            <PressableScale style={s.card} onPress={() => router.push(`/module/${mod.module}`)}>
              <Text style={s.cardIcon}>{mod.icon}</Text>
              <View style={s.cardContent}>
                <Text style={s.cardTitle}>{mod.title}</Text>
                <Text style={s.cardDesc}>{mod.desc}</Text>
              </View>
              <View style={s.badge}>
                <Text style={s.badgeText}>✨ NOVO</Text>
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

      {/* Free tier info */}
      <FadeInView delay={600}>
        <View style={s.freeCard}>
          <View style={s.freeTierRow}>
            <View style={s.freeTier}>
              <Text style={s.freeTierLabel}>Free Anônimo</Text>
              <Text style={s.freeTierDesc}>ProteOS básico · Nutrição · Diário Google Agenda · 30 dias trial completo</Text>
            </View>
            <View style={[s.freeTier, s.freeTierActive]}>
              <Text style={[s.freeTierLabel, { color: colors.primary }]}>Free Comunidade</Text>
              <Text style={s.freeTierDesc}>+ Comunidades · XP Existencial · IVI Spirit · histórico 30 dias</Text>
              <View style={s.freeBadge}><Text style={s.freeBadgeText}>ATUAL</Text></View>
            </View>
          </View>
          <Text style={s.freeUpgradeHint}>Upgrade para Starter R$19,90/mês → IVI completo + wearable</Text>
        </View>
      </FadeInView>

      <View style={s.footer}>
        <Text style={s.footerText}>Arkhe Labs · V1.0512 · 2026</Text>
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
  freeCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  freeTierRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  freeTier: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  freeTierActive: {
    borderColor: colors.primaryFaded,
    backgroundColor: colors.primarySubtle,
  },
  freeTierLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 4 },
  freeTierDesc: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16 },
  freeBadge: {
    marginTop: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  freeBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  freeUpgradeHint: { fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center' },
  footer: { alignItems: 'center', paddingVertical: 30, borderTopWidth: 1, borderTopColor: colors.border },
  footerText: { color: colors.textMuted, fontSize: fontSize.sm },
  footerSub: { color: colors.textDimmed, fontSize: fontSize.xs, marginTop: spacing.xs, fontStyle: 'italic' },
});
