import '../i18n';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/auth';
import { OfflineNotice } from '../components/OfflineNotice';
import { colors, fontSize } from '../lib/theme';
import * as Localization from 'expo-localization';
import { applyRTL } from '../i18n/rtl';

const { width } = Dimensions.get('window');

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadePhoto = useRef(new Animated.Value(0)).current;
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const fadeSub = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1.1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadePhoto, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ]),
      Animated.timing(fadeTitle, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(fadeSub, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.delay(1200),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={splash.container}>
      <StatusBar style="light" />
      <Animated.Image
        source={require('../assets/splash-optimized.jpg')}
        style={[splash.photo, { opacity: fadePhoto, transform: [{ scale }] }]}
        resizeMode="contain"
      />
      <Animated.Text style={[splash.title, { opacity: fadeTitle }]}>
        AquariOS
      </Animated.Text>
      <Animated.Text style={[splash.subtitle, { opacity: fadeSub }]}>
        Sistema Operacional Pessoal
      </Animated.Text>
      <Animated.Text style={[splash.version, { opacity: fadeSub }]}>
        v4.2.0
      </Animated.Text>
    </View>
  );
}

const splash = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  photo: { width: width * 0.7, height: width * 0.75, borderRadius: 20, marginBottom: 24 },
  title: { fontSize: fontSize.splash, fontWeight: '700', color: colors.primary, letterSpacing: 3 },
  subtitle: { fontSize: fontSize.body, color: colors.textSecondary, marginTop: 6 },
  version: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 16 },
});

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const { session, loading: authLoading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
    const locale = Localization.getLocales()?.[0]?.languageTag ?? 'pt-BR';
    applyRTL(locale);
  }, []);

  useEffect(() => {
    if (showSplash || authLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [session, authLoading, showSplash, segments]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <OfflineNotice />
      <Slot />
    </>
  );
}
