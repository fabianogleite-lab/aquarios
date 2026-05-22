import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth';

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuário';
  const email = user?.email || '';

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{displayName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Plano</Text>
          <Text style={[styles.value, styles.gold]}>Free</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferências</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Modo Escuro</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: '#b8952a' }} thumbColor="#fff" />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Notificações</Text>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: '#b8952a' }} thumbColor="#fff" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Versão</Text>
          <Text style={styles.value}>4.2.0</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Build</Text>
          <Text style={styles.value}>SDK 54 · Expo Go</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Desenvolvedor</Text>
          <Text style={styles.value}>Arkhe Labs</Text>
        </View>
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090c14' },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { color: '#b8952a', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#141c28' },
  label: { color: '#ccd6e8', fontSize: 15 },
  value: { color: '#6a7a8a', fontSize: 15 },
  gold: { color: '#b8952a', fontWeight: '600' },
  logoutSection: { padding: 20, marginTop: 20 },
  logoutBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  logoutText: { color: '#e74c3c', fontWeight: '700', fontSize: 15 },
});
