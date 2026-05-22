import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

export default function RegisterScreen() {
  const { signUp } = useAuthStore();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim()) { setError('Preencha todos os campos'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem'); return; }
    if (password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres'); return; }

    setError('');
    setLoading(true);
    const result = await signUp(email.trim(), password, displayName.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      Alert.alert('Conta criada!', 'Verifique seu email para confirmar o cadastro, ou faça login diretamente.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.content}>
        <FadeInView>
          <Text style={s.logo}>{'⚗'}</Text>
          <Text style={s.title}>AquariOS</Text>
          <Text style={s.subtitle}>Criar nova conta</Text>
        </FadeInView>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <FadeInView delay={200}>
          <TextInput style={s.input} placeholder="Nome" placeholderTextColor={colors.textMuted} value={displayName} onChangeText={setDisplayName} autoCapitalize="words" />
          <TextInput style={s.input} placeholder="Email" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <TextInput style={s.input} placeholder="Senha" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput style={s.input} placeholder="Confirmar senha" placeholderTextColor={colors.textMuted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

          <TouchableOpacity style={[s.button, loading && s.buttonDisabled]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={s.buttonText}>Criar Conta</Text>}
          </TouchableOpacity>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={s.linkBtn}>
              <Text style={s.linkText}>Já tem conta? <Text style={s.linkHighlight}>Entrar</Text></Text>
            </TouchableOpacity>
          </Link>
        </FadeInView>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xxxl },
  logo: { fontSize: 56, textAlign: 'center', marginBottom: spacing.sm },
  title: { fontSize: fontSize.display, fontWeight: '700', color: colors.primary, textAlign: 'center', letterSpacing: 2 },
  subtitle: { fontSize: fontSize.lg, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xxxl },
  error: { color: colors.error, fontSize: fontSize.body, textAlign: 'center', marginBottom: spacing.lg, backgroundColor: colors.errorBg, padding: 10, borderRadius: radius.sm },
  input: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, color: colors.text, fontSize: fontSize.xl, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  button: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginTop: spacing.sm },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.bg, fontWeight: '700', fontSize: fontSize.xl },
  linkBtn: { marginTop: spacing.xxl, alignItems: 'center' },
  linkText: { color: colors.textSecondary, fontSize: fontSize.body },
  linkHighlight: { color: colors.primary, fontWeight: '600' },
});
