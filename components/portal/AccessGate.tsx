'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, KeyRound, Mail, GraduationCap, ShieldCheck, Lock } from 'lucide-react';
import { submitAccessCode, submitReturningEmail, submitAdminLogin } from '@/app/portal/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AccessGate() {
  const [portalRole, setPortalRole] = useState<'student' | 'admin'>('student');
  const [mode, setMode] = useState<'first' | 'returning'>('first');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const action =
        portalRole === 'admin' ? submitAdminLogin : mode === 'first' ? submitAccessCode : submitReturningEmail;
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex justify-center gap-6">
        <button
          type="button"
          onClick={() => {
            setPortalRole('student');
            setError(null);
          }}
          className={`flex items-center gap-1.5 border-b-2 pb-2 text-sm font-bold transition-colors ${
            portalRole === 'student'
              ? 'border-brand-purple text-white'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <GraduationCap className="h-4 w-4" /> Soy estudiante
        </button>
        <button
          type="button"
          onClick={() => {
            setPortalRole('admin');
            setError(null);
          }}
          className={`flex items-center gap-1.5 border-b-2 pb-2 text-sm font-bold transition-colors ${
            portalRole === 'admin'
              ? 'border-brand-yellow text-white'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Soy admin
        </button>
      </div>

      <AnimatePresence mode="wait">
        {portalRole === 'admin' ? (
          <motion.form
            key="admin"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="adminEmail" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email de admin
              </Label>
              <Input
                id="adminEmail"
                name="email"
                type="email"
                placeholder="lumens.ecom@gmail.com"
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Contraseña
              </Label>
              <Input
                id="adminPassword"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && <p className="text-sm font-medium text-brand-danger">{error}</p>}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
              {pending ? 'Entrando…' : 'Entrar como admin'}
              {!pending && <ArrowRight className="h-4 w-4" />}
            </Button>
          </motion.form>
        ) : (
          <motion.div
            key="student"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8 flex justify-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('first');
                  setError(null);
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${
                  mode === 'first' ? 'bg-brand-purple text-white' : 'text-text-secondary hover:text-white'
                }`}
              >
                Primera vez
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('returning');
                  setError(null);
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${
                  mode === 'returning' ? 'bg-brand-purple text-white' : 'text-text-secondary hover:text-white'
                }`}
              >
                Ya tengo cuenta
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'first' ? (
                <motion.form
                  key="first"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nombre completo</Label>
                    <Input id="fullName" name="fullName" placeholder="Tu nombre y apellido" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="tucorreo@gmail.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code" className="flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5" /> Clave de acceso
                    </Label>
                    <Input id="code" name="code" placeholder="GEN1K-2026" required autoComplete="off" />
                    <p className="text-xs text-text-muted">Te la compartió Juan al confirmar tu cupo.</p>
                  </div>

                  {error && <p className="text-sm font-medium text-brand-danger">{error}</p>}

                  <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
                    {pending ? 'Entrando…' : 'Entrar al portal'}
                    {!pending && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="returning"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email2" className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email con el que te registraste
                    </Label>
                    <Input id="email2" name="email" type="email" placeholder="tucorreo@gmail.com" required />
                  </div>

                  {error && <p className="text-sm font-medium text-brand-danger">{error}</p>}

                  <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
                    {pending ? 'Entrando…' : 'Entrar al portal'}
                    {!pending && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
