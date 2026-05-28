import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { getDeviceLocale } from '../../lib/locale';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { useXP } from '../../hooks/useXP';
import { encryptField, decryptOrFallback } from '../../lib/crypto';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { formatTime } from '../../lib/locale';

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

interface SelectedImage {
  base64: string;
  mimeType: string;
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
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuthStore();
  const { logXP } = useXP();

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
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 400);
    }
  };

  const pickImage = () => {
    Alert.alert('Adicionar imagem', 'Escolha a origem', [
      { text: 'Câmera', onPress: openCamera },
      { text: 'Galeria', onPress: openGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Permita acesso à câmera nas configurações.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.4, allowsEditing: true });
    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage({ base64: result.assets[0].base64, mimeType: 'image/jpeg' });
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.4,
    });
    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage({
        base64: result.assets[0].base64,
        mimeType: result.assets[0].mimeType || 'image/jpeg',
      });
    }
  };

  const sendMessage = async () => {
    if ((!message.trim() && !selectedImage) || !user?.id) return;

    setLoading(true);
    const userInput = message;
    const capturedImage = selectedImage;
    setMessage('');
    setSelectedImage(null);

    const now = new Date().toISOString();
    const displayText = capturedImage
      ? (userInput.trim() ? `📷 ${userInput.trim()}` : '📷 Analisar imagem')
      : userInput;

    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: displayText, created_at: now };
    setMessages((prev) => [...prev, userMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const newConvId = conversationId || generateUUID();
      if (!conversationId) setConversationId(newConvId);

      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

      const userApiContent = capturedImage
        ? [
            {
              type: 'image',
              source: { type: 'base64', media_type: capturedImage.mimeType, data: capturedImage.base64 },
            },
            {
              type: 'text',
              text: userInput.trim() || 'Extraia e transcreva todo o texto desta imagem. Se não houver texto, descreva o que vê.',
            },
          ]
        : userInput;

      const apiMessages = [...history, { role: 'user', content: userApiContent }];

      let assistantContent = 'Desculpe, não consegui processar. Tente novamente.';

      try {
        const locale = getDeviceLocale();
        const { data, error: fnError } = await supabase.functions.invoke('chat', {
          body: { messages: apiMessages, persona, locale },
        });

        if (fnError) {
          console.error('Edge Function error:', fnError);
        } else if (data?.error === 'rate_limit') {
          assistantContent = data.message;
        } else if (data?.text) {
          assistantContent = data.text;
          logXP('chat_message', 25, 'proteos').catch(() => {});
        }
      } catch (apiErr) {
        console.error('ProteOS API error:', apiErr);
      }

      const futureTime = new Date().toISOString();

      const [encUser, encAssistant] = await Promise.all([
        encryptField(displayText),
        encryptField(assistantContent),
      ]);

      const { error: saveError } = await supabase.from('chat_messages').insert([
        {
          conversation_id: newConvId, user_id: user.id, role: 'user',
          content: encUser.ciphertext ? '[encrypted]' : displayText,
          content_encrypted: encUser.ciphertext || null,
          content_nonce: encUser.nonce || null,
          created_at: now,
        },
        {
          conversation_id: newConvId, user_id: user.id, role: 'assistant',
          content: encAssistant.ciphertext ? '[encrypted]' : assistantContent,
          content_encrypted: encAssistant.ciphertext || null,
          content_nonce: encAssistant.nonce || null,
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
                {formatTime(item.created_at)}
              </Text>
            </View>
          </FadeInView>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
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

      {selectedImage && (
        <View style={s.imagePreview}>
          <Image
            source={{ uri: `data:${selectedImage.mimeType};base64,${selectedImage.base64}` }}
            style={s.previewImg}
          />
          <TouchableOpacity style={s.removeImgBtn} onPress={() => setSelectedImage(null)}>
            <Text style={s.removeImgText}>✕</Text>
          </TouchableOpacity>
          <Text style={s.previewLabel}>Imagem pronta — adicione um texto ou envie direto</Text>
        </View>
      )}

      <View style={s.inputRow}>
        <TouchableOpacity style={s.cameraBtn} onPress={pickImage} disabled={loading}>
          <Text style={s.cameraBtnText}>{selectedImage ? '🖼️' : '📷'}</Text>
        </TouchableOpacity>
        <TextInput
          style={s.input}
          value={message}
          onChangeText={setMessage}
          placeholder={selectedImage ? 'Pergunta sobre a imagem (opcional)...' : 'Converse com ProteOS...'}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
          editable={!loading}
        />
        <TouchableOpacity
          style={[s.sendBtn, loading && s.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={loading || (!message.trim() && !selectedImage)}
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
  imagePreview: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  previewImg: { width: 52, height: 52, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  removeImgBtn: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  removeImgText: { color: colors.bg, fontSize: 10, fontWeight: '700' },
  previewLabel: { flex: 1, color: colors.textMuted, fontSize: fontSize.xs },
  inputRow: { flexDirection: 'row', padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'flex-end' },
  cameraBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginRight: spacing.xs },
  cameraBtnText: { fontSize: 22 },
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
