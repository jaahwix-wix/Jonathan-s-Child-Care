import { UserSession, UserRole, Permission, ClearanceLevel, ModuleTab, SecurityAuditEntry } from '../types';

// Pre-defined institutional staff roles across Jonathan's Child Care (JCC) Bo Management Hub
export const INSTITUTIONAL_USERS: UserSession[] = [
  {
    id: 'USR-DIR-01',
    name: 'Dr. Winston Davies',
    role: 'Director / Administrator',
    email: 'jaahwix@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'JCC Bo Executive Directorate & Board of Trustees',
    clearanceLevel: 'Executive Board (Level 4)',
    badgeColor: 'bg-emerald-600 text-white border-emerald-500',
    isVerified: true,
    privileges: [
      'Full Institutional Governance & System Control',
      'Teacher & Staff Registration & Academic Directorate',
      'Supabase Cloud PostgreSQL Schema & DDL Execution',
      'Child Welfare & Confidential Medical Protection Access',
      'Academic Bursary & Fee Dispatch Authorization',
      'Science Lab Safety & Apparatus Oversight',
      'JCC FC Player Registrations & Match Sanctioning',
      'International Donor Grants & Philanthropy Allocations',
      'Gemini AI Command Center Governance',
    ],
    permissions: [
      'students:view',
      'students:create',
      'students:edit',
      'students:delete',
      'students:grades_edit',
      'teachers:view',
      'teachers:create',
      'teachers:edit',
      'teachers:delete',
      'fees:view',
      'fees:manage',
      'fees:dispatch',
      'orphans:view',
      'orphans:create',
      'orphans:edit',
      'orphans:delete',
      'orphans:confidential_notes',
      'science:view',
      'science:manage_equipment',
      'science:allocate',
      'science:schedule',
      'football:view',
      'football:manage_players',
      'football:log_matches',
      'sponsorships:view',
      'sponsorships:manage',
      'community:view',
      'community:manage',
      'ai:access',
      'ai:execute_prompts',
      'database:view',
      'database:manage_supabase',
      'system:manage_users',
      'system:audit_logs',
      'system:full_control',
    ],
  },
  {
    id: 'USR-HT-02',
    name: 'Mr. Francis Koroma',
    role: 'Head Teacher',
    email: 'francis.koroma@jonathanschildcare.org',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'JCC Nursery, Primary & Secondary Academic Division',
    clearanceLevel: 'Senior Administration (Level 3)',
    badgeColor: 'bg-blue-600 text-white border-blue-500',
    isVerified: true,
    privileges: [
      'Academic Transcripts & Class Placement Supervision',
      'Curriculum Grades & Term Report Cards',
      'Term Tuition Fees & Payment Installments Management',
      'Guardian SMS / Notification Dispatch for Balances',
      'Daily Pupil Attendance Auditing',
      'AI Student Performance Report Generation',
    ],
    permissions: [
      'students:view',
      'students:edit',
      'students:grades_edit',
      'teachers:view',
      'teachers:edit',
      'fees:view',
      'fees:manage',
      'fees:dispatch',
      'science:view',
      'football:view',
      'community:view',
      'community:manage',
      'sponsorships:view',
      'ai:access',
      'ai:execute_prompts',
      'database:view',
    ],
  },
  {
    id: 'USR-WLF-03',
    name: 'Mrs. Fatmata Kamara',
    role: 'Welfare & Orphanage Officer',
    email: 'fatmata.kamara@jonathanschildcare.org',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'JCC Residential Home & MSWGCA Social Welfare Liaison',
    clearanceLevel: 'Senior Administration (Level 3)',
    badgeColor: 'bg-rose-600 text-white border-rose-500',
    isVerified: true,
    privileges: [
      'Vulnerable Child & Orphan Intake Registration',
      'Confidential Medical Records & Psychological Logs Access',
      'Residential Dormitory & Nutritional Care Plans',
      'Sierra Leone Ministry of Social Welfare Statutory Reporting',
      'Reunification & Guardian Tracing Documentation',
    ],
    permissions: [
      'orphans:view',
      'orphans:create',
      'orphans:edit',
      'orphans:delete',
      'orphans:confidential_notes',
      'students:view',
      'community:view',
      'sponsorships:view',
      'ai:access',
      'ai:execute_prompts',
      'database:view',
    ],
  },
  {
    id: 'USR-STM-04',
    name: 'Mr. Mohamed Bangura',
    role: 'STEM Lab Specialist',
    email: 'mohamed.bangura@jonathanschildcare.org',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Practical Science & Mathematics Laboratory',
    clearanceLevel: 'Department Specialist (Level 2)',
    badgeColor: 'bg-cyan-600 text-white border-cyan-500',
    isVerified: true,
    privileges: [
      'STEM Laboratory Apparatus & Reagent Inventory',
      'Equipment Safety Inspection & Calibration Schedules',
      'Class Practical Session Booking & Allocations',
      'Integrated Science Apparatus Dispatch Logs',
    ],
    permissions: [
      'science:view',
      'science:manage_equipment',
      'science:allocate',
      'science:schedule',
      'students:view',
      'community:view',
      'database:view',
    ],
  },
  {
    id: 'USR-COA-05',
    name: 'Coach Ibrahim Conteh',
    role: 'JCC FC Coach',
    email: 'ibrahim.conteh@jonathanschildcare.org',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    department: 'JCC FC Technical Directorate & SRFA Division One',
    clearanceLevel: 'Department Specialist (Level 2)',
    badgeColor: 'bg-amber-600 text-white border-amber-500',
    isVerified: true,
    privileges: [
      'Squad Roster & Player Scouting Profiles',
      'Match Fixture Lineup & Tactics Formations',
      'Match Results, Goals & Performance Statistics Submission',
      'Trophy Showcase & Regional Championship Registry',
    ],
    permissions: [
      'football:view',
      'football:manage_players',
      'football:log_matches',
      'students:view',
      'community:view',
      'database:view',
    ],
  },
  {
    id: 'USR-SPN-06',
    name: 'Sarah Jenkins',
    role: 'Community Sponsor',
    email: 'sarah.jenkins@uk-sl-foundation.org',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    department: 'International Philanthropy & Donor Oversight Council',
    clearanceLevel: 'Public / Sponsor (Level 1)',
    badgeColor: 'bg-teal-600 text-white border-teal-500',
    isVerified: true,
    privileges: [
      'Sponsorship Commitments & Grants Portfolio',
      'Transparent Institutional Impact Reports',
      'Student Academic Milestone Progress (Read Only)',
      'Community Outreach & Youth Forum Schedules (Read Only)',
    ],
    permissions: [
      'sponsorships:view',
      'sponsorships:manage',
      'community:view',
      'students:view',
      'orphans:view',
      'football:view',
      'science:view',
    ],
  },
];

// Helper: Check if a user possesses a specific privilege
export function hasPermission(user: UserSession, permission: Permission): boolean {
  if (!user || !user.permissions) return false;
  // Super Admin / Director has system:full_control
  if (user.permissions.includes('system:full_control')) return true;
  return user.permissions.includes(permission);
}

// Helper: Check if a user possesses any of the listed permissions
export function hasAnyPermission(user: UserSession, permissions: Permission[]): boolean {
  return permissions.some((perm) => hasPermission(user, perm));
}

// Helper: Check if user has write permissions for a specific module
export function canWriteModule(user: UserSession, module: ModuleTab): boolean {
  if (!user) return false;
  if (user.permissions.includes('system:full_control')) return true;

  switch (module) {
    case 'school':
      return hasPermission(user, 'students:edit') || hasPermission(user, 'fees:manage');
    case 'orphanage':
      return hasPermission(user, 'orphans:edit') || hasPermission(user, 'orphans:create');
    case 'science-lab':
      return hasPermission(user, 'science:manage_equipment') || hasPermission(user, 'science:allocate');
    case 'jcc-fc':
      return hasPermission(user, 'football:manage_players') || hasPermission(user, 'football:log_matches');
    case 'community':
      return hasPermission(user, 'community:manage');
    case 'sponsorship':
      return hasPermission(user, 'sponsorships:manage');
    case 'ai-hub':
      return hasPermission(user, 'ai:execute_prompts');
    case 'supabase':
      return hasPermission(user, 'database:manage_supabase');
    case 'overview':
    default:
      return true;
  }
}

// Tab navigation accessibility evaluator
export function canAccessTab(
  user: UserSession,
  tab: ModuleTab
): { allowed: boolean; readOnly: boolean; reason?: string } {
  if (!user) return { allowed: false, readOnly: true, reason: 'Authentication required' };
  if (user.permissions.includes('system:full_control')) {
    return { allowed: true, readOnly: false };
  }

  switch (tab) {
    case 'overview':
      return { allowed: true, readOnly: false };

    case 'school':
      if (hasPermission(user, 'students:view')) {
        const canWrite = hasPermission(user, 'students:create') || hasPermission(user, 'fees:manage');
        return {
          allowed: true,
          readOnly: !canWrite,
          reason: canWrite ? undefined : 'View only: Academic Administrator credentials required to edit records.',
        };
      }
      return { allowed: false, readOnly: true, reason: 'Restricted: Requires Student Records authorization.' };

    case 'orphanage':
      if (hasPermission(user, 'orphans:view')) {
        const canWrite = hasPermission(user, 'orphans:create') || hasPermission(user, 'orphans:edit');
        return {
          allowed: true,
          readOnly: !canWrite,
          reason: canWrite ? undefined : 'View only: Social Welfare Officer clearance required for care plan edits.',
        };
      }
      return { allowed: false, readOnly: true, reason: 'Restricted: Protected child welfare files.' };

    case 'science-lab':
      if (hasPermission(user, 'science:view')) {
        const canWrite = hasPermission(user, 'science:manage_equipment');
        return {
          allowed: true,
          readOnly: !canWrite,
          reason: canWrite ? undefined : 'View only: STEM Lab Specialist clearance required to allocate apparatus.',
        };
      }
      return { allowed: false, readOnly: true, reason: 'Restricted: Lab equipment access required.' };

    case 'jcc-fc':
      if (hasPermission(user, 'football:view')) {
        const canWrite = hasPermission(user, 'football:manage_players');
        return {
          allowed: true,
          readOnly: !canWrite,
          reason: canWrite ? undefined : 'View only: Football Coaching staff required to submit match results.',
        };
      }
      return { allowed: false, readOnly: true, reason: 'Restricted: Sports management credentials required.' };

    case 'community':
      return { allowed: true, readOnly: !hasPermission(user, 'community:manage') };

    case 'sponsorship':
      return { allowed: true, readOnly: !hasPermission(user, 'sponsorships:manage') };

    case 'ai-hub':
      if (hasPermission(user, 'ai:access')) {
        return { allowed: true, readOnly: !hasPermission(user, 'ai:execute_prompts') };
      }
      return {
        allowed: false,
        readOnly: true,
        reason: 'Restricted: Gemini AI Engine access reserved for Academic Staff & Directorate.',
      };

    case 'supabase':
      if (hasPermission(user, 'database:view')) {
        const canManage = hasPermission(user, 'database:manage_supabase');
        return {
          allowed: true,
          readOnly: !canManage,
          reason: canManage ? undefined : 'Read-only: Database Schema & DDL operations require Executive Board (Level 4).',
        };
      }
      return { allowed: false, readOnly: true, reason: 'Restricted: Cloud database access requires Level 3+ clearance.' };

    default:
      return { allowed: true, readOnly: false };
  }
}

// Complete Institutional Role Capabilities Matrix (for UI visualization and auditing)
export interface RoleCapabilityRow {
  capability: string;
  category: string;
  director: boolean;
  headTeacher: boolean;
  welfareOfficer: boolean;
  stemSpecialist: boolean;
  coach: boolean;
  sponsor: boolean;
}

export const CAPABILITY_MATRIX_ROWS: RoleCapabilityRow[] = [
  { capability: 'View Student Directory & Grades', category: 'Academic', director: true, headTeacher: true, welfareOfficer: true, stemSpecialist: true, coach: true, sponsor: true },
  { capability: 'Register Pupils (Exclusive Admin)', category: 'Academic', director: true, headTeacher: false, welfareOfficer: false, stemSpecialist: false, coach: false, sponsor: false },
  { capability: 'Delete Student Records', category: 'Academic', director: true, headTeacher: false, welfareOfficer: false, stemSpecialist: false, coach: false, sponsor: false },
  { capability: 'Register Teachers & Faculty (Exclusive Admin)', category: 'Academic', director: true, headTeacher: false, welfareOfficer: false, stemSpecialist: false, coach: false, sponsor: false },
  { capability: 'Delete Teacher Profiles', category: 'Academic', director: true, headTeacher: false, welfareOfficer: false, stemSpecialist: false, coach: false, sponsor: false },
  { capability: 'Manage Tuition & Installments', category: 'Bursary', director: true, headTeacher: true, welfareOfficer: false, stemSpecialist: false, coach: false, sponsor: false },
  { capability: 'Dispatch Fee SMS/Notices', category: 'Bursary', director: true, headTeacher: true, welfareOfficer: false, stemSpecialist: false, coach: false, sponsor: false },
  { capability: 'View Orphan Profiles', category: 'Orphanage', director: true, headTeacher: false, welfareOfficer: true, stemSpecialist: false, coach: false, sponsor: true },
  { capability: 'Intake & Discharge Orphans', category: 'Orphanage', director: true, headTeacher: false, welfareOfficer: true, stemSpecialist: false, coach: false, sponsor: false },
  { capability: 'Confidential Medical & Trauma Notes', category: 'Orphanage', director: true, headTeacher: false, welfareOfficer: true, stemSpecialist: false, coach: false, sponsor: false },
  { capability: 'STEM Equipment Inventory & Safety', category: 'Science Lab', director: true, headTeacher: false, welfareOfficer: false, stemSpecialist: true, coach: false, sponsor: false },
  { capability: 'Allocate Practical Apparatus', category: 'Science Lab', director: true, headTeacher: false, welfareOfficer: false, stemSpecialist: true, coach: false, sponsor: false },
  { capability: 'Sign & Register Football Players', category: 'JCC FC', director: true, headTeacher: false, welfareOfficer: false, stemSpecialist: false, coach: true, sponsor: false },
  { capability: 'Submit Official Match Scores', category: 'JCC FC', director: true, headTeacher: false, welfareOfficer: false, stemSpecialist: false, coach: true, sponsor: false },
  { capability: 'Manage Sponsorship Pledges', category: 'Sponsorship', director: true, headTeacher: false, welfareOfficer: false, stemSpecialist: false, coach: false, sponsor: true },
  { capability: 'Gemini AI Intelligent Prompts', category: 'AI Hub', director: true, headTeacher: true, welfareOfficer: true, stemSpecialist: false, coach: false, sponsor: false },
  { capability: 'Supabase PostgreSQL DDL & Sync', category: 'Database', director: true, headTeacher: false, welfareOfficer: false, stemSpecialist: false, coach: false, sponsor: false },
  { capability: 'Manage Roles & Security Privileges', category: 'Security', director: true, headTeacher: false, welfareOfficer: false, stemSpecialist: false, coach: false, sponsor: false },
];

// Audit Logger
const AUDIT_STORAGE_KEY = 'jcc_security_audit_logs';

export function getSecurityAuditLogs(): SecurityAuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  // Initial audit entries reflecting live system operations
  const initial: SecurityAuditEntry[] = [
    {
      id: 'AUD-901',
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      userId: 'USR-DIR-01',
      userName: 'Dr. Winston Davies',
      role: 'Director / Administrator',
      action: 'System Security Model Initialized',
      module: 'overview',
      status: 'Authorized',
      details: 'RBAC Security Matrix & Clearance Level 4 active for Bo District Hub.',
    },
    {
      id: 'AUD-902',
      timestamp: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
      userId: 'USR-DIR-01',
      userName: 'Dr. Winston Davies',
      role: 'Director / Administrator',
      action: 'Supabase Dual-Persistence Synced',
      module: 'supabase',
      status: 'Authorized',
      details: 'Verified PostgreSQL schema connectivity and synchronization pipeline.',
    },
    {
      id: 'AUD-903',
      timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      userId: 'USR-HT-02',
      userName: 'Mr. Francis Koroma',
      role: 'Head Teacher',
      action: 'Tuition Fee Installment Schedule Verified',
      module: 'school',
      status: 'Authorized',
      details: 'Checked Bo District academic fee notifications ledger.',
    },
  ];

  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(initial));
  } catch {
    // ignore
  }
  return initial;
}

export function logSecurityAudit(
  entry: Omit<SecurityAuditEntry, 'id' | 'timestamp'>
): SecurityAuditEntry {
  const newEntry: SecurityAuditEntry = {
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  try {
    const existing = getSecurityAuditLogs();
    const updated = [newEntry, ...existing.slice(0, 49)]; // keep 50 entries
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // fallback
  }

  return newEntry;
}
