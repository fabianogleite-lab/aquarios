import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';

interface DiarioEntry {
  id: string;
  user_id: string;
  content: string;
  mood: string;
  tags: string[];
  created_at: string;
}

const MOOD_EMOJI = {
  happy: '😊',
  neutral: '😐',
  sad: '😔',
  angry: '😤',
  thoughtful: '🤔',
  inspired: '✨',
};

export default function DiarioScreen() {
  const [entries, setEntries] = useState<DiarioEntry[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  const loadEntries = async () => {
    if (!user?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('diario_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas reflexões');
      setLoading(false);
      return;
    }

    setEntries(
      (data || []).map((entry: any) => ({
        id: entry.id,
        user_id: entry.user_id,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags || [],
        created_at: entry.created_at,
      }))
    );
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [user])
  );

  const filteredEntries = entries.filter(
    (entry) =>
      entry.content.toLowerCase().includes(searchText.toLowerCase()) ||
      entry.tags.some((tag) =>
        tag.toLowerCase().includes(searchText.toLowerCase())
      )
  );

  const shareEntry = async (entry: DiarioEntry) => {
    if (!user?.id) return;
    const { error } = await supabase.from('shares').insert({
      user_id: user.id,
      diario_id: entry.id,
      content: entry.content,
      is_public: true,
    });
    if (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar');
    } else {
      Alert.alert('Compartilhado!', 'Sua reflexão foi publicada no Feed.');
    }
  };

  const deleteEntry = (id: string) => {
    Alert.alert('Deletar Reflexão', 'Tem certeza que deseja deletar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase
            .from('diario_entries')
            .delete()
            .eq('id', id)
            .eq('user_id', user?.id || '');

          if (error) {
            Alert.alert('Erro', 'Não foi possível deletar a reflexão');
          } else {
            setEntries((prev) => prev.filter((e) => e.id !== id));
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getPreview = (content: string, length: number = 80) => {
    return content.length > length ? content.substring(0, length) + '...' : content;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diário do Ser</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar reflexões..."
            placeholderTextColor="#3a4a5a"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#b8952a" />
        </View>
      ) : filteredEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {entries.length === 0
              ? 'Nenhuma reflexão ainda. Comece uma nova!'
              : 'Nenhuma reflexão encontrada.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.entryCard}
              onLongPress={() => deleteEntry(item.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
                <Text style={styles.cardMood}>
                  {MOOD_EMOJI[item.mood as keyof typeof MOOD_EMOJI] || '🤔'}
                </Text>
              </View>

              <Text style={styles.cardContent}>{getPreview(item.content, 100)}</Text>

              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {item.tags.slice(0, 3).map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                  {item.tags.length > 3 && (
                    <Text style={styles.moreTagsText}>
                      +{item.tags.length - 3}
                    </Text>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => shareEntry(item)}
              >
                <Text style={styles.shareBtnText}>↑ Compartilhar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(app)/diario-new')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090c14' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#b8952a', marginBottom: 12 },
  searchRow: { marginBottom: 8 },
  searchInput: {
    backgroundColor: '#0d1520',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ccd6e8',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#141c28',
  },
  listContent: { paddingHorizontal: 16, paddingVertical: 8 },
  entryCard: {
    backgroundColor: '#0d1520',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#141c28',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardDate: { color: '#3a4a5a', fontSize: 12 },
  cardMood: { fontSize: 20 },
  cardContent: { color: '#ccd6e8', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: { backgroundColor: '#141c28', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { color: '#b8952a', fontSize: 12, fontWeight: '600' },
  moreTagsText: { color: '#3a4a5a', fontSize: 12, alignSelf: 'center' },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#b8952a',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: { color: '#090c14', fontSize: 32, fontWeight: '700' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#3a4a5a', fontSize: 16 },
  shareBtn: {
    marginTop: 8, paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8, borderWidth: 1, borderColor: '#b8952a44',
    alignSelf: 'flex-start',
  },
  shareBtnText: { color: '#b8952a', fontSize: 12, fontWeight: '600' },
});
