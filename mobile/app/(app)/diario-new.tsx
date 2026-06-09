import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { useXP } from '../../hooks/useXP';
import { encryptField } from '../../lib/crypto';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

const MOODS = [
  { key: 'happy', emoji: '😊', label: 'Feliz' },
  { key: 'neutral', emoji: '😐', label: 'Neutro' },
  { key: 'sad', emoji: '😔', label: 'Triste' },
  { key: 'angry', emoji: '😤', label: 'Irritado' },
  { key: 'thoughtful', emoji: '🤔', label: 'Pensativo' },
  { key: 'inspired', emoji: '✨', label: 'Inspirado' },
];

const INSPIRATIONAL_QUESTIONS = [
  'O que descobri sobre mim hoje?',
  'Qual foi meu momento de alegria hoje?',
  'Como posso crescer a partir disso?',
  'O que agradeço no meu dia?',
  'Qual é meu maior medo agora?',
  'Se eu pudesse dar um conselho para mim mesmo, qual seria?',
  'O que preciso perdoar?',
  'Qual é meu propósito neste momento?',
  'Como estou me sentindo na minha jornada?',
  'O que me torna único?',
];

export default function DiarioNewScreen() {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('thoughtful');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [question] = useState(
    INSPIRATIONAL_QUESTIONS[Math.floor(Math.random() * INSPIRATIONAL_QUESTIONS.length)]
  );
  const router = useRouter();
  const { user } = useAuthStore();
  const { logXP } = useXP();

  const saveEntry = async () => {
    if (!content.trim() || !user?.id) {
      Alert.alert('Erro', 'Escreva algo na sua reflexão');
      return;
    }

    setLoading(true);
    const tags = tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0);

    const encryptedContent = await encryptField(content.trim());

    const { error } = await supabase.from('diario_entries').insert([{
      user_id: user.id,
      content: encryptedContent.ciphertext ? '[encrypted]' : content.trim(),
      content_encrypted: encryptedContent.ciphertext || null,
      content_nonce: encryptedContent.nonce || null,
      mood,
      tags,
      created_at: new Date().toISOString(),
    }]);

    setLoading(false);
    if (error) Alert.alert('Erro', 'Não foi possível salvar sua reflexão');
    else {
      logXP('diary_entry', 50, 'diario').catch(() => {});
      Alert.alert('Sucesso', 'Reflexão salva!', [{ text: 'OK', onPress: () => router.back() }]);
    }
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.content}>
        <FadeInView>
          <Text style={s.title}>Nova Reflexão</Text>
        </FadeInView>

        <FadeInView delay={100}>
          <View style={s.questionBox}>
            <Text style={s.questionLabel}>Pergunta Inspiradora:</Text>
            <Text style={s.question}>{question}</Text>
          </View>
        </FadeInView>

        <FadeInView delay={200}>
          <View style={s.section}>
            <Text style={s.sectionLabel}>Sua Reflexão:</Text>
            <TextInput
              style={s.textInput}
              value={content}
              onChangeText={setContent}
              placeholder="Escreva seu pensamento, sentimento ou descoberta..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={8}
              editable={!loading}
            />
          </View>
        </FadeInView>

        <FadeInView delay={300}>
          <View style={s.section}>
            <Text style={s.sectionLabel}>Como você se sente?</Text>
            <View style={s.moodsGrid}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[s.moodButton, mood === m.key && s.moodButtonActive]}
                  onPress={() => setMood(m.key)}
                  disabled={loading}
                >
                  <Text style={s.moodEmoji}>{m.emoji}</Text>
                  <Text style={s.moodLabel}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={400}>
          <View style={s.section}>
            <Text style={s.sectionLabel}>Tags (separadas por vírgula)</Text>
            <TextInput
              style={s.tagsInput}
              value={tagsInput}
              onChangeText={setTagsInput}
              placeholder="ex: meditação, gratidão, aprendizado"
              placeholderTextColor={colors.textMuted}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[s.saveButton, loading && s.saveButtonDisabled]}
            onPress={saveEntry}
            disabled={loading}
          >
            {loading ? <ActivityIndicator size="small" color={colors.textLight} /> : <Text style={s.saveButtonText}>Salvar Reflexão</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.cancelButton} onPress={() => router.back()} disabled={loading}>
            <Text style={s.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </FadeInView>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  title: { fontSize: fontSize.hero, fontWeight: '700', color: colors.primary, marginBottom: spacing.lg },
  questionBox: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: 14,
    borderLeftWidth: 4, borderLeftColor: colors.primary, marginBottom: spacing.xl,
  },
  questionLabel: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: 6 },
  question: { color: colors.text, fontSize: fontSize.lg, lineHeight: 22, fontWeight: '500' },
  section: { marginBottom: spacing.xl },
  sectionLabel: { color: colors.text, fontSize: fontSize.body, fontWeight: '600', marginBottom: 10 },
  textInput: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    color: colors.text, fontSize: fontSize.lg, borderWidth: 1, borderColor: colors.border,
    minHeight: 150, textAlignVertical: 'top',
  },
  moodsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  moodButton: {
    width: '31%', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  moodButtonActive: { borderColor: colors.primary, backgroundColor: colors.cardActive },
  moodEmoji: { fontSize: 28, marginBottom: 6 },
  moodLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  tagsInput: {
    backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 10,
    color: colors.text, fontSize: fontSize.body, borderWidth: 1, borderColor: colors.border,
  },
  saveButton: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center', marginBottom: 10 },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: colors.textLight, fontSize: fontSize.xl, fontWeight: '700' },
  cancelButton: {
    backgroundColor: 'transparent', borderRadius: radius.lg, paddingVertical: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  cancelButtonText: { color: colors.textMuted, fontSize: fontSize.xl, fontWeight: '600' },
});
