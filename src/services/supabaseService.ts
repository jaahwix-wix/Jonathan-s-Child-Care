import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Student,
  OrphanRecord,
  LabEquipment,
  LabSession,
  EquipmentAllocation,
  Player,
  Match,
  CommunityEvent,
  Sponsorship,
  FeeNotification,
} from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
  lastConnectedAt?: string;
}

const STORAGE_KEY = 'jcc_supabase_config';

// Load stored config or environment variables
export function getSavedSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load saved Supabase config:', err);
  }

  // Fallback to environment variables if provided
  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
    autoSync: true,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Reset client cache
    cachedClient = null;
  } catch (err) {
    console.error('Failed to save Supabase config to localStorage:', err);
  }
}

export function clearSupabaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    cachedClient = null;
  } catch (err) {
    console.error('Failed to clear Supabase config:', err);
  }
}

let cachedClient: SupabaseClient | null = null;

// Get active Supabase Client
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getSavedSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      cachedClient = createClient(config.url.trim(), config.anonKey.trim(), {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      return cachedClient;
    } catch (err) {
      console.error('Error instantiating Supabase client:', err);
      return null;
    }
  }
  return null;
}

// Test connection to Supabase
export async function testSupabaseConnection(
  urlInput?: string,
  keyInput?: string
): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const config = getSavedSupabaseConfig();
  const url = (urlInput || config.url || '').trim();
  const key = (keyInput || config.anonKey || '').trim();

  if (!url || !key) {
    return {
      success: false,
      message: 'Supabase Project URL and Anon/Public Key are required.',
    };
  }

  // Validate URL format
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    return {
      success: false,
      message: 'Invalid URL. Project URL must start with https:// (e.g. https://your-project.supabase.co)',
    };
  }

  const startTime = performance.now();
  try {
    const testClient = createClient(url, key, {
      auth: { persistSession: false },
    });

    // Attempt a light ping by querying Supabase REST root or schema endpoint
    const response = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (response.ok || response.status === 200 || response.status === 404) {
      // Update last connected time
      const updatedConfig = { ...config, url, anonKey: key, lastConnectedAt: new Date().toISOString() };
      saveSupabaseConfig(updatedConfig);

      return {
        success: true,
        message: `Successfully connected to Supabase in ${latencyMs}ms!`,
        latencyMs,
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        message: `Connection returned HTTP ${response.status}: ${errorText || response.statusText}`,
        latencyMs,
      };
    }
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      message: `Failed to reach Supabase server: ${err.message || String(err)}`,
      latencyMs,
    };
  }
}

// Replicate single record to Supabase
export async function syncRecordToSupabase(
  tableName: string,
  record: Record<string, any>
): Promise<boolean> {
  const client = getSupabaseClient();
  const config = getSavedSupabaseConfig();
  if (!client || !config.autoSync) return false;

  try {
    const { error } = await client.from(tableName).upsert(record, { onConflict: 'id' });
    if (error) {
      console.warn(`Supabase upsert warning on ${tableName}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`Supabase replication error on ${tableName}:`, err);
    return false;
  }
}

// Remove single record from Supabase
export async function deleteRecordFromSupabase(
  tableName: string,
  id: string
): Promise<boolean> {
  const client = getSupabaseClient();
  const config = getSavedSupabaseConfig();
  if (!client || !config.autoSync) return false;

  try {
    const { error } = await client.from(tableName).delete().eq('id', id);
    if (error) {
      console.warn(`Supabase delete warning on ${tableName}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`Supabase delete error on ${tableName}:`, err);
    return false;
  }
}

// Batch Sync all items of a collection
export async function batchSyncTable<T extends { id: string }>(
  tableName: string,
  items: T[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Supabase client is not connected.' };
  }

  if (items.length === 0) {
    return { success: true, count: 0 };
  }

  try {
    const { error } = await client.from(tableName).upsert(items, { onConflict: 'id' });
    if (error) {
      return { success: false, count: 0, error: error.message };
    }
    return { success: true, count: items.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || String(err) };
  }
}

// Pull all items from a table
export async function fetchTableFromSupabase<T>(
  tableName: string
): Promise<{ success: boolean; data?: T[]; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const { data, error } = await client.from(tableName).select('*');
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: (data as T[]) || [] };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

// Complete PostgreSQL DDL Script for Supabase SQL Editor
export function generateSupabaseSqlSchema(): string {
  return `-- =====================================================================
-- JONATHAN'S CHILD CARE (JCC BO) - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Comprehensive Relational Architecture for JCC Academic School,
-- Orphanage Welfare, Science Lab, JCC FC & Community Grants
-- =====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ACADEMIC STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    admission_number TEXT,
    tier TEXT NOT NULL CHECK (tier IN ('Nursery', 'Primary', 'Secondary')),
    grade TEXT NOT NULL,
    age INTEGER,
    guardian_name TEXT,
    guardian_contact TEXT,
    is_orphan BOOLEAN DEFAULT FALSE,
    has_scholarship BOOLEAN DEFAULT FALSE,
    tuition_balance NUMERIC(12, 2) DEFAULT 0,
    tuition_paid NUMERIC(12, 2) DEFAULT 0,
    annual_tuition NUMERIC(12, 2) DEFAULT 0,
    fee_status TEXT DEFAULT 'Outstanding',
    payment_plan TEXT DEFAULT '3-Part Installment',
    academic_performance TEXT,
    gpa NUMERIC(4, 2),
    attendance_rate NUMERIC(5, 2) DEFAULT 95.0,
    avatar_url TEXT,
    installments JSONB DEFAULT '[]'::jsonb,
    payment_history JSONB DEFAULT '[]'::jsonb,
    grades JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORPHANAGE & CHILD WELFARE TABLE
CREATE TABLE IF NOT EXISTS public.orphans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    date_of_birth TEXT,
    admission_date TEXT,
    status TEXT DEFAULT 'Active Resident',
    health_status TEXT DEFAULT 'Good Health',
    dietary_needs TEXT,
    guardian_or_sponsor TEXT,
    room_number TEXT,
    academic_grade TEXT,
    social_worker_assigned TEXT,
    care_plan_notes TEXT,
    today_daily_checklist JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SCIENCE & MATH LAB APPARATUS TABLE
CREATE TABLE IF NOT EXISTS public.lab_equipment (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Physics', 'Chemistry', 'Biology', 'Mathematics', 'General STEM')),
    quantity INTEGER NOT NULL DEFAULT 1,
    available INTEGER NOT NULL DEFAULT 1,
    condition TEXT DEFAULT 'Excellent',
    location TEXT,
    storage_bin TEXT,
    safety_notes TEXT,
    last_inspected TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LAB TEACHING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.lab_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    subject TEXT NOT NULL,
    instructor TEXT NOT NULL,
    scheduled_date TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    station_number INTEGER DEFAULT 1,
    max_pupils INTEGER DEFAULT 24,
    enrolled_count INTEGER DEFAULT 0,
    safety_checklist JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LAB EQUIPMENT ALLOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.equipment_allocations (
    id TEXT PRIMARY KEY,
    equipment_id TEXT NOT NULL,
    equipment_name TEXT NOT NULL,
    allocated_to_teacher TEXT NOT NULL,
    class_name TEXT NOT NULL,
    quantity_allocated INTEGER NOT NULL DEFAULT 1,
    allocation_date TEXT NOT NULL,
    return_due_date TEXT NOT NULL,
    returned_date TEXT,
    status TEXT DEFAULT 'Active',
    condition_out TEXT DEFAULT 'Good',
    condition_in TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. JCC FC PLAYERS & ATHLETES TABLE
CREATE TABLE IF NOT EXISTS public.players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    jersey_number INTEGER NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Winger')),
    age INTEGER NOT NULL,
    squad_category TEXT DEFAULT 'Senior Squad',
    preferred_foot TEXT DEFAULT 'Right',
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    fitness_status TEXT DEFAULT 'Match Ready',
    monthly_allowance NUMERIC(12, 2) DEFAULT 0,
    photo_url TEXT,
    joined_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. JCC FC FIXTURES & MATCH RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.matches (
    id TEXT PRIMARY KEY,
    opponent TEXT NOT NULL,
    competition TEXT NOT NULL,
    match_date TEXT NOT NULL,
    venue TEXT NOT NULL,
    home_away TEXT DEFAULT 'Home',
    status TEXT DEFAULT 'Upcoming',
    score_jcc INTEGER DEFAULT 0,
    score_opponent INTEGER DEFAULT 0,
    scorers JSONB DEFAULT '[]'::jsonb,
    man_of_the_match TEXT,
    attendance INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COMMUNITY & SOCIAL OUTREACH EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.community_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TEXT NOT NULL,
    location TEXT NOT NULL,
    coordinator TEXT NOT NULL,
    target_audience TEXT,
    budget NUMERIC(12, 2) DEFAULT 0,
    funds_raised NUMERIC(12, 2) DEFAULT 0,
    attendees_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SPONSORSHIPS & INSTITUTIONAL DONORS TABLE
CREATE TABLE IF NOT EXISTS public.sponsorships (
    id TEXT PRIMARY KEY,
    sponsor_name TEXT NOT NULL,
    organization TEXT,
    email TEXT,
    phone TEXT,
    allocated_cause TEXT NOT NULL,
    pledged_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    amount_received NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    frequency TEXT DEFAULT 'Annual',
    status TEXT DEFAULT 'Active',
    start_date TEXT,
    end_date TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. BURSARY FEE DISPATCH NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.fee_notifications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    guardian_name TEXT,
    guardian_contact TEXT,
    installment_title TEXT NOT NULL,
    amount_due NUMERIC(12, 2) NOT NULL,
    due_date TEXT NOT NULL,
    urgency TEXT DEFAULT 'Standard Reminder',
    channel TEXT DEFAULT 'SMS & WhatsApp',
    status TEXT DEFAULT 'Pending Dispatch',
    sent_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CREATE PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_students_tier ON public.students(tier);
CREATE INDEX IF NOT EXISTS idx_students_fee_status ON public.students(fee_status);
CREATE INDEX IF NOT EXISTS idx_orphans_status ON public.orphans(status);
CREATE INDEX IF NOT EXISTS idx_players_position ON public.players(position);
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date);
CREATE INDEX IF NOT EXISTS idx_allocations_due ON public.equipment_allocations(return_due_date);

-- 13. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orphans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_notifications ENABLE ROW LEVEL SECURITY;

-- 14. DEFAULT POLICIES (Allow Read & Write via Anon API Key)
CREATE POLICY "Public Read Students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public Write Students" ON public.students FOR ALL USING (true);

CREATE POLICY "Public Read Orphans" ON public.orphans FOR SELECT USING (true);
CREATE POLICY "Public Write Orphans" ON public.orphans FOR ALL USING (true);

CREATE POLICY "Public Read Lab Equipment" ON public.lab_equipment FOR SELECT USING (true);
CREATE POLICY "Public Write Lab Equipment" ON public.lab_equipment FOR ALL USING (true);

CREATE POLICY "Public Read Lab Sessions" ON public.lab_sessions FOR SELECT USING (true);
CREATE POLICY "Public Write Lab Sessions" ON public.lab_sessions FOR ALL USING (true);

CREATE POLICY "Public Read Allocations" ON public.equipment_allocations FOR SELECT USING (true);
CREATE POLICY "Public Write Allocations" ON public.equipment_allocations FOR ALL USING (true);

CREATE POLICY "Public Read Players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Public Write Players" ON public.players FOR ALL USING (true);

CREATE POLICY "Public Read Matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public Write Matches" ON public.matches FOR ALL USING (true);

CREATE POLICY "Public Read Events" ON public.community_events FOR SELECT USING (true);
CREATE POLICY "Public Write Events" ON public.community_events FOR ALL USING (true);

CREATE POLICY "Public Read Sponsorships" ON public.sponsorships FOR SELECT USING (true);
CREATE POLICY "Public Write Sponsorships" ON public.sponsorships FOR ALL USING (true);

CREATE POLICY "Public Read Notifications" ON public.fee_notifications FOR SELECT USING (true);
CREATE POLICY "Public Write Notifications" ON public.fee_notifications FOR ALL USING (true);

-- SUCCESS: Schema ready for Jonathan's Child Care System!
`;
}
