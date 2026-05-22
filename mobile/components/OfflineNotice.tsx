import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { colors, fontSize, spacing } from '../lib/theme';

export function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <View style={s.bar}>
      <Text style={s.text}>Sem conexão com a internet</Text>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    backgroundColor: colors.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  text: { color: '#fff', fontSize: fontSize.sm, fontWeight: '600' },
});
