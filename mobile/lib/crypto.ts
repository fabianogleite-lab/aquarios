import * as SecureStore from 'expo-secure-store';

const KEY_STORE_ID = 'aquarios_e2e_key_v1';

function uint8ToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToUint8(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function getKey(): Promise<CryptoKey> {
  const stored = await SecureStore.getItemAsync(KEY_STORE_ID);
  if (stored) {
    return crypto.subtle.importKey(
      'raw',
      base64ToUint8(stored).buffer as ArrayBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const raw = await crypto.subtle.exportKey('raw', key);
  await SecureStore.setItemAsync(KEY_STORE_ID, uint8ToBase64(new Uint8Array(raw)));
  return key;
}

export interface EncryptedField {
  ciphertext: string;
  nonce: string;
}

export async function encryptField(plaintext: string): Promise<EncryptedField> {
  const key = await getKey();
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, encoded);
  return {
    ciphertext: uint8ToBase64(new Uint8Array(encrypted)),
    nonce: uint8ToBase64(nonce),
  };
}

export async function decryptField(ciphertext: string, nonce: string): Promise<string> {
  const key = await getKey();
  const iv = base64ToUint8(nonce).buffer as ArrayBuffer;
  const data = base64ToUint8(ciphertext).buffer as ArrayBuffer;
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

export async function decryptOrFallback(
  ciphertext: string | null | undefined,
  nonce: string | null | undefined,
  fallback: string
): Promise<string> {
  if (!ciphertext || !nonce) return fallback;
  try {
    return await decryptField(ciphertext, nonce);
  } catch {
    return fallback;
  }
}
