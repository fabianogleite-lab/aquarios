import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { EmptyState } from '../../components/EmptyState';
import { PressableScale } from '../../components/PressableScale';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

interface Profile {
  id: string;
  username: string;
  display_name: string;
}

export default function ComunidadesScreen() {
  const [suggested, setSuggested] = useState<Profile[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searchText, setSearchText] = useState('');
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);

    const { data: followData } = await supabase.from('user_follows').select('following_id').eq('follower_id', user.id);
    const ids = new Set((followData || []).map((f: any) => f.following_id));
    setFollowingIds(ids);

    const { data: profilesData } = await supabase.from('profiles').select('id, username, display_name').neq('id', user.id).limit(20);
    if (profilesData) setSuggested(profilesData.filter((p: Profile) => !ids.has(p.id)).slice(0, 10));
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadData(); }, [user]));

  const searchUsers = async (text: string) => {
    setSearchText(text);
    if (text.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase.from('profiles').select('id, username, display_name').ilike('username', `%${text}%`).neq('id', user?.id || '').limit(10);
    setSearchResults(data || []);
  };

  const toggleFollow = async (targetId: string) => {
    if (!user?.id) return;
    if (followingIds.has(targetId)) {
      await supabase.from('user_follows').delete().eq('follower_id', user.id).eq('following_id', targetId);
      setFollowingIds(prev => { const n = new Set(prev); n.delete(targetId); return n; });
    } else {
      await supabase.from('user_follows').insert({ follower_id: user.id, following_id: targetId });
      setFollowingIds(prev => new Set(prev).add(targetId));
      await supabase.from('notifications').insert({ user_id: targetId, from_user_id: user.id, type: 'follow' });
    }
  };

  const displayList = searchText.length >= 2 ? searchResults : suggested;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Comunidades</Text>
        <View style={s.navRow}>
          <PressableScale style={s.navBtn} onPress={() => router.push('/(app)/comunidades-timeline')}>
            <Text style={s.navBtnText}>📰 Feed</Text>
          </PressableScale>
          <PressableScale style={s.navBtn} onPress={() => router.push('/(app)/comunidades-notificacoes')}>
            <Text style={s.navBtnText}>🔔 Notificações</Text>
          </PressableScale>
        </View>
      </View>

      <TextInput
        style={s.searchInput}
        placeholder="Buscar usuários por @username..."
        placeholderTextColor={colors.textMuted}
        value={searchText}
        onChangeText={searchUsers}
        autoCapitalize="none"
      />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={item => item.id}
          contentContainerStyle={s.listContent}
          ListHeaderComponent={
            <Text style={s.sectionTitle}>
              {searchText.length >= 2 ? 'Resultados da busca' : 'Pessoas para seguir'}
            </Text>
          }
          renderItem={({ item, index }) => (
            <FadeInView delay={index * 60}>
              <View style={s.userCard}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{(item.display_name || item.username || '?')[0].toUpperCase()}</Text>
                </View>
                <View style={s.userInfo}>
                  <Text style={s.userName}>{item.display_name || item.username}</Text>
                  <Text style={s.userHandle}>@{item.username}</Text>
                </View>
                <TouchableOpacity
                  style={[s.followBtn, followingIds.has(item.id) && s.followingBtn]}
                  onPress={() => toggleFollow(item.id)}
                >
                  <Text style={[s.followBtnText, followingIds.has(item.id) && s.followingBtnText]}>
                    {followingIds.has(item.id) ? 'Seguindo' : 'Seguir'}
                  </Text>
                </TouchableOpacity>
              </View>
            </FadeInView>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="👥"
              title={searchText.length >= 2 ? 'Nenhum usuário encontrado' : 'Nenhum usuário disponível'}
            />
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: fontSize.hero, fontWeight: '700', color: colors.primary, marginBottom: spacing.md },
  navRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  navBtn: {
    flex: 1, paddingVertical: 10, borderRadius: radius.md,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  navBtnText: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  searchInput: {
    marginHorizontal: spacing.lg, marginBottom: spacing.sm, backgroundColor: colors.card,
    borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 10,
    color: colors.text, fontSize: fontSize.body, borderWidth: 1, borderColor: colors.border,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  sectionTitle: { color: colors.textMuted, fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.xs },
  userCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  avatarText: { color: colors.primary, fontSize: fontSize.xxl, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600' },
  userHandle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  followBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.primary },
  followingBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.textMuted },
  followBtnText: { color: colors.bg, fontSize: fontSize.md, fontWeight: '700' },
  followingBtnText: { color: colors.textMuted },
});
