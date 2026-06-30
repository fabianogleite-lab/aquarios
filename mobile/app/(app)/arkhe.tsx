import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';

export default function ArkheScreen() {
  const { user } = useAuthStore();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!user?.id || !subject.trim() || !message.trim()) {
      Alert.alert('Preencha assunto e mensagem');
      return;
    }
    setSending(true);
    const { error } = await supabase.from('arkhe_tickets').insert({
      user_id: user.id,
      subject: subject.trim(),
      message: message.trim(),
    });
    setSending(false);
    if (error) {
      Alert.alert('Erro ao enviar', error.message);
      return;
    }
    setSubject('');
    setMessage('');
    setSent(true);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <FadeInView>
        <View style={s.hero}>
          <Text style={s.heroLabel}>ARKHE LABS</Text>
          <Text style={s.heroTitle}>Documentação & Garantia Autoral</Text>
        </View>
      </FadeInView>

      <FadeInView delay={80}>
        <Text style={s.sectionLabel}>O QUE É ARKHE</Text>
        <View style={s.card}>
          <Text style={s.body}>
            Arkhe Labs é a marca que assina a autoria técnica do AquariOS — não é um módulo
            de saúde. Aqui você encontra como o sistema foi pensado, como reportar uma dúvida
            ou problema, e como a autoria de cada parte do código é garantida.
          </Text>
        </View>
      </FadeInView>

      <FadeInView delay={120}>
        <Text style={s.sectionLabel}>GARANTIA AUTORAL</Text>
        <View style={s.card}>
          <Text style={s.body}>
            Cada decisão arquitetural e cada linha de código do AquariOS fica registrada em
            commits Git assinados, identificados por hash SHA-256. Esse hash é um identificador
            único e imutável: qualquer alteração no conteúdo gera um hash diferente, o que torna
            possível provar a qualquer momento quem criou o quê e quando — sem depender de
            registro em cartório ou de terceiros.
          </Text>
          <Text style={[s.body, { marginTop: spacing.sm }]}>
            O histórico completo de autoria fica em um registro interno (intellectual property
            registry), de acesso restrito à administração do AquariOS por segurança.
          </Text>
        </View>
      </FadeInView>

      <FadeInView delay={160}>
        <Text style={s.sectionLabel}>ABRIR UM TICKET</Text>
        <View style={s.card}>
          {sent && (
            <Text style={s.successText}>✓ Ticket enviado. Vamos responder em breve.</Text>
          )}
          <TextInput
            style={s.input}
            placeholder="Assunto"
            placeholderTextColor={colors.textMuted}
            value={subject}
            onChangeText={setSubject}
          />
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="Descreva sua dúvida ou problema"
            placeholderTextColor={colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={s.submitButton} onPress={handleSubmit} disabled={sending}>
            {sending ? (
              <ActivityIndicator color="#000" size={16} />
            ) : (
              <Text style={s.submitText}>Enviar ticket</Text>
            )}
          </TouchableOpacity>
        </View>
      </FadeInView>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 40 },

  hero: {
    backgroundColor: colors.cardDark,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heroLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: spacing.xs },
  heroTitle: { fontSize: fontSize.title, fontWeight: '700', color: colors.textLight },

  sectionLabel: {
    fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 1.2, marginHorizontal: spacing.lg,
    marginTop: spacing.xl, marginBottom: spacing.sm,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  body: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },

  successText: { fontSize: fontSize.sm, color: colors.success, fontWeight: '600', marginBottom: spacing.md },

  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: fontSize.sm,
  },
  textArea: { height: 100, textAlignVertical: 'top' },

  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  submitText: { color: '#000', fontWeight: '700', fontSize: fontSize.sm },
});
