import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { useXP } from '../../hooks/useXP';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { formatDate } from '../../lib/locale';

const MOODS = [
  { v: 2,  emoji: '😔', label: 'Difícil' },
  { v: 4,  emoji: '😟', label: 'Baixo' },
  { v: 6,  emoji: '😐', label: 'Neutro' },
  { v: 8,  emoji: '🙂', label: 'Bem' },
  { v: 10, emoji: '😄', label: 'Ótimo' },
];
const ENERGIES = [
  { v: 2,  emoji: '🪫', label: 'Esgotado' },
  { v: 4,  emoji: '😴', label: 'Cansado' },
  { v: 6,  emoji: '😌', label: 'Estável' },
  { v: 8,  emoji: '💪', label: 'Ativo' },
  { v: 10, emoji: '🚀', label: 'Pleno' },
];

function moodEmoji(v: number): string {
  return MOODS.reduce((p, c) => (Math.abs(c.v - v) < Math.abs(p.v - v) ? c : p), MOODS[0]).emoji;
}

interface MoodEntry { id: string; mood: number; energy: number | null; intention: string | null; created_at: string; }

export default function HumorScreen() {
  const { user } = useAuthStore();
  const { logXP } = useXP();
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [intention, setIntention] = useState('');
  const [saving, setSaving] = useState(false);
  const [today, setToday] = useState<MoodEntry | null>(null);
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data } = await supabase
      .from('mood_logs')
      .select('id, mood, energy, intention, created_at')
      .eq('user_id', user.id)
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false });
    const rows = (data || []) as MoodEntry[];
    setHistory(rows);
    const todayStr = new Date().toDateString();
    setToday(rows.find(r => new Date(r.created_at).toDateString() === todayStr) || null);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { load(); }, [user?.id]));

  const save = async () => {
    if (mood == null || !user?.id) return;
    setSaving(true);
    const { error } = await supabase.from('mood_logs').insert({
      user_id: user.id, mood, energy, intention: intention.trim() || null,
    });
    setSaving(false);
    if (error) { Alert.alert('Ops', 'Não consegui salvar agora. Tente de novo.'); return; }
    logXP('mood_checkin', 15, 'humor').catch(() => {});
    setMood(null); setEnergy(null); setIntention('');
    load();
  };

  const histShown = history.slice(0, 7);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <FadeInView>
        <View style={s.header}>
          <Text style={s.title}>Como você está agora?</Text>
          <Text style={s.subtitle}>Um check-in de 5 segundos. Sem certo nem errado.</Text>
        </View>
      </FadeInView>

      {today && (
        <FadeInView delay={60}>
          <View style={s.todayCard}>
            <Text style={s.todayEmoji}>{moodEmoji(today.mood)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.todayLabel}>Você já fez check-in hoje</Text>
              <Text style={s.todaySub}>Humor {today.mood}/10{today.energy ? ` · Energia ${today.energy}/10` : ''}. Pode registrar de novo se algo mudou.</Text>
            </View>
          </View>
        </FadeInView>
      )}

      <FadeInView delay={100}>
        <Text style={s.sectionLabel}>HUMOR</Text>
        <View style={s.row}>
          {MOODS.map(m => (
            <TouchableOpacity key={m.v} style={[s.pick, mood === m.v && s.pickActive]} onPress={() => setMood(m.v)} activeOpacity={0.7}>
              <Text style={s.pickEmoji}>{m.emoji}</Text>
              <Text style={[s.pickLabel, mood === m.v && s.pickLabelActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </FadeInView>

      <FadeInView delay={140}>
        <Text style={s.sectionLabel}>ENERGIA (OPCIONAL)</Text>
        <View style={s.row}>
          {ENERGIES.map(m => (
            <TouchableOpacity key={m.v} style={[s.pick, energy === m.v && s.pickActive]} onPress={() => setEnergy(energy === m.v ? null : m.v)} activeOpacity={0.7}>
              <Text style={s.pickEmoji}>{m.emoji}</Text>
              <Text style={[s.pickLabel, energy === m.v && s.pickLabelActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </FadeInView>

      <FadeInView delay={180}>
        <Text style={s.sectionLabel}>INTENÇÃO DO DIA (OPCIONAL)</Text>
        <TextInput
          style={s.input}
          value={intention}
          onChangeText={setIntention}
          placeholder="O que importa pra você hoje?"
          placeholderTextColor={colors.textMuted}
          maxLength={140}
        />
      </FadeInView>

      <FadeInView delay={220}>
        <TouchableOpacity style={[s.saveBtn, mood == null && s.saveBtnDisabled]} onPress={save} disabled={mood == null || saving}>
          {saving ? <ActivityIndicator color={colors.textLight} /> : <Text style={s.saveText}>Registrar check-in</Text>}
        </TouchableOpacity>
        <Text style={s.note}>Alimenta seu iVi Mental e ajuda o ProteOS a te entender.</Text>
      </FadeInView>

      <FadeInView delay={260}>
        <Text style={s.sectionLabel}>ÚLTIMOS 7 DIAS</Text>
        <View style={s.histCard}>
          {loading ? <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.lg }} />
            : histShown.length === 0 ? <Text style={s.histEmpty}>Seu primeiro check-in aparece aqui.</Text>
            : histShown.map((h, i) => (
              <View key={h.id} style={[s.histRow, i < histShown.length - 1 && s.histBorder]}>
                <Text style={s.histEmoji}>{moodEmoji(h.mood)}</Text>
                <Text style={s.histDate}>{formatDate(h.created_at)}</Text>
                <Text style={s.histVal}>{h.mood}/10</Text>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, gap: spacing.xs },
  pick: { flex: 1, alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border },
  pickActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  pickEmoji: { fontSize: 26 },
  pickLabel: { fontSize: 9, color: colors.textMuted, marginTop: 4, fontWeight: '600' },
  pickLabelActive: { color: colors.primary },
  input: { backgroundColor: colors.card, borderRadius: radius.md, marginHorizontal: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, marginHorizontal: spacing.lg, marginTop: spacing.xl, paddingVertical: spacing.md, alignItems: 'center', minHeight: 50, justifyContent: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: colors.textLight, fontSize: fontSize.lg, fontWeight: '700' },
  note: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, marginHorizontal: spacing.lg },
  histCard: { backgroundColor: colors.card, borderRadius: radius.lg, marginHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  histBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  histEmoji: { fontSize: 20 },
  histDate: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  histVal: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  histEmpty: { fontSize: fontSize.sm, color: colors.textMuted, paddingVertical: spacing.lg, textAlign: 'center' },
});
