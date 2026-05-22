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
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const { data: sharesData } = await supabase
      .from('shares')
      .select('id, user_id, content, created_at, profiles!shares_user_id_fkey(username, display_name)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(30);

    const { data: likesData } = await supabase
      .from('likes')
      .select('share_id')
      .eq('user_id', user?.id || '');

    const myLikeIds = new Set((likesData || []).map((l: any) => l.share_id));

    const { data: countData } = await supabase
      .from('likes')
      .select('share_id');

    const likeCounts: Record<string, number> = {};
    (countData || []).forEach((l: any) => {
      likeCounts[l.share_id] = (likeCounts[l.share_id] || 0) + 1;
    });

    if (sharesData) {
      setPosts(sharesData.map((s: any) => ({
        id: s.id,
        user_id: s.user_id,
        content: s.content,
        created_at: s.created_at,
        likesCount: likeCounts[s.id] || 0,
        likedByMe: myLikeIds.has(s.id),
        authorName: s.profiles?.display_name || s.profiles?.username || 'Usuário',
      })));
    }

    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadFeed(); }, [user]));

  const toggleLike = async (post: SharePost) => {
    if (!user?.id) return;

    if (post.likedByMe) {
      await supabase.from('likes').delete()
        .eq('user_id', user.id).eq('share_id', post.id);
    } else {
      await supabase.from('likes').insert({ user_id: user.id, share_id: post.id });
      if (post.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          from_user_id: user.id,
          type: 'like',
          share_id: post.id,
        });
      }
    }

    setPosts(prev => prev.map(p =>
      p.id === post.id
        ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likesCount + (p.likedByMe ? -1 : 1) }
        : p
    ));
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Feed</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#b8952a" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadFeed(true)} tintColor="#b8952a" />
          }
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.authorName[0].toUpperCase()}</Text>
                </View>
                <View style={styles.postMeta}>
                  <Text style={styles.authorName}>{item.authorName}</Text>
                  <Text style={styles.postDate}>{formatDate(item.created_at)}</Text>
                </View>
              </View>
              <Text style={styles.postContent}>{item.content}</Text>
              <TouchableOpacity style={styles.likeBtn} onPress={() => toggleLike(item)}>
                <Text style={[styles.likeIcon, item.likedByMe && styles.likedIcon]}>
                  {item.likedByMe ? '♥' : '♡'}
                </Text>
                <Text style={[styles.likeCount, item.likedByMe && styles.likedCount]}>
                  {item.likesCount}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum post ainda.</Text>
              <Text style={styles.emptySubtext}>Compartilhe reflexões do seu diário!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090c14' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#b8952a' },
  listContent: { paddingHorizontal: 16, paddingVertical: 8 },
  postCard: {
    backgroundColor: '#0d1520', borderRadius: 12, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#141c28',
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#141c28',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  avatarText: { color: '#b8952a', fontSize: 16, fontWeight: '700' },
  postMeta: { flex: 1 },
  authorName: { color: '#ccd6e8', fontSize: 14, fontWeight: '600' },
  postDate: { color: '#3a4a5a', fontSize: 11, marginTop: 1 },
  postContent: { color: '#ccd6e8', fontSize: 14, lineHeight: 20, marginBottom: 10 },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeIcon: { fontSize: 20, color: '#3a4a5a' },
  likedIcon: { color: '#e05a5a' },
  likeCount: { color: '#3a4a5a', fontSize: 13 },
  likedCount: { color: '#e05a5a' },
  emptyContainer: { paddingTop: 60, alignItems: 'center' },
  emptyText: { color: '#3a4a5a', fontSize: 16, marginBottom: 4 },
  emptySubtext: { color: '#3a4a5a', fontSize: 13 },
});
