import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth';
import { FadeInView } from '../../components/FadeInView';

const P = {
  bg: '#F6F4F0', card: '#FFFFFF', text: '#2B2A26', textSecondary: '#5C5A53',
  textMuted: '#8A8678', textDimmed: '#9C998F', border: '#ECE9E2', danger: '#C0392B',
};

function Row({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} disabled={!onPress}>
      <Text style={s.rowLabel}>{label}</Text>
      {value ? <Text style={s.rowValue}>{value}</Text> : null}
      {onPress ? <Text style={s.rowChev}>›</Text> : null}
    </TouchableOpacity>
  );
}

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [notificacoes, setNotificacoes] = useState(true);
  const [vozAtiva, setVozAtiva] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sair da conta', 'Tem certeza que quer sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await signOut(); router.replace('/'); } },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: P.bg }} contentContainerStyle={{ padding: 20, paddingTop: 28 }}>
      <FadeInView>
        <Text style={s.section}>Conta</Text>
        <View style={s.card}>
          <Row label="E-mail" value={user?.email || '—'} />
          <Row label="Nome de exibição" value={user?.user_metadata?.display_name || '—'} />
        </View>
      </FadeInView>

      <FadeInView delay={60}>
        <Text style={s.section}>Preferências</Text>
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.rowLabel}>Notificações</Text>
            <Switch value={notificacoes} onValueChange={setNotificacoes} />
          </View>
          <View style={[s.row, { borderBottomWidth: 0 }]}>
            <Text style={s.rowLabel}>Voz ativa por padrão no ProteOS</Text>
            <Switch value={vozAtiva} onValueChange={setVozAtiva} />
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={120}>
        <Text style={s.section}>Plano</Text>
        <View style={s.card}>
          <Row label="Plano atual" value="Gratuito" onPress={() => router.push('/store' as any)} />
        </View>
      </FadeInView>

      <FadeInView delay={180}>
        <Text style={s.section}>Sobre</Text>
        <View style={s.card}>
          <Row label="Versão" value="4.7.0" />
          <Row label="Política de privacidade" onPress={() => router.push({ pathname: '/coming-soon', params: { module: 'privacidade' } } as any)} />
        </View>
      </FadeInView>

      <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
        <Text style={s.signOutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  section: { fontSize: 11.5, color: P.textDimmed, letterSpacing: 0.5, marginBottom: 8, marginTop: 20, textTransform: 'uppercase' },
  card: { backgroundColor: P.card, borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: P.border },
  rowLabel: { fontSize: 14, color: P.text },
  rowValue: { fontSize: 13, color: P.textMuted, marginRight: 6 },
  rowChev: { fontSize: 14, color: P.textDimmed },
  signOutBtn: { marginTop: 28, alignItems: 'center', paddingVertical: 14 },
  signOutText: { fontSize: 14, color: P.danger, fontWeight: '600' },
});
