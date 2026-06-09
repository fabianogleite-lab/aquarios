import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { EmptyState } from '../../components/EmptyState';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { formatDate } from '../../lib/locale';

interface WonderEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  join_url: string;
  price: number;
  ticket_code?: string;
  purchased: boolean;
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function CountdownDisplay({ targetDate }: { targetDate: string }) {
  const { days, hours, minutes, seconds } = useCountdown(targetDate);
  return (
    <View style={s.countdown}>
      {[{ v: days, l: 'dias' }, { v: hours, l: 'hrs' }, { v: minutes, l: 'min' }, { v: seconds, l: 'seg' }].map(({ v, l }) => (
        <View key={l} style={s.countdownUnit}>
          <Text style={s.countdownNumber}>{String(v).padStart(2, '0')}</Text>
          <Text style={s.countdownLabel}>{l}</Text>
        </View>
      ))}
    </View>
  );
}

export default function WonderNightScreen() {
  const [events, setEvents] = useState<WonderEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const loadEvents = async () => {
    if (!user?.id) return;
    setLoading(true);

    const { data: eventsData } = await supabase.from('wonder_night_events').select('*').eq('is_active', true).order('event_date', { ascending: true });
    const { data: purchasesData } = await supabase.from('wonder_night_purchases').select('event_id, ticket_code').eq('user_id', user.id);

    const purchaseMap: Record<string, string> = {};
    (purchasesData || []).forEach((p: any) => { purchaseMap[p.event_id] = p.ticket_code; });

    setEvents((eventsData || []).map((e: any) => ({
      id: e.id, title: e.title, description: e.description, event_date: e.event_date,
      join_url: e.join_url, price: e.price, ticket_code: purchaseMap[e.id], purchased: !!purchaseMap[e.id],
    })));
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadEvents(); }, [user]));

  const handleJoin = (url: string) => {
    if (!url || url.includes('placeholder')) {
      Alert.alert('Em breve', 'O link de acesso será disponibilizado próximo ao evento.');
      return;
    }
    Linking.openURL(url);
  };

  const formatEventDate = (dateStr: string) => {
    return formatDate(dateStr, {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const isPast = (dateStr: string) => new Date(dateStr).getTime() < Date.now();

  return (
    <View style={s.container}>
      <FadeInView>
        <View style={s.header}>
          <Text style={s.title}>✦ Wonder Night</Text>
          <Text style={s.subtitle}>Experiências de conexão e bem-estar</Text>
        </View>
      </FadeInView>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          contentContainerStyle={s.listContent}
          renderItem={({ item, index }) => (
            <FadeInView delay={100 + index * 100}>
              <View style={[s.eventCard, item.purchased && s.eventCardOwned]}>
                <View style={s.eventHeader}>
                  <Text style={s.eventTitle}>{item.title}</Text>
                  {item.purchased && <View style={s.ownedBadge}><Text style={s.ownedBadgeText}>✓ Comprado</Text></View>}
                </View>

                <Text style={s.eventDate}>{formatEventDate(item.event_date)}</Text>
                <Text style={s.eventDescription}>{item.description}</Text>

                {!isPast(item.event_date) && (
                  <View style={s.countdownSection}>
                    <Text style={s.countdownTitle}>Começa em</Text>
                    <CountdownDisplay targetDate={item.event_date} />
                  </View>
                )}

                {item.purchased ? (
                  <View style={s.ticketSection}>
                    <Text style={s.ticketLabel}>Seu ingresso</Text>
                    <Text style={s.ticketCode}>{item.ticket_code?.substring(0, 8).toUpperCase()}</Text>
                    <TouchableOpacity style={s.joinBtn} onPress={() => handleJoin(item.join_url)}>
                      <Text style={s.joinBtnText}>Entrar no Evento →</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={s.priceSection}>
                    <Text style={s.price}>R$ {item.price.toFixed(2)}</Text>
                    <Text style={s.priceNote}>Ingresso disponível no app em breve</Text>
                  </View>
                )}
              </View>
            </FadeInView>
          )}
          ListEmptyComponent={<EmptyState icon="✦" title="Nenhum evento disponível" subtitle="Fique atento às novidades!" />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 26, fontWeight: '700', color: colors.primary },
  subtitle: { color: colors.textMuted, fontSize: fontSize.md, marginTop: spacing.xs },
  listContent: { padding: spacing.lg },
  eventCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  eventCardOwned: { borderColor: colors.primaryFaded },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  eventTitle: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, flex: 1 },
  ownedBadge: { backgroundColor: colors.primarySubtle, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3, marginLeft: spacing.sm },
  ownedBadgeText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  eventDate: { color: colors.primary, fontSize: fontSize.sm, marginBottom: spacing.sm },
  eventDescription: { color: colors.textMuted, fontSize: fontSize.md, lineHeight: 18, marginBottom: spacing.lg },
  countdownSection: { marginBottom: spacing.lg },
  countdownTitle: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600', marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  countdown: { flexDirection: 'row', gap: spacing.sm },
  countdownUnit: { flex: 1, backgroundColor: colors.border, borderRadius: radius.md, padding: 10, alignItems: 'center' },
  countdownNumber: { color: colors.primary, fontSize: fontSize.title, fontWeight: '700' },
  countdownLabel: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  ticketSection: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 },
  ticketLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600', marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 1 },
  ticketCode: { color: colors.text, fontSize: 20, fontWeight: '700', letterSpacing: 3, marginBottom: spacing.md, fontVariant: ['tabular-nums'] },
  joinBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center' },
  joinBtnText: { color: colors.textLight, fontSize: fontSize.lg, fontWeight: '700' },
  priceSection: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14, alignItems: 'center' },
  price: { color: colors.primary, fontSize: fontSize.hero, fontWeight: '700', marginBottom: spacing.xs },
  priceNote: { color: colors.textMuted, fontSize: fontSize.sm },
});
