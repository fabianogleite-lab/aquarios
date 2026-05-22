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
import { EmptyState } from '../../components/EmptyState';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

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
        id: n.id, type: n.type, from_user_id: n.from_user_id, share_id: n.share_id,
        is_read: n.is_read, created_at: n.created_at,
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
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
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
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Agora';
    if (hours < 24) return `${hours}h atrás`;
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Notificações</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={s.markAllBtn}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={s.listContent}
          renderItem={({ item, index }) => (
            <FadeInView delay={index * 50}>
              <TouchableOpacity
                style={[s.notifCard, !item.is_read && s.notifCardUnread]}
                onPress={() => markRead(item.id)}
              >
                <Text style={s.notifIcon}>{getNotifIcon(item.type)}</Text>
                <View style={s.notifContent}>
                  <Text style={s.notifText}>{getNotifText(item)}</Text>
                  <Text style={s.notifDate}>{formatDate(item.created_at)}</Text>
                </View>
                {!item.is_read && <View style={s.unreadDot} />}
              </TouchableOpacity>
            </FadeInView>
          )}
          ListEmptyComponent={<EmptyState icon="🔔" title="Nenhuma notificação ainda" />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: fontSize.hero, fontWeight: '700', color: colors.primary },
  markAllBtn: { color: colors.primary, fontSize: fontSize.sm },
  listContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  notifCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: radius.lg, padding: 14, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  notifCardUnread: { borderColor: colors.primaryFaded, backgroundColor: colors.cardHighlight },
  notifIcon: { fontSize: 22, marginRight: spacing.md },
  notifContent: { flex: 1 },
  notifText: { color: colors.text, fontSize: fontSize.body, lineHeight: 20 },
  notifDate: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 3 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
