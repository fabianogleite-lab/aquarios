import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { usePersonaDetection } from '../../hooks/usePersonaDetection';
import { useCommunityScoring } from '../../hooks/useCommunityScoring';
import CommunityPostForm from './comunidades-post-form';
import { EmptyState } from '../../components/EmptyState';
import { PressableScale } from '../../components/PressableScale';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

type Persona = 'ZÉ_DO_APERTO' | 'DONA_MARIA' | 'CARLOS';

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  reply_count: number;
  view_count: number;
}

interface Helper {
  userId: string;
  userName: string;
  persona: Persona;
  finalScore: number;
  replyCount: number;
  averageRating: number;
}

type TabType = 'posts' | 'helpers';

export default function ComunidadesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [loading, setLoading] = useState(false);
  const [userPersona, setUserPersona] = useState<Persona>('ZÉ_DO_APERTO');
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();
  const { detect } = usePersonaDetection();
  const { getRankedHelpers } = useCommunityScoring();

  const loadUserPersona = async () => {
    if (!user?.id) return;
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('persona')
        .eq('user_id', user.id)
        .single();

      if (profile?.persona) {
        setUserPersona(profile.persona);
      }
    } catch (err) {
      console.warn('Error loading user persona:', err);
    }
  };

  const loadPosts = async () => {
    try {
      const { data } = await supabase
        .from('community_posts')
        .select('id, title, content, user_id, created_at, reply_count, view_count')
        .order('created_at', { ascending: false })
        .limit(20);

      setPosts(data || []);
    } catch (err) {
      console.error('Error loading posts:', err);
    }
  };

  const loadHelpers = async () => {
    try {
      const result = await getRankedHelpers(userPersona, 10);
      setHelpers(result.topHelpers);
    } catch (err) {
      console.error('Error loading helpers:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await loadUserPersona();
    if (activeTab === 'posts') {
      await loadPosts();
    } else {
      await loadHelpers();
    }
    setLoading(false);
  };

  const handlePostSuccess = async () => {
    // Recarrega posts após novo post publicado
    await loadPosts();
  };

  useFocusEffect(useCallback(() => { loadData(); }, [user, activeTab]));

  const renderPost = ({ item, index }: { item: CommunityPost; index: number }) => (
    <FadeInView delay={index * 60}>
      <TouchableOpacity
        style={s.postCard}
        onPress={() => router.push(`/(app)/comunidades-timeline?postId=${item.id}`)}
      >
        <Text style={s.postTitle}>{item.title}</Text>
        <Text style={s.postContent} numberOfLines={2}>{item.content}</Text>
        <View style={s.postMeta}>
          <Text style={s.metaText}>💬 {item.reply_count} respostas</Text>
          <Text style={s.metaText}>👁 {item.view_count} visualizações</Text>
        </View>
      </TouchableOpacity>
    </FadeInView>
  );

  const renderHelper = ({ item, index }: { item: Helper; index: number }) => (
    <FadeInView delay={index * 60}>
      <View style={s.helperCard}>
        <View style={s.helperRank}>
          <Text style={s.rankNumber}>#{index + 1}</Text>
        </View>
        <View style={s.helperInfo}>
          <Text style={s.helperName}>{item.userName}</Text>
          <View style={s.helperStats}>
            <Text style={s.statText}>⭐ {item.averageRating.toFixed(1)}</Text>
            <Text style={s.statText}>💬 {item.replyCount} respostas</Text>
            <Text style={s.statText}>🎯 Score: {(item.finalScore * 100).toFixed(0)}%</Text>
          </View>
        </View>
      </View>
    </FadeInView>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Comunidades</Text>
        <View style={s.tabBar}>
          <PressableScale
            style={[s.tab, activeTab === 'posts' && s.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[s.tabText, activeTab === 'posts' && s.activeTabText]}>
              📰 Posts
            </Text>
          </PressableScale>
          <PressableScale
            style={[s.tab, activeTab === 'helpers' && s.activeTab]}
            onPress={() => setActiveTab('helpers')}
          >
            <Text style={[s.tabText, activeTab === 'helpers' && s.activeTabText]}>
              👥 Helpers Top
            </Text>
          </PressableScale>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <>
          {activeTab === 'posts' && (
            <FlatList
              data={posts}
              keyExtractor={item => item.id}
              contentContainerStyle={s.listContent}
              renderItem={renderPost}
              ListEmptyComponent={
                <EmptyState icon="📝" title="Nenhum post ainda" />
              }
            />
          )}
          {activeTab === 'helpers' && (
            <FlatList
              data={helpers}
              keyExtractor={item => item.userId}
              contentContainerStyle={s.listContent}
              renderItem={renderHelper}
              ListEmptyComponent={
                <EmptyState icon="👥" title="Nenhum helper disponível" />
              }
            />
          )}
        </>
      )}

      {/* FAB Button */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      {/* Post Form Modal */}
      <CommunityPostForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handlePostSuccess}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: fontSize.hero, fontWeight: '700', color: colors.primary, marginBottom: spacing.md },
  tabBar: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: radius.md,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  activeTab: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  activeTabText: { color: colors.textLight },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  postCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  postTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.xs },
  postContent: { color: colors.textMuted, fontSize: fontSize.body, marginBottom: spacing.sm },
  postMeta: { flexDirection: 'row', gap: spacing.md },
  metaText: { color: colors.textMuted, fontSize: fontSize.sm },
  helperCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  helperRank: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  rankNumber: { color: colors.textLight, fontSize: fontSize.lg, fontWeight: '700' },
  helperInfo: { flex: 1 },
  helperName: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.xs },
  helperStats: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  statText: { color: colors.textMuted, fontSize: fontSize.sm },
  fab: {
    position: 'absolute',
    bottom: spacing.xl + 20,
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: colors.textLight,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    lineHeight: 40,
  },
});
