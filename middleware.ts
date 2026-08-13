import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/session-core';

// Protege todo /portal/**. La pantalla de acceso (/portal) siempre es
// pública. El resto exige sesión válida y /portal/admin exige role=admin.
//
// El estudiante pasa además por dos puertas, en este orden: el cuestionario
// inicial (/portal/bienvenida) y el video de bienvenida (/portal/onboarding).
// Hasta que no cruza las dos no ve ningún otro contenido. El orden importa:
// el video da la bienvenida por su nombre, y ese nombre lo escribe él en el
// cuestionario.
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
    if (!session.intakeDone) {
      return pathname === '/portal/bienvenida'
        ? NextResponse.next()
        : NextResponse.redirect(new URL('/portal/bienvenida', req.url));
    }
    if (pathname === '/portal/bienvenida') {
      return NextResponse.redirect(new URL('/portal/onboarding', req.url));
    }

    if (!session.videoDone) {
      return pathname === '/portal/onboarding'
        ? NextResponse.next()
        : NextResponse.redirect(new URL('/portal/onboarding', req.url));
    }
    if (pathname === '/portal/onboarding') {
      return NextResponse.redirect(new URL('/portal/inicio', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*'],
};
