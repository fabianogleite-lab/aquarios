import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const PROTEOS_SYSTEM_PROMPT = `Você é ProteOS, o assistente IA pessoal do AquariOS — Sistema Operacional Pessoal.

Características:
- Caloroso, profundo e prático
- Fala português brasileiro coloquial
- Criador: Fabiano Gomes Leite, fundador da Arkhe Labs
- Ajuda com autoconhecimento, produtividade e bem-estar
- Conciso mas profundo; usa metáforas quando apropriado
- Nunca inventa dados sobre o usuário — pergunta se não sabe
- Respeita a privacidade e segurança

Seu objetivo é ser um companheiro genuíno na jornada pessoal do usuário.`;

export default function ProteosScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuthStore();

  // Load conversation history on mount
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
      // Get conversation ID from first message
      setConversationId(data[0].conversation_id);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !user?.id) return;

    setLoading(true);
    const userInput = message;
    setMessage('');

    try {
      // Prepare messages for Claude
      const conversationHistory = messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Call Anthropic API directly via fetch
      const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
      if (!apiKey) {
        Alert.alert('Erro', 'API Key do Anthropic não configurada');
        setLoading(false);
        return;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          system: PROTEOS_SYSTEM_PROMPT,
          messages: [
            ...conversationHistory,
            {
              role: 'user',
              content: userInput,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`API returned ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      const assistantResponse =
        data.content?.[0]?.type === 'text'
          ? data.content[0].text
          : 'Desculpe, não consegui processar sua mensagem.';

      // Generate new conversation ID if needed
      const newConvId = conversationId || `conv_${Date.now()}`;
      if (!conversationId) {
        setConversationId(newConvId);
      }

      // Save both messages to Supabase
      const now = new Date().toISOString();
      const { error: saveError } = await supabase.from('chat_messages').insert([
        {
          conversation_id: newConvId,
          user_id: user.id,
          role: 'user',
          content: userInput,
          created_at: now,
        },
        {
          conversation_id: newConvId,
          user_id: user.id,
          role: 'assistant',
          content: assistantResponse,
          created_at: new Date(Date.now() + 1000).toISOString(),
        },
      ]);

      if (saveError) {
        console.error('Save error:', saveError);
      }

      // Add to local state
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userInput,
        created_at: now,
      };

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantResponse,
        created_at: new Date(Date.now() + 1000).toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', `Falha ao conectar com ProteOS: ${errorMsg}`);
      // Restore message if error
      setMessage(userInput);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user' ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.role === 'user' && styles.userText,
              ]}
            >
              {item.content}
            </Text>
            <Text style={styles.timestamp}>
              {new Date(item.created_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )}
        onEndReachedThreshold={0.1}
        onEndReached={() => flatListRef.current?.scrollToEnd()}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#b8952a" />
          <Text style={styles.loadingText}>ProteOS está pensando...</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Converse com ProteOS..."
          placeholderTextColor="#3a4a5a"
          multiline
          maxLength={500}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={loading || !message.trim()}
        >
          <Text style={styles.sendText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090c14' },
  messageList: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  bubble: { padding: 12, borderRadius: 12, marginBottom: 10, maxWidth: '85%' },
  botBubble: {
    backgroundColor: '#0d1520',
    borderWidth: 1,
    borderColor: '#141c28',
    alignSelf: 'flex-start',
  },
  userBubble: { backgroundColor: '#1a3a4a', alignSelf: 'flex-end' },
  bubbleText: { color: '#ccd6e8', fontSize: 15, lineHeight: 22 },
  userText: { color: '#e0e8f0' },
  timestamp: {
    color: '#3a4a5a',
    fontSize: 11,
    marginTop: 6,
  },
  loadingContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loadingText: { color: '#3a4a5a', marginLeft: 8, fontSize: 13 },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#141c28',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#0d1520',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ccd6e8',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#141c28',
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#b8952a',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: '#090c14', fontSize: 20, fontWeight: '700' },
});
