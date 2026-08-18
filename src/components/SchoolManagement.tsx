import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Plus,
  Sparkles,
  Heart,
  Phone,
  BookOpen,
  Award,
  Filter,
  X,
  Loader2,
  CheckCircle2,
  FileDown,
  CreditCard,
  Calendar,
  Receipt,
  AlertCircle,
  Baby,
  School,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Bell,
  Edit2,
  Trash2,
  Send,
  MessageSquare,
  Clock,
  ChevronRight,
  UserCheck,
  Check,
  Folder,
  FolderOpen,
} from 'lucide-react';
import {
  Student,
  SchoolTier,
  PaymentPlanType,
  FeeInstallment,
  PaymentTransaction,
  FeeNotification,
  NotificationUrgency,
  NotificationChannel,
} from '../types';
import { exportStudentsPdf, exportFeeReceiptPdf } from '../utils/pdfExporter';
import { SCHOOL_TIER_CONFIG } from '../data/mockData';
import { FeeNotificationCenter } from './FeeNotificationCenter';
import { StudentDirectoryTreeView } from './StudentDirectoryTreeView';

interface SchoolManagementProps {
  students: Student[];
  notifications: FeeNotification[];
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onAddNotification: (notif: FeeNotification) => void;
  onUpdateNotification: (notif: FeeNotification) => void;
  onDeleteNotification: (notifId: string) => void;
  onBatchDispatch: (urgencyFilter?: NotificationUrgency) => void;
  searchQuery: string;
}

export const SchoolManagement: React.FC<SchoolManagementProps> = ({
  students,
  notifications,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddNotification,
  onUpdateNotification,
  onDeleteNotification,
  onBatchDispatch,
  searchQuery,
}) => {
  // Sub-view switcher
  const [subView, setSubView] = useState<'roster' | 'treeview' | 'notifications' | 'matrix'>('roster');

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [tierFilter, setTierFilter] = useState<'All' | SchoolTier>('All');
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('All');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentStudent, setPaymentStudent] = useState<Student | null>(null);

  const [quickAlertStudent, setQuickAlertStudent] = useState<Student | null>(null);
  const [quickAlertChannel, setQuickAlertChannel] = useState<NotificationChannel>('SMS / Mobile Network (+232 Sierra Leone)');
  const [quickAlertUrgency, setQuickAlertUrgency] = useState<NotificationUrgency>('Due Imminent (Within 7 Days)');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Student Detail Modal active tab
  const [detailTab, setDetailTab] = useState<'academics' | 'fees' | 'welfare'>('fees');

  // AI Report State
  const [aiReportOutput, setAiReportOutput] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // --- FORM STATE FOR ENROLLING PUPIL ---
  const [newStudentName, setNewStudentName] = useState('');
  const [newTier, setNewTier] = useState<SchoolTier>('Secondary');
  const [newGradeLevel, setNewGradeLevel] = useState('JSS 1');
  const [newAge, setNewAge] = useState(12);
  const [newGender, setNewGender] = useState<'Female' | 'Male'>('Female');
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('+232 76 ');
  const [newEmotionalNotes, setNewEmotionalNotes] = useState('');
  
  // Fees & Installments state for Enrollment Form
  const [newTotalFee, setNewTotalFee] = useState<number>(2400);
  const [newScholarshipStatus, setNewScholarshipStatus] = useState<'Full Sponsor' | 'Partial Sponsor' | 'Self-Funded'>('Self-Funded');
  const [newPaymentPlan, setNewPaymentPlan] = useState<PaymentPlanType>('2-Part Installment');
  const [newInitialDeposit, setNewInitialDeposit] = useState<number>(1200);
  const [newPaymentMethod, setNewPaymentMethod] = useState<'Cash (Bursary Office)' | 'Orange Money' | 'Afrimoney' | 'Bank Transfer (Rokel Bank)' | 'Scholarship / Sponsor'>('Orange Money');

  // --- FORM STATE FOR EDITING EXISTING STUDENT ---
  const [editName, setEditName] = useState('');
  const [editTier, setEditTier] = useState<SchoolTier>('Secondary');
  const [editGradeLevel, setEditGradeLevel] = useState('JSS 1');
  const [editAge, setEditAge] = useState(12);
  const [editGender, setEditGender] = useState<'Female' | 'Male'>('Female');
  const [editGuardianName, setEditGuardianName] = useState('');
  const [editGuardianPhone, setEditGuardianPhone] = useState('');
  const [editScholarshipStatus, setEditScholarshipStatus] = useState<'Full Sponsor' | 'Partial Sponsor' | 'Self-Funded'>('Self-Funded');
  const [editPaymentPlan, setEditPaymentPlan] = useState<PaymentPlanType>('2-Part Installment');
  const [editTotalTermFee, setEditTotalTermFee] = useState<number>(2400);
  const [editTotalPaid, setEditTotalPaid] = useState<number>(1200);
  const [editEmotionalNotes, setEditEmotionalNotes] = useState('');
  const [editNutritionStatus, setEditNutritionStatus] = useState<'Optimal' | 'Under Monitoring' | 'Supplemental Meal Required'>('Optimal');
  const [editAttendanceRate, setEditAttendanceRate] = useState<number>(98);

  // --- FORM STATE FOR RECORDING INSTALLMENT PAYMENT ---
  const [payAmount, setPayAmount] = useState<number>(600);
  const [payMethod, setPayMethod] = useState<'Cash (Bursary Office)' | 'Orange Money' | 'Afrimoney' | 'Bank Transfer (Rokel Bank)' | 'Scholarship / Sponsor'>('Cash (Bursary Office)');
  const [payNotes, setPayNotes] = useState<string>('');
  const [payInstallmentId, setPayInstallmentId] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle tier change in enrollment form
  const handleTierChange = (tier: SchoolTier) => {
    setNewTier(tier);
    const config = SCHOOL_TIER_CONFIG[tier];
    setNewGradeLevel(config.grades[0]);
    const fee = config.baseFee;
    setNewTotalFee(fee);
    if (newPaymentPlan === 'Full Payment') {
      setNewInitialDeposit(fee);
    } else if (newPaymentPlan === '2-Part Installment') {
      setNewInitialDeposit(Math.round(fee / 2));
    } else if (newPaymentPlan === '3-Part Installment') {
      setNewInitialDeposit(Math.round(fee * 0.4));
    }
    if (tier === 'Nursery') setNewAge(4);
    else if (tier === 'Primary') setNewAge(8);
    else setNewAge(13);
  };

  // Handle payment plan change in enrollment form
  const handlePaymentPlanChange = (plan: PaymentPlanType) => {
    setNewPaymentPlan(plan);
    if (plan === 'Full Payment') {
      setNewInitialDeposit(newTotalFee);
    } else if (plan === '2-Part Installment') {
      setNewInitialDeposit(Math.round(newTotalFee / 2));
    } else if (plan === '3-Part Installment') {
      setNewInitialDeposit(Math.round(newTotalFee * 0.4));
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const studentTier = s.schoolTier || (s.gradeLevel.toLowerCase().includes('nursery') ? 'Nursery' : s.gradeLevel.toLowerCase().includes('primary') || s.gradeLevel.toLowerCase().includes('class') ? 'Primary' : 'Secondary');
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentTier.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTier = tierFilter === 'All' || studentTier === tierFilter;
    const matchesFeeStatus =
      feeStatusFilter === 'All' ||
      (feeStatusFilter === 'Fully Paid' && s.remainingBalance === 0) ||
      (feeStatusFilter === 'Partially Paid' && s.remainingBalance > 0 && s.totalPaid > 0) ||
      (feeStatusFilter === 'Outstanding' && s.totalPaid === 0);

    return matchesSearch && matchesTier && matchesFeeStatus;
  });

  // Calculate Tier Statistics
  const nurseryStudents = students.filter((s) => s.schoolTier === 'Nursery');
  const primaryStudents = students.filter((s) => s.schoolTier === 'Primary');
  const secondaryStudents = students.filter((s) => s.schoolTier === 'Secondary');

  const totalTermRevenueDue = students.reduce((acc, s) => acc + (s.totalTermFee || 0), 0);
  const totalTermRevenuePaid = students.reduce((acc, s) => acc + (s.totalPaid || 0), 0);
  const totalTermRevenueOutstanding = students.reduce((acc, s) => acc + (s.remainingBalance || 0), 0);
  const collectionPercentage = totalTermRevenueDue > 0 ? Math.round((totalTermRevenuePaid / totalTermRevenueDue) * 100) : 0;

  // Active notifications count
  const pendingNotifsCount = notifications.filter((n) => n.status !== 'Delivered').length;
  const overdueNotifsCount = notifications.filter((n) => n.urgency.includes('Overdue')).length;

  // AI Report Generation Handler
  const handleGenerateAiReport = async (student: Student) => {
    setIsGeneratingAi(true);
    setAiReportOutput('');
    try {
      const response = await fetch('/api/gemini/student-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          gradeLevel: student.gradeLevel,
          grades: student.grades,
          emotionalNotes: student.emotionalSupportNotes,
        }),
      });
      const data = await response.json();
      if (data.result) {
        setAiReportOutput(data.result);
      } else {
        setAiReportOutput('Failed to generate report card comments.');
      }
    } catch (err) {
      console.error(err);
      setAiReportOutput('Error connecting to AI service.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Submit Enrollment (Create Pupil)
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const studentId = `STU-${newTier === 'Nursery' ? 'N' : newTier === 'Primary' ? 'P' : 'S'}${100 + students.length + 1}`;
    const initialPaid = Number(newInitialDeposit) || 0;
    const totalFee = Number(newTotalFee) || 0;
    const balance = Math.max(0, totalFee - initialPaid);

    // Build installment list
    let installments: FeeInstallment[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const receiptNum = `REC-${newTier.slice(0, 3).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`;

    if (newPaymentPlan === 'Full Payment') {
      installments = [
        {
          id: `INS-${studentId}-1`,
          installmentNumber: 1,
          title: `Full Term Tuition (${newTier} School)`,
          amountDue: totalFee,
          amountPaid: initialPaid,
          dueDate: todayStr,
          paidDate: initialPaid >= totalFee ? todayStr : undefined,
          status: initialPaid >= totalFee ? 'Paid' : initialPaid > 0 ? 'Partial' : 'Pending',
          receiptNumber: initialPaid > 0 ? receiptNum : undefined,
          paymentMethod: initialPaid > 0 ? newPaymentMethod : undefined,
          notes: 'Full payment schedule initialized at enrollment',
        },
      ];
    } else if (newPaymentPlan === '2-Part Installment') {
      const part1Due = Math.round(totalFee / 2);
      const part2Due = totalFee - part1Due;
      installments = [
        {
          id: `INS-${studentId}-1`,
          installmentNumber: 1,
          title: '1st Installment (Enrollment Deposit)',
          amountDue: part1Due,
          amountPaid: Math.min(initialPaid, part1Due),
          dueDate: todayStr,
          paidDate: initialPaid >= part1Due ? todayStr : undefined,
          status: initialPaid >= part1Due ? 'Paid' : initialPaid > 0 ? 'Partial' : 'Pending',
          receiptNumber: initialPaid > 0 ? receiptNum : undefined,
          paymentMethod: initialPaid > 0 ? newPaymentMethod : undefined,
          notes: 'First installment recorded at registration',
        },
        {
          id: `INS-${studentId}-2`,
          installmentNumber: 2,
          title: '2nd Installment (Mid-Term Balance)',
          amountDue: part2Due,
          amountPaid: Math.max(0, initialPaid - part1Due),
          dueDate: '2026-11-20',
          status: initialPaid >= totalFee ? 'Paid' : 'Pending',
          notes: 'Due before mid-term assessments',
        },
      ];
    } else if (newPaymentPlan === '3-Part Installment') {
      const part1Due = Math.round(totalFee * 0.4);
      const part2Due = Math.round(totalFee * 0.3);
      const part3Due = totalFee - part1Due - part2Due;
      installments = [
        {
          id: `INS-${studentId}-1`,
          installmentNumber: 1,
          title: '1st Installment (Registration Deposit - 40%)',
          amountDue: part1Due,
          amountPaid: Math.min(initialPaid, part1Due),
          dueDate: todayStr,
          paidDate: initialPaid >= part1Due ? todayStr : undefined,
          status: initialPaid >= part1Due ? 'Paid' : initialPaid > 0 ? 'Partial' : 'Pending',
          receiptNumber: initialPaid > 0 ? receiptNum : undefined,
          paymentMethod: initialPaid > 0 ? newPaymentMethod : undefined,
        },
        {
          id: `INS-${studentId}-2`,
          installmentNumber: 2,
          title: '2nd Installment (Month 2 Science/Materials - 30%)',
          amountDue: part2Due,
          amountPaid: Math.max(0, Math.min(initialPaid - part1Due, part2Due)),
          dueDate: '2026-10-20',
          status: 'Pending',
        },
        {
          id: `INS-${studentId}-3`,
          installmentNumber: 3,
          title: '3rd Installment (Final Term Exam Assessment - 30%)',
          amountDue: part3Due,
          amountPaid: Math.max(0, initialPaid - part1Due - part2Due),
          dueDate: '2026-11-30',
          status: 'Pending',
        },
      ];
    }

    const transactions: PaymentTransaction[] = initialPaid > 0 ? [
      {
        id: `TXN-${Date.now()}`,
        date: todayStr,
        amount: initialPaid,
        installmentTitle: installments[0]?.title || 'Enrollment Fee Deposit',
        paymentMethod: newPaymentMethod,
        receiptNumber: receiptNum,
        recordedBy: 'Mrs. Fatmata Sesay (Head Teacher / Bursar)',
        notes: `Initial ${newPaymentPlan} deposit at registration`,
      },
    ] : [];

    const defaultGrades = newTier === 'Nursery' ? [
      { subject: 'Early Literacy & Phonics', score: 88, letterGrade: 'A' as const, teacherComment: 'Recognizes alphabet phonics.' },
      { subject: 'Numeracy & Shapes', score: 85, letterGrade: 'B' as const, teacherComment: 'Counting and pattern matching.' },
      { subject: 'Creative Arts & Rhymes', score: 92, letterGrade: 'A' as const, teacherComment: 'Enthusiastic and creative.' },
    ] : [
      { subject: 'Integrated Science', score: 85, letterGrade: 'B' as const, teacherComment: 'Engaged in lab practicals.' },
      { subject: 'Mathematics', score: 82, letterGrade: 'B' as const, teacherComment: 'Good grasp of fundamentals.' },
      { subject: 'English Language', score: 86, letterGrade: 'A' as const, teacherComment: 'Solid reading comprehension.' },
      { subject: 'Social Studies', score: 84, letterGrade: 'B' as const, teacherComment: 'Active class participant.' },
    ];

    const newStudent: Student = {
      id: studentId,
      name: newStudentName,
      schoolTier: newTier,
      gradeLevel: newGradeLevel,
      age: Number(newAge),
      gender: newGender,
      guardianName: newGuardianName || 'Family Guardian',
      guardianPhone: newGuardianPhone || '+232 76 000 000',
      attendanceRate: 98,
      emotionalSupportNotes: newEmotionalNotes || `Enrolled in JCC ${newTier} School. Adapting smoothly to curriculum.`,
      nutritionStatus: 'Optimal',
      scholarshipStatus: newScholarshipStatus,
      avatar: newGender === 'Female'
        ? `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
        : `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80`,
      grades: defaultGrades,
      currency: 'NLe',
      totalTermFee: totalFee,
      totalPaid: initialPaid,
      remainingBalance: balance,
      feeStatus: balance === 0 ? 'Fully Paid' : initialPaid > 0 ? 'Partially Paid' : 'Outstanding',
      paymentPlan: newPaymentPlan,
      installments,
      transactions,
    };

    onAddStudent(newStudent);
    setShowAddModal(false);
    showToast(`Pupil ${newStudent.name} successfully enrolled with ${newPaymentPlan}.`);
    
    // Reset Form
    setNewStudentName('');
    setNewEmotionalNotes('');
    setNewGuardianName('');
  };

  // Open Edit Pupil Modal
  const handleOpenEditStudentModal = (student: Student) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditTier(student.schoolTier);
    setEditGradeLevel(student.gradeLevel);
    setEditAge(student.age);
    setEditGender(student.gender);
    setEditGuardianName(student.guardianName);
    setEditGuardianPhone(student.guardianPhone);
    setEditScholarshipStatus(student.scholarshipStatus);
    setEditPaymentPlan(student.paymentPlan);
    setEditTotalTermFee(student.totalTermFee);
    setEditTotalPaid(student.totalPaid);
    setEditEmotionalNotes(student.emotionalSupportNotes || '');
    setEditNutritionStatus(student.nutritionStatus);
    setEditAttendanceRate(student.attendanceRate);
  };

  // Save Edit Pupil
  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const newTotalFee = Number(editTotalTermFee);
    const newPaid = Number(editTotalPaid);
    const newBalance = Math.max(0, newTotalFee - newPaid);
    const newFeeStatus = newBalance === 0 ? 'Fully Paid' : newPaid > 0 ? 'Partially Paid' : 'Outstanding';

    const updatedStudent: Student = {
      ...editingStudent,
      name: editName,
      schoolTier: editTier,
      gradeLevel: editGradeLevel,
      age: Number(editAge),
      gender: editGender,
      guardianName: editGuardianName,
      guardianPhone: editGuardianPhone,
      scholarshipStatus: editScholarshipStatus,
      paymentPlan: editPaymentPlan,
      totalTermFee: newTotalFee,
      totalPaid: newPaid,
      remainingBalance: newBalance,
      feeStatus: newFeeStatus,
      emotionalSupportNotes: editEmotionalNotes,
      nutritionStatus: editNutritionStatus,
      attendanceRate: Number(editAttendanceRate),
    };

    onUpdateStudent(updatedStudent);
    if (selectedStudent && selectedStudent.id === updatedStudent.id) {
      setSelectedStudent(updatedStudent);
    }
    setEditingStudent(null);
    showToast(`Updated pupil profile for ${updatedStudent.name} (${updatedStudent.id}).`);
  };

  // Delete Pupil
  const handleDeleteStudentConfirm = (studentId: string) => {
    onDeleteStudent(studentId);
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(null);
    }
    setDeleteStudentId(null);
    showToast(`Student #${studentId} removed from academic records.`);
  };

  // Quick 1-Click Alert Dispatch from Roster
  const handleDispatchQuickAlert = (student: Student) => {
    const pendingIns = student.installments?.find((i) => i.status !== 'Paid') || student.installments?.[0];
    const amount = pendingIns ? (pendingIns.amountDue - pendingIns.amountPaid) : student.remainingBalance;
    const dueDate = pendingIns?.dueDate || '2026-08-30';

    const newNotif: FeeNotification = {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      studentId: student.id,
      studentName: student.name,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      schoolTier: student.schoolTier,
      gradeLevel: student.gradeLevel,
      installmentId: pendingIns?.id,
      installmentTitle: pendingIns?.title || 'Term Fee Installment',
      amountDue: amount,
      dueDate,
      daysRemaining: 7,
      urgency: quickAlertUrgency,
      channel: quickAlertChannel,
      status: 'Delivered',
      sentDate: new Date().toISOString().split('T')[0],
      automatedTrigger: false,
      messageText: `JCC BURSARY NOTICE: Dear ${student.guardianName}, this is a reminder for ${student.name}'s (${student.gradeLevel}) fee balance of NLe ${amount.toLocaleString()} due on ${dueDate}. Please settle at campus bursary or via Orange Money (+232 76 555 444).`,
      notes: 'Direct 1-click dispatch triggered by Bursar from pupil ledger.',
    };

    onAddNotification(newNotif);
    setQuickAlertStudent(null);
    showToast(`Payment reminder dispatched to ${student.guardianName} (${student.guardianPhone}).`);
  };

  // Open Payment Modal
  const handleOpenPaymentModal = (student: Student) => {
    setPaymentStudent(student);
    const pendingIns = student.installments?.find((i) => i.status !== 'Paid');
    const defaultAmt = pendingIns ? (pendingIns.amountDue - pendingIns.amountPaid) : student.remainingBalance;
    setPayAmount(defaultAmt > 0 ? defaultAmt : 500);
    setPayInstallmentId(pendingIns?.id || student.installments?.[0]?.id || '');
    setPayNotes(`Term fee installment payment for ${student.name}`);
    setShowPaymentModal(true);
  };

  // Submit Installment Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentStudent) return;

    const amount = Number(payAmount);
    if (amount <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const receiptNum = `REC-${paymentStudent.schoolTier.slice(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    let remToApply = amount;
    const updatedInstallments = (paymentStudent.installments || []).map((ins) => {
      if (remToApply <= 0) return ins;

      const needed = ins.amountDue - ins.amountPaid;
      if (needed <= 0) return ins;

      if (remToApply >= needed) {
        remToApply -= needed;
        return {
          ...ins,
          amountPaid: ins.amountDue,
          status: 'Paid' as const,
          paidDate: todayStr,
          receiptNumber: receiptNum,
          paymentMethod: payMethod,
          notes: payNotes || ins.notes,
        };
      } else {
        const newPaid = ins.amountPaid + remToApply;
        remToApply = 0;
        return {
          ...ins,
          amountPaid: newPaid,
          status: 'Partial' as const,
          paidDate: todayStr,
          receiptNumber: receiptNum,
          paymentMethod: payMethod,
          notes: payNotes || ins.notes,
        };
      }
    });

    const newTotalPaid = (paymentStudent.totalPaid || 0) + amount;
    const newBalance = Math.max(0, (paymentStudent.totalTermFee || 0) - newTotalPaid);
    const newFeeStatus = newBalance === 0 ? 'Fully Paid' : 'Partially Paid';

    const newTransaction: PaymentTransaction = {
      id: `TXN-${Date.now()}`,
      date: todayStr,
      amount,
      installmentTitle: `Installment Payment (${paymentStudent.schoolTier} School)`,
      paymentMethod: payMethod,
      receiptNumber: receiptNum,
      recordedBy: 'Mrs. Fatmata Sesay (Head Teacher / Bursar)',
      notes: payNotes || 'Recorded at JCC Bursary Desk',
    };

    const updatedStudent: Student = {
      ...paymentStudent,
      totalPaid: newTotalPaid,
      remainingBalance: newBalance,
      feeStatus: newFeeStatus,
      installments: updatedInstallments,
      transactions: [newTransaction, ...(paymentStudent.transactions || [])],
    };

    onUpdateStudent(updatedStudent);
    if (selectedStudent && selectedStudent.id === updatedStudent.id) {
      setSelectedStudent(updatedStudent);
    }
    setShowPaymentModal(false);
    showToast(`Payment of NLe ${amount.toLocaleString()} recorded for ${paymentStudent.name}.`);

    // Prompt receipt export
    exportFeeReceiptPdf(updatedStudent, newTransaction);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce text-xs font-bold border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Module Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            Jonathan's Child Care Education Complex
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Nursery, Primary & Secondary School Management</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Student enrollment, term fee installment ledgers, automated notification alerts, and Bo District welfare records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportStudentsPdf(students)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold text-xs shadow-md transition-all flex items-center gap-2"
            title="Download PDF Roster & Fees Report"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Export Fees Roster PDF</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Student</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-lg">
        <button
          onClick={() => setSubView('treeview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            subView === 'treeview'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Folder className="w-4 h-4 text-emerald-300" />
          <span>Pupils Directory (Treeview)</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-950/60 text-white font-mono">
            {students.length}
          </span>
        </button>

        <button
          onClick={() => setSubView('roster')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            subView === 'roster'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Ledger Table View</span>
        </button>

        <button
          onClick={() => setSubView('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
            subView === 'notifications'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Automated Fee Notification Center</span>
          {pendingNotifsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-mono font-bold">
              {pendingNotifsCount} Due
            </span>
          )}
        </button>

        <button
          onClick={() => setSubView('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            subView === 'matrix'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Nursery, Primary & Secondary Fee Matrix</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 0: PUPILS DIRECTORY TREEVIEW */}
      {/* ======================================================== */}
      {subView === 'treeview' && (
        <StudentDirectoryTreeView
          students={students}
          onSelectStudent={(student) => setSelectedStudent(student)}
          onOpenPaymentModal={(student) => {
            setPaymentStudent(student);
            setShowPaymentModal(true);
          }}
          searchQuery={searchQuery}
        />
      )}

      {/* ======================================================== */}
      {/* TAB 1: AUTOMATED FEE NOTIFICATION CENTER */}
      {/* ======================================================== */}
      {subView === 'notifications' && (
        <FeeNotificationCenter
          students={students}
          notifications={notifications}
          onAddNotification={onAddNotification}
          onUpdateNotification={onUpdateNotification}
          onDeleteNotification={onDeleteNotification}
          onBatchDispatch={onBatchDispatch}
          onNavigateToStudent={(studentId) => {
            const stu = students.find((s) => s.id === studentId);
            if (stu) {
              setSelectedStudent(stu);
              setSubView('roster');
            }
          }}
        />
      )}

      {/* ======================================================== */}
      {/* TAB 2: FEE STRUCTURE & INSTALLMENT MATRIX */}
      {/* ======================================================== */}
      {subView === 'matrix' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['Nursery', 'Primary', 'Secondary'] as SchoolTier[]).map((tier) => {
              const cfg = SCHOOL_TIER_CONFIG[tier];
              const tierStudents = students.filter((s) => s.schoolTier === tier);
              const tierRevenue = tierStudents.reduce((acc, s) => acc + (s.totalPaid || 0), 0);
              const tierOutstanding = tierStudents.reduce((acc, s) => acc + (s.remainingBalance || 0), 0);

              return (
                <div
                  key={tier}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border ${
                        tier === 'Nursery' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' :
                        tier === 'Primary' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                        'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {tier} Education
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {tierStudents.length} Pupils
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-white">NLe {cfg.baseFee.toLocaleString()}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Standard Term Fee Schedule</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                        <span className="font-bold text-slate-300 block">Class Levels Included:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {cfg.grades.map((g) => (
                            <span key={g} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px]">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <span className="font-bold text-slate-300 block">Installment Options:</span>
                        <div className="space-y-1 text-slate-400 text-[11px]">
                          <div className="flex justify-between">
                            <span>Full Payment:</span>
                            <span className="text-white font-semibold">100% (NLe {cfg.baseFee})</span>
                          </div>
                          <div className="flex justify-between">
                            <span>2-Part Plan:</span>
                            <span className="text-white font-semibold">50% / 50%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>3-Part Plan:</span>
                            <span className="text-white font-semibold">40% / 30% / 30%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Collected</span>
                      <span className="text-emerald-400 font-bold">NLe {tierRevenue.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Outstanding</span>
                      <span className="text-rose-400 font-bold">NLe {tierOutstanding.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PUPILS ROSTER & INSTALLMENT LEDGER */}
      {/* ======================================================== */}
      {subView === 'roster' && (
        <div className="space-y-6">
          {/* School Tiers & Fee Collection Overview Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Nursery Tier Card */}
            <div
              onClick={() => setTierFilter(tierFilter === 'Nursery' ? 'All' : 'Nursery')}
              className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                tierFilter === 'Nursery'
                  ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-950/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-rose-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <Baby className="w-4 h-4 text-rose-400" /> Nursery School
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 font-semibold border border-rose-500/20">
                  {nurseryStudents.length} Pupils
                </span>
              </div>
              <div className="mt-3">
                <p className="text-xl font-black text-white">
                  NLe {nurseryStudents.reduce((acc, s) => acc + (s.totalPaid || 0), 0).toLocaleString()}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Standard Fee: NLe 1,200</span>
                  <span className="text-rose-300">
                    Bal: NLe {nurseryStudents.reduce((acc, s) => acc + (s.remainingBalance || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Tier Card */}
            <div
              onClick={() => setTierFilter(tierFilter === 'Primary' ? 'All' : 'Primary')}
              className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                tierFilter === 'Primary'
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-950/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <BookOpen className="w-4 h-4 text-amber-400" /> Primary School
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                  {primaryStudents.length} Pupils
                </span>
              </div>
              <div className="mt-3">
                <p className="text-xl font-black text-white">
                  NLe {primaryStudents.reduce((acc, s) => acc + (s.totalPaid || 0), 0).toLocaleString()}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Classes 1 - 6</span>
                  <span className="text-amber-300">
                    Bal: NLe {primaryStudents.reduce((acc, s) => acc + (s.remainingBalance || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary Tier Card */}
            <div
              onClick={() => setTierFilter(tierFilter === 'Secondary' ? 'All' : 'Secondary')}
              className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                tierFilter === 'Secondary'
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <GraduationCap className="w-4 h-4 text-emerald-400" /> Secondary (STEM)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                  {secondaryStudents.length} Students
                </span>
              </div>
              <div className="mt-3">
                <p className="text-xl font-black text-white">
                  NLe {secondaryStudents.reduce((acc, s) => acc + (s.totalPaid || 0), 0).toLocaleString()}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>JSS & SSS + Lab</span>
                  <span className="text-emerald-300">
                    Bal: NLe {secondaryStudents.reduce((acc, s) => acc + (s.remainingBalance || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Collection Metric */}
            <div className="p-4 rounded-2xl border bg-slate-900/90 border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <Wallet className="w-4 h-4 text-cyan-400" /> Term Collection
                </span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  {collectionPercentage}% Collected
                </span>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Total Paid:</span>
                  <span className="text-sm font-bold text-emerald-400">NLe {totalTermRevenuePaid.toLocaleString()}</span>
                </div>
                <div className="flex items-baseline justify-between text-xs mt-0.5">
                  <span className="text-slate-400">Outstanding:</span>
                  <span className="text-xs font-bold text-rose-400">NLe {totalTermRevenueOutstanding.toLocaleString()}</span>
                </div>
                {/* Mini Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, collectionPercentage)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase">Tier:</span>
                {(['All', 'Nursery', 'Primary', 'Secondary'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tier)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      tierFilter === tier
                        ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-slate-700 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 uppercase">Fee Status:</span>
                {['All', 'Fully Paid', 'Partially Paid', 'Outstanding'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFeeStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      feeStatusFilter === status
                        ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Showing <strong className="text-emerald-400">{filteredStudents.length}</strong> of {students.length} Students
            </div>
          </div>

          {/* Student Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => {
              const avgScore = Math.round(
                student.grades.reduce((acc, curr) => acc + curr.score, 0) / (student.grades.length || 1)
              );
              const tier = student.schoolTier || 'Secondary';
              const tierColor =
                tier === 'Nursery'
                  ? 'border-rose-500/30 text-rose-300 bg-rose-500/10'
                  : tier === 'Primary'
                  ? 'border-amber-500/30 text-amber-300 bg-amber-500/10'
                  : 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10';

              const feePaid = student.totalPaid || 0;
              const feeTotal = student.totalTermFee || (tier === 'Nursery' ? 1200 : tier === 'Primary' ? 1600 : 2400);
              const feePercent = feeTotal > 0 ? Math.round((feePaid / feeTotal) * 100) : 100;
              const feeStatus = student.remainingBalance === 0 ? 'Fully Paid' : student.totalPaid > 0 ? 'Partially Paid' : 'Outstanding';

              return (
                <div
                  key={student.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-emerald-500/50 p-5 transition-all shadow-lg flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header with Avatar and Tier */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                              {student.name}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-300 font-medium mt-0.5">{student.gradeLevel}</p>
                          <p className="text-[11px] text-slate-400">
                            Age {student.age} • Guardian: {student.guardianName}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${tierColor}`}>
                          {tier}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{student.id}</span>
                      </div>
                    </div>

                    {/* School Fee Progress & Installment Bar */}
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-semibold flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                          Term Fees ({student.paymentPlan || 'Installments'})
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            feeStatus === 'Fully Paid'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : feeStatus === 'Partially Paid'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {feeStatus}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between text-xs pt-1">
                        <span className="text-slate-300">
                          Paid: <strong className="text-emerald-400">NLe {feePaid.toLocaleString()}</strong>
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          Total: NLe {feeTotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Fee ProgressBar */}
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            feePercent === 100 ? 'bg-emerald-400' : feePercent > 0 ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, feePercent)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-rose-300 font-medium">
                          Balance Due: NLe {student.remainingBalance.toLocaleString()}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {student.installments?.length || 1} Installment Schedule
                        </span>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
                        <span className="text-slate-400 block text-[10px] uppercase">Academic Avg</span>
                        <span className="font-bold text-white text-sm">{avgScore}%</span>
                      </div>
                      <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
                        <span className="text-slate-400 block text-[10px] uppercase">Attendance</span>
                        <span className="font-bold text-emerald-400 text-sm">{student.attendanceRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons with Admin CRUD */}
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Full Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {student.remainingBalance > 0 ? (
                        <button
                          onClick={() => handleOpenPaymentModal(student)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>Pay Fee</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid in Full
                        </span>
                      )}
                    </div>

                    {/* Secondary row for quick admin alert & edit/delete */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      {student.remainingBalance > 0 ? (
                        <button
                          onClick={() => setQuickAlertStudent(student)}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Bell className="w-3 h-3 text-amber-400" />
                          <span>Send Reminder</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">No overdue balance</span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditStudentModal(student)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                          title="Edit Student Information"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteStudentId(student.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Student Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STUDENT DETAIL MODAL */}
      {/* ======================================================== */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selectedStudent.name}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {selectedStudent.schoolTier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{selectedStudent.gradeLevel} • ID: {selectedStudent.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditStudentModal(selectedStudent)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                  title="Edit Pupil"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setDetailTab('fees')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  detailTab === 'fees' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fee Installments & Receipts
              </button>
              <button
                onClick={() => setDetailTab('academics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  detailTab === 'academics' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Grades & Report Card
              </button>
              <button
                onClick={() => setDetailTab('welfare')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  detailTab === 'welfare' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Guardian & Welfare Notes
              </button>
            </div>

            {/* Fees Tab Content */}
            {detailTab === 'fees' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Term Plan</span>
                    <span className="text-sm font-bold text-white">{selectedStudent.paymentPlan}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Fee</span>
                    <span className="text-sm font-bold text-white">NLe {selectedStudent.totalTermFee.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Paid</span>
                    <span className="text-sm font-bold text-emerald-400">NLe {selectedStudent.totalPaid.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Outstanding Balance</span>
                    <span className="text-sm font-bold text-rose-400">NLe {selectedStudent.remainingBalance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs">Scheduled Installment Breakdown</h4>
                    {selectedStudent.remainingBalance > 0 && (
                      <button
                        onClick={() => {
                          setSelectedStudent(null);
                          handleOpenPaymentModal(selectedStudent);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                      >
                        Record Installment Payment
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {(selectedStudent.installments || []).map((ins) => (
                      <div
                        key={ins.id}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">{ins.title}</span>
                          <span className="text-[11px] text-slate-400">
                            Due: {ins.dueDate} • Paid: NLe {ins.amountPaid} of NLe {ins.amountDue}
                          </span>
                        </div>
                        <div className="text-right space-y-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ins.status === 'Paid'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : ins.status === 'Partial'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {ins.status.toUpperCase()}
                          </span>
                          {ins.receiptNumber && (
                            <span className="block text-[10px] text-cyan-400 font-mono">{ins.receiptNumber}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Academics Tab Content */}
            {detailTab === 'academics' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  {selectedStudent.grades.map((g, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between font-semibold text-white">
                        <span>{g.subject}</span>
                        <span className="text-emerald-400 font-bold">{g.score}% ({g.letterGrade})</span>
                      </div>
                      {g.teacherComment && (
                        <p className="text-[11px] text-slate-400">{g.teacherComment}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleGenerateAiReport(selectedStudent)}
                    disabled={isGeneratingAi}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-2"
                  >
                    {isGeneratingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Generate AI Teacher Report Card</span>
                  </button>
                </div>

                {aiReportOutput && (
                  <div className="p-4 bg-slate-950 border border-amber-500/40 rounded-xl text-slate-200 text-xs font-mono whitespace-pre-wrap">
                    {aiReportOutput}
                  </div>
                )}
              </div>
            )}

            {/* Welfare Tab Content */}
            {detailTab === 'welfare' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-300">Guardian Information</span>
                  <p className="text-slate-300">Name: <strong className="text-white">{selectedStudent.guardianName}</strong></p>
                  <p className="text-slate-300">Phone: <strong className="text-cyan-400 font-mono">{selectedStudent.guardianPhone}</strong></p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-300">Welfare & Emotional Support Notes</span>
                  <p className="text-slate-300 leading-relaxed">{selectedStudent.emotionalSupportNotes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK PAYMENT ALERT DISPATCH MODAL */}
      {/* ======================================================== */}
      {quickAlertStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" /> Send Fee Payment Alert
              </h3>
              <button onClick={() => setQuickAlertStudent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-300">Pupil: <strong className="text-white">{quickAlertStudent.name}</strong> ({quickAlertStudent.gradeLevel})</p>
                <p className="text-slate-300">Guardian: <strong className="text-white">{quickAlertStudent.guardianName}</strong> ({quickAlertStudent.guardianPhone})</p>
                <p className="text-rose-400 font-bold">Outstanding Balance: NLe {quickAlertStudent.remainingBalance.toLocaleString()}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Alert Channel</label>
                <select
                  value={quickAlertChannel}
                  onChange={(e) => setQuickAlertChannel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="SMS / Mobile Network (+232 Sierra Leone)">SMS / Mobile Network (+232 Sierra Leone)</option>
                  <option value="WhatsApp Guardian Direct">WhatsApp Guardian Direct</option>
                  <option value="Official Printed Installment Notice">Official Printed Installment Notice</option>
                  <option value="School Email Alert">School Email Alert</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Urgency Level</label>
                <select
                  value={quickAlertUrgency}
                  onChange={(e) => setQuickAlertUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Due Imminent (Within 7 Days)">Due Imminent (Within 7 Days)</option>
                  <option value="Overdue Notice (Immediate Action)">Overdue Notice (Immediate Action)</option>
                  <option value="Upcoming Mid-Term Deadline (14-30 Days)">Upcoming Mid-Term Deadline (14-30 Days)</option>
                  <option value="Partial Payment Balance Reminder">Partial Payment Balance Reminder</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickAlertStudent(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDispatchQuickAlert(quickAlertStudent)}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Alert</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT STUDENT (ADMIN UPDATE & SAVE) */}
      {/* ======================================================== */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-400" /> Update Pupil Profile #{editingStudent.id}
              </h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">School Tier</label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value as SchoolTier)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Nursery">Nursery School</option>
                    <option value="Primary">Primary School</option>
                    <option value="Secondary">Secondary School (STEM)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Grade Level</label>
                  <input
                    type="text"
                    value={editGradeLevel}
                    onChange={(e) => setEditGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={editAge}
                    onChange={(e) => setEditAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Attendance %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editAttendanceRate}
                    onChange={(e) => setEditAttendanceRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Total Term Fee (NLe)</label>
                  <input
                    type="number"
                    value={editTotalTermFee}
                    onChange={(e) => setEditTotalTermFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Amount Paid So Far (NLe)</label>
                  <input
                    type="number"
                    value={editTotalPaid}
                    onChange={(e) => setEditTotalPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={editGuardianName}
                    onChange={(e) => setEditGuardianName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    value={editGuardianPhone}
                    onChange={(e) => setEditGuardianPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Welfare & Emotional Support Notes</label>
                <textarea
                  rows={2}
                  value={editEmotionalNotes}
                  onChange={(e) => setEditEmotionalNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Student Confirmation Modal */}
      {deleteStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h4 className="font-bold text-white text-base">Remove Student Record?</h4>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete student #{deleteStudentId}? This will remove all associated grade and fee records.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteStudentId(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStudentConfirm(deleteStudentId)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ENROLL PUPIL MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-emerald-400" /> Enroll New Student & Set Installment Plan
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register pupil for Nursery, Primary, or Secondary (STEM) with customized payment options.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Isata Koroma"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Tier Selection */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">School Education Tier</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Nursery', 'Primary', 'Secondary'] as SchoolTier[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => handleTierChange(tier)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        newTier === tier
                          ? tier === 'Nursery'
                            ? 'bg-rose-950/50 border-rose-500 text-rose-300'
                            : tier === 'Primary'
                            ? 'bg-amber-950/50 border-amber-500 text-amber-300'
                            : 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <span className="font-bold text-xs block">{tier}</span>
                      <span className="text-[10px] text-slate-400">NLe {SCHOOL_TIER_CONFIG[tier].baseFee} / term</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Grade / Class Level</label>
                  <select
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    {SCHOOL_TIER_CONFIG[newTier].grades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    min={2}
                    max={25}
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>

              {/* Installment Plan Structure Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-400" /> School Fee & Installment Plan
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">Term Total: NLe {newTotalFee}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Installment Plan</label>
                    <select
                      value={newPaymentPlan}
                      onChange={(e) => handlePaymentPlanChange(e.target.value as PaymentPlanType)}
                      className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="2-Part Installment">2-Part Installment (50/50)</option>
                      <option value="3-Part Installment">3-Part Installment (40/30/30)</option>
                      <option value="Full Payment">Full Payment (100% upfront)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Deposit Paid Now (NLe)</label>
                    <input
                      type="number"
                      min={0}
                      max={newTotalFee}
                      value={newInitialDeposit}
                      onChange={(e) => setNewInitialDeposit(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Payment Method</label>
                    <select
                      value={newPaymentMethod}
                      onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                      className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="Cash (Bursary Office)">Cash (Bursary Office)</option>
                      <option value="Orange Money">Orange Money</option>
                      <option value="Afrimoney">Afrimoney</option>
                      <option value="Bank Transfer (Rokel Bank)">Rokel Bank Transfer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={newGuardianName}
                    onChange={(e) => setNewGuardianName(e.target.value)}
                    placeholder="Parent / Guardian"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Guardian Phone Number</label>
                  <input
                    type="text"
                    value={newGuardianPhone}
                    onChange={(e) => setNewGuardianPhone(e.target.value)}
                    placeholder="+232 76 ..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Emotional Support & Welfare Notes</label>
                <textarea
                  rows={2}
                  value={newEmotionalNotes}
                  onChange={(e) => setNewEmotionalNotes(e.target.value)}
                  placeholder="Special guidance, nutrition notes, or academic interests..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enroll Pupil & Save Ledger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RECORD INSTALLMENT PAYMENT MODAL --- */}
      {showPaymentModal && paymentStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" /> Record Installment Payment
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Student: <strong className="text-white">{paymentStudent.name}</strong> ({paymentStudent.schoolTier} School)
                </p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Total Term Fee:</span>
                  <span className="font-semibold text-white">NLe {paymentStudent.totalTermFee}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Amount Paid So Far:</span>
                  <span className="font-semibold text-emerald-400">NLe {paymentStudent.totalPaid}</span>
                </div>
                <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1">
                  <span className="font-bold text-rose-300">Remaining Balance:</span>
                  <span className="font-bold text-rose-400">NLe {paymentStudent.remainingBalance}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Amount Being Paid (NLe)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={paymentStudent.remainingBalance}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-black text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Payment Method / Channel</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                >
                  <option value="Cash (Bursary Office)">Cash (Bo Bursary Desk)</option>
                  <option value="Orange Money">Orange Money Mobile Wallet</option>
                  <option value="Afrimoney">Afrimoney Mobile Wallet</option>
                  <option value="Bank Transfer (Rokel Bank)">Bank Transfer (Rokel Bank / Sierra Leone)</option>
                  <option value="Scholarship / Sponsor">Sponsor Grant Allocation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Payment Notes / Receipt Memo</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Paid in cash by father Abu Kamara"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md flex items-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Confirm & Download Receipt PDF</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
