import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuário';
  const email = user?.email || '';

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={s.container}>
      <FadeInView>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Conta</Text>
          <View style={s.row}>
            <Text style={s.label}>Nome</Text>
            <Text style={s.value}>{displayName}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Email</Text>
            <Text style={s.value}>{email}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Plano</Text>
            <Text style={[s.value, s.gold]}>Free</Text>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={100}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Preferências</Text>
          <View style={s.row}>
            <Text style={s.label}>Modo Escuro</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: colors.primary }} thumbColor="#fff" />
          </View>
          <View style={s.row}>
            <Text style={s.label}>Notificações</Text>
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: colors.primary }} thumbColor="#fff" />
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={200}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Sobre</Text>
          <View style={s.row}>
            <Text style={s.label}>Versão</Text>
            <Text style={s.value}>4.2.0</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Build</Text>
            <Text style={s.value}>SDK 54 · Production</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Desenvolvedor</Text>
            <Text style={s.value}>Arkhe Labs</Text>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={300}>
        <View style={s.logoutSection}>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <Text style={s.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </FadeInView>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  sectionTitle: { color: colors.primary, fontSize: fontSize.body, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { color: colors.text, fontSize: fontSize.lg },
  value: { color: colors.textSecondary, fontSize: fontSize.lg },
  gold: { color: colors.primary, fontWeight: '600' },
  logoutSection: { padding: spacing.xl, marginTop: spacing.xl },
  logoutBtn: {
    backgroundColor: colors.errorBg, borderRadius: radius.md, padding: spacing.lg,
    alignItems: 'center', borderWidth: 1, borderColor: colors.error,
  },
  logoutText: { color: colors.error, fontWeight: '700', fontSize: fontSize.lg },
});
