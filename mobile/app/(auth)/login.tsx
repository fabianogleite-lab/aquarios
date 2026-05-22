import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';
import { useAuthStore } from '../../store/auth';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

export default function LoginScreen() {
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('Preencha todos os campos'); return; }
    setError('');
    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.content}>
        <FadeInView>
          <Text style={s.logo}>{'⚗'}</Text>
          <Text style={s.title}>AquariOS</Text>
          <Text style={s.subtitle}>Entre na sua conta</Text>
        </FadeInView>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <FadeInView delay={200}>
          <TextInput style={s.input} placeholder="Email" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <TextInput style={s.input} placeholder="Senha" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={[s.button, loading && s.buttonDisabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={s.buttonText}>Entrar</Text>}
          </TouchableOpacity>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={s.linkBtn}>
              <Text style={s.linkText}>Não tem conta? <Text style={s.linkHighlight}>Criar conta</Text></Text>
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
