/**
 * useVoice — Hook de voz para o ProteOS
 * Gerencia gravação (STT) e reprodução (TTS) via ElevenLabs
 */

import { useState, useRef, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import {
  useAudioRecorder,
  createAudioPlayer,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  RecordingPresets,
  type AudioPlayer,
} from 'expo-audio';
import { speechToText, textToSpeech, elevenLabsAvailable } from '../lib/elevenlabs';

export type VoiceState = 'idle' | 'recording' | 'processing' | 'speaking';

interface UseVoiceReturn {
  voiceState: VoiceState;
  isAvailable: boolean;
  startRecording: () => Promise<void>;
  stopRecordingAndTranscribe: () => Promise<string | null>;
  speakResponse: (text: string) => Promise<void>;
  stopSpeaking: () => Promise<void>;
  error: string | null;
}

export function useVoice(): UseVoiceReturn {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [error, setError] = useState<string | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const playerRef = useRef<AudioPlayer | null>(null);
  const isAvailable = elevenLabsAvailable();

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setError('Permissão de microfone negada');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setVoiceState('recording');
    } catch (e: any) {
      setError('Erro ao iniciar gravação: ' + e.message);
      setVoiceState('idle');
    }
  }, [recorder]);

  const stopRecordingAndTranscribe = useCallback(async (): Promise<string | null> => {
    try {
      setVoiceState('processing');
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error('URI de gravação não encontrado');

      const transcript = await speechToText(uri, 'audio/m4a');
      await FileSystem.deleteAsync(uri, { idempotent: true });

      setVoiceState('idle');
      return transcript || null;
    } catch (e: any) {
      setError('Erro na transcrição: ' + e.message);
      setVoiceState('idle');
      return null;
    }
  }, [recorder]);

  const speakResponse = useCallback(async (text: string) => {
    if (!text.trim()) return;
    try {
      setVoiceState('speaking');

      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }

      const outputUri = `${FileSystem.cacheDirectory}proteos_tts_${Date.now()}.mp3`;
      await textToSpeech(text, outputUri);
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

      const player = createAudioPlayer(outputUri);
      playerRef.current = player;

      player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          setVoiceState('idle');
          player.remove();
          playerRef.current = null;
          FileSystem.deleteAsync(outputUri, { idempotent: true });
        }
      });

      player.play();
    } catch (e: any) {
      setError('Erro na reprodução: ' + e.message);
      setVoiceState('idle');
    }
  }, []);

  const stopSpeaking = useCallback(async () => {
    if (playerRef.current) {
      playerRef.current.remove();
      playerRef.current = null;
    }
    setVoiceState('idle');
  }, []);

  return { voiceState, isAvailable, startRecording, stopRecordingAndTranscribe, speakResponse, stopSpeaking, error };
}
