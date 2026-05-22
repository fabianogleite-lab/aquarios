import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';

interface Notification {
  id: string;
  type: 'follow' | 'like' | 'comment';
  from_user_id: string;
  share_id?: string;
  is_read: boolean;
  created_at: string;
  fromUserName: string;
}

export default function ComunidadesNotificacoes() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const loadNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);

    const { data } = await supabase
      .from('notifications')
      .select('id, type, from_user_id, share_id, is_read, created_at, profiles!notifications_from_user_id_fkey(username, display_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data.map((n: any) => ({
        id: n.id,
        type: n.type,
        from_user_id: n.from_user_id,
        share_id: n.share_id,
        is_read: n.is_read,
        created_at: n.created_at,
        fromUserName: n.profiles?.display_name || n.profiles?.username || 'Alguém',
      })));
    }

    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadNotifications(); }, [user]));

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user?.id) return;
    await supabase.from('notifications').update({ is_read: true })
      .eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const getNotifText = (n: Notification) => {
    if (n.type === 'follow') return `${n.fromUserName} começou a te seguir`;
    if (n.type === 'like') return `${n.fromUserName} curtiu sua reflexão`;
    if (n.type === 'comment') return `${n.fromUserName} comentou na sua reflexão`;
    return 'Nova notificação';
  };

  const getNotifIcon = (type: string) => {
    if (type === 'follow') return '👥';
    if (type === 'like') return '♥';
    return '💬';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Agora';
    if (hours < 24) return `${hours}h atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificações</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllBtn}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#b8952a" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notifCard, !item.is_read && styles.notifCardUnread]}
              onPress={() => markRead(item.id)}
            >
              <Text style={styles.notifIcon}>{getNotifIcon(item.type)}</Text>
              <View style={styles.notifContent}>
                <Text style={styles.notifText}>{getNotifText(item)}</Text>
                <Text style={styles.notifDate}>{formatDate(item.created_at)}</Text>
              </View>
              {!item.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma notificação ainda</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090c14' },
  header: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#b8952a' },
  markAllBtn: { color: '#b8952a', fontSize: 12 },
  listContent: { paddingHorizontal: 16, paddingVertical: 8 },
  notifCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1520',
    borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#141c28',
  },
  notifCardUnread: { borderColor: '#b8952a44', backgroundColor: '#0f1a2a' },
  notifIcon: { fontSize: 22, marginRight: 12 },
  notifContent: { flex: 1 },
  notifText: { color: '#ccd6e8', fontSize: 14, lineHeight: 20 },
  notifDate: { color: '#3a4a5a', fontSize: 11, marginTop: 3 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#b8952a' },
  emptyContainer: { paddingTop: 60, alignItems: 'center' },
  emptyText: { color: '#3a4a5a', fontSize: 16 },
});
