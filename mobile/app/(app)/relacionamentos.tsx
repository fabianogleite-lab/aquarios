import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { useXP } from '../../hooks/useXP';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { formatDate } from '../../lib/locale';

const KINDS = [
  { k: 'familia',  label: 'Família',     emoji: '👨‍👩‍👧' },
  { k: 'amigo',    label: 'Amigo',       emoji: '🫂' },
  { k: 'parceiro', label: 'Parceiro(a)', emoji: '💑' },
  { k: 'colega',   label: 'Colega',      emoji: '🤝' },
  { k: 'outro',    label: 'Outro',       emoji: '🌐' },
];
const QUALITY = [
  { v: 2,  emoji: '😕', label: 'Difícil' },
  { v: 4,  emoji: '🙂', label: 'Ok' },
  { v: 6,  emoji: '😊', label: 'Bom' },
  { v: 8,  emoji: '🥰', label: 'Ótimo' },
  { v: 10, emoji: '💛', label: 'Profundo' },
];

interface RelEntry { id: string; person: string | null; kind: string | null; quality: number | null; created_at: string; }

export default function RelacionamentosScreen() {
  const { user } = useAuthStore();
  const { logXP } = useXP();
  const [person, setPerson] = useState('');
  const [kind, setKind] = useState<string | null>(null);
  const [quality, setQuality] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<RelEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data } = await supabase.from('relationship_logs')
      .select('id, person, kind, quality, created_at')
      .eq('user_id', user.id).gte('created_at', weekAgo).order('created_at', { ascending: false });
    setHistory((data || []) as RelEntry[]);
    setLoading(false);
  };
  useFocusEffect(useCallback(() => { load(); }, [user?.id]));

  const canSave = quality != null || kind != null;

  const save = async () => {
    if (!canSave || !user?.id) return;
    setSaving(true);
    const { error } = await supabase.from('relationship_logs').insert({
      user_id: user.id, person: person.trim() || null, kind, quality, note: note.trim() || null,
    });
    setSaving(false);
    if (error) { Alert.alert('Ops', 'Não consegui salvar agora. Tente de novo.'); return; }
    logXP('relationship', 15, 'relacionamentos').catch(() => {});
    setPerson(''); setKind(null); setQuality(null); setNote('');
    load();
  };

  const histShown = history.slice(0, 7);
  const kindEmoji = (k: string | null) => KINDS.find(x => x.k === k)?.emoji || '🌐';

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <FadeInView>
        <View style={s.header}>
          <Text style={s.title}>Com quem você se conectou?</Text>
          <Text style={s.subtitle}>Vínculo de verdade — não curtida.</Text>
        </View>
      </FadeInView>

      <FadeInView delay={100}>
        <Text style={s.sectionLabel}>QUEM (OPCIONAL)</Text>
        <TextInput style={s.input} value={person} onChangeText={setPerson} placeholder="Nome ou como quiser chamar" placeholderTextColor={colors.textMuted} maxLength={60} />
      </FadeInView>

      <FadeInView delay={140}>
        <Text style={s.sectionLabel}>TIPO DE VÍNCULO</Text>
        <View style={s.chips}>
          {KINDS.map(x => (
            <TouchableOpacity key={x.k} style={[s.chip, kind === x.k && s.chipActive]} onPress={() => setKind(kind === x.k ? null : x.k)} activeOpacity={0.7}>
              <Text style={s.chipEmoji}>{x.emoji}</Text>
              <Text style={[s.chipLabel, kind === x.k && s.chipLabelActive]}>{x.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </FadeInView>

      <FadeInView delay={180}>
        <Text style={s.sectionLabel}>COMO FOI</Text>
        <View style={s.row}>
          {QUALITY.map(q => (
            <TouchableOpacity key={q.v} style={[s.pick, quality === q.v && s.pickActive]} onPress={() => setQuality(quality === q.v ? null : q.v)} activeOpacity={0.7}>
              <Text style={s.pickEmoji}>{q.emoji}</Text>
              <Text style={[s.pickLabel, quality === q.v && s.pickLabelActive]}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </FadeInView>

      <FadeInView delay={220}>
        <Text style={s.sectionLabel}>ALGO A LEMBRAR (OPCIONAL)</Text>
        <TextInput style={[s.input, s.noteInput]} value={note} onChangeText={setNote} placeholder="O que esse momento teve de especial…" placeholderTextColor={colors.textMuted} multiline maxLength={300} />
      </FadeInView>

      <FadeInView delay={260}>
        <TouchableOpacity style={[s.saveBtn, !canSave && s.saveBtnDisabled]} onPress={save} disabled={!canSave || saving}>
          {saving ? <ActivityIndicator color={colors.textLight} /> : <Text style={s.saveText}>Registrar conexão</Text>}
        </TouchableOpacity>
        <Text style={s.note}>Alimenta seu iVi Social.</Text>
      </FadeInView>

      <FadeInView delay={300}>
        <Text style={s.sectionLabel}>ÚLTIMOS 7 DIAS</Text>
        <View style={s.histCard}>
          {loading ? <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.lg }} />
            : histShown.length === 0 ? <Text style={s.histEmpty}>Sua primeira conexão aparece aqui.</Text>
            : histShown.map((h, i) => (
              <View key={h.id} style={[s.histRow, i < histShown.length - 1 && s.histBorder]}>
                <Text style={s.histEmoji}>{kindEmoji(h.kind)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.histPerson}>{h.person || KINDS.find(x => x.k === h.kind)?.label || 'Conexão'}</Text>
                  <Text style={s.histDate}>{formatDate(h.created_at)}</Text>
                </View>
                {h.quality != null && <Text style={s.histQual}>{QUALITY.find(q => q.v === h.quality)?.emoji || ''}</Text>}
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
  sectionLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.md },
  input: { backgroundColor: colors.card, borderRadius: radius.md, marginHorizontal: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border },
  noteInput: { minHeight: 70, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  chipEmoji: { fontSize: 15 },
  chipLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '600' },
  chipLabelActive: { color: colors.primary },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, gap: spacing.xs },
  pick: { flex: 1, alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border },
  pickActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  pickEmoji: { fontSize: 24 },
  pickLabel: { fontSize: 9, color: colors.textMuted, marginTop: 4, fontWeight: '600' },
  pickLabelActive: { color: colors.primary },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, marginHorizontal: spacing.lg, marginTop: spacing.xl, paddingVertical: spacing.md, alignItems: 'center', minHeight: 50, justifyContent: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: colors.textLight, fontSize: fontSize.lg, fontWeight: '700' },
  note: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, marginHorizontal: spacing.lg },
  histCard: { backgroundColor: colors.card, borderRadius: radius.lg, marginHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  histBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  histEmoji: { fontSize: 20 },
  histPerson: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  histDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  histQual: { fontSize: 18 },
  histEmpty: { fontSize: fontSize.sm, color: colors.textMuted, paddingVertical: spacing.lg, textAlign: 'center' },
});
