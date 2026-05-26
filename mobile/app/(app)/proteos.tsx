import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { encryptField, decryptOrFallback } from '../../lib/crypto';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

type PersonaKey = 'default' | 'pragmatico' | 'suporte' | 'urgencia';

const PERSONA_OPTIONS: { key: PersonaKey; label: string; icon: string }[] = [
  { key: 'default',    label: 'ProteOS',    icon: '💬' },
  { key: 'pragmatico', label: 'Direto',     icon: '⚡' },
  { key: 'suporte',    label: 'Suporte',    icon: '🤗' },
  { key: 'urgencia',   label: 'Clínico',    icon: '⚕' },
];

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
  const [persona, setPersona] = useState<PersonaKey>('default');
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, content_encrypted, content_nonce, conversation_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    if (data && data.length > 0) {
      const decrypted = await Promise.all(
        data.map(async (msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: await decryptOrFallback(msg.content_encrypted, msg.content_nonce, msg.content),
          created_at: msg.created_at,
        }))
      );
      setMessages(decrypted);
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
      const apiMessages = [
        ...history,
        { role: 'user', content: userInput },
      ];

      let assistantContent = 'Desculpe, não consegui processar. Tente novamente.';

      try {
        const { data, error: fnError } = await supabase.functions.invoke('chat', {
          body: { messages: apiMessages, persona },
        });

        if (fnError) {
          console.error('Edge Function error:', fnError);
        } else if (data?.error === 'rate_limit') {
          assistantContent = data.message;
        } else if (data?.text) {
          assistantContent = data.text;
        }
      } catch (apiErr) {
        console.error('ProteOS API error:', apiErr);
      }

      const futureTime = new Date().toISOString();

      const [encUser, encAssistant] = await Promise.all([
        encryptField(userInput),
        encryptField(assistantContent),
      ]);

      const { error: saveError } = await supabase.from('chat_messages').insert([
        {
          conversation_id: newConvId, user_id: user.id, role: 'user',
          content: '[encrypted]',
          content_encrypted: encUser.ciphertext, content_nonce: encUser.nonce,
          created_at: now,
        },
        {
          conversation_id: newConvId, user_id: user.id, role: 'assistant',
          content: '[encrypted]',
          content_encrypted: encAssistant.ciphertext, content_nonce: encAssistant.nonce,
          created_at: futureTime,
        },
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.personaRow} contentContainerStyle={s.personaRowContent}>
        {PERSONA_OPTIONS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[s.personaBtn, persona === p.key && s.personaBtnActive]}
            onPress={() => setPersona(p.key)}
          >
            <Text style={s.personaIcon}>{p.icon}</Text>
            <Text style={[s.personaLabel, persona === p.key && s.personaLabelActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
  personaRow: { borderTopWidth: 1, borderTopColor: colors.border, maxHeight: 54 },
  personaRowContent: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  personaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.pill, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
  },
  personaBtnActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  personaIcon: { fontSize: 14 },
  personaLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' },
  personaLabelActive: { color: colors.primary, fontWeight: '700' },
});
