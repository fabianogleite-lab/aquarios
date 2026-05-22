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
    INSPIRATIONAL_QUESTIONS[
      Math.floor(Math.random() * INSPIRATIONAL_QUESTIONS.length)
    ]
  );
  const router = useRouter();
  const { user } = useAuthStore();

  const savEntry = async () => {
    if (!content.trim() || !user?.id) {
      Alert.alert('Erro', 'Escreva algo na sua reflexão');
      return;
    }

    setLoading(true);

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    const { error } = await supabase.from('diario_entries').insert([
      {
        user_id: user.id,
        content: content.trim(),
        mood,
        tags,
        created_at: new Date().toISOString(),
      },
    ]);

    setLoading(false);

    if (error) {
      console.error('Save error:', error);
      Alert.alert('Erro', 'Não foi possível salvar sua reflexão');
    } else {
      Alert.alert('Sucesso', 'Reflexão salva! 💚', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Nova Reflexão</Text>

        <View style={styles.questionBox}>
          <Text style={styles.questionLabel}>Pergunta Inspiradora:</Text>
          <Text style={styles.question}>{question}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sua Reflexão:</Text>
          <TextInput
            style={styles.textInput}
            value={content}
            onChangeText={setContent}
            placeholder="Escreva seu pensamento, sentimento ou descoberta..."
            placeholderTextColor="#3a4a5a"
            multiline
            numberOfLines={8}
            editable={!loading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Como você se sente?</Text>
          <View style={styles.moodsGrid}>
            {MOODS.map((moodOption) => (
              <TouchableOpacity
                key={moodOption.key}
                style={[
                  styles.moodButton,
                  mood === moodOption.key && styles.moodButtonActive,
                ]}
                onPress={() => setMood(moodOption.key)}
                disabled={loading}
              >
                <Text style={styles.moodEmoji}>{moodOption.emoji}</Text>
                <Text style={styles.moodLabel}>{moodOption.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tags (separadas por vírgula)</Text>
          <TextInput
            style={styles.tagsInput}
            value={tagsInput}
            onChangeText={setTagsInput}
            placeholder="ex: meditação, gratidão, aprendizado"
            placeholderTextColor="#3a4a5a"
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={savEntry}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#090c14" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Reflexão</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090c14' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#b8952a', marginBottom: 16 },
  questionBox: {
    backgroundColor: '#0d1520',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#b8952a',
    marginBottom: 20,
  },
  questionLabel: { color: '#3a4a5a', fontSize: 12, marginBottom: 6 },
  question: { color: '#ccd6e8', fontSize: 15, lineHeight: 22, fontWeight: '500' },
  section: { marginBottom: 20 },
  sectionLabel: { color: '#ccd6e8', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  textInput: {
    backgroundColor: '#0d1520',
    borderRadius: 12,
    padding: 12,
    color: '#ccd6e8',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#141c28',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  moodButton: {
    width: '31%',
    backgroundColor: '#0d1520',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#141c28',
  },
  moodButtonActive: {
    borderColor: '#b8952a',
    backgroundColor: '#1a2a3a',
  },
  moodEmoji: { fontSize: 28, marginBottom: 6 },
  moodLabel: { color: '#ccd6e8', fontSize: 12, fontWeight: '500' },
  tagsInput: {
    backgroundColor: '#0d1520',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ccd6e8',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#141c28',
  },
  saveButton: {
    backgroundColor: '#b8952a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#090c14', fontSize: 16, fontWeight: '700' },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#141c28',
  },
  cancelButtonText: { color: '#3a4a5a', fontSize: 16, fontWeight: '600' },
});
