import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/session-core';

// Protege todo /portal/**. La pantalla de acceso (/portal) siempre es
// pública. El resto exige sesión válida; /portal/admin exige role=admin;
// y si el estudiante no completó el cuestionario inicial, se le fuerza a
// /portal/bienvenida antes de ver cualquier otro contenido.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/portal') {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.redirect(new URL('/portal', req.url));
  }

  if (pathname.startsWith('/portal/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/portal/inicio', req.url));
  }

  if (session.role !== 'admin') {
    if (!session.intakeDone && pathname !== '/portal/bienvenida') {
      return NextResponse.redirect(new URL('/portal/bienvenida', req.url));
    }
    if (session.intakeDone && pathname === '/portal/bienvenida') {
      return NextResponse.redirect(new URL('/portal/inicio', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*'],
};
