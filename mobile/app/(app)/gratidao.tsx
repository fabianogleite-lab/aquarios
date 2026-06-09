import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { useXP } from '../../hooks/useXP';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { formatDate } from '../../lib/locale';

interface GratEntry { id: string; items: string[] | null; note: string | null; created_at: string; }

export default function GratidaoScreen() {
  const { user } = useAuthStore();
  const { logXP } = useXP();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<GratEntry[]>([]);
  const [today, setToday] = useState<GratEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data } = await supabase
      .from('gratitude_logs')
      .select('id, items, note, created_at')
      .eq('user_id', user.id)
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false });
    const rows = (data || []) as GratEntry[];
    setHistory(rows);
    const todayStr = new Date().toDateString();
    setToday(rows.find(r => new Date(r.created_at).toDateString() === todayStr) || null);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { load(); }, [user?.id]));

  const items = [a, b, c].map(s => s.trim()).filter(Boolean);
  const canSave = items.length > 0;

  const save = async () => {
    if (!canSave || !user?.id) return;
    setSaving(true);
    const { error } = await supabase.from('gratitude_logs').insert({
      user_id: user.id, items, note: note.trim() || null,
    });
    setSaving(false);
    if (error) { Alert.alert('Ops', 'Não consegui salvar agora. Tente de novo.'); return; }
    logXP('gratitude_entry', 15, 'gratidao').catch(() => {});
    setA(''); setB(''); setC(''); setNote('');
    load();
  };

  const histShown = history.slice(0, 7);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <FadeInView>
        <View style={s.header}>
          <Text style={s.title}>Pelo que você é grato hoje?</Text>
          <Text style={s.subtitle}>Três coisas bastam. As pequenas contam.</Text>
        </View>
      </FadeInView>

      {today && (
        <FadeInView delay={60}>
          <View style={s.todayCard}>
            <Text style={s.todayEmoji}>🙏</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.todayLabel}>Você já registrou gratidão hoje</Text>
              <Text style={s.todaySub} numberOfLines={2}>{(today.items || []).slice(0, 3).join(' · ') || 'Registrado'}. Pode adicionar mais.</Text>
            </View>
          </View>
        </FadeInView>
      )}

      <FadeInView delay={100}>
        <Text style={s.sectionLabel}>EU SOU GRATO POR…</Text>
        <TextInput style={s.input} value={a} onChangeText={setA} placeholder="1. algo, alguém, um momento…" placeholderTextColor={colors.textMuted} maxLength={120} />
        <TextInput style={s.input} value={b} onChangeText={setB} placeholder="2. (opcional)" placeholderTextColor={colors.textMuted} maxLength={120} />
        <TextInput style={s.input} value={c} onChangeText={setC} placeholder="3. (opcional)" placeholderTextColor={colors.textMuted} maxLength={120} />
      </FadeInView>

      <FadeInView delay={160}>
        <Text style={s.sectionLabel}>POR QUÊ? (OPCIONAL)</Text>
        <TextInput style={[s.input, s.noteInput]} value={note} onChangeText={setNote} placeholder="O que isso significou pra você…" placeholderTextColor={colors.textMuted} multiline maxLength={300} />
      </FadeInView>

      <FadeInView delay={200}>
        <TouchableOpacity style={[s.saveBtn, !canSave && s.saveBtnDisabled]} onPress={save} disabled={!canSave || saving}>
          {saving ? <ActivityIndicator color={colors.textLight} /> : <Text style={s.saveText}>Registrar gratidão</Text>}
        </TouchableOpacity>
        <Text style={s.note}>Alimenta seu iVi Espiritual e ajuda o ProteOS a te entender.</Text>
      </FadeInView>

      <FadeInView delay={240}>
        <Text style={s.sectionLabel}>ÚLTIMOS 7 DIAS</Text>
        <View style={s.histCard}>
          {loading ? <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.lg }} />
            : histShown.length === 0 ? <Text style={s.histEmpty}>Sua primeira gratidão aparece aqui.</Text>
            : histShown.map((h, i) => (
              <View key={h.id} style={[s.histRow, i < histShown.length - 1 && s.histBorder]}>
                <Text style={s.histEmoji}>🙏</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.histDate}>{formatDate(h.created_at)}</Text>
                  <Text style={s.histItems} numberOfLines={1}>{(h.items || []).join(' · ')}</Text>
                </View>
              </View>
            ))}
        </View>
      </FadeInView>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md },
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  todayCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.primarySubtle, borderRadius: radius.lg, padding: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.primaryFaded },
  todayEmoji: { fontSize: 30 },
  todayLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  todaySub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  sectionLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.md },
  input: { backgroundColor: colors.card, borderRadius: radius.md, marginHorizontal: spacing.lg, marginBottom: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border },
  noteInput: { minHeight: 70, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, marginHorizontal: spacing.lg, marginTop: spacing.md, paddingVertical: spacing.md, alignItems: 'center', minHeight: 50, justifyContent: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: colors.textLight, fontSize: fontSize.lg, fontWeight: '700' },
  note: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, marginHorizontal: spacing.lg },
  histCard: { backgroundColor: colors.card, borderRadius: radius.lg, marginHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  histBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  histEmoji: { fontSize: 20 },
  histDate: { fontSize: fontSize.sm, color: colors.text },
  histItems: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  histEmpty: { fontSize: fontSize.sm, color: colors.textMuted, paddingVertical: spacing.lg, textAlign: 'center' },
});
