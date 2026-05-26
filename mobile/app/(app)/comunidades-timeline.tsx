import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { EmptyState } from '../../components/EmptyState';
import { PressableScale } from '../../components/PressableScale';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  reply_count: number;
  view_count: number;
}

interface Reply {
  id: string;
  content: string;
  user_id: string;
  rating: number | null;
  helpful_count: number;
  is_marked_solution: boolean;
  created_at: string;
}

export default function ComunidadesTimelineScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  const loadData = async () => {
    if (!postId) {
      router.back();
      return;
    }

    setLoading(true);
    try {
      const { data: postData } = await supabase
        .from('community_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postData) {
        setPost(postData);
        await supabase
          .from('community_posts')
          .update({ view_count: postData.view_count + 1 })
          .eq('id', postId);
      }

      const { data: repliesData } = await supabase
        .from('community_replies')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      setReplies(repliesData || []);
    } catch (err) {
      console.error('Error loading post:', err);
      Alert.alert('Erro', 'Não conseguimos carregar o post');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, [postId]));

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      Alert.alert('Campo vazio', 'Digite uma resposta');
      return;
    }

    if (!user?.id || !postId) {
      Alert.alert('Erro', 'Informações do usuário não disponíveis');
      return;
    }

    setSubmittingReply(true);

    try {
      const { error } = await supabase.from('community_replies').insert({
        post_id: postId,
        user_id: user.id,
        content: replyText.trim(),
        rating: null,
        helpful_count: 0,
        is_marked_solution: false,
      });

      if (error) {
        Alert.alert('Erro ao enviar', error.message);
        return;
      }

      if (post) {
        await supabase
          .from('community_posts')
          .update({ reply_count: post.reply_count + 1 })
          .eq('id', postId);
      }

      setReplyText('');
      await loadData();
      Alert.alert('✅ Sucesso', 'Sua resposta foi publicada!');
    } catch (err) {
      console.error('Error submitting reply:', err);
      Alert.alert('Erro', 'Não conseguimos enviar sua resposta');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleRateReply = async (replyId: string, rating: number) => {
    if (!user?.id) return;

    try {
      const { data: existing } = await supabase
        .from('community_ratings')
        .select('id')
        .eq('reply_id', replyId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        await supabase
          .from('community_ratings')
          .update({ rating })
          .eq('id', existing.id);
      } else {
        await supabase.from('community_ratings').insert({
          reply_id: replyId,
          user_id: user.id,
          rating,
          helpful: false,
        });
      }

      await loadData();
    } catch (err) {
      console.error('Error rating reply:', err);
    }
  };

  const renderReply = ({ item, index }: { item: Reply; index: number }) => (
    <FadeInView delay={index * 60}>
      <View style={s.replyCard}>
        <View style={s.replyHeader}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>👤</Text>
          </View>
          <View style={s.replyMeta}>
            <Text style={s.replyAuthor}>Helper #{index + 1}</Text>
            <Text style={s.replyTime}>
              {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          {item.is_marked_solution && (
            <View style={s.solutionBadge}>
              <Text style={s.solutionText}>✓ Solução</Text>
            </View>
          )}
        </View>

        <Text style={s.replyContent}>{item.content}</Text>

        <View style={s.replyFooter}>
          <View style={s.ratingButtons}>
            <PressableScale
              style={[s.ratingBtn, item.rating === 1 && s.ratingBtnActive]}
              onPress={() => handleRateReply(item.id, 1)}
            >
              <Text>👎 {item.rating === 1 ? '✓' : ''}</Text>
            </PressableScale>
            <PressableScale
              style={[s.ratingBtn, item.rating === 3 && s.ratingBtnActive]}
              onPress={() => handleRateReply(item.id, 3)}
            >
              <Text>👌 {item.rating === 3 ? '✓' : ''}</Text>
            </PressableScale>
            <PressableScale
              style={[s.ratingBtn, item.rating === 5 && s.ratingBtnActive]}
              onPress={() => handleRateReply(item.id, 5)}
            >
              <Text>👍 {item.rating === 5 ? '✓' : ''}</Text>
            </PressableScale>
          </View>
          <Text style={s.helpfulCount}>💚 {item.helpful_count}</Text>
        </View>
      </View>
    </FadeInView>
  );

  if (loading) {
    return (
      <View style={s.centerContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={s.centerContainer}>
        <EmptyState icon="❌" title="Post não encontrado" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.container}
    >
      <FlatList
        data={replies}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <View>
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => router.back()}
            >
              <Text style={s.backBtnText}>← Voltar</Text>
            </TouchableOpacity>

            <View style={s.postSection}>
              <Text style={s.postTitle}>{post.title}</Text>
              <Text style={s.postContent}>{post.content}</Text>
              <View style={s.postStats}>
                <Text style={s.statText}>👁 {post.view_count} views</Text>
                <Text style={s.statText}>💬 {post.reply_count} respostas</Text>
              </View>
            </View>

            <View style={s.repliesHeader}>
              <Text style={s.repliesTitle}>Respostas ({replies.length})</Text>
            </View>
          </View>
        }
        renderItem={renderReply}
        ListEmptyComponent={
          <EmptyState icon="💬" title="Nenhuma resposta ainda. Seja o primeiro!" />
        }
      />

      <View style={s.replyInputContainer}>
        <TextInput
          style={s.replyInput}
          placeholder="Sua resposta aqui..."
          placeholderTextColor={colors.textMuted}
          value={replyText}
          onChangeText={setReplyText}
          multiline
          maxLength={500}
          editable={!submittingReply}
        />
        <TouchableOpacity
          style={[s.submitBtn, submittingReply && s.disabledBtn]}
          onPress={handleReplySubmit}
          disabled={submittingReply}
        >
          {submittingReply ? (
            <ActivityIndicator color={colors.bg} size="small" />
          ) : (
            <Text style={s.submitBtnText}>Responder</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
  backBtn: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtnText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  postSection: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  postContent: {
    color: colors.text,
    fontSize: fontSize.body,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  postStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  repliesHeader: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  repliesTitle: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  replyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.lg,
  },
  replyMeta: {
    flex: 1,
  },
  replyAuthor: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  replyTime: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  solutionBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  solutionText: {
    color: '#065F46',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  replyContent: {
    color: colors.text,
    fontSize: fontSize.body,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  replyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  ratingBtnActive: {
    backgroundColor: colors.primary,
  },
  helpfulCount: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  replyInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  replyInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: fontSize.body,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 80,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  submitBtnText: {
    color: colors.bg,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
