import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  HeartHandshake,
  Heart,
  Home,
  UserCheck,
  Calendar,
  Phone,
  MapPin,
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Download,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Clock,
  Activity,
  Smile,
  Baby,
  GraduationCap,
  Lock,
  Unlock,
  Stethoscope,
  Utensils,
  Shirt,
  Bed,
  MessageSquare,
  ChevronRight,
  X,
  Building,
  User,
  Users,
} from 'lucide-react';
import {
  OrphanRecord,
  OrphanCategory,
  ResidentialPlacement,
  SchoolTier,
  UserSession,
  WelfareCaseLog,
} from '../types';
import { exportOrphanWelfarePdf, exportOrphanRosterPdf } from '../utils/pdfExporter';

interface OrphanageManagementProps {
  orphans: OrphanRecord[];
  onAddOrphan: (orphan: OrphanRecord) => void;
  onUpdateOrphan: (orphan: OrphanRecord) => void;
  currentUser: UserSession;
  searchQuery?: string;
  onNavigateToSchool?: (studentId: string) => void;
}

export const OrphanageManagement: React.FC<OrphanageManagementProps> = ({
  orphans,
  onAddOrphan,
  onUpdateOrphan,
  currentUser,
  searchQuery = '',
  onNavigateToSchool,
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPlacement, setSelectedPlacement] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Privacy & Access Control State
  const [isPrivacyMasked, setIsPrivacyMasked] = useState<boolean>(true);
  const [showSecurityPinModal, setShowSecurityPinModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isSuperAuthorized, setIsSuperAuthorized] = useState<boolean>(
    currentUser.role === 'Director / Administrator' || currentUser.role === 'Welfare & Orphanage Officer'
  );

  // Modals
  const [selectedOrphan, setSelectedOrphan] = useState<OrphanRecord | null>(null);
  const [activeDossierTab, setActiveDossierTab] = useState<
    'overview' | 'guardian' | 'dailyCare' | 'health' | 'caseLogs' | 'school'
  >('overview');
  
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showAddLogModal, setShowAddLogModal] = useState<boolean>(false);

  // New Case Log form state
  const [newLogCategory, setNewLogCategory] = useState<WelfareCaseLog['category']>('Emotional Well-being');
  const [newLogUrgency, setNewLogUrgency] = useState<WelfareCaseLog['urgency']>('Routine Observation');
  const [newLogNotes, setNewLogNotes] = useState('');
  const [newLogAction, setNewLogAction] = useState('');

  // New Orphan intake form state
  const [newOrphanForm, setNewOrphanForm] = useState<Partial<OrphanRecord>>({
    fullName: '',
    gender: 'Female',
    dateOfBirth: '2018-01-01',
    age: 8,
    admissionDate: new Date().toISOString().split('T')[0],
    orphanCategory: 'Double Orphan (Both Parents Deceased)',
    schoolTier: 'Primary',
    gradeLevel: 'Class 3',
    residentialPlacement: 'JCC Bo Home (Cottage A - Girls)',
    cottageOrDorm: 'Cottage A - Room 1',
    houseParentName: 'Mrs. Hawa Jalloh (Cottage Mother)',
    privacyLevel: 'Strict Confidential',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    ministryRegistrationNumber: `MSWGCA/BO/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    dailyCare: {
      dietaryPlan: 'Standard high-nutrition residential meal plan with morning eggs and fresh fruit.',
      morningMedicationOrSupplements: 'Daily Multivitamin Complex',
      clothingAndUniformStatus: 'Adequate',
      beddingAndHygieneKit: 'Good Condition',
      emotionalCounselingStatus: 'Stable & Nurtured',
      schoolTransport: 'JCC Bo Walking Group',
      lastCareReviewDate: new Date().toISOString().split('T')[0],
    },
    guardian: {
      guardianName: '',
      relation: 'Aunt',
      contactNumber: '+232 ',
      communityLocation: 'Bo District, Sierra Leone',
      legalStatus: 'Formal Custody under Ministry (MSWGCA)',
      caseworkerNotes: 'Initial intake intake review in progress.',
    },
    health: {
      bloodGroup: 'O+',
      allergies: 'None recorded',
      vaccinationsCompleted: ['BCG', 'Polio', 'DTP', 'Measles', 'Yellow Fever'],
      lastMedicalExamDate: new Date().toISOString().split('T')[0],
      weightKg: 24,
      heightCm: 120,
      bmi: 16.6,
      healthStatus: 'Optimal',
      clinicExaminedBy: 'Dr. S. Kargbo (JCC Clinic)',
    },
  });

  // Effective search
  const activeSearch = (searchQuery || internalSearch).toLowerCase().trim();

  const filteredOrphans = orphans.filter((orphan) => {
    const matchesSearch =
      !activeSearch ||
      orphan.fullName.toLowerCase().includes(activeSearch) ||
      orphan.id.toLowerCase().includes(activeSearch) ||
      orphan.cottageOrDorm.toLowerCase().includes(activeSearch) ||
      orphan.guardian.guardianName.toLowerCase().includes(activeSearch) ||
      orphan.ministryRegistrationNumber.toLowerCase().includes(activeSearch);

    const matchesCategory =
      selectedCategory === 'All' || orphan.orphanCategory === selectedCategory;

    const matchesPlacement =
      selectedPlacement === 'All' || orphan.residentialPlacement === selectedPlacement;

    const matchesTier = selectedTier === 'All' || orphan.schoolTier === selectedTier;

    return matchesSearch && matchesCategory && matchesPlacement && matchesTier;
  });

  // Summary Metrics
  const totalOrphans = orphans.length;
  const doubleOrphans = orphans.filter(
    (o) => o.orphanCategory === 'Double Orphan (Both Parents Deceased)'
  ).length;
  const nurseryCount = orphans.filter((o) => o.schoolTier === 'Nursery').length;
  const primaryCount = orphans.filter((o) => o.schoolTier === 'Primary').length;
  const secondaryCount = orphans.filter((o) => o.schoolTier === 'Secondary').length;
  const fullyCompliantCareToday = orphans.filter(
    (o) =>
      o.todayDailyChecklist?.morningNutrition &&
      o.todayDailyChecklist?.schoolReadiness &&
      o.todayDailyChecklist?.eveningStudyAndWelfare
  ).length;

  const handleVerifyPin = () => {
    // Authorized Security PIN for Bo Child Protection Officers / Directors
    if (enteredPin === '7744' || enteredPin === '1234') {
      setIsSuperAuthorized(true);
      setIsPrivacyMasked(false);
      setShowSecurityPinModal(false);
      setPinError('');
      setEnteredPin('');
    } else {
      setPinError('Invalid Child Safeguarding Security PIN. Authorized officers only.');
    }
  };

  const handleToggleDailyCheck = (orphanId: string, field: keyof NonNullable<OrphanRecord['todayDailyChecklist']>) => {
    const target = orphans.find((o) => o.id === orphanId);
    if (!target) return;

    const updatedChecklist = {
      morningNutrition: true,
      medicationCheck: true,
      schoolReadiness: true,
      eveningStudyAndWelfare: true,
      nightCareCheck: true,
      ...target.todayDailyChecklist,
      [field]: !target.todayDailyChecklist?.[field],
    };

    const updatedOrphan: OrphanRecord = {
      ...target,
      todayDailyChecklist: updatedChecklist,
    };

    onUpdateOrphan(updatedOrphan);
    if (selectedOrphan?.id === orphanId) {
      setSelectedOrphan(updatedOrphan);
    }
  };

  const handleCreateCaseLog = () => {
    if (!selectedOrphan || !newLogNotes.trim()) return;

    const newLog: WelfareCaseLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      officerName: currentUser.name || 'Mrs. Aminata Conteh (Welfare Director)',
      category: newLogCategory,
      notes: newLogNotes,
      urgency: newLogUrgency,
      actionTaken: newLogAction || undefined,
    };

    const updatedOrphan: OrphanRecord = {
      ...selectedOrphan,
      caseLogs: [newLog, ...selectedOrphan.caseLogs],
    };

    onUpdateOrphan(updatedOrphan);
    setSelectedOrphan(updatedOrphan);
    setShowAddLogModal(false);
    setNewLogNotes('');
    setNewLogAction('');
  };

  const handleSaveNewOrphan = () => {
    if (!newOrphanForm.fullName) return;

    const newId = `ORP-${100 + orphans.length + 1}`;
    const completeOrphan: OrphanRecord = {
      id: newId,
      fullName: newOrphanForm.fullName || 'Unnamed Child',
      gender: newOrphanForm.gender || 'Female',
      dateOfBirth: newOrphanForm.dateOfBirth || '2018-01-01',
      age: Number(newOrphanForm.age) || 8,
      admissionDate: newOrphanForm.admissionDate || new Date().toISOString().split('T')[0],
      orphanCategory:
        (newOrphanForm.orphanCategory as OrphanCategory) ||
        'Double Orphan (Both Parents Deceased)',
      schoolTier: (newOrphanForm.schoolTier as SchoolTier) || 'Primary',
      gradeLevel: newOrphanForm.gradeLevel || 'Class 1',
      residentialPlacement:
        (newOrphanForm.residentialPlacement as ResidentialPlacement) ||
        'JCC Bo Home (Cottage A - Girls)',
      cottageOrDorm: newOrphanForm.cottageOrDorm || 'Cottage A - Room 1',
      houseParentName: newOrphanForm.houseParentName || 'Mrs. Hawa Jalloh (Cottage Mother)',
      privacyLevel: newOrphanForm.privacyLevel || 'Strict Confidential',
      avatar:
        newOrphanForm.avatar ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      ministryRegistrationNumber:
        newOrphanForm.ministryRegistrationNumber ||
        `MSWGCA/BO/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      dailyCare: {
        dietaryPlan:
          newOrphanForm.dailyCare?.dietaryPlan ||
          'Standard high-nutrition residential meal plan with morning eggs and fresh fruit.',
        morningMedicationOrSupplements:
          newOrphanForm.dailyCare?.morningMedicationOrSupplements || 'Daily Multivitamins',
        clothingAndUniformStatus:
          newOrphanForm.dailyCare?.clothingAndUniformStatus || 'Adequate',
        beddingAndHygieneKit:
          newOrphanForm.dailyCare?.beddingAndHygieneKit || 'Good Condition',
        emotionalCounselingStatus:
          newOrphanForm.dailyCare?.emotionalCounselingStatus || 'Stable & Nurtured',
        schoolTransport:
          newOrphanForm.dailyCare?.schoolTransport || 'JCC Bo Walking Group',
        lastCareReviewDate: new Date().toISOString().split('T')[0],
      },
      guardian: {
        guardianName: newOrphanForm.guardian?.guardianName || 'Kinship Guardian',
        relation: newOrphanForm.guardian?.relation || 'Aunt',
        contactNumber: newOrphanForm.guardian?.contactNumber || '+232 76 000 000',
        communityLocation:
          newOrphanForm.guardian?.communityLocation || 'Bo District, Sierra Leone',
        legalStatus:
          newOrphanForm.guardian?.legalStatus || 'Formal Custody under Ministry (MSWGCA)',
        caseworkerNotes: newOrphanForm.guardian?.caseworkerNotes || 'Admitted to JCC care.',
      },
      health: {
        bloodGroup: newOrphanForm.health?.bloodGroup || 'O+',
        allergies: newOrphanForm.health?.allergies || 'None',
        vaccinationsCompleted: newOrphanForm.health?.vaccinationsCompleted || [
          'BCG',
          'Polio',
          'DTP',
          'Measles',
          'Yellow Fever',
        ],
        lastMedicalExamDate: new Date().toISOString().split('T')[0],
        weightKg: Number(newOrphanForm.health?.weightKg) || 25,
        heightCm: Number(newOrphanForm.health?.heightCm) || 125,
        bmi: 16.0,
        healthStatus: 'Optimal',
        clinicExaminedBy: 'Dr. S. Kargbo (JCC Clinic)',
      },
      caseLogs: [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          date: new Date().toISOString().split('T')[0],
          officerName: currentUser.name || 'Mrs. Aminata Conteh (Welfare Director)',
          category: 'Emotional Well-being',
          notes: 'Child safely admitted and welcomed to JCC Bo residential cottage.',
          urgency: 'Routine Observation',
          actionTaken: 'Assigned house parent and bed kit.',
        },
      ],
      todayDailyChecklist: {
        morningNutrition: true,
        medicationCheck: true,
        schoolReadiness: true,
        eveningStudyAndWelfare: true,
        nightCareCheck: true,
      },
    };

    onAddOrphan(completeOrphan);
    setShowAddModal(false);
  };

  const maskSecret = (val: string | undefined, maskType: 'phone' | 'id' | 'text' = 'text') => {
    if (!val) return '—';
    if (!isPrivacyMasked || isSuperAuthorized) return val;
    if (maskType === 'phone') {
      return val.slice(0, 7) + ' ••• •••';
    }
    if (maskType === 'id') {
      return val.slice(0, 6) + '••••••';
    }
    return '•••••••••••• (Confidential)';
  };

  return (
    <div className="space-y-6 pb-12" id="orphanage-management-root">
      {/* Top Security & Safeguarding Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                  Residential Orphanage & Child Welfare
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                    MSWGCA Bo Safeguarding
                  </span>
                </h1>
                <p className="text-sm text-slate-300">
                  Bo District, Sierra Leone • 24/7 Residential Care, Guardianship Records, Daily Nutrition & Trauma-Informed Support
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Safeguarding Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Privacy Shield Toggle */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs">
              <ShieldCheck className={`w-4 h-4 ${isPrivacyMasked ? 'text-amber-400' : 'text-emerald-400'}`} />
              <div className="text-left">
                <span className="block font-medium text-slate-200">
                  {isPrivacyMasked ? 'Child Privacy Shield Active' : 'Unrestricted Access Mode'}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {isPrivacyMasked ? 'Sensitive IDs & contacts masked' : 'Full confidential records visible'}
                </span>
              </div>
              <button
                onClick={() => {
                  if (isPrivacyMasked) {
                    if (isSuperAuthorized) {
                      setIsPrivacyMasked(false);
                    } else {
                      setShowSecurityPinModal(true);
                    }
                  } else {
                    setIsPrivacyMasked(true);
                  }
                }}
                className={`ml-2 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isPrivacyMasked
                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                }`}
              >
                {isPrivacyMasked ? 'Unlock Full Access' : 'Lock Shield'}
              </button>
            </div>

            {/* Export Roster PDF */}
            <button
              onClick={() => exportOrphanRosterPdf(orphans)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all shadow-sm"
              title="Download Confidential Roster PDF"
            >
              <Download className="w-4 h-4 text-rose-400" />
              <span>Export Roster PDF</span>
            </button>

            {/* Add New Admission Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-950/40 border border-rose-400/30"
            >
              <Plus className="w-4 h-4" />
              <span>New Orphan Admission</span>
            </button>
          </div>
        </div>

        {/* Access Role Badge */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              Active Safeguarding Officer: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.role})
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <Building className="w-3.5 h-3.5 text-rose-400" /> JCC Bo Residential Compound
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Ministry Partner: MSWGCA Bo Desk
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Resident Children</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalOrphans}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            {doubleOrphans} Double Orphans in JCC Care
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Nursery & Creche</span>
            <Baby className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-2xl font-bold text-pink-400">{nurseryCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">Early Years Cottage Suite</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Primary School</span>
            <GraduationCap className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{primaryCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">Classes 1 - 6 (JCC Campus)</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Secondary / STEM</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">{secondaryCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">JSS & JCC FC Feeder</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Kinship & Guardians</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">100%</p>
          <p className="text-[10px] text-slate-400 mt-1">Legal Custody Sanctioned</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Daily Care Checklist</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {fullyCompliantCareToday}/{totalOrphans}
          </p>
          <p className="text-[10px] text-emerald-400 mt-1">Shift Verification Active</p>
        </div>
      </div>

      {/* Daily Shift Caregiver Quick-Tracker Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              House Parents & Shift Caregivers: Today's Daily Routine Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Interactive live verification of morning nutrition, medication/vitamins, uniform readiness, and evening welfare
            </p>
          </div>
          <span className="text-xs font-medium px-3 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
            Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {orphans.map((orphan) => {
            const check = orphan.todayDailyChecklist || {
              morningNutrition: true,
              medicationCheck: true,
              schoolReadiness: true,
              eveningStudyAndWelfare: true,
              nightCareCheck: true,
            };

            return (
              <div
                key={orphan.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <img
                      src={orphan.avatar}
                      alt={orphan.fullName}
                      className="w-7 h-7 rounded-full object-cover border border-rose-500/40"
                    />
                    <div>
                      <h3 className="font-bold text-slate-200">{orphan.fullName}</h3>
                      <p className="text-[10px] text-slate-400">
                        {orphan.cottageOrDorm} • {orphan.schoolTier}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOrphan(orphan);
                      setActiveDossierTab('dailyCare');
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline"
                  >
                    Dossier
                  </button>
                </div>

                {/* 5 Daily Care Step Toggles */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    onClick={() => handleToggleDailyCheck(orphan.id, 'morningNutrition')}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-colors ${
                      check.morningNutrition
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Utensils className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Nutrition & Diet</span>
                    {check.morningNutrition && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-auto" />}
                  </button>

                  <button
                    onClick={() => handleToggleDailyCheck(orphan.id, 'medicationCheck')}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-colors ${
                      check.medicationCheck
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Stethoscope className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>Meds & Vitamin</span>
                    {check.medicationCheck && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-auto" />}
                  </button>

                  <button
                    onClick={() => handleToggleDailyCheck(orphan.id, 'schoolReadiness')}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-colors ${
                      check.schoolReadiness
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Shirt className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Uniform & Pack</span>
                    {check.schoolReadiness && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-auto" />}
                  </button>

                  <button
                    onClick={() => handleToggleDailyCheck(orphan.id, 'eveningStudyAndWelfare')}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-colors ${
                      check.eveningStudyAndWelfare
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Bed className="w-3 h-3 text-purple-400 shrink-0" />
                    <span>Evening Study</span>
                    {check.eveningStudyAndWelfare && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-auto" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search child name, cottage, guardian..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            {internalSearch && (
              <button
                onClick={() => setInternalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="All">All Orphan Categories</option>
            <option value="Double Orphan (Both Parents Deceased)">Double Orphan</option>
            <option value="Maternal Orphan">Maternal Orphan</option>
            <option value="Paternal Orphan">Paternal Orphan</option>
            <option value="Vulnerable Child (Kinship Care)">Kinship Care</option>
            <option value="Emergency Protective Custody">Emergency Custody</option>
          </select>

          {/* Placement Filter */}
          <select
            value={selectedPlacement}
            onChange={(e) => setSelectedPlacement(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="All">All Residential Placements</option>
            <option value="JCC Bo Home (Cottage A - Girls)">Cottage A (Girls)</option>
            <option value="JCC Bo Home (Cottage B - Boys)">Cottage B (Boys)</option>
            <option value="JCC Bo Early Years Cottage">Early Years Cottage</option>
            <option value="Kinship Caregiver Home (Bo District)">Kinship Caregiver Home</option>
          </select>

          {/* School Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="All">All School Tiers</option>
            <option value="Nursery">Nursery & Creche</option>
            <option value="Primary">Primary School</option>
            <option value="Secondary">Secondary School</option>
          </select>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'cards'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Welfare Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Safeguarding Table
          </button>
        </div>
      </div>

      {/* Orphan Roster Display: Cards vs Table */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrphans.map((orphan) => {
            const isDouble = orphan.orphanCategory === 'Double Orphan (Both Parents Deceased)';
            return (
              <div
                key={orphan.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={orphan.avatar}
                          alt={orphan.fullName}
                          className="w-13 h-13 rounded-2xl object-cover border-2 border-rose-500/30 shadow-md"
                        />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[9px] font-bold text-rose-300">
                          {orphan.age}y
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-white text-base group-hover:text-rose-300 transition-colors">
                            {orphan.fullName}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400">
                          {orphan.schoolTier} • {orphan.gradeLevel}
                        </p>
                        <span className="inline-block mt-0.5 text-[10px] text-slate-500 font-mono">
                          ID: {orphan.id} {orphan.studentId ? `• [${orphan.studentId}]` : ''}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-semibold border ${
                        isDouble
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {isDouble ? 'Double Orphan' : orphan.orphanCategory.split(' ')[0]}
                    </span>
                  </div>

                  {/* Placement & Cottage info */}
                  <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 mb-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Home className="w-3.5 h-3.5 text-rose-400" /> Placement:
                      </span>
                      <span className="font-medium text-right">{orphan.cottageOrDorm}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> House Parent:
                      </span>
                      <span className="text-slate-200">{orphan.houseParentName.split('(')[0]}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-pink-400" /> Guardian / Kin:
                      </span>
                      <span className="font-medium text-slate-200 truncate max-w-[140px]">
                        {maskSecret(orphan.guardian.guardianName, 'text')}
                      </span>
                    </div>
                  </div>

                  {/* Key Care Indicators */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                    <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                      <span className="block text-slate-400 text-[10px]">Dietary Status</span>
                      <span className="font-semibold text-emerald-400 truncate block">
                        Fortified High-Protein
                      </span>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                      <span className="block text-slate-400 text-[10px]">Medical Check</span>
                      <span className="font-semibold text-blue-400 truncate block">
                        {orphan.health.healthStatus} ({orphan.health.bloodGroup || 'O+'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrphan(orphan);
                      setActiveDossierTab('overview');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-200 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-rose-400" />
                    <span>Welfare Dossier</span>
                  </button>

                  <button
                    onClick={() => exportOrphanWelfarePdf(orphan)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="Export Individual Welfare PDF"
                  >
                    <Download className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Administrative Master Table View */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Child Name & ID</th>
                  <th className="px-4 py-3">Category & Reg #</th>
                  <th className="px-4 py-3">Placement / Cottage</th>
                  <th className="px-4 py-3">Academic Tier</th>
                  <th className="px-4 py-3">Guardian & Kinship</th>
                  <th className="px-4 py-3">Daily Care Needs</th>
                  <th className="px-4 py-3">Health Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrphans.map((orphan) => (
                  <tr key={orphan.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={orphan.avatar}
                          alt={orphan.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-rose-500/40"
                        />
                        <div>
                          <p className="font-bold text-white">{orphan.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {orphan.id} • {orphan.age} yrs
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {orphan.orphanCategory.replace(' (Both Parents Deceased)', '')}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">
                        {maskSecret(orphan.ministryRegistrationNumber, 'id')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-200">{orphan.cottageOrDorm}</p>
                      <p className="text-[10px] text-slate-400">{orphan.houseParentName.split('(')[0]}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {orphan.schoolTier} ({orphan.gradeLevel})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-200">
                        {maskSecret(orphan.guardian.guardianName, 'text')}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {orphan.guardian.relation} • {maskSecret(orphan.guardian.contactNumber, 'phone')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5 text-[11px]">
                        <p className="text-slate-300 truncate max-w-[160px]">
                          {orphan.dailyCare.dietaryPlan}
                        </p>
                        <p className="text-[10px] text-emerald-400">
                          {orphan.dailyCare.clothingAndUniformStatus} uniform
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {orphan.health.healthStatus}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Blood {orphan.health.bloodGroup || 'O+'} • BMI {orphan.health.bmi}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedOrphan(orphan);
                            setActiveDossierTab('overview');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-300 border border-slate-700 text-xs font-medium"
                        >
                          Dossier
                        </button>
                        <button
                          onClick={() => exportOrphanWelfarePdf(orphan)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
                        >
                          <Download className="w-3.5 h-3.5 text-rose-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPREHENSIVE INDIVIDUAL WELFARE DOSSIER MODAL */}
      {/* ========================================================================= */}
      {selectedOrphan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedOrphan.avatar}
                  alt={selectedOrphan.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-500 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-bold text-white">{selectedOrphan.fullName}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {selectedOrphan.orphanCategory.replace(' (Both Parents Deceased)', '')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedOrphan.age} Years Old • DOB: {selectedOrphan.dateOfBirth} • Ministry Reg:{' '}
                    <span className="font-mono text-slate-300">
                      {maskSecret(selectedOrphan.ministryRegistrationNumber, 'id')}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => exportOrphanWelfarePdf(selectedOrphan)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold border border-slate-700 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Dossier PDF</span>
                </button>
                <button
                  onClick={() => setSelectedOrphan(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center space-x-1 px-6 pt-3 pb-1 border-b border-slate-800 bg-slate-950/60 overflow-x-auto text-xs scrollbar-none">
              <button
                onClick={() => setActiveDossierTab('overview')}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all ${
                  activeDossierTab === 'overview'
                    ? 'bg-rose-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Intake & Placement
              </button>
              <button
                onClick={() => setActiveDossierTab('guardian')}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all ${
                  activeDossierTab === 'guardian'
                    ? 'bg-rose-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Guardian & Kinship
              </button>
              <button
                onClick={() => setActiveDossierTab('dailyCare')}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all ${
                  activeDossierTab === 'dailyCare'
                    ? 'bg-rose-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Daily Care & Needs
              </button>
              <button
                onClick={() => setActiveDossierTab('health')}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all ${
                  activeDossierTab === 'health'
                    ? 'bg-rose-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Health & Vaccinations
              </button>
              <button
                onClick={() => setActiveDossierTab('caseLogs')}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all ${
                  activeDossierTab === 'caseLogs'
                    ? 'bg-rose-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Caseworker Logs ({selectedOrphan.caseLogs.length})
              </button>
              <button
                onClick={() => setActiveDossierTab('school')}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all ${
                  activeDossierTab === 'school'
                    ? 'bg-rose-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                School & Sponsorship
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* TAB 1: INTAKE & PLACEMENT */}
              {activeDossierTab === 'overview' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                      <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                        <Building className="w-4 h-4" /> Residential Placement
                      </h3>
                      <div className="space-y-2 text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Campus Facility:</span>
                          <span className="font-semibold text-white">{selectedOrphan.residentialPlacement}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Cottage / Wing:</span>
                          <span className="font-medium text-white">{selectedOrphan.cottageOrDorm}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Assigned House Parent:</span>
                          <span className="font-medium text-white">{selectedOrphan.houseParentName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Admission Date:</span>
                          <span className="text-slate-200">{selectedOrphan.admissionDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                      <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> Safeguarding Classification
                      </h3>
                      <div className="space-y-2 text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Orphan Classification:</span>
                          <span className="font-semibold text-rose-300">{selectedOrphan.orphanCategory}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ministry Reg Number:</span>
                          <span className="font-mono text-slate-200">
                            {maskSecret(selectedOrphan.ministryRegistrationNumber, 'id')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Privacy Protection Tier:</span>
                          <span className="text-emerald-400 font-semibold">{selectedOrphan.privacyLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Academic Placement:</span>
                          <span className="text-slate-200">
                            {selectedOrphan.schoolTier} School • {selectedOrphan.gradeLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Caregiver Daily Status Strip */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white">Daily Caregiver Shift Status</h4>
                      <p className="text-slate-400">
                        Updated continuously by cottage house mother / father on active duty.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg font-semibold border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Shift Verified
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: GUARDIAN & KINSHIP */}
              {activeDossierTab === 'guardian' && (
                <div className="space-y-5">
                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-rose-400" />
                          Designated Kinship / Legal Guardian Information
                        </h3>
                        <p className="text-slate-400 text-xs mt-0.5">
                          In compliance with the Sierra Leone Child Rights Act & Bo District Welfare Protocols.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {selectedOrphan.guardian.legalStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 pt-2">
                      <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-slate-850">
                          <span className="text-slate-400">Guardian Name:</span>
                          <span className="font-bold text-white">
                            {maskSecret(selectedOrphan.guardian.guardianName, 'text')}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-850">
                          <span className="text-slate-400">Relationship:</span>
                          <span className="text-white">{selectedOrphan.guardian.relation}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-850">
                          <span className="text-slate-400">Contact Number:</span>
                          <span className="font-mono text-emerald-400">
                            {maskSecret(selectedOrphan.guardian.contactNumber, 'phone')}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-slate-850">
                          <span className="text-slate-400">Community Location:</span>
                          <span className="text-white">{selectedOrphan.guardian.communityLocation}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-850">
                          <span className="text-slate-400">Last Home Visit:</span>
                          <span className="text-slate-200">
                            {selectedOrphan.guardian.lastHomeVisitDate || 'Routine weekly check'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-850">
                          <span className="text-slate-400">Voter / National ID:</span>
                          <span className="font-mono text-slate-400">
                            {maskSecret(selectedOrphan.guardian.voterOrNationalId, 'id')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedOrphan.guardian.caseworkerNotes && (
                      <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                        <strong className="text-slate-400 block mb-1">Caseworker Kinship Assessment:</strong>
                        <p>{selectedOrphan.guardian.caseworkerNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: DAILY CARE & NEEDS */}
              {activeDossierTab === 'dailyCare' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nutrition & Diet */}
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5">
                      <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                        <Utensils className="w-4 h-4" /> Nutrition & Meal Schedule
                      </h3>
                      <p className="text-slate-300">{selectedOrphan.dailyCare.dietaryPlan}</p>
                      {selectedOrphan.dailyCare.specialDietaryNeeds && (
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
                          <strong className="text-amber-400 block text-[10px]">Dietary Notes:</strong>
                          {selectedOrphan.dailyCare.specialDietaryNeeds}
                        </div>
                      )}
                    </div>

                    {/* Morning Medications & Supplements */}
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5">
                      <h3 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" /> Morning Medicine & Supplements
                      </h3>
                      <p className="text-slate-300">
                        {selectedOrphan.dailyCare.morningMedicationOrSupplements || 'No specialized medicine prescribed.'}
                      </p>
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-400 flex justify-between">
                        <span>Emotional Counseling Status:</span>
                        <strong className="text-emerald-400">
                          {selectedOrphan.dailyCare.emotionalCounselingStatus}
                        </strong>
                      </div>
                    </div>

                    {/* Clothing, Uniform & Shoes */}
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5">
                      <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                        <Shirt className="w-4 h-4" /> Uniform, Clothing & Shoes
                      </h3>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Clothing Status:</span>
                        <span className="font-semibold text-emerald-400">
                          {selectedOrphan.dailyCare.clothingAndUniformStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Bedding & Hygiene Kit:</span>
                        <span className="font-semibold text-emerald-400">
                          {selectedOrphan.dailyCare.beddingAndHygieneKit}
                        </span>
                      </div>
                    </div>

                    {/* School Transport & Routine */}
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5">
                      <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                        <Building className="w-4 h-4" /> School Transport & Daily Routine
                      </h3>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Campus Transit:</span>
                        <span className="font-semibold text-slate-200">
                          {selectedOrphan.dailyCare.schoolTransport}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Last Care Review:</span>
                        <span className="text-slate-400">{selectedOrphan.dailyCare.lastCareReviewDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: HEALTH & VACCINATIONS */}
              {activeDossierTab === 'health' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="block text-slate-400 text-[10px]">Blood Group</span>
                      <span className="text-lg font-bold text-rose-400">
                        {selectedOrphan.health.bloodGroup || 'O+'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="block text-slate-400 text-[10px]">Weight / Height</span>
                      <span className="text-lg font-bold text-emerald-400">
                        {selectedOrphan.health.weightKg} kg / {selectedOrphan.health.heightCm} cm
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="block text-slate-400 text-[10px]">BMI Score</span>
                      <span className="text-lg font-bold text-blue-400">
                        {selectedOrphan.health.bmi} (Optimal)
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="block text-slate-400 text-[10px]">Clinical Status</span>
                      <span className="text-lg font-bold text-emerald-400">
                        {selectedOrphan.health.healthStatus}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Completed Immunizations & Vaccination Card
                    </h3>
                    <p className="text-slate-400 text-xs">
                      Verified by Bo Government Hospital & JCC Medical Officer Dr. S. Kargbo.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedOrphan.health.vaccinationsCompleted.map((vax, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-emerald-950/40 text-emerald-300 font-semibold border border-emerald-800/60 text-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {vax}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CASEWORKER LOGS & INCIDENT JOURNAL */}
              {activeDossierTab === 'caseLogs' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-white">Caseworker Observations & Care Logs</h3>
                      <p className="text-slate-400 text-xs">
                        Confidential record maintained by Child Welfare Officers
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddLogModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Case Log Entry</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedOrphan.caseLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {log.category}
                            </span>
                            <span className="text-slate-400 text-xs">• {log.date}</span>
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            Logged by: <strong className="text-slate-200">{log.officerName}</strong>
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{log.notes}</p>
                        {log.actionTaken && (
                          <div className="mt-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Action Taken: {log.actionTaken}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: SCHOOL & SPONSORSHIP LINK */}
              {activeDossierTab === 'school' && (
                <div className="space-y-5">
                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      Academic School Enrollment & Scholarship Link
                    </h3>
                    <p className="text-slate-300">
                      Enrolled at JCC Bo Campus in{' '}
                      <strong className="text-emerald-400">{selectedOrphan.schoolTier} School</strong> (
                      {selectedOrphan.gradeLevel}). Full tuition, uniform, and meal scholarship covered by JCC
                      Child Protection Trust.
                    </p>

                    {selectedOrphan.studentId && onNavigateToSchool && (
                      <button
                        onClick={() => {
                          setSelectedOrphan(null);
                          onNavigateToSchool(selectedOrphan.studentId!);
                        }}
                        className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                      >
                        <span>View Academic Profile ({selectedOrphan.studentId})</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {selectedOrphan.sponsorLinked && (
                    <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-2.5">
                      <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                        <Heart className="w-4 h-4" /> Linked Diaspora Sponsor
                      </h3>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Sponsor Family:</span>
                        <span className="font-semibold text-white">
                          {selectedOrphan.sponsorLinked.sponsorName} ({selectedOrphan.sponsorLinked.sponsorCountry})
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Annual Sponsorship:</span>
                        <span className="font-semibold text-emerald-400">
                          ${selectedOrphan.sponsorLinked.annualSupportUSD} USD / year
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                Child Welfare Dossier • Jonathan's Child Care Ministries Bo
              </span>
              <button
                onClick={() => setSelectedOrphan(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECURITY PIN UNLOCK MODAL */}
      {/* ========================================================================= */}
      {showSecurityPinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Safeguarding Authorization PIN</h3>
                <p className="text-xs text-slate-400">
                  Enter Officer clearance PIN to unmask sensitive National IDs & guardian data.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">
                Officer Clearance PIN (Default: 7744 or 1234)
              </label>
              <input
                type="password"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Enter 4-digit security PIN"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:border-rose-500"
                autoFocus
              />
              {pinError && <p className="text-xs text-rose-400">{pinError}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowSecurityPinModal(false);
                  setPinError('');
                  setEnteredPin('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPin}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
              >
                Unlock Full Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD CASEWORKER LOG ENTRY MODAL */}
      {/* ========================================================================= */}
      {showAddLogModal && selectedOrphan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-rose-400" />
                New Case Worker Observation Log
              </h3>
              <button
                onClick={() => setShowAddLogModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={newLogCategory}
                  onChange={(e) => setNewLogCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="Emotional Well-being">Emotional Well-being</option>
                  <option value="Medical & Health Check">Medical & Health Check</option>
                  <option value="Academic Progress">Academic Progress</option>
                  <option value="Guardian & Kinship Visit">Guardian & Kinship Visit</option>
                  <option value="Nutrition & Growth">Nutrition & Growth</option>
                  <option value="Trauma-Informed Care">Trauma-Informed Care</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Urgency Level</label>
                <select
                  value={newLogUrgency}
                  onChange={(e) => setNewLogUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="Routine Observation">Routine Observation</option>
                  <option value="Follow-up Required">Follow-up Required</option>
                  <option value="Urgent Intervention">Urgent Intervention</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Observation Notes</label>
                <textarea
                  rows={3}
                  value={newLogNotes}
                  onChange={(e) => setNewLogNotes(e.target.value)}
                  placeholder="Detail caregiver observation, behavior, counseling feedback..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Action Taken (Optional)</label>
                <input
                  type="text"
                  value={newLogAction}
                  onChange={(e) => setNewLogAction(e.target.value)}
                  placeholder="e.g. Disbursed new shoes, assigned peer mentor..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddLogModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCaseLog}
                disabled={!newLogNotes.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold"
              >
                Save Case Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEW ORPHAN INTAKE MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">New Orphan Residential Admission</h3>
                  <p className="text-xs text-slate-400">
                    MSWGCA Bo District Child Protection Intake Protocol
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Child Full Name *</label>
                  <input
                    type="text"
                    value={newOrphanForm.fullName}
                    onChange={(e) => setNewOrphanForm({ ...newOrphanForm, fullName: e.target.value })}
                    placeholder="e.g. Sahr Kamara"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Gender & Age</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newOrphanForm.gender}
                      onChange={(e) =>
                        setNewOrphanForm({ ...newOrphanForm, gender: e.target.value as any })
                      }
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                    <input
                      type="number"
                      value={newOrphanForm.age}
                      onChange={(e) =>
                        setNewOrphanForm({ ...newOrphanForm, age: Number(e.target.value) })
                      }
                      placeholder="Age"
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Orphan Category *</label>
                  <select
                    value={newOrphanForm.orphanCategory}
                    onChange={(e) =>
                      setNewOrphanForm({ ...newOrphanForm, orphanCategory: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Double Orphan (Both Parents Deceased)">
                      Double Orphan (Both Parents Deceased)
                    </option>
                    <option value="Maternal Orphan">Maternal Orphan</option>
                    <option value="Paternal Orphan">Paternal Orphan</option>
                    <option value="Vulnerable Child (Kinship Care)">
                      Vulnerable Child (Kinship Care)
                    </option>
                    <option value="Emergency Protective Custody">Emergency Protective Custody</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">School Tier & Grade Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newOrphanForm.schoolTier}
                      onChange={(e) =>
                        setNewOrphanForm({ ...newOrphanForm, schoolTier: e.target.value as any })
                      }
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="Nursery">Nursery</option>
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                    </select>
                    <input
                      type="text"
                      value={newOrphanForm.gradeLevel}
                      onChange={(e) =>
                        setNewOrphanForm({ ...newOrphanForm, gradeLevel: e.target.value })
                      }
                      placeholder="e.g. Class 2"
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Residential Placement Cottage</label>
                  <select
                    value={newOrphanForm.residentialPlacement}
                    onChange={(e) =>
                      setNewOrphanForm({
                        ...newOrphanForm,
                        residentialPlacement: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="JCC Bo Home (Cottage A - Girls)">Cottage A (Girls)</option>
                    <option value="JCC Bo Home (Cottage B - Boys)">Cottage B (Boys)</option>
                    <option value="JCC Bo Early Years Cottage">Early Years Cottage</option>
                    <option value="Kinship Caregiver Home (Bo District)">Kinship Caregiver Home</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Guardian / Kinship Name</label>
                  <input
                    type="text"
                    value={newOrphanForm.guardian?.guardianName}
                    onChange={(e) =>
                      setNewOrphanForm({
                        ...newOrphanForm,
                        guardian: { ...newOrphanForm.guardian!, guardianName: e.target.value },
                      })
                    }
                    placeholder="e.g. Marie Conteh (Aunt)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewOrphan}
                disabled={!newOrphanForm.fullName}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-md"
              >
                Confirm Admission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
