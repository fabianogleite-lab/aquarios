/**
 * Voice Client — ProteOS
 * STT: áudio → texto  |  TTS: texto → áudio
 *
 * A chave ElevenLabs NÃO vive mais no app: variáveis EXPO_PUBLIC_* são embutidas
 * no APK e vazam quando alguém descompila o pacote. O app agora fala com o NOSSO
 * backend (HygeiOS v2 — api.podiumtec.com.br), que guarda a chave server-side nos
 * endpoints /v1/tts e /v1/stt e exige o JWT do usuário Supabase. Ver
 * business-agent/voice_proxy.py.
 */

import * as FileSystem from 'expo-file-system';   // static import (Hermes safe)
import { supabase } from './supabase';
import { i18n } from '../i18n';

const VOICE_API_BASE = process.env.EXPO_PUBLIC_HYGEIOS_V2_URL || '';

export const elevenLabsAvailable = () => !!VOICE_API_BASE;

/** ArrayBuffer → base64 sem Buffer (Hermes safe) */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Bearer do usuário logado (Supabase) — exigido pelo proxy de voz no servidor. */
async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sessão não encontrada — faça login para usar voz');
  return { Authorization: `Bearer ${token}` };
}

export async function speechToText(audioUri: string, mimeType = 'audio/m4a'): Promise<string> {
  if (!VOICE_API_BASE) throw new Error('EXPO_PUBLIC_HYGEIOS_V2_URL não configurada');

  const formData = new FormData();
  formData.append('file', { uri: audioUri, name: 'recording.m4a', type: mimeType } as any);
  formData.append('language_code', (i18n.language || 'pt').split('-')[0]);

  // multipart: NÃO setar Content-Type — o React Native injeta o boundary correto
  const res = await fetch(`${VOICE_API_BASE}/v1/stt`, {
    method: 'POST',
    headers: { ...(await authHeader()) },
    body: formData,
  });

  if (!res.ok) throw new Error(`Voice STT error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.text?.trim() || '';
}

export async function textToSpeech(text: string, outputUri: string): Promise<string> {
  if (!VOICE_API_BASE) throw new Error('EXPO_PUBLIC_HYGEIOS_V2_URL não configurada');

  const res = await fetch(`${VOICE_API_BASE}/v1/tts`, {
    method: 'POST',
    headers: {
      ...(await authHeader()),
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.1 },
    }),
  });

  if (!res.ok) throw new Error(`Voice TTS error ${res.status}: ${await res.text()}`);

  const base64 = arrayBufferToBase64(await res.arrayBuffer());  // Hermes safe

  await FileSystem.writeAsStringAsync(outputUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return outputUri;
}
