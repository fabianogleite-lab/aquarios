import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/auth';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Aquariano';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>{'⚗'}</Text>
        <Text style={styles.title}>AquariOS</Text>
        <Text style={styles.greeting}>Olá, {displayName}</Text>
        <Text style={styles.subtitle}>Sistema Operacional Pessoal</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Módulos Ativos</Text>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>{'💬'}</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>ProteOS</Text>
            <Text style={styles.cardDesc}>Assistente IA pessoal com memória</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>{'✎'}</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Diário do Ser</Text>
            <Text style={styles.cardDesc}>Reflexões diárias e autoconhecimento</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>{'🧬'}</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Nutrição</Text>
            <Text style={styles.cardDesc}>Tracking nutricional inteligente</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>{'👥'}</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Comunidades</Text>
            <Text style={styles.cardDesc}>Círculos de crescimento coletivo</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>{'🌙'}</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Wonder Night</Text>
            <Text style={styles.cardDesc}>Rituais noturnos de transformação</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Arkhe Labs · 2024-2026</Text>
        <Text style={styles.footerSub}>Consciência como tecnologia</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090c14' },
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#141c28',
  },
  logo: { fontSize: 64, marginBottom: 12 },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#b8952a',
    letterSpacing: 2,
  },
  greeting: {
    fontSize: 16,
    color: '#ccd6e8',
    marginTop: 8,
  },
  subtitle: { fontSize: 14, color: '#6a7a8a', marginTop: 4 },
  section: { padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ccd6e8',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1520',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#141c28',
  },
  cardIcon: { fontSize: 28, marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#ccd6e8' },
  cardDesc: { fontSize: 13, color: '#6a7a8a', marginTop: 2 },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: '#141c28',
  },
  footerText: { color: '#3a4a5a', fontSize: 12 },
  footerSub: {
    color: '#2a3a4a',
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
