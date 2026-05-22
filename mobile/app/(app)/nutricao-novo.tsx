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
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';

type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

const MEAL_TYPES: { value: MealType; label: string; icon: string }[] = [
  { value: 'breakfast', label: 'Café da Manhã', icon: '🌅' },
  { value: 'lunch', label: 'Almoço', icon: '🍽️' },
  { value: 'snack', label: 'Lanche', icon: '🍪' },
  { value: 'dinner', label: 'Jantar', icon: '🌙' },
];

export default function NutricaoNovoScreen() {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [notes, setNotes] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  const save = async () => {
    if (!name.trim()) { Alert.alert('Erro', 'Informe o nome da refeição'); return; }
    if (!calories.trim() || isNaN(Number(calories))) { Alert.alert('Erro', 'Informe as calorias'); return; }

    setSaving(true);
    const { error } = await supabase.from('meals').insert({
      user_id: user?.id,
      name: name.trim(),
      calories: Number(calories),
      protein: protein ? Number(protein) : null,
      carbs: carbs ? Number(carbs) : null,
      fat: fat ? Number(fat) : null,
      meal_type: mealType,
      notes: notes.trim() || null,
    });

    setSaving(false);
    if (error) { Alert.alert('Erro', 'Não foi possível salvar'); return; }
    router.back();
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Nova Refeição</Text>

        <Text style={s.label}>Refeição *</Text>
        <TextInput
          style={s.input}
          placeholder="Ex: Frango com arroz"
          placeholderTextColor="#3a4a5a"
          value={name}
          onChangeText={setName}
        />

        <Text style={s.label}>Calorias *</Text>
        <TextInput
          style={s.input}
          placeholder="kcal"
          placeholderTextColor="#3a4a5a"
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
        />

        <Text style={s.label}>Macros (opcional)</Text>
        <View style={s.macroRow}>
          <View style={s.macroField}>
            <Text style={s.macroLabel}>Proteína (g)</Text>
            <TextInput style={s.macroInput} placeholder="0" placeholderTextColor="#3a4a5a" value={protein} onChangeText={setProtein} keyboardType="numeric" />
          </View>
          <View style={s.macroField}>
            <Text style={s.macroLabel}>Carbos (g)</Text>
            <TextInput style={s.macroInput} placeholder="0" placeholderTextColor="#3a4a5a" value={carbs} onChangeText={setCarbs} keyboardType="numeric" />
          </View>
          <View style={s.macroField}>
            <Text style={s.macroLabel}>Gordura (g)</Text>
            <TextInput style={s.macroInput} placeholder="0" placeholderTextColor="#3a4a5a" value={fat} onChangeText={setFat} keyboardType="numeric" />
          </View>
        </View>

        <Text style={s.label}>Tipo de Refeição</Text>
        <View style={s.typeRow}>
          {MEAL_TYPES.map(t => (
            <TouchableOpacity
              key={t.value}
              style={[s.typeBtn, mealType === t.value && s.typeBtnActive]}
              onPress={() => setMealType(t.value)}
            >
              <Text style={s.typeIcon}>{t.icon}</Text>
              <Text style={[s.typeLabel, mealType === t.value && s.typeLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Notas (opcional)</Text>
        <TextInput
          style={[s.input, s.textArea]}
          placeholder="Observações..."
          placeholderTextColor="#3a4a5a"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
          <Text style={s.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.saveBtn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#090c14" /> : <Text style={s.saveText}>Salvar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090c14' },
  scroll: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#b8952a', marginBottom: 20 },
  label: { color: '#ccd6e8', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#0d1520', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#ccd6e8', fontSize: 15, borderWidth: 1, borderColor: '#141c28' },
  textArea: { height: 80, textAlignVertical: 'top' },
  macroRow: { flexDirection: 'row', gap: 8 },
  macroField: { flex: 1 },
  macroLabel: { color: '#3a4a5a', fontSize: 11, marginBottom: 4 },
  macroInput: { backgroundColor: '#0d1520', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, color: '#ccd6e8', fontSize: 14, borderWidth: 1, borderColor: '#141c28', textAlign: 'center' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: { flex: 1, minWidth: '45%', alignItems: 'center', backgroundColor: '#0d1520', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#141c28' },
  typeBtnActive: { borderColor: '#b8952a', backgroundColor: '#1a1508' },
  typeIcon: { fontSize: 20, marginBottom: 4 },
  typeLabel: { color: '#3a4a5a', fontSize: 11, fontWeight: '600' },
  typeLabelActive: { color: '#b8952a' },
  footer: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: '#141c28' },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#141c28', alignItems: 'center' },
  cancelText: { color: '#3a4a5a', fontSize: 15, fontWeight: '600' },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: '#b8952a', alignItems: 'center' },
  saveText: { color: '#090c14', fontSize: 15, fontWeight: '700' },
});
