import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

const MODULE_INFO: Record<string, { icon: string; name: string; tagline: string; features: string[] }> = {
  aeropagos: {
    icon: '🏛',
    name: 'AeropagOS',
    tagline: 'Gamificação desbloqueável por lotes e conquistas',
    features: [
      'Sistema de lotes progressivos por módulo',
      'Conquistas e badges de autoconhecimento',
      'XP Existencial como moeda de crescimento',
      'Ranking comunitário com impacto real',
    ],
  },
  token_economy: {
    icon: '💰',
    name: 'Token Economy',
    tagline: 'Tokens AquariOS · recompensas, acesso e pertencimento',
    features: [
      '4 tipos: AI, Sync, Insight e Community tokens',
      'Ganho por engajamento, streak e contribuição',
      'Acesso temporário (24h/30d) ou permanente',
      'Mercado interno: troque tokens por módulos e conteúdo',
    ],
  },
  sandeiros: {
    icon: '🔮',
    name: 'SandeirOS',
    tagline: 'Engine simbólica dos 22 arcanos maiores',
    features: [
      'Tiragens personalizadas com arcanos do Tarot',
      'Tempero simbólico nas respostas do ProteOS',
      'Padrões longitudinais de arcanos recorrentes',
      'Espelho interior através de linguagem arquetípica',
    ],
  },
  asclepios: {
    icon: '⚕',
    name: 'AsclepiOS',
    tagline: 'Módulo médico com prontuário inteligente',
    features: [
      'Arquivo digital de resultados de exames',
      'Anamnese assistida por inteligência artificial',
      'Prontuário longitudinal integrado ao HygeiOS',
      'Integração com telemedicina via Rapidoc',
    ],
  },
  hermeos: {
    icon: '💰',
    name: 'HermeOS',
    tagline: 'Inteligência financeira pessoal',
    features: [
      'Visão consolidada de finanças e investimentos',
      'Análise de padrões de consumo',
      'Metas financeiras alinhadas ao seu estilo de vida',
      'Criptografia de ponta a ponta nos dados bancários',
    ],
  },
  eterios: {
    icon: '📡',
    name: 'EteriOS',
    tagline: 'Conexão com dispositivos e wearables',
    features: [
      'Telemetria de dispositivos IoT',
      'Sincronização com smartwatches e pulseiras',
      'Métricas biométricas em tempo real',
      'Isolamento total de dados por dispositivo',
    ],
  },
  ecumenicos: {
    icon: '☯',
    name: 'EcumenicOS',
    tagline: 'Sabedoria inter-religiosa e filosófica',
    features: [
      'Consultas cruzando tradições espirituais',
      'A Voz do Silêncio, Livro dos Mortos do Tibet',
      'Quarto Caminho como fundamento prático',
      'Respeito à soberania de cada tradição',
    ],
  },
  panaceia: {
    icon: '🛍',
    name: 'PanaceIA',
    tagline: 'Marketplace de saúde, bem-estar e autoconhecimento',
    features: [
      'Produtos curados: suplementos, livros, wearables',
      'Modelo dropship afiliado — sem estoque próprio',
      '9 categorias temáticas alinhadas aos módulos',
      'Compras desbloqueáveis por nível e tokens',
    ],
  },
  'beck-office': {
    icon: '🏢',
    name: 'Beck Office',
    tagline: 'Plataforma B2B para clínicas, empresas e profissionais',
    features: [
      'Painel multi-paciente para clínicas e terapeutas',
      'Acesso corporativo com dados anonimizados',
      'Relatórios de bem-estar organizacional',
      'White-label configurável por plano empresarial',
    ],
  },
  'token-economy': {
    icon: '🪙',
    name: 'Token Economy',
    tagline: 'Tokens AquariOS · recompensas, acesso e pertencimento',
    features: [
      '4 tipos: AI, Sync, Insight e Community tokens',
      'Ganho por engajamento, streak e contribuição',
      'Acesso temporário (24h/30d) ou permanente',
      'Mercado interno: troque tokens por módulos e conteúdo',
    ],
  },
  cerberos: {
    icon: '🛡',
    name: 'CerberOS',
    tagline: 'Segurança ativa com 7 camadas de proteção',
    features: [
      'Aprisionamento por detecção de comportamento malicioso',
      'ETERNAL MAZE: bloqueio progressivo e inescapável',
      'HygeiOS Data Gate: acesso exclusivo ao dono dos dados',
      'Auditoria transparente sem vigilância oculta',
    ],
  },
};

export default function ComingSoonScreen() {
  const { module } = useLocalSearchParams<{ module: string }>();
  const router = useRouter();
  const info = MODULE_INFO[module || ''];

  if (!info) {
    return (
      <View style={s.container}>
        <Text style={s.errorText}>Módulo não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <FadeInView>
        <View style={s.header}>
          <Text style={s.icon}>{info.icon}</Text>
          <Text style={s.name}>{info.name}</Text>
          <View style={s.badge}>
            <Text style={s.badgeText}>Em construção</Text>
          </View>
          <Text style={s.tagline}>{info.tagline}</Text>
        </View>
      </FadeInView>

      <FadeInView delay={200}>
        <View style={s.card}>
          <Text style={s.cardTitle}>O que vem por aí</Text>
          {info.features.map((feat, i) => (
            <View key={i} style={s.featureRow}>
              <Text style={s.bullet}>◆</Text>
              <Text style={s.featureText}>{feat}</Text>
            </View>
          ))}
        </View>
      </FadeInView>

      <FadeInView delay={400}>
        <View style={s.messageCard}>
          <Text style={s.messageEmoji}>⚗</Text>
          <Text style={s.messageText}>
            Estamos destilando este módulo com o cuidado que ele merece. Em breve, será parte do seu Sistema Operacional Pessoal.
          </Text>
        </View>
      </FadeInView>

      <FadeInView delay={500}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>Voltar à Home</Text>
        </TouchableOpacity>
      </FadeInView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl },
  header: { alignItems: 'center', paddingTop: 48, paddingBottom: spacing.xl },
  icon: { fontSize: 72, marginBottom: spacing.md },
  name: { fontSize: fontSize.hero, fontWeight: '700', color: colors.text, letterSpacing: 1 },
  badge: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  badgeText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  tagline: { fontSize: fontSize.lg, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  cardTitle: { fontSize: fontSize.xl, fontWeight: '600', color: colors.text, marginBottom: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  bullet: { color: colors.primary, fontSize: fontSize.sm, marginRight: spacing.sm, marginTop: 2 },
  featureText: { flex: 1, fontSize: fontSize.lg, color: colors.textSecondary, lineHeight: 22 },
  messageCard: {
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryFaded,
  },
  messageEmoji: { fontSize: 32, marginBottom: spacing.sm },
  messageText: { fontSize: fontSize.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, fontStyle: 'italic' },
  backBtn: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backText: { color: colors.textSecondary, fontSize: fontSize.lg },
  errorText: { color: colors.error, fontSize: fontSize.xl, textAlign: 'center', marginTop: 100 },
});
