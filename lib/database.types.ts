// Generado automáticamente desde el esquema real de Supabase (proyecto
// "LMS", hignsutxlgbzyisqqgpy) vía generate_typescript_types. No editar a
// mano — si cambia el esquema, regenerar. Los tipos de dominio con formas
// más específicas (TheoryBlock[], etc.) viven en lib/types.ts y se castean
// desde estos Row/Insert/Update en la capa de datos (lib/portal-data.ts).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string;
          created_at: string;
          id: string;
          metadata: Json | null;
          student_id: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          student_id: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_log_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      group_sessions: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_published: boolean
          meet_url: string | null
          recording_url: string | null
          scheduled_at: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_published?: boolean
          meet_url?: string | null
          recording_url?: string | null
          scheduled_at?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_published?: boolean
          meet_url?: string | null
          recording_url?: string | null
          scheduled_at?: string | null
          title?: string
        }
        Relationships: []
      }
      meeting_requests: {
        Row: {
          admin_note: string | null
          availability: string | null
          created_at: string
          id: string
          question: string
          scheduled_at: string | null
          status: string
          student_id: string
        }
        Insert: {
          admin_note?: string | null
          availability?: string | null
          created_at?: string
          id?: string
          question: string
          scheduled_at?: string | null
          status?: string
          student_id: string
        }
        Update: {
          admin_note?: string | null
          availability?: string | null
          created_at?: string
          id?: string
          question?: string
          scheduled_at?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      session_poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          poll_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          poll_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          poll_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "session_polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_poll_votes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      session_polls: {
        Row: {
          created_at: string
          id: string
          is_open: boolean
          options: Json
          question: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_open?: boolean
          options?: Json
          question?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_open?: boolean
          options?: Json
          question?: string
        }
        Relationships: []
      }
      student_questions: {
        Row: {
          admin_reply: string | null
          created_at: string
          id: string
          module_slug: string | null
          question: string
          replied_at: string | null
          reply_video_url: string | null
          status: string
          student_id: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          module_slug?: string | null
          question: string
          replied_at?: string | null
          reply_video_url?: string | null
          status?: string
          student_id: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          module_slug?: string | null
          question?: string
          replied_at?: string | null
          reply_video_url?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_questions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          video_url: string | null
          bio: string | null;
          companies: string | null;
          id: string;
          name: string;
          order_index: number;
          photo_url: string | null;
          role: string;
          session_date: string | null;
          session_loom_url: string | null;
          slug: string;
          years_experience: string | null;
        };
        Insert: {
          video_url?: string | null
          bio?: string | null;
          companies?: string | null;
          id?: string;
          name: string;
          order_index?: number;
          photo_url?: string | null;
          role: string;
          session_date?: string | null;
          session_loom_url?: string | null;
          slug: string;
          years_experience?: string | null;
        };
        Update: {
          video_url?: string | null
          bio?: string | null;
          companies?: string | null;
          id?: string;
          name?: string;
          order_index?: number;
          photo_url?: string | null;
          role?: string;
          session_date?: string | null;
          session_loom_url?: string | null;
          slug?: string;
          years_experience?: string | null;
        };
        Relationships: [];
      };
      module_resources: {
        Row: {
          created_at: string;
          file_type: string | null;
          file_url: string;
          id: string;
          module_id: string;
          name: string;
          size_bytes: number | null;
        };
        Insert: {
          created_at?: string;
          file_type?: string | null;
          file_url: string;
          id?: string;
          module_id: string;
          name: string;
          size_bytes?: number | null;
        };
        Update: {
          created_at?: string;
          file_type?: string | null;
          file_url?: string;
          id?: string;
          module_id?: string;
          name?: string;
          size_bytes?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'module_resources_module_id_fkey';
            columns: ['module_id'];
            isOneToOne: false;
            referencedRelation: 'modules';
            referencedColumns: ['id'];
          },
        ];
      };
      modules: {
        Row: {
          video_url: string | null
          created_at: string;
          id: string;
          is_locked: boolean;
          loom_url: string | null;
          order_index: number;
          practice_checklist: Json;
          slug: string;
          subtitle: string | null;
          theory_content: Json;
          title: string;
          updated_at: string;
        };
        Insert: {
          video_url?: string | null
          created_at?: string;
          id?: string;
          is_locked?: boolean;
          loom_url?: string | null;
          order_index: number;
          practice_checklist?: Json;
          slug: string;
          subtitle?: string | null;
          theory_content?: Json;
          title: string;
          updated_at?: string;
        };
        Update: {
          video_url?: string | null
          created_at?: string;
          id?: string;
          is_locked?: boolean;
          loom_url?: string | null;
          order_index?: number;
          practice_checklist?: Json;
          slug?: string;
          subtitle?: string | null;
          theory_content?: Json;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      one_on_one_sessions: {
        Row: {
          admin_notes: string | null
          created_at: string
          duration_minutes: number
          id: string
          meet_url: string | null
          recording_url: string | null
          scheduled_at: string | null
          session_number: number
          status: string
          student_id: string
          student_topic: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          meet_url?: string | null
          recording_url?: string | null
          scheduled_at?: string | null
          session_number: number
          status?: string
          student_id: string
          student_topic?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          meet_url?: string | null
          recording_url?: string | null
          scheduled_at?: string | null
          session_number?: number
          status?: string
          student_id?: string
          student_topic?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_on_one_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_config: {
        Row: {
          id: string;
          key: string;
          updated_at: string;
          value: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          updated_at?: string;
          value?: string | null;
        };
        Update: {
          id?: string;
          key?: string;
          updated_at?: string;
          value?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          credits: number | null;
          email: string | null;
          id: string;
        };
        Insert: {
          credits?: number | null;
          email?: string | null;
          id: string;
        };
        Update: {
          credits?: number | null;
          email?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      student_checkins: {
        Row: {
          created_at: string;
          date: string;
          id: string;
          notes: string | null;
          student_id: string;
          worked_today: boolean;
        };
        Insert: {
          created_at?: string;
          date: string;
          id?: string;
          notes?: string | null;
          student_id: string;
          worked_today?: boolean;
        };
        Update: {
          created_at?: string;
          date?: string;
          id?: string;
          notes?: string | null;
          student_id?: string;
          worked_today?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'student_checkins_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      student_intake: {
        Row: {
          biggest_fear: string | null;
          completed_at: string;
          daily_hours: string | null;
          economic_situation: string | null;
          id: string;
          income_goal: string | null;
          investment_capital: string | null;
          occupation: string | null;
          student_id: string;
          why_chose_program: string | null;
        };
        Insert: {
          biggest_fear?: string | null;
          completed_at?: string;
          daily_hours?: string | null;
          economic_situation?: string | null;
          id?: string;
          income_goal?: string | null;
          investment_capital?: string | null;
          occupation?: string | null;
          student_id: string;
          why_chose_program?: string | null;
        };
        Update: {
          biggest_fear?: string | null;
          completed_at?: string;
          daily_hours?: string | null;
          economic_situation?: string | null;
          id?: string;
          income_goal?: string | null;
          investment_capital?: string | null;
          occupation?: string | null;
          student_id?: string;
          why_chose_program?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'student_intake_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: true;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      student_progress: {
        Row: {
          id: string;
          module_completed: boolean;
          module_completed_at: string | null;
          module_id: string;
          practice_checked_items: Json;
          practice_completed: boolean;
          practice_completed_at: string | null;
          student_id: string;
          student_notes: string | null;
          updated_at: string;
          video_watched: boolean;
          video_watched_at: string | null;
        };
        Insert: {
          id?: string;
          module_completed?: boolean;
          module_completed_at?: string | null;
          module_id: string;
          practice_checked_items?: Json;
          practice_completed?: boolean;
          practice_completed_at?: string | null;
          student_id: string;
          student_notes?: string | null;
          updated_at?: string;
          video_watched?: boolean;
          video_watched_at?: string | null;
        };
        Update: {
          id?: string;
          module_completed?: boolean;
          module_completed_at?: string | null;
          module_id?: string;
          practice_checked_items?: Json;
          practice_completed?: boolean;
          practice_completed_at?: string | null;
          student_id?: string;
          student_notes?: string | null;
          updated_at?: string;
          video_watched?: boolean;
          video_watched_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'student_progress_module_id_fkey';
            columns: ['module_id'];
            isOneToOne: false;
            referencedRelation: 'modules';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'student_progress_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      students: {
        Row: {
          onboarding_video_at: string | null
          sessions_total: number | null
          plan_started_at: string | null
          plan: string | null
          payment_notes: string | null
          currency: string
          amount_total_cents: number
          amount_paid_cents: number
          password_set_at: string | null
          password_hash: string | null
          created_by_admin: boolean
          age: number | null;
          city: string | null;
          email: string;
          first_login_at: string | null;
          full_name: string;
          id: string;
          invited_at: string;
          is_active: boolean;
          last_login_at: string | null;
          personal_notes: string | null;
          phone: string | null;
          role: string;
        };
        Insert: {
          onboarding_video_at?: string | null
          sessions_total?: number | null
          plan_started_at?: string | null
          plan?: string | null
          payment_notes?: string | null
          currency?: string
          amount_total_cents?: number
          amount_paid_cents?: number
          password_set_at?: string | null
          password_hash?: string | null
          created_by_admin?: boolean
          age?: number | null;
          city?: string | null;
          email: string;
          first_login_at?: string | null;
          full_name: string;
          id?: string;
          invited_at?: string;
          is_active?: boolean;
          last_login_at?: string | null;
          personal_notes?: string | null;
          phone?: string | null;
          role?: string;
        };
        Update: {
          onboarding_video_at?: string | null
          sessions_total?: number | null
          plan_started_at?: string | null
          plan?: string | null
          payment_notes?: string | null
          currency?: string
          amount_total_cents?: number
          amount_paid_cents?: number
          password_set_at?: string | null
          password_hash?: string | null
          created_by_admin?: boolean
          age?: number | null;
          city?: string | null;
          email?: string;
          first_login_at?: string | null;
          full_name?: string;
          id?: string;
          invited_at?: string;
          is_active?: boolean;
          last_login_at?: string | null;
          personal_notes?: string | null;
          phone?: string | null;
          role?: string;
        };
        Relationships: [];
      };
      test_attempts: {
        Row: {
          answers: Json;
          attempt_number: number;
          completed_at: string;
          duration_seconds: number | null;
          id: string;
          module_id: string;
          passed: boolean;
          score: number;
          student_id: string;
          total_questions: number;
        };
        Insert: {
          answers?: Json;
          attempt_number?: number;
          completed_at?: string;
          duration_seconds?: number | null;
          id?: string;
          module_id: string;
          passed?: boolean;
          score: number;
          student_id: string;
          total_questions?: number;
        };
        Update: {
          answers?: Json;
          attempt_number?: number;
          completed_at?: string;
          duration_seconds?: number | null;
          id?: string;
          module_id?: string;
          passed?: boolean;
          score?: number;
          student_id?: string;
          total_questions?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'test_attempts_module_id_fkey';
            columns: ['module_id'];
            isOneToOne: false;
            referencedRelation: 'modules';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'test_attempts_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_credits: {
        Args: { amount: number; user_id: string };
        Returns: undefined;
      };
      deduct_credit: { Args: { user_id: string }; Returns: undefined };
      renumerar_sesiones: { Args: { p_student: string }; Returns: undefined };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
