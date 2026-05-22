import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { PressableScale } from '../../components/PressableScale';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

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

  return (
    <View style={ring.wrap}>
      <View style={[ring.circle, { width: size, height: size }]}>
        <View style={[ring.bg, { borderColor: colors.border, borderRadius: size / 2, borderWidth: stroke }]} />
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
  circle: { justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xs },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  inner: { alignItems: 'center' },
  value: { fontSize: fontSize.xl, fontWeight: '700' },
  unit: { fontSize: 10, color: colors.textMuted },
  label: { fontSize: fontSize.xs, color: colors.text, fontWeight: '600' },
  sub: { fontSize: 10, color: colors.textMuted },
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
      supabase.from('meals').select('*').eq('user_id', user.id).gte('created_at', today.toISOString()).order('created_at', { ascending: false }),
      supabase.from('nutrition_goals').select('*').eq('user_id', user.id).single(),
    ]);

    if (!mealsRes.error) setMeals(mealsRes.data || []);
    if (!goalsRes.error && goalsRes.data) setGoals(goalsRes.data);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadData(); }, [user]));

  const totals = meals.reduce(
    (acc, m) => ({ calories: acc.calories + m.calories, protein: acc.protein + (m.protein || 0), carbs: acc.carbs + (m.carbs || 0), fat: acc.fat + (m.fat || 0) }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const deleteMeal = (id: string) => {
    Alert.alert('Deletar Refeição', 'Confirma?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Deletar', style: 'destructive', onPress: async () => {
        const { error } = await supabase.from('meals').delete().eq('id', id);
        if (!error) setMeals(prev => prev.filter(m => m.id !== id));
      }},
    ]);
  };

  const grouped = (['breakfast', 'lunch', 'snack', 'dinner'] as const).reduce((acc, type) => {
    acc[type] = meals.filter(m => m.meal_type === type);
    return acc;
  }, {} as Record<string, Meal[]>);

  if (loading) return <LoadingState />;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Text style={s.title}>🥗 Nutrição</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/nutricao-metas')}>
            <Text style={s.metasBtn}>Metas ⚙</Text>
          </TouchableOpacity>
        </View>

        <FadeInView>
          <View style={s.ringsCard}>
            <Text style={s.ringsTitle}>Hoje</Text>
            <View style={s.ringsRow}>
              <RingProgress value={totals.calories} max={goals.daily_calories} color={colors.primary} label="Kcal" unit="kcal" />
              <RingProgress value={totals.protein} max={goals.daily_protein} color={colors.macro.protein} label="Prot" unit="g" />
              <RingProgress value={totals.carbs} max={goals.daily_carbs} color={colors.macro.carbs} label="Carbs" unit="g" />
              <RingProgress value={totals.fat} max={goals.daily_fat} color={colors.macro.fat} label="Gord" unit="g" />
            </View>
            <View style={s.calBar}>
              <View style={[s.calFill, { width: `${Math.min((totals.calories / goals.daily_calories) * 100, 100)}%` as any }]} />
            </View>
            <Text style={s.calText}>{totals.calories} / {goals.daily_calories} kcal</Text>
          </View>
        </FadeInView>

        {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map((type, i) => (
          grouped[type].length > 0 ? (
            <FadeInView key={type} delay={100 + i * 80}>
              <View style={s.section}>
                <Text style={s.sectionTitle}>{MEAL_ICONS[type]} {MEAL_LABELS[type]}</Text>
                {grouped[type].map(meal => (
                  <PressableScale key={meal.id} style={s.mealCard} onLongPress={() => deleteMeal(meal.id)}>
                    <View style={s.mealRow}>
                      <Text style={s.mealName}>{meal.name}</Text>
                      <Text style={s.mealKcal}>{meal.calories} kcal</Text>
                    </View>
                    {(meal.protein || meal.carbs || meal.fat) ? (
                      <Text style={s.mealMacros}>
                        {meal.protein ? `P: ${meal.protein}g  ` : ''}{meal.carbs ? `C: ${meal.carbs}g  ` : ''}{meal.fat ? `G: ${meal.fat}g` : ''}
                      </Text>
                    ) : null}
                  </PressableScale>
                ))}
              </View>
            </FadeInView>
          ) : null
        ))}

        {meals.length === 0 && (
          <EmptyState icon="🥗" title="Nenhuma refeição hoje" subtitle="Adicione sua primeira refeição!" />
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
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.primary },
  metasBtn: { color: colors.textMuted, fontSize: fontSize.md },
  ringsCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  ringsTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.md },
  ringsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.md },
  calBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  calFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  calText: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center' },
  section: { marginBottom: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: fontSize.body, fontWeight: '600', marginBottom: spacing.sm },
  mealCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealName: { color: colors.text, fontSize: fontSize.body, fontWeight: '500', flex: 1 },
  mealKcal: { color: colors.primary, fontSize: fontSize.body, fontWeight: '700' },
  mealMacros: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: radius.round, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  fabText: { color: colors.bg, fontSize: fontSize.display, fontWeight: '700' },
});
