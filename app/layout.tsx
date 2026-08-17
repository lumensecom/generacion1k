import type { Metadata } from 'next';
import { Manrope, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

// Solo las rutas de /portal pasan por este layout — "/" y "/programa" se
// sirven como HTML estático crudo desde app/route.ts y app/programa/route.ts
// y nunca entran al árbol de React, así que el sitio público no cambia en nada.

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['italic'],
  weight: ['500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Portal de Estudiantes | Generación 1K Elite',
  description: 'Portal privado de estudiantes 1:1 de Generación 1K Elite.',
  robots: { index: false, follow: false },
  // El icono se declara a mano y no por el archivo app/icon.png, porque el
  // landing y /programa se sirven como HTML crudo sin pasar por este layout:
  // así los tres apuntan al mismo archivo de public/ en vez de a la ruta con
  // hash que genera Next.
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${manrope.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <body className="bg-bg-primary font-body text-text-primary antialiased">
        {children}
        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  );
}
