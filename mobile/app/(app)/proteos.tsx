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

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

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

    const now = new Date().toISOString();
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: userInput, created_at: now };
    setMessages((prev) => [...prev, userMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const newConvId = conversationId || generateUUID();
      if (!conversationId) setConversationId(newConvId);

      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

      const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
      const apiMessages = [
        ...history,
        { role: 'user', content: userInput },
      ];

      let assistantContent = 'Desculpe, não consegui processar. Tente novamente.';

      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey || '',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: 'Voce e ProteOS, o assistente IA pessoal do AquariOS - Sistema Operacional Pessoal. Caloroso, profundo e pratico. Fala portugues brasileiro coloquial. Criador: Fabiano Gomes Leite, fundador da Arkhe Labs. Ajuda com autoconhecimento, produtividade e bem-estar. Conciso mas profundo; usa metaforas quando apropriado. Nunca inventa dados sobre o usuario. Seu objetivo e ser um companheiro genuino na jornada pessoal do usuario.',
            messages: apiMessages,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          assistantContent = data.content?.[0]?.text || assistantContent;
        } else {
          console.error('API error:', res.status, await res.text());
        }
      } catch (apiErr) {
        console.error('Anthropic API error:', apiErr);
      }

      const futureTime = new Date().toISOString();

      const { error: saveError } = await supabase.from('chat_messages').insert([
        { conversation_id: newConvId, user_id: user.id, role: 'user', content: userInput, created_at: now },
        { conversation_id: newConvId, user_id: user.id, role: 'assistant', content: assistantContent, created_at: futureTime },
      ]);

      if (saveError) console.error('Save error:', saveError);

      const assistantMsg: Message = { id: `assistant-${Date.now()}`, role: 'assistant', content: assistantContent, created_at: futureTime };
      setMessages((prev) => [...prev, assistantMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = { id: `err-${Date.now()}`, role: 'assistant', content: 'Erro de conexão. Verifique sua internet.', created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, errorMsg]);
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
