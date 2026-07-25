import { cookies } from 'next/headers';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from '@/lib/session-core';

// Envuelve lib/session-core.ts con next/headers — SOLO usar desde Server
// Components / Server Actions / Route Handlers, nunca desde middleware.ts
// (next/headers no funciona en Edge Middleware).

export { SESSION_COOKIE, verifySessionToken, type SessionPayload };

/** Solo para Server Components / Server Actions (no middleware). */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/** Solo para Server Actions / Route Handlers (pueden mutar cookies). */
export async function setSessionCookie(payload: Omit<SessionPayload, 'exp'>) {
  const token = await createSessionToken(payload);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}
