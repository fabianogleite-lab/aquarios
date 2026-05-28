import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../lib/theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '⚗ AquariOS',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'◈'}</Text>,
        }}
      />
      <Tabs.Screen
        name="nutricao"
        options={{
          title: 'Nutrição',
          tabBarLabel: 'Nutrição',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'🥗'}</Text>,
        }}
      />
      <Tabs.Screen name="nutricao-novo" options={{ href: null }} />
      <Tabs.Screen name="nutricao-metas" options={{ href: null }} />
      <Tabs.Screen
        name="proteos"
        options={{
          title: 'ProteOS',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'💬'}</Text>,
        }}
      />
      <Tabs.Screen
        name="comunidades"
        options={{
          title: 'Comunidades',
          tabBarLabel: 'Social',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'👥'}</Text>,
        }}
      />
      <Tabs.Screen name="comunidades-timeline" options={{ href: null }} />
      <Tabs.Screen name="comunidades-notificacoes" options={{ href: null }} />
      <Tabs.Screen name="comunidades-post-form" options={{ href: null, title: 'Novo Post' }} />
      <Tabs.Screen name="store" options={{ href: null, title: 'Loja AquariOS' }} />
      <Tabs.Screen name="hygeios" options={{ href: null, title: 'HygeiOS' }} />
      <Tabs.Screen name="coming-soon" options={{ href: null, title: 'Em Breve' }} />
      <Tabs.Screen name="admin" options={{ href: null, title: '⚙ Admin' }} />
      <Tabs.Screen name="divergencias" options={{ href: null, title: '📊 Divergências DEVPACK v4' }} />
      <Tabs.Screen name="diario-new" options={{ href: null, title: 'Nova Reflexão' }} />
      <Tabs.Screen
        name="diario"
        options={{
          title: 'Diário do Ser',
          tabBarLabel: 'Diário',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'✎'}</Text>,
        }}
      />
      <Tabs.Screen
        name="wonder-night"
        options={{
          title: 'Wonder Night',
          tabBarLabel: 'Wonder',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'✦'}</Text>,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Minhas Conquistas',
          tabBarLabel: 'Conquistas',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'🏆'}</Text>,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Ranking IVI',
          tabBarLabel: 'Ranking',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'📊'}</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configurações',
          tabBarLabel: 'Config',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'⚙'}</Text>,
        }}
      />
    </Tabs>
  );
}
