export type ModuleTab =
  | 'overview'
  | 'school'
  | 'orphanage'
  | 'science-lab'
  | 'jcc-fc'
  | 'community'
  | 'sponsorship'
  | 'ai-hub';

export type UserRole =
  | 'Director / Administrator'
  | 'Head Teacher'
  | 'Welfare & Orphanage Officer'
  | 'JCC FC Coach'
  | 'STEM Lab Specialist'
  | 'Community Sponsor';

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  privileges: string[];
  department: string;
}

export interface SubjectGrade {
  subject: string;
  score: number; // 0 - 100
  letterGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  teacherComment?: string;
}

export type SchoolTier = 'Nursery' | 'Primary' | 'Secondary';

export type PaymentPlanType = 'Full Payment' | '2-Part Installment' | '3-Part Installment' | 'Custom';

export type FeeStatus = 'Fully Paid' | 'Partially Paid' | 'Outstanding' | 'Scholarship Exemption';

export interface FeeInstallment {
  id: string;
  installmentNumber: number;
  title: string; // e.g. "1st Installment (Enrollment Deposit)", "2nd Installment (Mid-Term)", "3rd Installment (Final Term Exam)"
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  receiptNumber?: string;
  paymentMethod?: 'Cash (Bursary Office)' | 'Orange Money' | 'Afrimoney' | 'Bank Transfer (Rokel Bank)' | 'Scholarship / Sponsor';
  notes?: string;
}

export interface PaymentTransaction {
  id: string;
  date: string;
  amount: number;
  installmentTitle: string;
  paymentMethod: string;
  receiptNumber: string;
  recordedBy: string;
  notes?: string;
}

export type NotificationChannel =
  | 'SMS / Mobile Network (+232 Sierra Leone)'
  | 'WhatsApp Guardian Direct'
  | 'School Email Alert'
  | 'Official Printed Installment Notice';

export type NotificationUrgency =
  | 'Overdue Notice (Immediate Action)'
  | 'Due Imminent (Within 7 Days)'
  | 'Upcoming Mid-Term Deadline (14-30 Days)'
  | 'Partial Payment Balance Reminder'
  | 'Payment Received & Official Receipt';

export type NotificationDeliveryStatus = 'Delivered' | 'Scheduled' | 'Pending Dispatch' | 'Draft';

export interface FeeNotification {
  id: string;
  studentId: string;
  studentName: string;
  guardianName: string;
  guardianPhone: string;
  schoolTier: SchoolTier;
  gradeLevel: string;
  installmentId?: string;
  installmentTitle: string;
  amountDue: number;
  dueDate: string;
  daysRemaining: number; // negative if overdue
  urgency: NotificationUrgency;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  sentDate?: string;
  messageText: string;
  automatedTrigger: boolean;
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  schoolTier: SchoolTier; // 'Nursery' | 'Primary' | 'Secondary'
  gradeLevel: string; // e.g. "Nursery 2", "Class 4", "JSS 2 (STEM Track)", "SSS 2 (Science)"
  age: number;
  gender: 'Female' | 'Male';
  guardianName: string;
  guardianPhone: string;
  attendanceRate: number; // percentage
  emotionalSupportNotes?: string;
  nutritionStatus: 'Optimal' | 'Under Monitoring' | 'Supplemental Meal Required';
  scholarshipStatus: 'Full Sponsor' | 'Partial Sponsor' | 'Self-Funded';
  grades: SubjectGrade[];
  avatar: string;

  // School Fees & Installment Ledger
  currency: string; // "NLe"
  totalTermFee: number;
  totalPaid: number;
  remainingBalance: number;
  feeStatus: FeeStatus;
  paymentPlan: PaymentPlanType;
  installments: FeeInstallment[];
  transactions?: PaymentTransaction[];
}

export interface LabEquipment {
  id: string;
  name: string;
  category: 'Biology' | 'Chemistry' | 'Physics' | 'Mathematics' | 'STEM Robotics';
  quantity: number;
  condition: 'Excellent' | 'Good' | 'Needs Calibration';
  lastInspected: string;
  storageLocation: string;
}

export interface LabSession {
  id: string;
  title: string;
  subject: 'Integrated Science' | 'Biology' | 'Chemistry' | 'Physics' | 'Mathematics';
  date: string;
  timeSlot: string;
  teacherName: string;
  targetGrade: string;
  maxCapacity: number;
  bookedCount: number;
  apparatusNeeded: string[];
}

export interface Player {
  id: string;
  name: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  jerseyNumber: number;
  age: number;
  appearances: number;
  starts?: number;
  subAppearances?: number;
  minutesPlayed?: number;
  goals: number;
  assists: number;
  cleanSheets?: number;
  fitnessStatus: 'Match Ready' | 'Mild Fatigue' | 'Recovering';
  overallRating: number; // 1-99
  schoolAlumni: boolean; // Graduated from or currently attending JCC School
  photo: string;
}

export interface MatchPlayerParticipation {
  playerId: string;
  playerName: string;
  position: string;
  started: boolean;
  minutes: number;
  goals: number;
  assists: number;
  rating: number;
}

export interface Match {
  id: string;
  opponent: string;
  competition: 'Bo District First Division' | 'SRFA Championship' | 'National WPL Play-offs' | 'Friendly Match';
  venue: string;
  date: string;
  time: string;
  status: 'Finished' | 'Live' | 'Upcoming';
  scoreHome?: number;
  scoreAway?: number;
  isHome: boolean;
  tacticalSetup?: string;
  highlights?: string[];
  attendance?: number;
  result?: 'Win' | 'Draw' | 'Loss';
  playerParticipations?: MatchPlayerParticipation[];
}

export interface Trophy {
  id: string;
  title: string;
  year: string;
  organization: string;
  description: string;
  iconName: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  category: 'Educational Panel' | 'Community Development' | 'Child Health Screening' | 'Sports Summit';
  date: string;
  time: string;
  location: string;
  description: string;
  organizer: string;
  attendeesCount: number;
  status: 'Upcoming' | 'Completed';
}

export interface InstagramPost {
  id: string;
  caption: string;
  imageUrl: string;
  likesCount: number;
  commentsCount: number;
  postDate: string;
  location: string;
  tags: string[];
}

export interface Sponsorship {
  id: string;
  sponsorName: string;
  country: string;
  tier: 'Gold Champion' | 'Silver Patron' | 'Community Partner';
  category: 'Child Education' | 'Science & Math Lab' | 'JCC FC Women Football' | 'School Meal Program';
  amountUSD: number;
  recurringPeriod: 'Monthly' | 'Annual' | 'One-Time';
  impactNote: string;
}

export interface EnrollmentDataPoint {
  month: string;
  shortMonth: string;
  total: number;
  primarySchool: number;
  jssStem: number;
  girls: number;
  boys: number;
  newAdmissions: number;
  attendanceRate: number;
}

// ==========================================
// ORPHANAGE & CHILD WELFARE MANAGEMENT TYPES
// ==========================================

export type OrphanCategory =
  | 'Double Orphan (Both Parents Deceased)'
  | 'Maternal Orphan'
  | 'Paternal Orphan'
  | 'Vulnerable Child (Kinship Care)'
  | 'Emergency Protective Custody';

export type ResidentialPlacement =
  | 'JCC Bo Home (Cottage A - Girls)'
  | 'JCC Bo Home (Cottage B - Boys)'
  | 'JCC Bo Early Years Cottage'
  | 'Kinship Caregiver Home (Bo District)'
  | 'Supported Foster Family';

export type DailyCareRoutineStatus = 'Completed' | 'Pending' | 'Flagged';

export interface DailyCareNeeds {
  dietaryPlan: string;
  morningMedicationOrSupplements?: string;
  clothingAndUniformStatus: 'Adequate' | 'Needs New Uniform' | 'Needs Shoes' | 'Disbursed';
  beddingAndHygieneKit: 'Good Condition' | 'Restocked' | 'Needs Replacement';
  emotionalCounselingStatus: 'Weekly Session Active' | 'Stable & Nurtured' | 'Trauma Care Active';
  schoolTransport: 'JCC Bo Walking Group' | 'JCC Campus Shuttle' | 'Guided Escort';
  specialDietaryNeeds?: string;
  lastCareReviewDate: string;
}

export interface GuardianInfo {
  guardianName: string;
  relation: 'Grandmother' | 'Aunt' | 'Uncle' | 'Appointed Legal Guardian' | 'JCC House Mother / Father' | 'Kinship Cousin';
  contactNumber: string;
  communityLocation: string; // e.g. "Tikonko Road, Bo City"
  legalStatus: 'Formal Custody under Ministry (MSWGCA)' | 'Recognized Kinship Care' | 'Institutional Custody (JCC Ministries)';
  voterOrNationalId?: string;
  lastHomeVisitDate?: string;
  caseworkerNotes?: string;
}

export interface WelfareCaseLog {
  id: string;
  date: string;
  officerName: string;
  category: 'Emotional Well-being' | 'Medical & Health Check' | 'Academic Progress' | 'Guardian & Kinship Visit' | 'Nutrition & Growth' | 'Trauma-Informed Care';
  notes: string;
  urgency: 'Routine Observation' | 'Follow-up Required' | 'Urgent Intervention';
  actionTaken?: string;
}

export interface HealthAndVaccination {
  bloodGroup?: string;
  allergies?: string;
  vaccinationsCompleted: string[];
  lastMedicalExamDate: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  healthStatus: 'Optimal' | 'Mild Infection / Treated' | 'Under Observation';
  clinicExaminedBy: string;
}

export interface OrphanRecord {
  id: string; // e.g. "ORP-101"
  studentId?: string; // Links to Student database (e.g. "STU-N101", "STU-102")
  fullName: string;
  gender: 'Female' | 'Male';
  dateOfBirth: string;
  age: number;
  admissionDate: string;
  orphanCategory: OrphanCategory;
  schoolTier: SchoolTier;
  gradeLevel: string;
  residentialPlacement: ResidentialPlacement;
  cottageOrDorm: string;
  houseParentName: string;
  privacyLevel: 'Strict Confidential' | 'Protected Standard' | 'Public Sponsor Eligible';
  avatar: string;
  
  ministryRegistrationNumber: string; // Official Ministry of Social Welfare identifier (MSWGCA)
  
  dailyCare: DailyCareNeeds;
  guardian: GuardianInfo;
  health: HealthAndVaccination;
  caseLogs: WelfareCaseLog[];
  
  sponsorLinked?: {
    sponsorName: string;
    sponsorCountry: string;
    annualSupportUSD: number;
    lastLetterDate?: string;
  };

  // Daily check status flags for caregiver shift tracking
  todayDailyChecklist?: {
    morningNutrition: boolean;
    medicationCheck: boolean;
    schoolReadiness: boolean;
    eveningStudyAndWelfare: boolean;
    nightCareCheck: boolean;
  };
}

// ----------------------------------------------------
// Science Lab Resource Allocation & Scheduling Types
// ----------------------------------------------------

export type AllocationStatus = 'Confirmed' | 'In Use' | 'Completed' | 'Cancelled';

export interface EquipmentAllocation {
  id: string; // e.g. "ALC-101"
  equipmentId: string; // references LabEquipment.id
  equipmentName: string;
  category?: 'Biology' | 'Chemistry' | 'Physics' | 'Mathematics' | 'STEM Robotics';
  equipmentCategory?: string;
  teacherName: string;
  teacherDepartment: string;
  teacherPhone?: string;
  targetClass?: string; // e.g. "JSS 2 (STEM Track)"
  targetGrade?: string;
  subject?: string;
  experimentTitle?: string;
  purpose?: string;
  labStation: string; // e.g. "Station Alpha (Optics Bench)"
  allocatedDate?: string; // "YYYY-MM-DD"
  date?: string;
  timeSlot: string; // e.g. "08:30 AM - 10:00 AM"
  quantityAllocated: number; // e.g. 10
  status: AllocationStatus;
  notes?: string;
  approvedBy?: string;
  createdAt?: string;
  allocatedAt?: string;
  safetyChecklistVerified?: boolean;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  type?: 'EQUIPMENT_OVERBOOKED' | 'TEACHER_DOUBLE_BOOKED' | 'STATION_OCCUPIED' | 'EQUIPMENT_CAPACITY_EXCEEDED' | 'NO_CONFLICT' | 'NONE' | string;
  conflictType?: 'EQUIPMENT_OVERBOOKED' | 'TEACHER_DOUBLE_BOOKED' | 'STATION_OCCUPIED' | 'NO_CONFLICT' | string;
  conflictMessage?: string;
  conflictingAllocation?: EquipmentAllocation;
  conflictingAllocations?: EquipmentAllocation[];
  availableQuantity?: number;
  requestedQuantity?: number;
  totalQuantity?: number;
  suggestedAlternativeSlots?: (string | {
    timeSlot: string;
    station?: string;
    availableQuantity?: number;
    description?: string;
  })[];
  alternativeSuggestions?: {
    timeSlot: string;
    station: string;
    availableQuantity: number;
  }[];
}

export interface LabTeacher {
  id: string;
  name: string;
  department: string;
  email: string;
  phone?: string;
  avatar: string;
}

export interface LabStation {
  id: string;
  name: string;
  capacity: number;
  stationType: 'Optics & Light' | 'Titration & Chemistry' | 'Electronics & Solar' | 'General Microscope' | 'Geometry & Math';
}

export type ThemeMode = 'academic-light' | 'midnight-emerald' | 'deep-navy';


