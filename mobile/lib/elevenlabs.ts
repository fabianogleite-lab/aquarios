/**
 * ElevenLabs Voice Client — ProteOS
 * STT: áudio → texto  |  TTS: texto → áudio
 */

import * as FileSystem from 'expo-file-system';   // static import (Hermes safe)

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
const PROTEOS_VOICE_ID   = process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID || 'cgSgspJ2msm6clMCkdW9';

export const elevenLabsAvailable = () => !!ELEVENLABS_API_KEY;

/** ArrayBuffer → base64 sem Buffer (Hermes safe) */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function speechToText(audioUri: string, mimeType = 'audio/m4a'): Promise<string> {
  if (!ELEVENLABS_API_KEY) throw new Error('EXPO_PUBLIC_ELEVENLABS_API_KEY não configurada');

  const formData = new FormData();
  formData.append('file', { uri: audioUri, name: 'recording.m4a', type: mimeType } as any);
  formData.append('model_id', 'scribe_v1');
  formData.append('language_code', 'pt');

  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    body: formData,
  });

  if (!res.ok) throw new Error(`ElevenLabs STT error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.text?.trim() || '';
}

export async function textToSpeech(text: string, outputUri: string): Promise<string> {
  if (!ELEVENLABS_API_KEY) throw new Error('EXPO_PUBLIC_ELEVENLABS_API_KEY não configurada');

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${PROTEOS_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_flash_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.1 },
    }),
  });

  if (!res.ok) throw new Error(`ElevenLabs TTS error ${res.status}: ${await res.text()}`);

  const base64 = arrayBufferToBase64(await res.arrayBuffer());  // Hermes safe

  await FileSystem.writeAsStringAsync(outputUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return outputUri;
}
