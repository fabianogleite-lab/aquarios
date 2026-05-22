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

    const { data: followData } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', user.id);

    const ids = new Set((followData || []).map((f: any) => f.following_id));
    setFollowingIds(ids);

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .neq('id', user.id)
      .limit(20);

    if (profilesData) {
      setSuggested(profilesData.filter((p: Profile) => !ids.has(p.id)).slice(0, 10));
    }

    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadData(); }, [user]));

  const searchUsers = async (text: string) => {
    setSearchText(text);
    if (text.length < 2) { setSearchResults([]); return; }

    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .ilike('username', `%${text}%`)
      .neq('id', user?.id || '')
      .limit(10);

    setSearchResults(data || []);
  };

  const toggleFollow = async (targetId: string) => {
    if (!user?.id) return;

    if (followingIds.has(targetId)) {
      await supabase.from('user_follows').delete()
        .eq('follower_id', user.id).eq('following_id', targetId);
      setFollowingIds(prev => { const n = new Set(prev); n.delete(targetId); return n; });
    } else {
      await supabase.from('user_follows').insert({ follower_id: user.id, following_id: targetId });
      setFollowingIds(prev => new Set(prev).add(targetId));
      await supabase.from('notifications').insert({
        user_id: targetId,
        from_user_id: user.id,
        type: 'follow',
      });
    }
  };

  const displayList = searchText.length >= 2 ? searchResults : suggested;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comunidades</Text>
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push('/(app)/comunidades-timeline')}
          >
            <Text style={styles.navBtnText}>📰 Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push('/(app)/comunidades-notificacoes')}
          >
            <Text style={styles.navBtnText}>🔔 Notificações</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar usuários por @username..."
        placeholderTextColor="#3a4a5a"
        value={searchText}
        onChangeText={searchUsers}
        autoCapitalize="none"
      />

      {loading ? (
        <ActivityIndicator color="#b8952a" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {searchText.length >= 2 ? 'Resultados da busca' : 'Pessoas para seguir'}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.display_name || item.username || '?')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.display_name || item.username}</Text>
                <Text style={styles.userHandle}>@{item.username}</Text>
              </View>
              <TouchableOpacity
                style={[styles.followBtn, followingIds.has(item.id) && styles.followingBtn]}
                onPress={() => toggleFollow(item.id)}
              >
                <Text style={[styles.followBtnText, followingIds.has(item.id) && styles.followingBtnText]}>
                  {followingIds.has(item.id) ? 'Seguindo' : 'Seguir'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchText.length >= 2 ? 'Nenhum usuário encontrado' : 'Nenhum usuário disponível'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090c14' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#b8952a', marginBottom: 12 },
  navRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  navBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#0d1520', borderWidth: 1, borderColor: '#141c28',
    alignItems: 'center',
  },
  navBtnText: { color: '#ccd6e8', fontSize: 13, fontWeight: '600' },
  searchInput: {
    marginHorizontal: 16, marginBottom: 8, backgroundColor: '#0d1520',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    color: '#ccd6e8', fontSize: 14, borderWidth: 1, borderColor: '#141c28',
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  sectionTitle: { color: '#3a4a5a', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1520',
    borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#141c28',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#141c28',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#b8952a', fontSize: 18, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { color: '#ccd6e8', fontSize: 15, fontWeight: '600' },
  userHandle: { color: '#3a4a5a', fontSize: 12, marginTop: 2 },
  followBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#b8952a' },
  followingBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3a4a5a' },
  followBtnText: { color: '#090c14', fontSize: 13, fontWeight: '700' },
  followingBtnText: { color: '#3a4a5a' },
  emptyText: { color: '#3a4a5a', fontSize: 14, textAlign: 'center', marginTop: 20 },
});
