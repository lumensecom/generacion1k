import Link from 'next/link';
import type { Student } from '@/lib/types';

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function StudentsTable({
  students,
  progressByStudent,
}: {
  students: Student[];
  progressByStudent: Map<string, number>;
}) {
  if (students.length === 0) {
    return <p className="py-10 text-center text-sm text-text-secondary">Todavía no hay estudiantes registrados.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-widest text-text-muted">
            <th className="px-5 py-3 font-mono font-medium">Nombre</th>
            <th className="px-5 py-3 font-mono font-medium">Ciudad</th>
            <th className="px-5 py-3 font-mono font-medium">Registro</th>
            <th className="px-5 py-3 font-mono font-medium">Último login</th>
            <th className="px-5 py-3 font-mono font-medium">Progreso</th>
            <th className="px-5 py-3 font-mono font-medium">Estado</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-b border-border/60 last:border-0 hover:bg-white/2">
              <td className="px-5 py-4">
                <p className="font-semibold text-white">{s.full_name}</p>
                <p className="text-xs text-text-muted">{s.email}</p>
              </td>
              <td className="px-5 py-4 text-text-secondary">{s.city ?? '—'}</td>
              <td className="px-5 py-4 text-text-secondary">{fmtDate(s.invited_at)}</td>
              <td className="px-5 py-4 text-text-secondary">{fmtDate(s.last_login_at)}</td>
              <td className="px-5 py-4">
                <span className="font-mono text-brand-yellow">{progressByStudent.get(s.id) ?? 0}%</span>
              </td>
              <td className="px-5 py-4">
                <span
                  className={
                    s.is_active
                      ? 'rounded-full bg-brand-success/12 px-2.5 py-1 text-[11px] font-semibold text-brand-success'
                      : 'rounded-full bg-brand-danger/12 px-2.5 py-1 text-[11px] font-semibold text-brand-danger'
                  }
                >
                  {s.is_active ? 'Activo' : 'Desactivado'}
                </span>
              </td>
              <td className="px-5 py-4 text-right">
                <Link href={`/portal/admin/estudiantes/${s.id}`} className="text-xs font-bold text-brand-purpleLight hover:text-white">
                  Ver perfil →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
