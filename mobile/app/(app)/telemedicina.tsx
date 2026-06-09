import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

const ODONTOLAR_PACKAGE = 'tech.rapidoc.odontolar';
const ODONTOLAR_PLAY_URL = `https://play.google.com/store/apps/details?id=${ODONTOLAR_PACKAGE}`;
const RAPIDOC_URL = 'https://rapidocbrasil.com.br';

async function openApp(packageId: string, fallbackUrl: string) {
  if (Platform.OS === 'android') {
    const intentUrl = `intent://app#Intent;package=${packageId};scheme=https;end`;
    const canOpen = await Linking.canOpenURL(intentUrl);
    if (canOpen) {
      await Linking.openURL(intentUrl);
      return;
    }
    // App not installed — go to Play Store
    const marketUrl = `market://details?id=${packageId}`;
    const canOpenMarket = await Linking.canOpenURL(marketUrl);
    await Linking.openURL(canOpenMarket ? marketUrl : fallbackUrl);
  } else {
    await Linking.openURL(fallbackUrl);
  }
}

interface ServiceCardProps {
  icon: string;
  title: string;
  subtitle: string;
  tags: string[];
  actionLabel: string;
  onPress: () => void;
  accent?: boolean;
}

function ServiceCard({ icon, title, subtitle, tags, actionLabel, onPress, accent }: ServiceCardProps) {
  return (
    <View style={[s.card, accent && s.cardAccent]}>
      <View style={s.cardHeader}>
        <Text style={s.cardIcon}>{icon}</Text>
        <View style={s.cardInfo}>
          <Text style={s.cardTitle}>{title}</Text>
          <Text style={s.cardSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={s.tagRow}>
        {tags.map((tag) => (
          <View key={tag} style={s.tag}>
            <Text style={s.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={[s.actionBtn, accent && s.actionBtnAccent]} onPress={onPress}>
        <Text style={[s.actionText, accent && s.actionTextAccent]}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TelemedicinScreen() {
  const handleOdontolar = async () => {
    try {
      await openApp(ODONTOLAR_PACKAGE, ODONTOLAR_PLAY_URL);
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o aplicativo. Verifique se está instalado.');
    }
  };

  const handleRapidoc = async () => {
    try {
      await Linking.openURL(RAPIDOC_URL);
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o navegador.');
    }
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergência Médica',
      'Em caso de emergência real ligue agora:',
      [
        { text: 'SAMU 192', onPress: () => Linking.openURL('tel:192') },
        { text: 'Bombeiros 193', onPress: () => Linking.openURL('tel:193') },
        { text: 'Fechar', style: 'cancel' },
      ]
    );
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll}>
      <FadeInView>
        <View style={s.hero}>
          <Text style={s.heroIcon}>⚕</Text>
          <Text style={s.heroTitle}>Telemedicina</Text>
          <Text style={s.heroSubtitle}>Consultas médicas e odontológicas sem sair de casa</Text>
        </View>
      </FadeInView>

      <FadeInView delay={100}>
        <Text style={s.sectionLabel}>Serviços Disponíveis</Text>

        <ServiceCard
          accent
          icon="🦷"
          title="Odontolar"
          subtitle="Consulta odontológica online"
          tags={['Clínico Geral', 'Ortodontia', 'Implantes', 'Urgência']}
          actionLabel="Abrir Odontolar →"
          onPress={handleOdontolar}
        />

        <ServiceCard
          icon="🩺"
          title="Rapidoc"
          subtitle="Telemedicina geral · + 300 parceiros"
          tags={['Clínico Geral', 'Pediatria', 'Psicologia', 'Dermatologia']}
          actionLabel="Acessar Rapidoc →"
          onPress={handleRapidoc}
        />
      </FadeInView>

      <FadeInView delay={200}>
        <Text style={s.sectionLabel}>Como funciona</Text>
        <View style={s.stepsCard}>
          {[
            { n: '1', text: 'Escolha o serviço e agende no app' },
            { n: '2', text: 'Consulta por vídeo no horário marcado' },
            { n: '3', text: 'Receita e atestado digitais em minutos' },
          ].map((step) => (
            <View key={step.n} style={s.step}>
              <View style={s.stepBadge}>
                <Text style={s.stepN}>{step.n}</Text>
              </View>
              <Text style={s.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      </FadeInView>

      <FadeInView delay={300}>
        <TouchableOpacity style={s.emergencyBtn} onPress={handleEmergency}>
          <Text style={s.emergencyIcon}>🚨</Text>
          <Text style={s.emergencyText}>Emergência? Ligue SAMU 192</Text>
        </TouchableOpacity>
      </FadeInView>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  hero: { alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.lg },
  heroIcon: { fontSize: 56, marginBottom: spacing.md },
  heroTitle: { fontSize: fontSize.display, fontWeight: '700', color: colors.primary },
  heroSubtitle: { fontSize: fontSize.body, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
  sectionLabel: { fontSize: fontSize.md, fontWeight: '700', color: colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.md, marginTop: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardAccent: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  cardIcon: { fontSize: 36, marginRight: spacing.md },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  cardSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  tag: { backgroundColor: colors.bg, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3, borderWidth: 1, borderColor: colors.border },
  tagText: { fontSize: fontSize.xs, color: colors.textMuted },
  actionBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnAccent: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionText: { fontSize: fontSize.body, fontWeight: '600', color: colors.textSecondary },
  actionTextAccent: { color: colors.textLight },
  stepsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepN: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  stepText: { flex: 1, fontSize: fontSize.body, color: colors.text },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#FFCCCC',
    backgroundColor: '#FFF5F5',
  },
  emergencyIcon: { fontSize: 20 },
  emergencyText: { fontSize: fontSize.body, color: colors.error, fontWeight: '600' },
});
