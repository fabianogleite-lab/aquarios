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
      // Get conversation ID from last message
      setConversationId(data[0].conversation_id);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !user?.id) return;

    setLoading(true);

    try {
      // Prepare history for Claude context
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call Edge Function
      const response = await supabase.functions.invoke('chat', {
        body: {
          message: message.trim(),
          user_id: user.id,
          conversation_id: conversationId,
          history,
        },
      });

      if (response.error) {
        Alert.alert('Erro', response.error.message || 'Erro ao enviar mensagem');
        setLoading(false);
        return;
      }

      const { response: assistantResponse, conversation_id: newConvId } = response.data;

      // Update conversation ID if new
      if (newConvId && !conversationId) {
        setConversationId(newConvId);
      }

      // Add both messages locally
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
      };

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantResponse,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setMessage('');

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert('Erro', 'Falha ao conectar com ProteOS');
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
          <Text style={styles.loadingText}>ProteOS está digitando...</Text>
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
