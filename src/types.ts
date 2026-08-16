export type ModuleTab =
  | 'overview'
  | 'school'
  | 'science-lab'
  | 'jcc-fc'
  | 'community'
  | 'sponsorship'
  | 'ai-hub';

export type UserRole =
  | 'Director / Administrator'
  | 'Head Teacher'
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

export interface Student {
  id: string;
  name: string;
  gradeLevel: string; // e.g. "Primary 5", "JSS 2"
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
  goals: number;
  assists: number;
  cleanSheets?: number;
  fitnessStatus: 'Match Ready' | 'Mild Fatigue' | 'Recovering';
  overallRating: number; // 1-99
  schoolAlumni: boolean; // Graduated from or currently attending JCC School
  photo: string;
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
