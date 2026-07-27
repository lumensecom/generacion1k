// Tipos de dominio del portal — formas más específicas que las columnas
// jsonb crudas de Supabase (TheoryBlock[] en vez de Json, etc.). El tipo
// `Database` real y generado vive en lib/database.types.ts; estos tipos se
// castean a partir de ese en lib/portal-data.ts, que es el único lugar que
// toca supabaseAdmin() directamente.

export type StudentRole = 'student' | 'admin';

export interface Student {
  id: string;
  email: string;
  full_name: string;
  city: string | null;
  age: number | null;
  phone: string | null;
  role: StudentRole;
  invited_at: string;
  first_login_at: string | null;
  last_login_at: string | null;
  is_active: boolean;
  personal_notes: string | null;
}

export interface StudentIntake {
  id: string;
  student_id: string;
  occupation: string | null;
  economic_situation: string | null;
  income_goal: string | null;
  daily_hours: string | null;
  investment_capital: string | null;
  biggest_fear: string | null;
  why_chose_program: string | null;
  completed_at: string;
}

export type TheoryBlock =
  | { type: 'text'; heading?: string; body: string }
  | { type: 'stat'; number: string; label: string }
  | { type: 'compare'; before: string[]; after: string[] }
  | { type: 'list'; heading?: string; items: string[] }
  | { type: 'callout'; variant: 'yellow' | 'green' | 'red' | 'purple'; text: string }
  | { type: 'timeline'; items: { label: string; text: string }[] };

export interface ModuleRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  order_index: number;
  loom_url: string | null;
  theory_content: TheoryBlock[] | null;
  practice_checklist: string[] | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleResource {
  id: string;
  module_id: string;
  name: string;
  file_url: string;
  file_type: 'pdf' | 'video' | 'link' | 'template' | null;
  size_bytes: number | null;
  created_at: string;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  module_id: string;
  video_watched: boolean;
  video_watched_at: string | null;
  practice_completed: boolean;
  practice_completed_at: string | null;
  practice_checked_items: string[] | null;
  module_completed: boolean;
  module_completed_at: string | null;
  student_notes: string | null;
  updated_at: string;
}

export interface StudentCheckin {
  id: string;
  student_id: string;
  date: string;
  worked_today: boolean;
  notes: string | null;
  created_at: string;
}

export interface PortalConfig {
  id: string;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface ActivityLogRow {
  id: string;
  student_id: string;
  action:
    | 'login'
    | 'video_watched'
    | 'practice_completed'
    | 'module_completed'
    | 'intake_completed'
    | 'test_passed'
    | 'test_failed';
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TestAttemptRow {
  id: string;
  student_id: string;
  module_id: string;
  score: number;
  total_questions: number;
  answers: unknown[];
  passed: boolean;
  attempt_number: number;
  duration_seconds: number | null;
  completed_at: string;
}

export interface Mentor {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  years_experience: string | null;
  companies: string | null;
  session_loom_url: string | null;
  session_date: string | null;
  order_index: number;
}
