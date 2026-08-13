// Núcleo puro de la sesión (firma/verificación HMAC con Web Crypto) — sin
// ninguna dependencia de next/headers, para que sea seguro importarlo desde
// middleware.ts (Edge runtime), que NO soporta next/headers. lib/session.ts
// envuelve esto con cookies() para Server Components / Server Actions.

export const SESSION_COOKIE = 'g1k_session';
const SESSION_DAYS = 90;

export interface SessionPayload {
  sid: string; // student id
  email: string;
  name: string;
  role: 'student' | 'admin';
  intakeDone: boolean;
  /**
   * Si ya vio el video de bienvenida. Va en la cookie y no se consulta a la
   * base en cada petición porque quien decide es el middleware, que corre en
   * el Edge y no puede hablar con Supabase.
   *
   * Opcional porque las cookies firmadas antes de que esto existiera siguen
   * siendo válidas 90 días y no lo traen. Ahí `undefined` cuenta como "no lo
   * ha visto", que es lo que se quiere: el video es nuevo, no lo ha visto
   * nadie todavía, y la puerta no debería poder saltarse por tener una sesión
   * vieja abierta.
   */
  videoDone?: boolean;
  exp: number; // unix ms
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey() {
  const secret = process.env.PORTAL_SESSION_SECRET;
  if (!secret) {
    throw new Error('Falta la variable de entorno PORTAL_SESSION_SECRET.');
  }
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret) as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export const SESSION_MAX_AGE_SECONDS = SESSION_DAYS * 24 * 60 * 60;

export async function createSessionToken(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  const full: SessionPayload = { ...payload, exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000 };
  const payloadBytes = encoder.encode(JSON.stringify(full));
  const key = await getKey();
  const signature = await crypto.subtle.sign('HMAC', key, payloadBytes as BufferSource);
  return `${toBase64Url(payloadBytes)}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payloadPart, sigPart] = token.split('.');
  if (!payloadPart || !sigPart) return null;

  try {
    const key = await getKey();
    const payloadBytes = fromBase64Url(payloadPart);
    const signatureBytes = fromBase64Url(sigPart);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as BufferSource,
      payloadBytes as BufferSource
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
