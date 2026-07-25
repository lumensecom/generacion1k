'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { setStudentActive } from '@/app/portal/admin/actions';
import { Button } from '@/components/ui/button';

export function StudentActiveToggle({ studentId, isActive }: { studentId: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      await setStudentActive(studentId, next);
      toast.success(next ? 'Estudiante activado' : 'Estudiante desactivado');
    });
  }

  return (
    <Button type="button" variant={active ? 'danger' : 'subtle'} size="sm" onClick={handleClick} disabled={pending}>
      {active ? 'Desactivar acceso' : 'Reactivar acceso'}
    </Button>
  );
}
