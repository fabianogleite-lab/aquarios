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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useVoice } from '../../hooks/useVoice';
import Markdown from 'react-native-markdown-display';
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

interface SelectedDocument {
  base64: string;
  mimeType: string;
  name: string;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

async function fetchUserContext(userId: string): Promise<string> {
  try {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now.getTime() - 7 * 86400000);

    const [mealsToday, mealsWeek, diaryWeek, xp, mood, grat, hyd, rel] = await Promise.all([
      supabase.from('meals').select('calories').eq('user_id', userId).gte('created_at', todayStart.toISOString()),
      supabase.from('meals').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', weekAgo.toISOString()),
      supabase.from('diario_entries').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', weekAgo.toISOString()),
      supabase.from('user_xp').select('total_xp, level').eq('user_id', userId).single(),
      supabase.from('mood_logs').select('mood').eq('user_id', userId).gte('created_at', weekAgo.toISOString()),
      supabase.from('gratitude_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', weekAgo.toISOString()),
      supabase.from('hydration_logs').select('amount_ml').eq('user_id', userId).gte('created_at', todayStart.toISOString()),
      supabase.from('relationship_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', weekAgo.toISOString()),
    ]);

    const kcalHoje = (mealsToday.data || []).reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
    const numRefeicoes = (mealsToday.data || []).length;
    const refeicoesSemana = mealsWeek.count ?? 0;
    const diarioSemana = diaryWeek.count ?? 0;
    const nivel = xp.data?.level ?? 1;
    const totalXP = xp.data?.total_xp ?? 0;
    const hora = now.toLocaleString('pt-BR', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
    const moodVals = (mood.data || []).map((m: any) => m.mood).filter((n: any) => typeof n === 'number');
    const moodAvg = moodVals.length ? (moodVals.reduce((a: number, b: number) => a + b, 0) / moodVals.length).toFixed(1) : null;
    const gratCount = grat.count ?? 0;
    const hydMl = (hyd.data || []).reduce((a: number, r: any) => a + (r.amount_ml || 0), 0);
    const relCount = rel.count ?? 0;

    return `Momento: ${hora}
Refeições hoje: ${numRefeicoes} (${kcalHoje} kcal registradas)
Refeições esta semana: ${refeicoesSemana}
Entradas no Diário do Ser esta semana: ${diarioSemana}${moodAvg ? `\nHumor médio (7 dias): ${moodAvg}/10` : ''}${gratCount ? `\nGratidões registradas (7 dias): ${gratCount}` : ''}${hydMl ? `\nÁgua hoje: ${hydMl} ml` : ''}${relCount ? `\nConexões registradas (7 dias): ${relCount}` : ''}
Nível AquariOS: ${nivel} | XP total: ${totalXP}`;
  } catch {
    return '';
  }
}

export default function ProteosScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [persona, setPersona] = useState<PersonaKey>('default');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<SelectedDocument | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuthStore();
  const { logXP } = useXP();
  const { voiceState, isAvailable: voiceAvailable, startRecording, stopRecordingAndTranscribe, speakResponse, stopSpeaking, error: voiceError } = useVoice();
  const params = useLocalSearchParams<{ autoCamera?: string; autoGallery?: string; autoDocument?: string; initialText?: string }>();

  useEffect(() => {
    loadConversationHistory();
  }, []);

  // Atalhos vindos da barra do ProteOS na home (botão "+" → câmera/foto/arquivo)
  useEffect(() => {
    if (params.autoCamera === '1') openCamera();
    else if (params.autoGallery === '1') openGallery();
    else if (params.autoDocument === '1') pickDocument();
    if (params.initialText) setMessage(String(params.initialText));
  }, [params.autoCamera, params.autoGallery, params.autoDocument, params.initialText]);

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
    Alert.alert('Anexar', 'Escolha o que enviar', [
      { text: 'Câmera', onPress: openCamera },
      { text: 'Foto/Vídeo', onPress: openGallery },
      { text: 'Arquivo', onPress: pickDocument },
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

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'text/plain', 'text/csv'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    try {
      const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
      setSelectedDocument({ base64, mimeType: asset.mimeType || 'application/pdf', name: asset.name });
    } catch {
      Alert.alert('Ops', 'Não consegui ler esse arquivo. Tente outro.');
    }
  };

  const sendMessage = async () => {
    if ((!message.trim() && !selectedImage && !selectedDocument) || !user?.id) return;

    setLoading(true);
    const userInput = message;
    const capturedImage = selectedImage;
    const capturedDocument = selectedDocument;
    setMessage('');
    setSelectedImage(null);
    setSelectedDocument(null);

    const now = new Date().toISOString();
    const displayText = capturedDocument
      ? (userInput.trim() ? `📄 ${capturedDocument.name}: ${userInput.trim()}` : `📄 Analisar ${capturedDocument.name}`)
      : capturedImage
      ? (userInput.trim() ? `📷 ${userInput.trim()}` : '📷 Analisar imagem')
      : userInput;

    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: displayText, created_at: now };
    setMessages((prev) => [...prev, userMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const newConvId = conversationId || generateUUID();
      if (!conversationId) setConversationId(newConvId);

      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

      const userApiContent = capturedDocument
        ? [
            {
              type: 'document',
              source: { type: 'base64', media_type: capturedDocument.mimeType, data: capturedDocument.base64 },
            },
            {
              type: 'text',
              text: userInput.trim() || `Leia o documento "${capturedDocument.name}" e resuma os pontos principais.`,
            },
          ]
        : capturedImage
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
        const userContext = await fetchUserContext(user.id);
        const { data, error: fnError } = await supabase.functions.invoke('chat', {
          body: { messages: apiMessages, persona, locale, userContext },
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

      // TTS: ProteOS fala a resposta se voz estiver ativa
      if (voiceEnabled && voiceAvailable && assistantContent && assistantContent !== 'Desculpe, não consegui processar. Tente novamente.') {
        speakResponse(assistantContent).catch(() => {});
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = { id: `err-${Date.now()}`, role: 'assistant', content: 'Erro de conexão. Verifique sua internet.', created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 80 : 90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.messageList}
        renderItem={({ item }) => (
          <FadeInView>
            <View style={[s.bubble, item.role === 'user' ? s.userBubble : s.botBubble]}>
              {item.role === 'assistant' ? (
                <Markdown style={mdStyle}>{item.content}</Markdown>
              ) : (
                <Text style={[s.bubbleText, s.userText]}>{item.content}</Text>
              )}
              <Text style={s.timestamp}>{formatTime(item.created_at)}</Text>
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

      {selectedDocument && (
        <View style={s.imagePreview}>
          <Text style={{ fontSize: 22 }}>📄</Text>
          <TouchableOpacity style={s.removeImgBtn} onPress={() => setSelectedDocument(null)}>
            <Text style={s.removeImgText}>✕</Text>
          </TouchableOpacity>
          <Text style={s.previewLabel}>{selectedDocument.name} — pronto pra converter/resumir</Text>
        </View>
      )}

      {/* Barra de voz: toggle + status */}
      <View style={s.voiceBar}>
        <TouchableOpacity
          style={[s.voiceToggle, voiceEnabled && s.voiceToggleActive]}
          onPress={() => { setVoiceEnabled((v) => !v); if (voiceState === 'speaking') stopSpeaking(); }}
        >
          <Text style={s.voiceToggleText}>{voiceEnabled ? '🔊 Voz ativa' : '🔇 Voz desligada'}</Text>
        </TouchableOpacity>
        {voiceState !== 'idle' && (
          <Text style={s.voiceStatus}>
            {voiceState === 'recording' ? '🔴 Gravando...' : voiceState === 'processing' ? '⏳ Transcrevendo...' : '🎵 Falando...'}
          </Text>
        )}
        {voiceError ? <Text style={s.voiceError}>{voiceError}</Text> : null}
      </View>

      <View style={s.inputRow}>
        <TouchableOpacity style={s.cameraBtn} onPress={pickImage} disabled={loading}>
          <Text style={s.cameraBtnText}>{selectedImage ? '🖼️' : '📷'}</Text>
        </TouchableOpacity>

        {/* Botão microfone — segura para gravar, solta para enviar */}
        <TouchableOpacity
          style={[s.micBtn, voiceState === 'recording' && s.micBtnRecording]}
          onLongPress={startRecording}
          onPressOut={async () => {
            if (voiceState === 'recording') {
              const transcript = await stopRecordingAndTranscribe();
              if (transcript) setMessage(transcript);
            }
          }}
          disabled={loading || voiceState === 'processing' || voiceState === 'speaking'}
        >
          <Text style={s.micBtnText}>{voiceState === 'recording' ? '⏺' : '🎤'}</Text>
        </TouchableOpacity>

        <TextInput
          style={s.input}
          value={message}
          onChangeText={setMessage}
          placeholder={selectedImage ? 'Pergunta sobre a imagem (opcional)...' : selectedDocument ? 'Pergunta sobre o arquivo (opcional)...' : 'Converse com ProteOS...'}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
          editable={!loading}
        />
        <TouchableOpacity
          style={[s.sendBtn, loading && s.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={loading || (!message.trim() && !selectedImage && !selectedDocument)}
        >
          <Text style={s.sendText}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const mdStyle = {
  body:       { color: colors.text, fontSize: fontSize.lg, lineHeight: 22 },
  heading1:   { fontSize: fontSize.xl, fontWeight: '700' as const, color: colors.primary, marginBottom: 4, marginTop: 8 },
  heading2:   { fontSize: fontSize.lg, fontWeight: '700' as const, color: colors.text, marginBottom: 4, marginTop: 6 },
  strong:     { fontWeight: '700' as const, color: colors.text },
  em:         { fontStyle: 'italic' as const, color: colors.textSecondary },
  bullet_list:{ marginVertical: 4 },
  ordered_list:{ marginVertical: 4 },
  list_item:  { marginBottom: 2 },
  code_inline:{ backgroundColor: colors.cardActive, color: colors.primary, borderRadius: 4, paddingHorizontal: 4, fontFamily: 'monospace' },
  fence:      { backgroundColor: colors.cardActive, borderRadius: 8, padding: 8, marginVertical: 6 },
  hr:         { backgroundColor: colors.border, height: 1, marginVertical: 8 },
  paragraph:  { marginBottom: 6 },
};

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
  removeImgText: { color: colors.textLight, fontSize: 10, fontWeight: '700' },
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
  sendText: { color: colors.textLight, fontSize: 20, fontWeight: '700' },
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
  // Voz
  voiceBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border },
  voiceToggle: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  voiceToggleActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  voiceToggleText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' },
  voiceStatus: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  voiceError: { fontSize: fontSize.xs, color: '#FF3B30', flex: 1 },
  micBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: spacing.xs },
  micBtnRecording: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  micBtnText: { fontSize: 18 },
});
