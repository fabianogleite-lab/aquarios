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
    <View style={styles.countdown}>
      {[{ v: days, l: 'dias' }, { v: hours, l: 'hrs' }, { v: minutes, l: 'min' }, { v: seconds, l: 'seg' }].map(({ v, l }) => (
        <View key={l} style={styles.countdownUnit}>
          <Text style={styles.countdownNumber}>{String(v).padStart(2, '0')}</Text>
          <Text style={styles.countdownLabel}>{l}</Text>
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

    const { data: eventsData } = await supabase
      .from('wonder_night_events')
      .select('*')
      .eq('is_active', true)
      .order('event_date', { ascending: true });

    const { data: purchasesData } = await supabase
      .from('wonder_night_purchases')
      .select('event_id, ticket_code')
      .eq('user_id', user.id);

    const purchaseMap: Record<string, string> = {};
    (purchasesData || []).forEach((p: any) => { purchaseMap[p.event_id] = p.ticket_code; });

    setEvents((eventsData || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      event_date: e.event_date,
      join_url: e.join_url,
      price: e.price,
      ticket_code: purchaseMap[e.id],
      purchased: !!purchaseMap[e.id],
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const isPast = (dateStr: string) => new Date(dateStr).getTime() < Date.now();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✦ Wonder Night</Text>
        <Text style={styles.subtitle}>Experiências de conexão e bem-estar</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#b8952a" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.eventCard, item.purchased && styles.eventCardOwned]}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                {item.purchased && <View style={styles.ownedBadge}><Text style={styles.ownedBadgeText}>✓ Comprado</Text></View>}
              </View>

              <Text style={styles.eventDate}>{formatDate(item.event_date)}</Text>
              <Text style={styles.eventDescription}>{item.description}</Text>

              {!isPast(item.event_date) && (
                <View style={styles.countdownSection}>
                  <Text style={styles.countdownTitle}>Começa em</Text>
                  <CountdownDisplay targetDate={item.event_date} />
                </View>
              )}

              {item.purchased ? (
                <View style={styles.ticketSection}>
                  <Text style={styles.ticketLabel}>Seu ingresso</Text>
                  <Text style={styles.ticketCode}>{item.ticket_code?.substring(0, 8).toUpperCase()}</Text>
                  <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoin(item.join_url)}>
                    <Text style={styles.joinBtnText}>Entrar no Evento →</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.priceSection}>
                  <Text style={styles.price}>R$ {item.price.toFixed(2)}</Text>
                  <Text style={styles.priceNote}>Ingresso disponível no app em breve</Text>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum evento disponível</Text>
              <Text style={styles.emptySubtext}>Fique atento às novidades!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090c14' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#141c28' },
  title: { fontSize: 26, fontWeight: '700', color: '#b8952a' },
  subtitle: { color: '#3a4a5a', fontSize: 13, marginTop: 4 },
  listContent: { padding: 16 },
  eventCard: {
    backgroundColor: '#0d1520', borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#141c28',
  },
  eventCardOwned: { borderColor: '#b8952a44' },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  eventTitle: { fontSize: 18, fontWeight: '700', color: '#ccd6e8', flex: 1 },
  ownedBadge: { backgroundColor: '#b8952a22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  ownedBadgeText: { color: '#b8952a', fontSize: 11, fontWeight: '700' },
  eventDate: { color: '#b8952a', fontSize: 12, marginBottom: 8 },
  eventDescription: { color: '#3a4a5a', fontSize: 13, lineHeight: 18, marginBottom: 16 },
  countdownSection: { marginBottom: 16 },
  countdownTitle: { color: '#3a4a5a', fontSize: 11, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  countdown: { flexDirection: 'row', gap: 8 },
  countdownUnit: { flex: 1, backgroundColor: '#141c28', borderRadius: 10, padding: 10, alignItems: 'center' },
  countdownNumber: { color: '#b8952a', fontSize: 22, fontWeight: '700' },
  countdownLabel: { color: '#3a4a5a', fontSize: 10, marginTop: 2 },
  ticketSection: { borderTopWidth: 1, borderTopColor: '#141c28', paddingTop: 14 },
  ticketLabel: { color: '#3a4a5a', fontSize: 11, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  ticketCode: { color: '#ccd6e8', fontSize: 20, fontWeight: '700', letterSpacing: 3, marginBottom: 12, fontVariant: ['tabular-nums'] },
  joinBtn: { backgroundColor: '#b8952a', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  joinBtnText: { color: '#090c14', fontSize: 15, fontWeight: '700' },
  priceSection: { borderTopWidth: 1, borderTopColor: '#141c28', paddingTop: 14, alignItems: 'center' },
  price: { color: '#b8952a', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  priceNote: { color: '#3a4a5a', fontSize: 12 },
  emptyContainer: { paddingTop: 60, alignItems: 'center' },
  emptyText: { color: '#3a4a5a', fontSize: 16, marginBottom: 4 },
  emptySubtext: { color: '#3a4a5a', fontSize: 13 },
});
