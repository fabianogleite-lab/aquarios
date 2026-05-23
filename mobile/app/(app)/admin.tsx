import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

interface DbStats {
  meals: number;
  diary: number;
  chat: number;
  wonder: number;
}

export default function AdminScreen() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DbStats>({ meals: 0, diary: 0, chat: 0, wonder: 0 });
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    if (!user?.id) return;
    setLoading(true);
    const [meals, diary, chat, wonder] = await Promise.all([
      supabase.from('meals').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('diary_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('wonder_purchases').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);
    setStats({
      meals: meals.count ?? 0,
      diary: diary.count ?? 0,
      chat: chat.count ?? 0,
      wonder: wonder.count ?? 0,
    });
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadStats(); }, [user]));

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={s.container}>
      <FadeInView>
        <View style={s.header}>
          <Text style={s.title}>⚙ Admin</Text>
          <Text style={s.subtitle}>Arkhe Labs · Supra-Usuário</Text>
        </View>
      </FadeInView>

      <FadeInView delay={80}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Conta</Text>
          <Row label="User ID" value={user?.id ? user.id.substring(0, 18) + '...' : '—'} />
          <Row label="Email" value={user?.email ?? '—'} />
          <Row label="Display Name" value={user?.user_metadata?.display_name ?? '—'} />
          <Row label="Criado em" value={user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '—'} />
        </View>
      </FadeInView>

      <FadeInView delay={120}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Sistema</Text>
          <Row label="Versão" value="4.4.0" />
          <Row label="Build" value="SDK 56 · V1.0512" />
          <Row label="Modelo IA" value="claude-haiku-4-5" />
          <Row label="Backend" value="Supabase Edge Functions" />
        </View>
      </FadeInView>

      <FadeInView delay={160}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Dados do usuário {loading ? '(carregando...)' : ''}</Text>
          <Row label="Refeições" value={String(stats.meals)} />
          <Row label="Entradas Diário" value={String(stats.diary)} />
          <Row label="Mensagens Chat" value={String(stats.chat)} />
          <Row label="Wonder Compras" value={String(stats.wonder)} />
          <Row label="Total registros" value={String(stats.meals + stats.diary + stats.chat + stats.wonder)} />
        </View>
      </FadeInView>

      <FadeInView delay={200}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Personas ProteOS</Text>
          {[
            { key: 'default',    label: 'ProteOS (padrão)',    desc: 'Caloroso, profundo, prático' },
            { key: 'pragmatico', label: 'Direto (Zé do Aperto)', desc: 'Objetivo, ação imediata, ≤3 frases' },
            { key: 'suporte',    label: 'Suporte (Dona Maria)', desc: 'Acolhedor, empático, holístico' },
            { key: 'urgencia',   label: 'Clínico (Carlos)',    desc: 'Urgência clínica, encaminha profissionais' },
          ].map((p) => (
            <View key={p.key} style={s.personaRow}>
              <Text style={s.personaLabel}>{p.label}</Text>
              <Text style={s.personaDesc}>{p.desc}</Text>
            </View>
          ))}
        </View>
      </FadeInView>

      <FadeInView delay={240}>
        <View style={s.warnCard}>
          <Text style={s.warnText}>⚠ Tela restrita ao desenvolvedor. Acesso via 5 toques em "Arkhe Labs" nas Configurações.</Text>
        </View>
      </FadeInView>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: 32, paddingBottom: spacing.lg },
  title: { fontSize: fontSize.hero, fontWeight: '700', color: colors.primary },
  subtitle: { fontSize: fontSize.body, color: colors.textSecondary, marginTop: spacing.xs },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  sectionTitle: {
    color: colors.primary, fontSize: fontSize.sm, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  label: { color: colors.text, fontSize: fontSize.body },
  value: { color: colors.textSecondary, fontSize: fontSize.body, maxWidth: '55%', textAlign: 'right' },
  personaRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  personaLabel: { color: colors.text, fontSize: fontSize.body, fontWeight: '600' },
  personaDesc: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  warnCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryFaded,
  },
  warnText: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18 },
});
