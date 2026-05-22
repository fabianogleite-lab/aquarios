import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  meal_type: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  notes: string | null;
  created_at: string;
}

interface Goals {
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
}

const MEAL_ICONS = { breakfast: '🌅', lunch: '🍽️', snack: '🍪', dinner: '🌙' };
const MEAL_LABELS = { breakfast: 'Café da Manhã', lunch: 'Almoço', snack: 'Lanche', dinner: 'Jantar' };
const DEFAULT_GOALS: Goals = { daily_calories: 2000, daily_protein: 150, daily_carbs: 250, daily_fat: 65 };

function RingProgress({ value, max, color, label, unit }: { value: number; max: number; color: string; label: string; unit: string }) {
  const pct = Math.min(value / max, 1);
  const size = 72;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = circ * (1 - pct);

  return (
    <View style={ring.wrap}>
      <View style={[ring.circle, { width: size, height: size }]}>
        <View style={[ring.bg, { borderColor: '#141c28', borderRadius: size / 2, borderWidth: stroke }]} />
        <View style={ring.inner}>
          <Text style={[ring.value, { color }]}>{Math.round(value)}</Text>
          <Text style={ring.unit}>{unit}</Text>
        </View>
      </View>
      <Text style={ring.label}>{label}</Text>
      <Text style={ring.sub}>{Math.round(pct * 100)}%</Text>
    </View>
  );
}

const ring = StyleSheet.create({
  wrap: { alignItems: 'center', flex: 1 },
  circle: { justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  inner: { alignItems: 'center' },
  value: { fontSize: 16, fontWeight: '700' },
  unit: { fontSize: 10, color: '#3a4a5a' },
  label: { fontSize: 11, color: '#ccd6e8', fontWeight: '600' },
  sub: { fontSize: 10, color: '#3a4a5a' },
});

export default function NutricaoScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [mealsRes, goalsRes] = await Promise.all([
      supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false }),
      supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', user.id)
        .single(),
    ]);

    if (!mealsRes.error) setMeals(mealsRes.data || []);
    if (!goalsRes.error && goalsRes.data) setGoals(goalsRes.data);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadData(); }, [user]));

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const deleteMeal = (id: string) => {
    Alert.alert('Deletar Refeição', 'Confirma?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar', style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('meals').delete().eq('id', id);
          if (!error) setMeals(prev => prev.filter(m => m.id !== id));
        },
      },
    ]);
  };

  const grouped = (['breakfast', 'lunch', 'snack', 'dinner'] as const).reduce((acc, type) => {
    acc[type] = meals.filter(m => m.meal_type === type);
    return acc;
  }, {} as Record<string, Meal[]>);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Text style={s.title}>🥗 Nutrição</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/nutricao-metas')}>
            <Text style={s.metasBtn}>Metas ⚙</Text>
          </TouchableOpacity>
        </View>

        <View style={s.ringsCard}>
          <Text style={s.ringsTitle}>Hoje</Text>
          <View style={s.ringsRow}>
            <RingProgress value={totals.calories} max={goals.daily_calories} color="#b8952a" label="Kcal" unit="kcal" />
            <RingProgress value={totals.protein} max={goals.daily_protein} color="#ff6b6b" label="Prot" unit="g" />
            <RingProgress value={totals.carbs} max={goals.daily_carbs} color="#4ecdc4" label="Carbs" unit="g" />
            <RingProgress value={totals.fat} max={goals.daily_fat} color="#ffd93d" label="Gord" unit="g" />
          </View>
          <View style={s.calBar}>
            <View style={[s.calFill, { width: `${Math.min((totals.calories / goals.daily_calories) * 100, 100)}%` as any }]} />
          </View>
          <Text style={s.calText}>{totals.calories} / {goals.daily_calories} kcal</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#b8952a" style={{ marginTop: 32 }} />
        ) : (
          (['breakfast', 'lunch', 'snack', 'dinner'] as const).map(type => (
            grouped[type].length > 0 && (
              <View key={type} style={s.section}>
                <Text style={s.sectionTitle}>{MEAL_ICONS[type]} {MEAL_LABELS[type]}</Text>
                {grouped[type].map(meal => (
                  <TouchableOpacity key={meal.id} style={s.mealCard} onLongPress={() => deleteMeal(meal.id)}>
                    <View style={s.mealRow}>
                      <Text style={s.mealName}>{meal.name}</Text>
                      <Text style={s.mealKcal}>{meal.calories} kcal</Text>
                    </View>
                    {(meal.protein || meal.carbs || meal.fat) ? (
                      <Text style={s.mealMacros}>
                        {meal.protein ? `P: ${meal.protein}g  ` : ''}
                        {meal.carbs ? `C: ${meal.carbs}g  ` : ''}
                        {meal.fat ? `G: ${meal.fat}g` : ''}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            )
          ))
        )}

        {!loading && meals.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyText}>Nenhuma refeição hoje.</Text>
            <Text style={s.emptyText}>Adicione sua primeira refeição!</Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => router.push('/(app)/nutricao-novo')}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090c14' },
  scroll: { paddingHorizontal: 16, paddingTop: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#b8952a' },
  metasBtn: { color: '#3a4a5a', fontSize: 13 },
  ringsCard: { backgroundColor: '#0d1520', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#141c28' },
  ringsTitle: { color: '#ccd6e8', fontSize: 13, fontWeight: '600', marginBottom: 12 },
  ringsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  calBar: { height: 6, backgroundColor: '#141c28', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  calFill: { height: '100%', backgroundColor: '#b8952a', borderRadius: 3 },
  calText: { color: '#3a4a5a', fontSize: 12, textAlign: 'center' },
  section: { marginBottom: 16 },
  sectionTitle: { color: '#ccd6e8', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  mealCard: { backgroundColor: '#0d1520', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#141c28' },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealName: { color: '#ccd6e8', fontSize: 14, fontWeight: '500', flex: 1 },
  mealKcal: { color: '#b8952a', fontSize: 14, fontWeight: '700' },
  mealMacros: { color: '#3a4a5a', fontSize: 12, marginTop: 4 },
  empty: { alignItems: 'center', marginTop: 48 },
  emptyText: { color: '#3a4a5a', fontSize: 15, marginBottom: 4 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#b8952a', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  fabText: { color: '#090c14', fontSize: 32, fontWeight: '700' },
});
