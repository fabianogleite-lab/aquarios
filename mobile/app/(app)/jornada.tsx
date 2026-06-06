import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { useXP } from '../../hooks/useXP';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { formatDate } from '../../lib/locale';
import { arcanoDoDia } from '../../data/arcanos';

interface Draw { id: string; arcano_num: number; arcano_name: string; reflection: string | null; created_at: string; }

export default function JornadaScreen() {
  const { user } = useAuthStore();
  const { logXP } = useXP();
  const arc = arcanoDoDia(user?.id || 'anon');
  const [reflection, setReflection] = useState('');
  const [saving, setSaving] = useState(false);
  const [todaySaved, setTodaySaved] = useState<Draw | null>(null);
  const [history, setHistory] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('arcana_draws')
      .select('id, arcano_num, arcano_name, reflection, created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
    const rows = (data || []) as Draw[];
    setHistory(rows);
    const todayStr = new Date().toDateString();
    setTodaySaved(rows.find(r => new Date(r.created_at).toDateString() === todayStr) || null);
    setLoading(false);
  };
  useFocusEffect(useCallback(() => { load(); }, [user?.id]));

  const save = async () => {
    if (!reflection.trim() || !user?.id) return;
    setSaving(true);
    const { error } = await supabase.from('arcana_draws').insert({
      user_id: user.id, arcano_num: arc.num, arcano_name: arc.name, reflection: reflection.trim(),
    });
    setSaving(false);
    if (error) { Alert.alert('Ops', 'Não consegui salvar agora. Tente de novo.'); return; }
    logXP('arcana_reflection', 20, 'jornada').catch(() => {});
    setReflection('');
    load();
  };

  const histShown = history.filter(h => new Date(h.created_at).toDateString() !== new Date().toDateString()).slice(0, 10);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <FadeInView>
        <View style={s.header}>
          <Text style={s.title}>Jornada</Text>
          <Text style={s.subtitle}>O arcano é um espelho, não um destino. Ele pergunta — você responde.</Text>
        </View>
      </FadeInView>

      <FadeInView delay={80}>
        <View style={s.card}>
          <Text style={s.cardTag}>ARCANO DO DIA</Text>
          <Text style={s.arcEmoji}>{arc.emoji}</Text>
          <Text style={s.arcName}>{arc.num} · {arc.name}</Text>
          <Text style={s.arcKeyword}>{arc.keyword}</Text>
          <View style={s.divider} />
          <Text style={s.arcPrompt}>{arc.prompt}</Text>
        </View>
      </FadeInView>

      {todaySaved ? (
        <FadeInView delay={140}>
          <Text style={s.sectionLabel}>SUA REFLEXÃO DE HOJE</Text>
          <View style={s.savedCard}>
            <Text style={s.savedText}>{todaySaved.reflection}</Text>
          </View>
          <Text style={s.note}>Você já refletiu hoje. Volte amanhã para um novo arcano.</Text>
        </FadeInView>
      ) : (
        <FadeInView delay={140}>
          <Text style={s.sectionLabel}>SUA REFLEXÃO</Text>
          <TextInput
            style={s.input}
            value={reflection}
            onChangeText={setReflection}
            placeholder="O que essa pergunta desperta em você hoje?"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={600}
          />
          <TouchableOpacity style={[s.saveBtn, !reflection.trim() && s.saveBtnDisabled]} onPress={save} disabled={!reflection.trim() || saving}>
            {saving ? <ActivityIndicator color={colors.textLight} /> : <Text style={s.saveText}>Guardar reflexão</Text>}
          </TouchableOpacity>
        </FadeInView>
      )}

      <FadeInView delay={200}>
        <Text style={s.sectionLabel}>TIRAGENS ANTERIORES</Text>
        <View style={s.histCard}>
          {loading ? <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.lg }} />
            : histShown.length === 0 ? <Text style={s.histEmpty}>Suas reflexões passadas aparecem aqui.</Text>
            : histShown.map((h, i) => (
              <View key={h.id} style={[s.histRow, i < histShown.length - 1 && s.histBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.histName}>{h.arcano_num} · {h.arcano_name}</Text>
                  {!!h.reflection && <Text style={s.histRef} numberOfLines={2}>{h.reflection}</Text>}
                  <Text style={s.histDate}>{formatDate(h.created_at)}</Text>
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
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, lineHeight: 18 },
  card: { alignItems: 'center', backgroundColor: colors.cardDark, borderRadius: radius.lg, marginHorizontal: spacing.lg, paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border },
  cardTag: { fontSize: 9, fontWeight: '700', color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.md },
  arcEmoji: { fontSize: 56, marginBottom: spacing.sm },
  arcName: { fontSize: fontSize.xl, fontWeight: '700', color: colors.textLight, textAlign: 'center' },
  arcKeyword: { fontSize: fontSize.sm, color: colors.primary, marginTop: spacing.xs, fontWeight: '600' },
  divider: { height: 1, width: '40%', backgroundColor: colors.border, marginVertical: spacing.md },
  arcPrompt: { fontSize: fontSize.lg, color: colors.textLight, textAlign: 'center', lineHeight: 24, fontStyle: 'italic' },
  sectionLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.md },
  input: { backgroundColor: colors.card, borderRadius: radius.md, marginHorizontal: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border, minHeight: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, marginHorizontal: spacing.lg, marginTop: spacing.md, paddingVertical: spacing.md, alignItems: 'center', minHeight: 50, justifyContent: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: colors.textLight, fontSize: fontSize.lg, fontWeight: '700' },
  savedCard: { backgroundColor: colors.primarySubtle, borderRadius: radius.lg, marginHorizontal: spacing.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.primaryFaded },
  savedText: { fontSize: fontSize.md, color: colors.text, lineHeight: 22, fontStyle: 'italic' },
  note: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, marginHorizontal: spacing.lg },
  histCard: { backgroundColor: colors.card, borderRadius: radius.lg, marginHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  histBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  histName: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  histRef: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  histDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  histEmpty: { fontSize: fontSize.sm, color: colors.textMuted, paddingVertical: spacing.lg, textAlign: 'center' },
});
