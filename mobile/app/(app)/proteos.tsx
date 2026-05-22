import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const PROTEOS_RESPONSES = [
  'Que profundo! Isso me faz pensar sobre a natureza da existência.',
  'Interessante perspectiva. Como você chegou a essa conclusão?',
  'Vejo que você está em uma jornada de autoconhecimento. Isso é muito importante.',
  'Essa reflexão é valiosa. Qual é o sentimento mais forte que você tem agora?',
  'Posso perceber que há algo importante aqui para você. Quer explorar mais?',
  'Fascinante. A vida é realmente uma série de descobertas.',
  'Você está no caminho certo. Continue assim.',
  'ProteOS aqui - pronto para conversar sobre o que você sente.',
];

export default function ProteosScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    if (data && data.length > 0) {
      setMessages(
        data.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          created_at: msg.created_at,
        }))
      );
      setConversationId(data[0].conversation_id);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !user?.id) return;

    setLoading(true);
    const userInput = message;
    setMessage('');

    try {
      const newConvId = conversationId || `conv_${Date.now()}`;
      if (!conversationId) setConversationId(newConvId);

      const assistantResponse = PROTEOS_RESPONSES[
        Math.floor(Math.random() * PROTEOS_RESPONSES.length)
      ];

      const now = new Date().toISOString();
      const futureTime = new Date(Date.now() + 1000).toISOString();

      const { error: saveError } = await supabase.from('chat_messages').insert([
        { conversation_id: newConvId, user_id: user.id, role: 'user', content: userInput, created_at: now },
        { conversation_id: newConvId, user_id: user.id, role: 'assistant', content: assistantResponse, created_at: futureTime },
      ]);

      if (saveError) console.error('Save error:', saveError);

      const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: userInput, created_at: now };
      const assistantMsg: Message = { id: `assistant-${Date.now()}`, role: 'assistant', content: assistantResponse, created_at: futureTime };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('Chat error:', error);
      setMessage(userInput);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.messageList}
        renderItem={({ item }) => (
          <FadeInView>
            <View style={[s.bubble, item.role === 'user' ? s.userBubble : s.botBubble]}>
              <Text style={[s.bubbleText, item.role === 'user' && s.userText]}>
                {item.content}
              </Text>
              <Text style={s.timestamp}>
                {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </FadeInView>
        )}
        onEndReachedThreshold={0.1}
        onEndReached={() => flatListRef.current?.scrollToEnd()}
      />

      {loading && (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={s.loadingText}>ProteOS está pensando...</Text>
        </View>
      )}

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Converse com ProteOS..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
          editable={!loading}
        />
        <TouchableOpacity
          style={[s.sendBtn, loading && s.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={loading || !message.trim()}
        >
          <Text style={s.sendText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  messageList: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  bubble: { padding: spacing.md, borderRadius: radius.lg, marginBottom: 10, maxWidth: '85%' },
  botBubble: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignSelf: 'flex-start' },
  userBubble: { backgroundColor: colors.userBubble, alignSelf: 'flex-end' },
  bubbleText: { color: colors.text, fontSize: fontSize.lg, lineHeight: 22 },
  userText: { color: colors.textLight },
  timestamp: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 6 },
  loadingContainer: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, alignItems: 'center' },
  loadingText: { color: colors.textMuted, marginLeft: spacing.sm, fontSize: fontSize.md },
  inputRow: { flexDirection: 'row', padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'flex-end' },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontSize: fontSize.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 100,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: spacing.sm },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: colors.bg, fontSize: 20, fontWeight: '700' },
});
