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
import { encryptField } from '../../lib/crypto';
import { FadeInView } from '../../components/FadeInView';
import { FoodPhotoButton, FoodVisionResult } from '../../components/FoodPhotoButton';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

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
  const [aiTag, setAiTag] = useState('');
  const router = useRouter();
  const { user } = useAuthStore();

  const handleFoodVision = (result: FoodVisionResult) => {
    setName(result.name);
    setCalories(String(Math.round(result.calories)));
    setProtein(String(result.protein.toFixed(1)));
    setCarbs(String(result.carbs.toFixed(1)));
    setFat(String(result.fat.toFixed(1)));
    setAiTag(`IA · confiança ${result.confidence}${result.notes ? ` · ${result.notes}` : ''}`);
  };

  const save = async () => {
    console.log('[Nutrição] Save clicked:', { name, calories, protein, carbs, fat });

    if (!name.trim()) { Alert.alert('Erro', 'Informe o nome da refeição'); return; }
    // Calorias e macros agora são opcionais (estimativa)

    setSaving(true);

    let encName: { ciphertext: string; nonce: string };
    let encNotes: { ciphertext: string; nonce: string } | null = null;
    try {
      encName = await encryptField(name.trim());
      if (notes.trim()) encNotes = await encryptField(notes.trim());
    } catch {
      setSaving(false);
      Alert.alert('Erro de Segurança', 'Não foi possível criptografar os dados. Tente novamente.');
      return;
    }

    try {
      console.log('[Nutrição] Inserting meal into database...');
      const { error } = await supabase.from('meals').insert({
        user_id: user?.id,
        name: '[encrypted]',
        name_encrypted: encName.ciphertext,
        name_nonce: encName.nonce,
        calories: calories ? Number(calories) : null,
        protein: protein ? Number(protein) : null,
        carbs: carbs ? Number(carbs) : null,
        fat: fat ? Number(fat) : null,
        meal_type: mealType,
        notes: encNotes ? '[encrypted]' : null,
        notes_encrypted: encNotes?.ciphertext ?? null,
        notes_nonce: encNotes?.nonce ?? null,
      });

      console.log('[Nutrição] Insert result:', { error });
      setSaving(false);
      if (error) {
        console.error('[Nutrição] Error details:', error);
        Alert.alert('Erro', `Não foi possível salvar: ${error.message}`);
        return;
      }
      Alert.alert('✅ Sucesso', 'Refeição registrada!');
      router.back();
    } catch (err) {
      console.error('[Nutrição] Exception:', err);
      setSaving(false);
      Alert.alert('Erro', String(err));
    }
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <FadeInView>
          <Text style={s.title}>Nova Refeição</Text>
          <FoodPhotoButton onResult={handleFoodVision} disabled={saving} />
          {aiTag ? <Text style={s.aiTag}>✨ {aiTag}</Text> : null}
        </FadeInView>

        <FadeInView delay={100}>
          <Text style={s.label}>Refeição *</Text>
          <TextInput style={s.input} placeholder="Ex: Frango com arroz" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />

          <Text style={s.label}>Calorias (opcional)</Text>
          <TextInput style={s.input} placeholder="kcal (estimativa)" placeholderTextColor={colors.textMuted} value={calories} onChangeText={setCalories} keyboardType="numeric" />
        </FadeInView>

        <FadeInView delay={200}>
          <Text style={s.label}>Macros (opcional)</Text>
          <View style={s.macroRow}>
            <View style={s.macroField}>
              <Text style={s.macroLabel}>Proteína (g)</Text>
              <TextInput style={s.macroInput} placeholder="0" placeholderTextColor={colors.textMuted} value={protein} onChangeText={setProtein} keyboardType="numeric" />
            </View>
            <View style={s.macroField}>
              <Text style={s.macroLabel}>Carbos (g)</Text>
              <TextInput style={s.macroInput} placeholder="0" placeholderTextColor={colors.textMuted} value={carbs} onChangeText={setCarbs} keyboardType="numeric" />
            </View>
            <View style={s.macroField}>
              <Text style={s.macroLabel}>Gordura (g)</Text>
              <TextInput style={s.macroInput} placeholder="0" placeholderTextColor={colors.textMuted} value={fat} onChangeText={setFat} keyboardType="numeric" />
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={300}>
          <Text style={s.label}>Tipo de Refeição</Text>
          <View style={s.typeRow}>
            {MEAL_TYPES.map(t => (
              <TouchableOpacity key={t.value} style={[s.typeBtn, mealType === t.value && s.typeBtnActive]} onPress={() => setMealType(t.value)}>
                <Text style={s.typeIcon}>{t.icon}</Text>
                <Text style={[s.typeLabel, mealType === t.value && s.typeLabelActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Notas (opcional)</Text>
          <TextInput style={[s.input, s.textArea]} placeholder="Observações..." placeholderTextColor={colors.textMuted} value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
        </FadeInView>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
          <Text style={s.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.saveBtn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.textLight} /> : <Text style={s.saveText}>Salvar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg },
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.primary, marginBottom: spacing.lg },
  aiTag: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: spacing.md, textAlign: 'center' },
  label: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: fontSize.lg, borderWidth: 1, borderColor: colors.border },
  textArea: { height: 80, textAlignVertical: 'top' },
  macroRow: { flexDirection: 'row', gap: spacing.sm },
  macroField: { flex: 1 },
  macroLabel: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: spacing.xs },
  macroInput: { backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 10, color: colors.text, fontSize: fontSize.body, borderWidth: 1, borderColor: colors.border, textAlign: 'center' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeBtn: { flex: 1, minWidth: '45%', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, padding: 10, borderWidth: 1, borderColor: colors.border },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  typeIcon: { fontSize: 20, marginBottom: spacing.xs },
  typeLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600' },
  typeLabelActive: { color: colors.primary },
  footer: { flexDirection: 'row', padding: spacing.lg, gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelText: { color: colors.textMuted, fontSize: fontSize.lg, fontWeight: '600' },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: radius.lg, backgroundColor: colors.primary, alignItems: 'center' },
  saveText: { color: colors.textLight, fontSize: fontSize.lg, fontWeight: '700' },
});
