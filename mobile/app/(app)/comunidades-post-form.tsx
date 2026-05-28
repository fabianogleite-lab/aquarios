import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { useCommunityRouter } from '../../hooks/useCommunityRouter';
import { usePersonaDetection } from '../../hooks/usePersonaDetection';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

type Persona = 'ZÉ_DO_APERTO' | 'DONA_MARIA' | 'CARLOS';

interface CommunityPostFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CommunityPostForm({ visible, onClose, onSuccess }: CommunityPostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [userPersona, setUserPersona] = useState<Persona>('ZÉ_DO_APERTO');
  const { user } = useAuthStore();
  const { routePost } = useCommunityRouter();

  // Carrega persona do user
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

  // Valida e publica post
  const handlePublish = async () => {
    // Reset validation
    setValidationError('');

    // Validar inputs
    if (!title.trim()) {
      setValidationError('Título obrigatório');
      return;
    }

    if (!content.trim()) {
      setValidationError('Conteúdo obrigatório');
      return;
    }

    if (title.length < 10) {
      setValidationError('Título deve ter no mínimo 10 caracteres');
      return;
    }

    if (content.length < 20) {
      setValidationError('Conteúdo deve ter no mínimo 20 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Usar routePost para validar com asclepiOS
      const routeResult = await routePost(content, userPersona);

      // Verificar se asclepiOS bloqueou
      if (!routeResult.shouldPublish) {
        setValidationError(
          'Seu post contém linguagem ou conteúdo não permitido pela comunidade. Por favor, revise e tente novamente.'
        );
        setLoading(false);
        return;
      }

      // Inserir post em Supabase
      const { error } = await supabase.from('community_posts').insert({
        user_id: user?.id,
        title: title.trim(),
        content: content.trim(),
        category: routeResult.category,
        tags: [],
        view_count: 0,
        reply_count: 0,
        helpful_count: 0,
      });

      if (error) {
        setValidationError(`Erro ao publicar: ${error.message}`);
        setLoading(false);
        return;
      }

      // Sucesso!
      Alert.alert(
        '✅ Sucesso!',
        `Seu post foi publicado na categoria "${routeResult.category}"`,
        [{ text: 'OK' }]
      );

      // Reset form
      setTitle('');
      setContent('');
      setValidationError('');

      // Callback
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error publishing post:', err);
      setValidationError('Erro desconhecido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalShow = () => {
    if (!userPersona || userPersona === 'ZÉ_DO_APERTO') {
      loadUserPersona();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onShow={handleModalShow}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.container}
      >
        <View style={s.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={s.closeBtn}>✕</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Novo Post</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={s.content}>
          <TextInput
            style={s.titleInput}
            placeholder="Seu título aqui..."
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            editable={!loading}
          />
          <Text style={s.charCount}>{title.length}/100</Text>

          <TextInput
            style={s.contentInput}
            placeholder="Descreva seu post detalhadamente. Quanto mais informações, melhor as respostas que receberá..."
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={1000}
            editable={!loading}
            textAlignVertical="top"
          />
          <Text style={s.charCount}>{content.length}/1000</Text>

          {validationError && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>⚠️ {validationError}</Text>
            </View>
          )}

          <View style={s.infoBox}>
            <Text style={s.infoText}>
              💡 Seu post será analisado pela IA e roteado para a comunidade correta.
              Evite linguagem agressiva ou conteúdo médico sem responsabilidade.
            </Text>
          </View>
        </View>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.cancelBtn, loading && s.disabledBtn]}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={s.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              s.publishBtn,
              loading && s.disabledBtn,
              (!title.trim() || !content.trim()) && s.disabledBtn,
            ]}
            onPress={handlePublish}
            disabled={loading || !title.trim() || !content.trim()}
          >
            {loading ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={s.publishBtnText}>Publicar</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    fontSize: fontSize.xl,
    color: colors.text,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  titleInput: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  contentInput: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: fontSize.body,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 180,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  charCount: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    marginBottom: spacing.md,
  },
  errorText: {
    color: '#7F1D1D',
    fontSize: fontSize.body,
  },
  infoBox: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: spacing.md,
  },
  infoText: {
    color: colors.text,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  publishBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  publishBtnText: {
    color: colors.bg,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
