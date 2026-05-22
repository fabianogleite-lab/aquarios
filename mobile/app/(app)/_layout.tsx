import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#090c14' },
        headerTintColor: '#ccd6e8',
        headerTitleStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: '#090c14',
          borderTopColor: '#141c28',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: '#b8952a',
        tabBarInactiveTintColor: '#3a4a5a',
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
      <Tabs.Screen
        name="nutricao-novo"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="nutricao-metas"
        options={{ href: null }}
      />
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
      <Tabs.Screen
        name="comunidades-timeline"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="comunidades-notificacoes"
        options={{ href: null }}
      />
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
