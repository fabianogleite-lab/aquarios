import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [screen, setScreen] = useState(0);

  const markOnboardingComplete = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user?.id) {
        await supabase
          .from('user_profiles')
          .update({ onboarding_done: true })
          .eq('user_id', session.session.user.id);
      }
    } catch (err) {
      console.error('Error marking onboarding complete:', err);
    }
    onComplete();
  };

  const screens = [
    {
      title: 'Bem-vindo ao IVI',
      subtitle: 'Sistema de Saúde Integral',
      description: 'IVI mede sua saúde em 8 dimensões:\n\n🏃 Físico\n🧠 Mental\n🍎 Nutrição\n😴 Sono\n⚡ Atividade\n💑 Relacionamento\n🎯 Propósito\n💰 Financeiro',
      icon: '📊',
      color: '#2196F3'
    },
    {
      title: 'Sistema de XP',
      subtitle: 'Ganhe pontos e suba de nível',
      description: 'Cada ação saudável gera XP:\n\n✅ Fazer exercício\n✅ Registrar refeição\n✅ Dormir bem\n✅ Participar da comunidade\n\nAcumule XP para desbloquear badges e recursos premium',
      icon: '⭐',
      color: '#FF9800'
    },
    {
      title: 'Comunidades',
      subtitle: 'Conecte com outros usuários',
      description: 'Faça parte de uma comunidade saudável:\n\n👥 Veja o Top 10 IVI\n💬 Compartilhe experiências\n🎁 Ganhe desafios em grupo\n🏆 Compete e se inspire\n\nVocê não está sozinho nessa jornada!',
      icon: '🤝',
      color: '#4CAF50'
    }
  ];

  const currentScreen = screens[screen];

  return (
    <LinearGradient
      colors={['#0f0f0f', '#1a1a1a']}
      style={styles.container}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconBadge, { borderColor: currentScreen.color }]}>
            <Text style={styles.icon}>{currentScreen.icon}</Text>
          </View>
        </View>

        <Text style={styles.title}>{currentScreen.title}</Text>
        <Text style={styles.subtitle}>{currentScreen.subtitle}</Text>

        <View style={styles.descriptionBox}>
          <Text style={styles.description}>{currentScreen.description}</Text>
        </View>

        <View style={styles.dotsContainer}>
          {screens.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === screen && [styles.activeDot, { backgroundColor: currentScreen.color }]
              ]}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {screen > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setScreen(screen - 1)}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: currentScreen.color }]}
          onPress={() => {
            if (screen < screens.length - 1) {
              setScreen(screen + 1);
            } else {
              markOnboardingComplete();
            }
          }}
        >
          <Text style={styles.nextButtonText}>
            {screen === screens.length - 1 ? 'Entendi! Vamos lá' : 'Próximo'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 32,
  },
  descriptionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  description: {
    fontSize: 14,
    color: '#ddd',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3a3a3a',
  },
  activeDot: {
    width: 24,
    height: 8,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#aaa',
    fontWeight: '600',
    fontSize: 14,
  },
  nextButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
