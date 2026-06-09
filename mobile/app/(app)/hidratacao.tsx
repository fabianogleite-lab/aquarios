import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { useXP } from '../../hooks/useXP';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

const GOAL_ML = 2000;

export default function HidratacaoScreen() {
  const { user } = useAuthStore();
  const { logXP } = useXP();
  const [todayMl, setTodayMl] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const { data } = await supabase.from('hydration_logs')
      .select('amount_ml').eq('user_id', user.id).gte('created_at', start.toISOString());
    const rows = data || [];
    setTodayMl(rows.reduce((sum: number, r: any) => sum + (r.amount_ml || 0), 0));
    setCount(rows.length);
    setLoading(false);
  };
  useFocusEffect(useCallback(() => { load(); }, [user?.id]));

  const add = async (ml: number) => {
    if (!user?.id || adding) return;
    setAdding(true);
    setTodayMl(p => p + ml); setCount(p => p + 1); // otimista
    const { error } = await supabase.from('hydration_logs').insert({ user_id: user.id, amount_ml: ml });
    setAdding(false);
    if (error) { load(); return; }
    logXP('hydration', 5, 'hidratacao').catch(() => {});
  };

  const pct = Math.min(100, Math.round(todayMl / GOAL_ML * 100));

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <FadeInView>
        <View style={s.header}>
          <Text style={s.title}>Hidratação</Text>
          <Text style={s.subtitle}>Pequenos goles, grande diferença.</Text>
        </View>
      </FadeInView>

      <FadeInView delay={80}>
        <View style={s.hero}>
          <Text style={s.drop}>💧</Text>
          <Text style={s.bigMl}>{loading ? '—' : todayMl}<Text style={s.unit}> ml</Text></Text>
          <Text style={s.goalText}>{pct}% da meta ({GOAL_ML} ml) · {count} registro{count !== 1 ? 's' : ''}</Text>
          <View style={s.track}><View style={[s.fill, { width: `${loading ? 0 : pct}%` }]} /></View>
        </View>
      </FadeInView>

      <FadeInView delay={140}>
        <Text style={s.sectionLabel}>ADICIONAR</Text>
        <View style={s.btnRow}>
          <TouchableOpacity style={s.addBtn} onPress={() => add(250)} disabled={adding} activeOpacity={0.7}>
            <Text style={s.addEmoji}>🥛</Text><Text style={s.addLabel}>Copo</Text><Text style={s.addMl}>250 ml</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.addBtn} onPress={() => add(500)} disabled={adding} activeOpacity={0.7}>
            <Text style={s.addEmoji}>🍶</Text><Text style={s.addLabel}>Garrafa</Text><Text style={s.addMl}>500 ml</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.addBtn} onPress={() => add(750)} disabled={adding} activeOpacity={0.7}>
            <Text style={s.addEmoji}>🚰</Text><Text style={s.addLabel}>Grande</Text><Text style={s.addMl}>750 ml</Text>
          </TouchableOpacity>
        </View>
      </FadeInView>

      <FadeInView delay={200}>
        <Text style={s.note}>Alimenta seu iVi Físico. A meta reinicia a cada dia.</Text>
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
  hero: { alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, marginHorizontal: spacing.lg, paddingVertical: spacing.xl, borderWidth: 1, borderColor: colors.border },
  drop: { fontSize: 40, marginBottom: spacing.sm },
  bigMl: { fontSize: 44, fontWeight: '700', color: colors.text },
  unit: { fontSize: fontSize.lg, color: colors.textMuted, fontWeight: '600' },
  goalText: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.md },
  track: { height: 8, width: '80%', backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.somatica, borderRadius: 4 },
  sectionLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.md },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, gap: spacing.sm },
  addBtn: { flex: 1, alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: spacing.lg, borderWidth: 1, borderColor: colors.border },
  addEmoji: { fontSize: 28 },
  addLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  addMl: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  note: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl, marginHorizontal: spacing.lg },
});
