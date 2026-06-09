import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { LoadingState } from '../../components/LoadingState';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

export default function NutricaoMetasScreen() {
  const [calories, setCalories] = useState('2000');
  const [protein, setProtein] = useState('150');
  const [carbs, setCarbs] = useState('250');
  const [fat, setFat] = useState('65');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuthStore();

  useFocusEffect(useCallback(() => {
    const load = async () => {
      if (!user?.id) return;
      const { data } = await supabase.from('nutrition_goals').select('*').eq('user_id', user.id).single();
      if (data) {
        setCalories(String(data.daily_calories));
        setProtein(String(data.daily_protein));
        setCarbs(String(data.daily_carbs));
        setFat(String(data.daily_fat));
      }
      setLoading(false);
    };
    load();
  }, [user]));

  const save = async () => {
    if (!user?.id) return;
    const vals = [calories, protein, carbs, fat];
    if (vals.some(v => !v || isNaN(Number(v)))) {
      Alert.alert('Erro', 'Todos os campos devem ser números válidos');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('nutrition_goals').upsert({
      user_id: user.id,
      daily_calories: Number(calories), daily_protein: Number(protein),
      daily_carbs: Number(carbs), daily_fat: Number(fat),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    setSaving(false);
    if (error) { Alert.alert('Erro', 'Não foi possível salvar as metas'); return; }
    Alert.alert('Sucesso', 'Metas atualizadas!', [{ text: 'OK', onPress: () => router.back() }]);
  };

  if (loading) return <LoadingState />;

  const fields = [
    { label: '🔥 Calorias (kcal)', value: calories, set: setCalories, color: colors.primary },
    { label: '💪 Proteína (g)', value: protein, set: setProtein, color: colors.macro.protein },
    { label: '🌾 Carboidratos (g)', value: carbs, set: setCarbs, color: colors.macro.carbs },
    { label: '🧈 Gorduras (g)', value: fat, set: setFat, color: colors.macro.fat },
  ];

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <FadeInView>
          <Text style={s.title}>Metas Diárias</Text>
          <Text style={s.sub}>Configure suas metas de nutrição para acompanhar o progresso</Text>
        </FadeInView>

        {fields.map(({ label, value, set, color }, i) => (
          <FadeInView key={label} delay={100 + i * 80}>
            <View style={s.field}>
              <Text style={s.label}>{label}</Text>
              <View style={[s.inputWrap, { borderColor: color + '44' }]}>
                <TextInput style={[s.input, { color }]} value={value} onChangeText={set} keyboardType="numeric" selectTextOnFocus />
              </View>
            </View>
          </FadeInView>
        ))}

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
          <Text style={s.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.saveBtn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.textLight} /> : <Text style={s.saveText}>Salvar Metas</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg },
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  sub: { color: colors.textMuted, fontSize: fontSize.md, marginBottom: spacing.xxl, lineHeight: 18 },
  field: { marginBottom: spacing.lg },
  label: { color: colors.text, fontSize: fontSize.body, fontWeight: '600', marginBottom: spacing.sm },
  inputWrap: { borderRadius: radius.lg, borderWidth: 1.5, backgroundColor: colors.card, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs },
  input: { fontSize: fontSize.hero, fontWeight: '700', paddingVertical: 10, textAlign: 'center' },
  footer: { flexDirection: 'row', padding: spacing.lg, gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelText: { color: colors.textMuted, fontSize: fontSize.lg, fontWeight: '600' },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: radius.lg, backgroundColor: colors.primary, alignItems: 'center' },
  saveText: { color: colors.textLight, fontSize: fontSize.lg, fontWeight: '700' },
});
