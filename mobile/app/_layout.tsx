import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/auth';

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
        style={[
          splash.photo,
          { opacity: fadePhoto, transform: [{ scale }] },
        ]}
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
  container: {
    flex: 1,
    backgroundColor: '#090c14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: width * 0.7,
    height: width * 0.75,
    borderRadius: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#b8952a',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 14,
    color: '#6a7a8a',
    marginTop: 6,
  },
  version: {
    fontSize: 11,
    color: '#3a4a5a',
    marginTop: 16,
  },
});

function LoadingScreen() {
  return (
    <View style={loading.container}>
      <StatusBar style="light" />
      <ActivityIndicator size="large" color="#b8952a" />
    </View>
  );
}

const loading = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090c14',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const { session, loading: authLoading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
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
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Slot />
    </>
  );
}
