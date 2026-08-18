import {
  Student,
  LabEquipment,
  LabSession,
  Player,
  Match,
  Trophy,
  CommunityEvent,
  InstagramPost,
  Sponsorship,
  UserSession,
  EnrollmentDataPoint,
  OrphanRecord,
  FeeNotification,
  EquipmentAllocation,
  LabTeacher,
  LabStation,
  SchoolTier,
} from '../types';

export const ASSET_IMAGES = {
  systemLogo: '/src/assets/images/system_logo_1786619579433.jpg',
  campusBanner: '/src/assets/images/jcc_campus_banner_1786615148281.jpg',
  jccFcCrest: '/src/assets/images/jcc_fc_crest_1786615159440.jpg',
  scienceLab: '/src/assets/images/jcc_science_lab_1786615172733.jpg',
};

// System Administrative Staff & Roles for Access Gateway
export const DEFAULT_USERS: UserSession[] = [
  {
    id: 'USR-01',
    name: 'Dr. Jonathan Davies',
    role: 'Director / Administrator',
    email: 'director@jonathanschildcare.org',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'JCC Bo Executive Board',
    privileges: ['Full System Control', 'Academic Oversight', 'Financial Grants Approval', 'JCC FC Operations', 'Orphanage Privacy Access', 'AI Command Center'],
  },
  {
    id: 'USR-05',
    name: 'Mrs. Aminata Conteh',
    role: 'Welfare & Orphanage Officer',
    email: 'welfare@jonathanschildcare.org',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    department: 'Child Protection & Residential Welfare',
    privileges: ['Orphan Intake & Case Logs', 'Daily Care Schedules', 'Guardian & Kinship Tracking', 'Confidential Medical Dossiers', 'MSWGCA Liaison'],
  },
  {
    id: 'USR-02',
    name: 'Mrs. Fatmata Sesay',
    role: 'Head Teacher',
    email: 'academics@jonathanschildcare.org',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Primary & JSS Academic Faculty',
    privileges: ['Student Enrollment', 'Grade Entry & Welfare Logs', 'AI Report Generator', 'Fee Collection & Receipts'],
  },
  {
    id: 'USR-03',
    name: 'Coach Mohamed Turay',
    role: 'JCC FC Coach',
    email: 'coach@jccfc.org',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'JCC FC Technical Team',
    privileges: ['Squad Management', 'Match Scheduling', 'Player Wellness & Stats', 'Trophy Cabinet'],
  },
  {
    id: 'USR-04',
    name: 'Mr. Patrick Senessie',
    role: 'STEM Lab Specialist',
    email: 'lab@jonathanschildcare.org',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Science & Math Laboratory',
    privileges: ['Apparatus Inventory', 'Practical Session Booking', 'Safety Logs', 'Experiment AI Guide'],
  },
];

// Clean Production Database Defaults - Empty Collections (Ready for Live User Inputs & Firestore Sync)
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_ORPHANS: OrphanRecord[] = [];
export const INITIAL_LAB_EQUIPMENT: LabEquipment[] = [];
export const INITIAL_LAB_SESSIONS: LabSession[] = [];
export const INITIAL_EQUIPMENT_ALLOCATIONS: EquipmentAllocation[] = [];
export const INITIAL_PLAYERS: Player[] = [];
export const INITIAL_MATCHES: Match[] = [];
export const TROPHIES: Trophy[] = [];
export const INITIAL_EVENTS: CommunityEvent[] = [];
export const INSTAGRAM_POSTS: InstagramPost[] = [];
export const INITIAL_SPONSORSHIPS: Sponsorship[] = [];
export const INITIAL_FEE_NOTIFICATIONS: FeeNotification[] = [];
export const ENROLLMENT_TRENDS: EnrollmentDataPoint[] = [];
export const ENROLLMENT_TRENDS_12_MONTHS: EnrollmentDataPoint[] = [];

// Academic Configuration Constants
export const SCHOOL_TIER_CONFIG: Record<SchoolTier, { name: string; grades: string[]; baseFee: number; termFeeSLL: number; badgeColor: string }> = {
  Nursery: {
    name: 'Early Years Nursery (Ages 3-5)',
    grades: ['Nursery 1', 'Nursery 2', 'Kindergarten'],
    baseFee: 1200,
    termFeeSLL: 1200,
    badgeColor: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
  },
  Primary: {
    name: 'Primary School (Classes 1-6)',
    grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'],
    baseFee: 1800,
    termFeeSLL: 1800,
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  },
  Secondary: {
    name: 'Junior Secondary STEM (JSS 1-3)',
    grades: ['JSS 1', 'JSS 2', 'JSS 3'],
    baseFee: 2400,
    termFeeSLL: 2400,
    badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  },
};

// Science & Math Lab Scheduling Configuration
export const LAB_TIME_SLOTS: string[] = [
  '08:30 - 09:45 AM (Period 1-2)',
  '10:00 - 11:15 AM (Period 3-4)',
  '11:45 - 01:00 PM (Period 5-6)',
  '01:45 - 03:00 PM (Period 7-8)',
  '03:30 - 05:00 PM (After-School STEM Club)',
];

export const LAB_TEACHERS: LabTeacher[] = [
  { id: 'TCH-01', name: 'Mr. Emmanuel Bio', department: 'Integrated & Biological Sciences', email: 'e.bio@jonathanschildcare.org', phone: '+232 76 112 001', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'TCH-02', name: 'Mrs. Mariama Koroma', department: 'Physical Chemistry & Chemical Reactions', email: 'm.koroma@jonathanschildcare.org', phone: '+232 77 223 002', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { id: 'TCH-03', name: 'Mr. Augustine Alpha', department: 'Physics, Optics & Mechanics', email: 'a.alpha@jonathanschildcare.org', phone: '+232 78 334 003', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'TCH-04', name: 'Madam Sarah Bundu', department: 'Applied Mathematics & Geometry', email: 's.bundu@jonathanschildcare.org', phone: '+232 76 445 004', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { id: 'TCH-05', name: 'Mr. Patrick Senessie', department: 'Robotics & STEM Innovation', email: 'p.senessie@jonathanschildcare.org', phone: '+232 79 556 005', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
];

export const LAB_TEACHERS_LIST = LAB_TEACHERS;

export const LAB_STATIONS: LabStation[] = [
  { id: 'STN-01', name: 'Optics & Light Workbench (Benches 1-4)', capacity: 16, stationType: 'Optics & Light' },
  { id: 'STN-02', name: 'Titration & Chemical Fume Island (Benches 5-8)', capacity: 12, stationType: 'Titration & Chemistry' },
  { id: 'STN-03', name: 'Robotics, Electronics & Solar Station (Benches 9-12)', capacity: 16, stationType: 'Electronics & Solar' },
  { id: 'STN-04', name: 'High-Power Biological Microscopy Center (Benches 13-16)', capacity: 20, stationType: 'General Microscope' },
  { id: 'STN-05', name: 'Applied Mathematics & Geometry Suite (Benches 17-20)', capacity: 20, stationType: 'Geometry & Math' },
];

export const LAB_STATIONS_LIST = LAB_STATIONS;
