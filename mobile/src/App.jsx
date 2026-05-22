// ⚗ AquariOS Mobile v2.0000 — Root App Component
// Fabiano Gomes Leite — fabianogleite@hotmail.com

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View } from 'react-native';

// Store
import { useAuthStore } from './store/auth';
import { useUserStore } from './store/user';

// Screens
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import DashboardScreen from './screens/dashboard/DashboardScreen';
import DiarioScreen from './screens/diario/DiarioScreen';
import NutritionScreen from './screens/nutrition/NutritionScreen';
import CommunityScreen from './screens/community/CommunityScreen';
import ProteosScreen from './screens/proteos/ProteosScreen';
import IviScreen from './screens/ivi/IviScreen';
import SettingsScreen from './screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ═══════════════════════════════════════════════════════════════════════
// AUTH STACK
// ═══════════════════════════════════════════════════════════════════════

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN APP STACK
// ═══════════════════════════════════════════════════════════════════════

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
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
        headerStyle: {
          backgroundColor: '#090c14',
          borderBottomColor: '#141c28',
          borderBottomWidth: 1,
        },
        headerTintColor: '#ccd6e8',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 16,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: '⚗ AquariOS',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>◈</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Diario"
        component={DiarioScreen}
        options={{
          title: 'Diário do Ser',
          tabBarLabel: 'Diário',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>✎</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ProteOS"
        component={ProteosScreen}
        options={{
          title: 'ProteOS',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          title: 'Comunidades',
          tabBarLabel: 'Comunidade',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configurações',
          tabBarLabel: 'Config',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>⚙</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ROOT APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  const { setAuthTokens, userId } = useAuthStore();
  const { setUserProfile } = useUserStore();

  useEffect(() => {
    const restoreToken = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const storedUserId = await SecureStore.getItemAsync('userId');
        
        if (accessToken && refreshToken && storedUserId) {
          setAuthTokens(accessToken, refreshToken);
          setIsSignedIn(true);
          
          // Fetch user profile
          try {
            const response = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/v2/user/profile`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
            if (response.ok) {
              const profile = await response.json();
              setUserProfile(profile);
            }
          } catch (err) {
            console.error('Failed to fetch profile:', err);
          }
        }
      } catch (e) {
        console.error('Failed to restore token:', e);
      } finally {
        setIsLoading(false);
      }
    };

    restoreToken();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090c14' }}>
          <ActivityIndicator size="large" color="#b8952a" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isSignedIn ? <AppTabs /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

import { Text } from 'react-native';
