import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { decryptOrFallback } from '../../lib/crypto';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { PressableScale } from '../../components/PressableScale';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { formatDate } from '../../lib/locale';

interface DiarioEntry {
  id: string;
  user_id: string;
  content: string;
  mood: string;
  tags: string[];
  created_at: string;
}

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊', neutral: '😐', sad: '😔',
  angry: '😤', thoughtful: '🤔', inspired: '✨',
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
      .select('id, user_id, content, content_encrypted, content_nonce, mood, tags, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Erro', 'Não foi possível carregar suas reflexões');
      setLoading(false);
      return;
    }

    const decrypted = await Promise.all(
      (data || []).map(async (entry: any) => ({
        id: entry.id,
        user_id: entry.user_id,
        content: await decryptOrFallback(entry.content_encrypted, entry.content_nonce, entry.content),
        mood: entry.mood,
        tags: entry.tags || [],
        created_at: entry.created_at,
      }))
    );

    setEntries(decrypted);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadEntries(); }, [user]));

  const filteredEntries = entries.filter(
    (entry) =>
      entry.content.toLowerCase().includes(searchText.toLowerCase()) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase()))
  );

  const shareEntry = async (entry: DiarioEntry) => {
    if (!user?.id) return;
    const { error } = await supabase.from('community_posts').insert({
      user_id: user.id, content: entry.content, category: 'reflections',
    });
    if (error) Alert.alert('Erro', 'Não foi possível compartilhar');
    else Alert.alert('Compartilhado!', 'Sua reflexão foi publicada no Feed.');
  };

  const deleteEntry = (id: string) => {
    Alert.alert('Deletar Reflexão', 'Tem certeza que deseja deletar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar', style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('diario_entries').delete().eq('id', id).eq('user_id', user?.id || '');
          if (error) Alert.alert('Erro', 'Não foi possível deletar a reflexão');
          else setEntries((prev) => prev.filter((e) => e.id !== id));
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    return formatDate(dateStr, { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getPreview = (content: string, length = 100) => {
    return content.length > length ? content.substring(0, length) + '...' : content;
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Diário do Ser</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Buscar reflexões..."
          placeholderTextColor={colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {loading ? (
        <LoadingState />
      ) : filteredEntries.length === 0 ? (
        <EmptyState
          icon="✎"
          title={entries.length === 0 ? 'Nenhuma reflexão ainda' : 'Nenhuma reflexão encontrada'}
          subtitle={entries.length === 0 ? 'Comece uma nova!' : undefined}
        />
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          renderItem={({ item, index }) => (
            <FadeInView delay={index * 60}>
              <PressableScale
                style={s.entryCard}
                onLongPress={() => deleteEntry(item.id)}
              >
                <View style={s.cardHeader}>
                  <Text style={s.cardDate}>{formatDate(item.created_at)}</Text>
                  <Text style={s.cardMood}>{MOOD_EMOJI[item.mood] || '🤔'}</Text>
                </View>
                <Text style={s.cardContent}>{getPreview(item.content)}</Text>
                {item.tags && item.tags.length > 0 && (
                  <View style={s.tagsRow}>
                    {item.tags.slice(0, 3).map((tag, idx) => (
                      <View key={idx} style={s.tag}>
                        <Text style={s.tagText}>#{tag}</Text>
                      </View>
                    ))}
                    {item.tags.length > 3 && (
                      <Text style={s.moreTagsText}>+{item.tags.length - 3}</Text>
                    )}
                  </View>
                )}
                <TouchableOpacity style={s.shareBtn} onPress={() => shareEntry(item)}>
                  <Text style={s.shareBtnText}>↑ Compartilhar</Text>
                </TouchableOpacity>
              </PressableScale>
            </FadeInView>
          )}
        />
      )}

      <TouchableOpacity style={s.fab} onPress={() => router.push('/(app)/diario-new')}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: fontSize.hero, fontWeight: '700', color: colors.primary, marginBottom: spacing.md },
  searchInput: {
    backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 10,
    color: colors.text, fontSize: fontSize.body, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  entryCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: 14,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardDate: { color: colors.textMuted, fontSize: fontSize.sm },
  cardMood: { fontSize: 20 },
  cardContent: { color: colors.text, fontSize: fontSize.body, lineHeight: 20, marginBottom: spacing.sm },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  tagText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  moreTagsText: { color: colors.textMuted, fontSize: fontSize.sm, alignSelf: 'center' },
  shareBtn: { marginTop: spacing.sm, paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.primaryFaded, alignSelf: 'flex-start' },
  shareBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: radius.round,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4,
  },
  fabText: { color: colors.bg, fontSize: fontSize.display, fontWeight: '700' },
});
