import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../lib/theme';

interface Props {
  message?: string;
}

export function LoadingState({ message }: Props) {
  return (
    <View style={s.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={s.text}>{message}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  text: { color: colors.textMuted, fontSize: fontSize.body, marginTop: 12 },
});
