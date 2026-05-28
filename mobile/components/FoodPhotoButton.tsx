import { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { colors, fontSize, spacing, radius } from '../lib/theme';

export interface FoodVisionResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  estimated_grams: number;
  confidence: 'alta' | 'média' | 'baixa';
  notes: string;
}

interface Props {
  onResult: (result: FoodVisionResult) => void;
  disabled?: boolean;
}

export function FoodPhotoButton({ onResult, disabled }: Props) {
  const [loading, setLoading] = useState(false);

  const pickAndAnalyze = () => {
    Alert.alert('Identificar alimento com IA', 'Escolha a origem da foto', [
      { text: 'Câmera', onPress: () => launchPicker('camera') },
      { text: 'Galeria', onPress: () => launchPicker('gallery') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const launchPicker = async (source: 'camera' | 'gallery') => {
    let result: ImagePicker.ImagePickerResult;

    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita acesso à câmera nas configurações.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.5, allowsEditing: true });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.5,
      });
    }

    if (result.canceled || !result.assets[0].base64) return;

    const asset = result.assets[0];
    await analyze(asset.base64!, asset.mimeType || 'image/jpeg');
  };

  const analyze = async (imageBase64: string, mimeType: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('food-vision', {
        body: { imageBase64, mimeType },
      });

      if (error) throw error;
      if (data?.error) {
        Alert.alert('Não identificado', data.error);
        return;
      }

      const result = data as FoodVisionResult;
      if (!result.name || result.calories == null) {
        Alert.alert('Erro', 'A IA não conseguiu identificar o alimento. Tente outra foto.');
        return;
      }

      onResult(result);
    } catch (err) {
      console.error('[FoodPhotoButton]', err);
      Alert.alert('Erro', 'Não foi possível analisar a imagem. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[s.btn, (disabled || loading) && s.btnDisabled]}
      onPress={pickAndAnalyze}
      disabled={disabled || loading}
    >
      {loading ? (
        <View style={s.row}>
          <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={s.text}>Analisando...</Text>
        </View>
      ) : (
        <View style={s.row}>
          <Text style={s.icon}>📷</Text>
          <Text style={s.text}>Identificar com IA</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    paddingVertical: 14,
    marginBottom: spacing.lg,
  },
  btnDisabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { fontSize: 20 },
  text: { color: colors.primary, fontSize: fontSize.body, fontWeight: '600' },
});
