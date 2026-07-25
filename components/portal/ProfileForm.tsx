'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateProfile } from '@/app/portal/perfil/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Student } from '@/lib/types';

export function ProfileForm({ student }: { student: Student }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.error) setError(result.error);
      else toast.success('Perfil actualizado');
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5 rounded-2xl border border-border bg-bg-card p-8">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={student.email} disabled />
        <p className="text-xs text-text-muted">El email no se puede cambiar. Escríbele a Juan si necesitas otro.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input id="fullName" name="fullName" defaultValue={student.full_name} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Edad</Label>
          <Input id="age" name="age" type="number" defaultValue={student.age ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" name="city" defaultValue={student.city ?? ''} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono / WhatsApp</Label>
        <Input id="phone" name="phone" defaultValue={student.phone ?? ''} placeholder="+57 300 000 0000" />
      </div>

      {error && <p className="text-sm font-medium text-brand-danger">{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </form>
  );
}
