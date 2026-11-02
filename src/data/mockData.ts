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
  Teacher,
} from '../types';

export const ASSET_IMAGES = {
  systemLogo: '/src/assets/images/system_logo_1786619579433.jpg',
  campusBanner: '/src/assets/images/jcc_campus_banner_1786615148281.jpg',
  jccFcCrest: '/src/assets/images/jcc_fc_crest_1786615159440.jpg',
  scienceLab: '/src/assets/images/jcc_science_lab_1786615172733.jpg',
};

import { INSTITUTIONAL_USERS } from '../services/authService';

// System Administrative Staff & Roles for Access Gateway (Admin Only)
export const DEFAULT_USERS: UserSession[] = INSTITUTIONAL_USERS;

// Clean Production Database Defaults - Initial Collections
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'TCH-BO-01',
    employeeId: 'JCC-FAC-2023-01',
    name: 'Mr. Emmanuel Bio',
    email: 'e.bio@jonathanschildcare.org',
    phone: '+232 76 112 001',
    gender: 'Male',
    schoolTier: 'Secondary',
    assignedGrades: ['JSS 2', 'JSS 3'],
    subjects: ['Integrated Science', 'Biology', 'Environmental Science'],
    qualification: 'B.Sc. Ed (Biological Sciences), Njala University',
    employmentType: 'Full-Time',
    role: 'Head of Department',
    joiningDate: '2021-09-01',
    status: 'Active',
    monthlySalarySLL: 4500,
    address: 'Sewa Road, Bo City',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    notes: 'Senior STEM Department Lead and practical science laboratory supervisor.',
  },
  {
    id: 'TCH-BO-02',
    employeeId: 'JCC-FAC-2023-02',
    name: 'Mrs. Mariama Koroma',
    email: 'm.koroma@jonathanschildcare.org',
    phone: '+232 77 223 002',
    gender: 'Female',
    schoolTier: 'Secondary',
    assignedGrades: ['JSS 1', 'JSS 2'],
    subjects: ['Physical Chemistry', 'General Science', 'Health Education'],
    qualification: 'Higher Teachers Certificate (HTC Secondary), Milton Margai Technical University',
    employmentType: 'Full-Time',
    role: 'Senior Master',
    joiningDate: '2022-01-15',
    status: 'Active',
    monthlySalarySLL: 4200,
    address: 'Tikonko Road, Bo',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    notes: 'Secondary science tutor and chemistry titration mentor.',
  },
  {
    id: 'TCH-BO-03',
    employeeId: 'JCC-FAC-2023-03',
    name: 'Mr. Augustine Alpha',
    email: 'a.alpha@jonathanschildcare.org',
    phone: '+232 78 334 003',
    gender: 'Male',
    schoolTier: 'Secondary',
    assignedGrades: ['JSS 2', 'JSS 3'],
    subjects: ['Physics', 'Applied Mechanics', 'Introductory Technology'],
    qualification: 'B.Ed Science Education, Njala University',
    employmentType: 'Full-Time',
    role: 'Subject Teacher',
    joiningDate: '2022-09-10',
    status: 'Active',
    monthlySalarySLL: 3900,
    address: 'Damballa Road, Bo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    notes: 'Physics lab supervisor and STEM robotics mentor.',
  },
  {
    id: 'TCH-BO-04',
    employeeId: 'JCC-FAC-2024-04',
    name: 'Madam Sarah Bundu',
    email: 's.bundu@jonathanschildcare.org',
    phone: '+232 76 445 004',
    gender: 'Female',
    schoolTier: 'Primary',
    assignedGrades: ['Class 4', 'Class 5'],
    subjects: ['Mathematics', 'English Language', 'Social Studies'],
    qualification: 'Higher Teachers Certificate (HTC Primary), Bo Teachers College',
    employmentType: 'Full-Time',
    role: 'Class Teacher',
    joiningDate: '2023-02-01',
    status: 'Active',
    monthlySalarySLL: 3600,
    address: 'Hospital Road, Bo City',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    notes: 'Lead Class 5 instructor and primary literacy coordinator.',
  },
  {
    id: 'TCH-BO-05',
    employeeId: 'JCC-FAC-2024-05',
    name: 'Mrs. Aminata Sesay',
    email: 'a.sesay@jonathanschildcare.org',
    phone: '+232 79 556 005',
    gender: 'Female',
    schoolTier: 'Nursery',
    assignedGrades: ['Nursery 2', 'Kindergarten'],
    subjects: ['Early Literacy', 'Numeracy Play', 'Creative Arts'],
    qualification: 'Diploma in Early Childhood Care & Education, FBC',
    employmentType: 'Full-Time',
    role: 'Class Teacher',
    joiningDate: '2023-08-20',
    status: 'Active',
    monthlySalarySLL: 3400,
    address: 'Reservoir Hill, Bo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    notes: 'Early years specialist and child psycho-social development coordinator.',
  },
];
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
