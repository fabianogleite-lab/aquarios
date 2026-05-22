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
      const { data } = await supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();
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
    const payload = {
      user_id: user.id,
      daily_calories: Number(calories),
      daily_protein: Number(protein),
      daily_carbs: Number(carbs),
      daily_fat: Number(fat),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('nutrition_goals')
      .upsert(payload, { onConflict: 'user_id' });

    setSaving(false);
    if (error) { Alert.alert('Erro', 'Não foi possível salvar as metas'); return; }
    Alert.alert('Sucesso', 'Metas atualizadas!', [{ text: 'OK', onPress: () => router.back() }]);
  };

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator color="#b8952a" size="large" />
    </View>
  );

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Metas Diárias</Text>
        <Text style={s.sub}>Configure suas metas de nutrição para acompanhar o progresso</Text>

        {[
          { label: '🔥 Calorias (kcal)', value: calories, set: setCalories, color: '#b8952a' },
          { label: '💪 Proteína (g)', value: protein, set: setProtein, color: '#ff6b6b' },
          { label: '🌾 Carboidratos (g)', value: carbs, set: setCarbs, color: '#4ecdc4' },
          { label: '🧈 Gorduras (g)', value: fat, set: setFat, color: '#ffd93d' },
        ].map(({ label, value, set, color }) => (
          <View key={label} style={s.field}>
            <Text style={s.label}>{label}</Text>
            <View style={[s.inputWrap, { borderColor: color + '44' }]}>
              <TextInput
                style={[s.input, { color }]}
                value={value}
                onChangeText={set}
                keyboardType="numeric"
                selectTextOnFocus
              />
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
          <Text style={s.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.saveBtn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#090c14" /> : <Text style={s.saveText}>Salvar Metas</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090c14' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090c14' },
  scroll: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#b8952a', marginBottom: 6 },
  sub: { color: '#3a4a5a', fontSize: 13, marginBottom: 24, lineHeight: 18 },
  field: { marginBottom: 16 },
  label: { color: '#ccd6e8', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputWrap: { borderRadius: 12, borderWidth: 1.5, backgroundColor: '#0d1520', paddingHorizontal: 16, paddingVertical: 4 },
  input: { fontSize: 24, fontWeight: '700', paddingVertical: 10, textAlign: 'center' },
  footer: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: '#141c28' },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#141c28', alignItems: 'center' },
  cancelText: { color: '#3a4a5a', fontSize: 15, fontWeight: '600' },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: '#b8952a', alignItems: 'center' },
  saveText: { color: '#090c14', fontSize: 15, fontWeight: '700' },
});
