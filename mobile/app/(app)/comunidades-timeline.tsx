import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { EmptyState } from '../../components/EmptyState';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

interface SharePost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  likesCount: number;
  likedByMe: boolean;
  authorName: string;
}

export default function ComunidadesTimeline() {
  const [posts, setPosts] = useState<SharePost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  const loadFeed = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);

    const { data: sharesData } = await supabase
      .from('shares')
      .select('id, user_id, content, created_at, profiles!shares_user_id_fkey(username, display_name)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(30);

    const { data: likesData } = await supabase.from('likes').select('share_id').eq('user_id', user?.id || '');
    const myLikeIds = new Set((likesData || []).map((l: any) => l.share_id));

    const { data: countData } = await supabase.from('likes').select('share_id');
    const likeCounts: Record<string, number> = {};
    (countData || []).forEach((l: any) => { likeCounts[l.share_id] = (likeCounts[l.share_id] || 0) + 1; });

    if (sharesData) {
      setPosts(sharesData.map((s: any) => ({
        id: s.id, user_id: s.user_id, content: s.content, created_at: s.created_at,
        likesCount: likeCounts[s.id] || 0, likedByMe: myLikeIds.has(s.id),
        authorName: s.profiles?.display_name || s.profiles?.username || 'Usuário',
      })));
    }

    if (isRefresh) setRefreshing(false); else setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadFeed(); }, [user]));

  const toggleLike = async (post: SharePost) => {
    if (!user?.id) return;
    if (post.likedByMe) {
      await supabase.from('likes').delete().eq('user_id', user.id).eq('share_id', post.id);
    } else {
      await supabase.from('likes').insert({ user_id: user.id, share_id: post.id });
      if (post.user_id !== user.id) {
        await supabase.from('notifications').insert({ user_id: post.user_id, from_user_id: user.id, type: 'like', share_id: post.id });
      }
    }
    setPosts(prev => prev.map(p =>
      p.id === post.id ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likesCount + (p.likedByMe ? -1 : 1) } : p
    ));
  };

  const formatDate = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Agora';
    if (hours < 24) return `${hours}h atrás`;
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Feed</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          contentContainerStyle={s.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadFeed(true)} tintColor={colors.primary} />}
          renderItem={({ item, index }) => (
            <FadeInView delay={index * 60}>
              <View style={s.postCard}>
                <View style={s.postHeader}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{item.authorName[0].toUpperCase()}</Text>
                  </View>
                  <View style={s.postMeta}>
                    <Text style={s.authorName}>{item.authorName}</Text>
                    <Text style={s.postDate}>{formatDate(item.created_at)}</Text>
                  </View>
                </View>
                <Text style={s.postContent}>{item.content}</Text>
                <TouchableOpacity style={s.likeBtn} onPress={() => toggleLike(item)}>
                  <Text style={[s.likeIcon, item.likedByMe && s.likedIcon]}>{item.likedByMe ? '♥' : '♡'}</Text>
                  <Text style={[s.likeCount, item.likedByMe && s.likedCount]}>{item.likesCount}</Text>
                </TouchableOpacity>
              </View>
            </FadeInView>
          )}
          ListEmptyComponent={<EmptyState icon="📰" title="Nenhum post ainda" subtitle="Compartilhe reflexões do seu diário!" />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: fontSize.hero, fontWeight: '700', color: colors.primary },
  listContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  postCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: 14,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: colors.primary, fontSize: fontSize.xl, fontWeight: '700' },
  postMeta: { flex: 1 },
  authorName: { color: colors.text, fontSize: fontSize.body, fontWeight: '600' },
  postDate: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 1 },
  postContent: { color: colors.text, fontSize: fontSize.body, lineHeight: 20, marginBottom: 10 },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  likeIcon: { fontSize: 20, color: colors.textMuted },
  likedIcon: { color: colors.like },
  likeCount: { color: colors.textMuted, fontSize: fontSize.md },
  likedCount: { color: colors.like },
});
