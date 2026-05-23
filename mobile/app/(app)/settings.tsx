import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Share } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

const PLANS = [
  { key: 'free', label: 'Free', color: colors.textSecondary },
  { key: 'starter', label: 'Starter Bronze', color: '#cd7f32' },
  { key: 'premium', label: 'Premium Silver', color: '#c0c0c0' },
  { key: 'professional', label: 'Professional Gold', color: colors.primary },
];

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuário';
  const email = user?.email || '';
  const currentPlan = PLANS[0];

  const handleExportData = async () => {
    if (!user?.id) return;
    setExporting(true);

    try {
      const [meals, diary, chat] = await Promise.all([
        supabase.from('meals').select('*').eq('user_id', user.id),
        supabase.from('diary_entries').select('*').eq('user_id', user.id),
        supabase.from('chat_messages').select('*').eq('user_id', user.id),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user: { id: user.id, email: user.email, display_name: displayName },
        meals: meals.data || [],
        diary_entries: diary.data || [],
        chat_messages: chat.data || [],
        total_records: (meals.data?.length || 0) + (diary.data?.length || 0) + (chat.data?.length || 0),
      };

      const jsonStr = JSON.stringify(exportData, null, 2);

      await Share.share({
        message: jsonStr,
        title: `AquariOS - Dados de ${displayName}`,
      });
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível exportar seus dados. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'ATENÇÃO: Esta ação é irreversível.\n\nTodos os seus dados (diário, nutrição, conversas, comunidades) serão permanentemente excluídos.\n\nDeseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, excluir tudo',
          style: 'destructive',
          onPress: () => confirmDelete(),
        },
      ]
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Confirmação Final',
      'Digite "EXCLUIR" mentalmente e confirme. Seus dados serão apagados para sempre.',
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'EXCLUIR PERMANENTEMENTE',
          style: 'destructive',
          onPress: executeDelete,
        },
      ]
    );
  };

  const executeDelete = async () => {
    if (!user?.id) return;
    setDeleting(true);

    try {
      await Promise.all([
        supabase.from('meals').delete().eq('user_id', user.id),
        supabase.from('nutrition_goals').delete().eq('user_id', user.id),
        supabase.from('diary_entries').delete().eq('user_id', user.id),
        supabase.from('chat_messages').delete().eq('user_id', user.id),
        supabase.from('wonder_purchases').delete().eq('user_id', user.id),
        supabase.from('user_follows').delete().eq('follower_id', user.id),
        supabase.from('user_follows').delete().eq('following_id', user.id),
        supabase.from('timeline_posts').delete().eq('user_id', user.id),
      ]);

      await signOut();
      Alert.alert('Conta Excluída', 'Todos os seus dados foram removidos. Obrigado por usar o AquariOS.');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível excluir a conta. Tente novamente ou entre em contato: contato@podiumtec.com.br');
    } finally {
      setDeleting(false);
    }
  };

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
            <View style={s.planBadge}>
              <Text style={[s.planText, { color: currentPlan.color }]}>{currentPlan.label}</Text>
            </View>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={50}>
        <View style={s.upgradeCard}>
          <Text style={s.upgradeTitle}>Planos em breve</Text>
          <View style={s.planRow}>
            {PLANS.slice(1).map((plan) => (
              <View key={plan.key} style={s.planChip}>
                <Text style={[s.planChipText, { color: plan.color }]}>{plan.label.split(' ')[1]}</Text>
              </View>
            ))}
          </View>
          <Text style={s.upgradeDesc}>Acesso a Data Lake, analytics avançado e mais recursos</Text>
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

      <FadeInView delay={150}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Privacidade (LGPD)</Text>
          <TouchableOpacity style={s.actionRow} onPress={handleExportData} disabled={exporting}>
            <View>
              <Text style={s.actionLabel}>Exportar meus dados</Text>
              <Text style={s.actionDesc}>Receba todos os seus dados em formato JSON</Text>
            </View>
            {exporting ? <ActivityIndicator color={colors.primary} /> : <Text style={s.actionArrow}>→</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={s.actionRow} onPress={handleDeleteAccount} disabled={deleting}>
            <View>
              <Text style={[s.actionLabel, { color: colors.error }]}>Excluir minha conta</Text>
              <Text style={s.actionDesc}>Remove permanentemente todos os seus dados</Text>
            </View>
            {deleting ? <ActivityIndicator color={colors.error} /> : <Text style={[s.actionArrow, { color: colors.error }]}>→</Text>}
          </TouchableOpacity>
        </View>
      </FadeInView>

      <FadeInView delay={200}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Sobre</Text>
          <View style={s.row}>
            <Text style={s.label}>Versão</Text>
            <Text style={s.value}>4.3.0</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Build</Text>
            <Text style={s.value}>SDK 56 · Production</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Desenvolvedor</Text>
            <Text style={s.value}>Arkhe Labs</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Contato</Text>
            <Text style={s.value}>contato@podiumtec.com.br</Text>
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

      <View style={{ height: 30 }} />
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
  planBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primaryFaded,
  },
  planText: { fontSize: fontSize.md, fontWeight: '700', letterSpacing: 0.5 },
  upgradeCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  upgradeTitle: { color: colors.textSecondary, fontSize: fontSize.sm, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  planRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  planChip: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  planChipText: { fontSize: fontSize.xs, fontWeight: '600' },
  upgradeDesc: { color: colors.textMuted, fontSize: fontSize.sm },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionLabel: { color: colors.text, fontSize: fontSize.lg, fontWeight: '500' },
  actionDesc: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  actionArrow: { color: colors.primary, fontSize: 20, fontWeight: '600' },
  logoutSection: { padding: spacing.xl, marginTop: spacing.md },
  logoutBtn: {
    backgroundColor: colors.errorBg, borderRadius: radius.md, padding: spacing.lg,
    alignItems: 'center', borderWidth: 1, borderColor: colors.error,
  },
  logoutText: { color: colors.error, fontWeight: '700', fontSize: fontSize.lg },
});
