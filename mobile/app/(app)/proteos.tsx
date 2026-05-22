import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function ProteosScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: 'Olá! Sou o ProteOS, seu assistente IA pessoal. Como posso ajudar hoje?' },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const userMsg = { id: Date.now().toString(), role: 'user', text: message };
    const botMsg = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: 'Estou em modo demonstração. Na versão completa, terei memória persistente e personalidade adaptativa.',
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
            <Text style={[styles.bubbleText, item.role === 'user' && styles.userText]}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="#3a4a5a"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>{'→'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090c14' },
  messageList: { padding: 16, paddingBottom: 8 },
  bubble: { padding: 12, borderRadius: 12, marginBottom: 10, maxWidth: '80%' },
  botBubble: { backgroundColor: '#0d1520', borderWidth: 1, borderColor: '#141c28', alignSelf: 'flex-start' },
  userBubble: { backgroundColor: '#1a2a3a', alignSelf: 'flex-end' },
  bubbleText: { color: '#ccd6e8', fontSize: 15, lineHeight: 22 },
  userText: { color: '#e0e8f0' },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#141c28' },
  input: { flex: 1, backgroundColor: '#0d1520', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#ccd6e8', fontSize: 15, borderWidth: 1, borderColor: '#141c28' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#b8952a', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendText: { color: '#090c14', fontSize: 20, fontWeight: '700' },
});
