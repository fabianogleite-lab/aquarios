import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { signUp } = useAuthStore();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim()) { setError(t('auth.register.fillAllFields')); return; }
    if (password !== confirmPassword) { setError(t('auth.register.passwordMismatch')); return; }
    if (password.length < 6) { setError(t('auth.register.passwordTooShort')); return; }

    setError('');
    setLoading(true);
    const result = await signUp(email.trim(), password, displayName.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      Alert.alert(t('auth.register.successTitle'), t('auth.register.successMessage'), [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.content}>
        <FadeInView>
          <Text style={s.logo}>{'⚗'}</Text>
          <Text style={s.title}>{t('app.name')}</Text>
          <Text style={s.subtitle}>{t('auth.register.subtitle')}</Text>
        </FadeInView>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <FadeInView delay={200}>
          <TextInput style={s.input} placeholder={t('auth.register.namePlaceholder')} placeholderTextColor={colors.textMuted} value={displayName} onChangeText={setDisplayName} autoCapitalize="words" />
          <TextInput style={s.input} placeholder={t('auth.register.emailPlaceholder')} placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <TextInput style={s.input} placeholder={t('auth.register.passwordPlaceholder')} placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput style={s.input} placeholder={t('auth.register.confirmPasswordPlaceholder')} placeholderTextColor={colors.textMuted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

          <TouchableOpacity style={[s.button, loading && s.buttonDisabled]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.textLight} /> : <Text style={s.buttonText}>{t('auth.register.registerButton')}</Text>}
          </TouchableOpacity>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={s.linkBtn}>
              <Text style={s.linkText}>{t('auth.register.hasAccount')} <Text style={s.linkHighlight}>{t('auth.register.loginLink')}</Text></Text>
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
  buttonText: { color: colors.textLight, fontWeight: '700', fontSize: fontSize.xl },
  linkBtn: { marginTop: spacing.xxl, alignItems: 'center' },
  linkText: { color: colors.textSecondary, fontSize: fontSize.body },
  linkHighlight: { color: colors.primary, fontWeight: '600' },
});
