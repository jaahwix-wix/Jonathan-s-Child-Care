import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  Award,
  BookOpen,
  Calendar,
  Building,
  CheckCircle2,
  Trash2,
  Edit2,
  ShieldCheck,
  AlertCircle,
  FileDown,
  UserCheck,
  X,
  CreditCard,
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Teacher, SchoolTier, UserSession, ThemeMode } from '../types';
import { hasPermission } from '../services/authService';
import { AccessRestrictedBanner } from './AccessRestrictedBanner';

interface TeacherManagementProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  currentUser?: UserSession;
  onOpenPrivilegeModal?: () => void;
  themeMode?: ThemeMode;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  currentUser,
  onOpenPrivilegeModal,
  themeMode = 'academic-light',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteTeacherId, setDeleteTeacherId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // RBAC Privileges: Only Administrator is authorized to register and manage teachers
  const isAdmin = currentUser
    ? currentUser.role === 'Director / Administrator' ||
      currentUser.email === 'jaahwix@gmail.com' ||
      currentUser.permissions.includes('system:full_control')
    : false;

  const canRegisterTeacher = isAdmin;
  const canDeleteTeacher = isAdmin;
  const canEditTeacher = isAdmin;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State for Adding / Editing Teacher
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '+232 76 ',
    gender: 'Female' as 'Female' | 'Male',
    schoolTier: 'Secondary' as SchoolTier | 'All Tiers',
    qualification: '',
    employmentType: 'Full-Time' as Teacher['employmentType'],
    role: 'Subject Teacher' as Teacher['role'],
    subjectsInput: '',
    assignedGradesInput: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active' as Teacher['status'],
    monthlySalarySLL: 3800,
    address: 'Bo City, Sierra Leone',
    notes: '',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  });

  const resetForm = () => {
    const nextCodeNum = teachers.length + 1;
    const formattedNum = nextCodeNum < 10 ? `0${nextCodeNum}` : `${nextCodeNum}`;
    setFormData({
      name: '',
      employeeId: `JCC-FAC-2024-${formattedNum}`,
      email: '',
      phone: '+232 76 ',
      gender: 'Female',
      schoolTier: 'Secondary',
      qualification: 'B.Ed Science Education, Njala University',
      employmentType: 'Full-Time',
      role: 'Subject Teacher',
      subjectsInput: 'Integrated Science, Mathematics',
      assignedGradesInput: 'JSS 1, JSS 2',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      monthlySalarySLL: 3800,
      address: 'Bo City, Sierra Leone',
      notes: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
  };

  const handleOpenAddModal = () => {
    if (!canRegisterTeacher) {
      if (onOpenPrivilegeModal) onOpenPrivilegeModal();
      return;
    }
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    if (!canEditTeacher) {
      if (onOpenPrivilegeModal) onOpenPrivilegeModal();
      return;
    }
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      employeeId: teacher.employeeId,
      email: teacher.email,
      phone: teacher.phone,
      gender: teacher.gender,
      schoolTier: teacher.schoolTier,
      qualification: teacher.qualification,
      employmentType: teacher.employmentType,
      role: teacher.role,
      subjectsInput: teacher.subjects.join(', '),
      assignedGradesInput: teacher.assignedGrades.join(', '),
      joiningDate: teacher.joiningDate,
      status: teacher.status,
      monthlySalarySLL: teacher.monthlySalarySLL || 3800,
      address: teacher.address || 'Bo City, Sierra Leone',
      notes: teacher.notes || '',
      avatar: teacher.avatar,
    });
    setShowAddModal(true);
  };

  const handleSubmitTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Please provide both teacher name and institutional email.');
      return;
    }

    const subjects = formData.subjectsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const assignedGrades = formData.assignedGradesInput
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    if (editingTeacher) {
      const updated: Teacher = {
        ...editingTeacher,
        name: formData.name.trim(),
        employeeId: formData.employeeId.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        schoolTier: formData.schoolTier,
        qualification: formData.qualification.trim(),
        employmentType: formData.employmentType,
        role: formData.role,
        subjects: subjects.length ? subjects : ['General Education'],
        assignedGrades: assignedGrades.length ? assignedGrades : ['Primary'],
        joiningDate: formData.joiningDate,
        status: formData.status,
        monthlySalarySLL: Number(formData.monthlySalarySLL) || 0,
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        avatar: formData.avatar,
      };
      onUpdateTeacher(updated);
      showToast(`Teacher profile for ${updated.name} updated successfully.`);
    } else {
      const newTeacher: Teacher = {
        id: `TCH-${Date.now().toString().slice(-6)}`,
        name: formData.name.trim(),
        employeeId: formData.employeeId.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        schoolTier: formData.schoolTier,
        qualification: formData.qualification.trim(),
        employmentType: formData.employmentType,
        role: formData.role,
        subjects: subjects.length ? subjects : ['General Curriculum'],
        assignedGrades: assignedGrades.length ? assignedGrades : ['JSS 1'],
        joiningDate: formData.joiningDate,
        status: formData.status,
        monthlySalarySLL: Number(formData.monthlySalarySLL) || 0,
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        avatar: formData.avatar,
      };
      onAddTeacher(newTeacher);
      showToast(`Teacher ${newTeacher.name} registered and saved to Firestore.`);
    }

    setShowAddModal(false);
    setEditingTeacher(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTeacherId) {
      const target = teachers.find((t) => t.id === deleteTeacherId);
      onDeleteTeacher(deleteTeacherId);
      showToast(`Teacher ${target ? target.name : 'profile'} deleted from faculty registry.`);
      setDeleteTeacherId(null);
      if (selectedTeacher?.id === deleteTeacherId) {
        setSelectedTeacher(null);
      }
    }
  };

  // Filtered teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchesQuery =
      searchQuery === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.qualification.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier =
      tierFilter === 'All' || t.schoolTier === 'All Tiers' || t.schoolTier === tierFilter;

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

    return matchesQuery && matchesTier && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-2xl border border-emerald-500 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* RBAC Header Access Warning if Non-Admin */}
      {!canRegisterTeacher && (
        <AccessRestrictedBanner
          requiredRole="Director / Administrator (Admin Only)"
          requiredClearance="Executive Board (Level 4)"
          actionAttempted="Register & Onboard Academic Teachers (Admin Only)"
          onOpenPrivilegeModal={onOpenPrivilegeModal}
          themeMode={themeMode}
        />
      )}

      {/* Header Bar with Action Controls */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        themeMode === 'academic-light'
          ? 'bg-white border-slate-200 shadow-xs'
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                Academic Staff Directorate
              </span>
              <span className="text-xs text-slate-500">
                • {teachers.length} Active Faculty Members
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold mt-1 ${themeMode === 'academic-light' ? 'text-slate-900' : 'text-white'}`}>
              Teacher & Academic Faculty Management
            </h2>
            <p className={`text-sm mt-0.5 ${themeMode === 'academic-light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Admin-authorized staff registration, class grade allocations, subjects, and qualifications for Bo District campus.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {canRegisterTeacher ? (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all cursor-pointer w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Register New Teacher</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenPrivilegeModal}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-500 font-semibold rounded-xl text-sm border border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-80"
                title="Admin clearance required to register teachers"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Register New Teacher (Admin Only)</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search faculty by name, ID, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors ${
                themeMode === 'academic-light'
                  ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className={`w-full py-2 px-3 text-sm rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors ${
                themeMode === 'academic-light'
                  ? 'bg-slate-50 border-slate-200 text-slate-900'
                  : 'bg-slate-800 border-slate-700 text-white'
              }`}
            >
              <option value="All">All School Tiers</option>
              <option value="Secondary">Junior Secondary (STEM Track)</option>
              <option value="Primary">Primary School (Classes 1-6)</option>
              <option value="Nursery">Early Years Nursery</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full py-2 px-3 text-sm rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors ${
                themeMode === 'academic-light'
                  ? 'bg-slate-50 border-slate-200 text-slate-900'
                  : 'bg-slate-800 border-slate-700 text-white'
              }`}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Duty</option>
              <option value="On Leave">On Approved Leave</option>
              <option value="Probation">Probationary Period</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className={`rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-lg ${
              themeMode === 'academic-light'
                ? 'bg-white border-slate-200 hover:border-blue-300'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              {/* Teacher Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    className="w-13 h-13 rounded-full object-cover border-2 border-blue-500/30 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className={`font-bold text-base ${themeMode === 'academic-light' ? 'text-slate-900' : 'text-white'}`}>
                      {teacher.name}
                    </h3>
                    <p className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400">
                      {teacher.employeeId}
                    </p>
                    <span className="inline-block mt-0.5 text-[11px] font-semibold text-slate-500">
                      {teacher.role}
                    </span>
                  </div>
                </div>

                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  teacher.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : teacher.status === 'On Leave'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                }`}>
                  {teacher.status}
                </span>
              </div>

              {/* Badges / Division info */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium">Division:</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                    {teacher.schoolTier}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-medium">Qualification:</span>
                  <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-300" title={teacher.qualification}>
                    {teacher.qualification}
                  </span>
                </div>

                {/* Assigned Grades */}
                <div className="pt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Allocated Classes
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.assignedGrades.map((grade) => (
                      <span
                        key={grade}
                        className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40"
                      >
                        {grade}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subjects Taught */}
                <div className="pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Specialized Subjects
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.map((subj) => (
                      <span
                        key={subj}
                        className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                      >
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer: Contacts & Action Buttons */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <div className="flex flex-col gap-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {teacher.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {teacher.phone}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTeacher(teacher)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  View Full File
                </button>

                <div className="flex items-center gap-1">
                  {canEditTeacher && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(teacher)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
                      title="Edit Teacher Record"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {canDeleteTeacher && (
                    <button
                      type="button"
                      onClick={() => setDeleteTeacherId(teacher.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-colors"
                      title="Delete Teacher (Director Only)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <div className={`p-12 text-center rounded-2xl border ${
          themeMode === 'academic-light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <GraduationCap className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">
            No Faculty Members Found
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery
              ? `No teachers match "${searchQuery}". Try clearing search filters.`
              : 'The faculty registry is ready. Authorized administrators can register new teachers.'}
          </p>
          {canRegisterTeacher && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm"
            >
              <Plus className="w-4 h-4" />
              Register First Teacher
            </button>
          )}
        </div>
      )}

      {/* MODAL: Register / Edit Teacher */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className={`w-full max-w-2xl my-8 rounded-2xl border shadow-2xl p-6 transition-all ${
            themeMode === 'academic-light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-xl">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {editingTeacher ? 'Update Teacher Record' : 'Register New Academic Teacher'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Institutional staff onboarding and teaching allocation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTeacher(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTeacher} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Full Name & Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Emmanuel Bio"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Employee Staff ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JCC-FAC-2024-06"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. e.bio@jonathanschildcare.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Contact Phone (+232 Sierra Leone) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+232 76 123 456"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    School Tier Division
                  </label>
                  <select
                    value={formData.schoolTier}
                    onChange={(e) => setFormData({ ...formData, schoolTier: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Secondary">Junior Secondary (STEM Track)</option>
                    <option value="Primary">Primary School (Classes 1-6)</option>
                    <option value="Nursery">Early Years Nursery</option>
                    <option value="All Tiers">All Tiers (Cross-Campus Faculty)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Academic Role / Title
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Subject Teacher">Subject Teacher</option>
                    <option value="Class Teacher">Class Teacher</option>
                    <option value="Head of Department">Head of Department</option>
                    <option value="Senior Master">Senior Master</option>
                    <option value="Lab Instructor">Lab Instructor</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Academic Qualification & Degree *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Sc. Ed (Biological Sciences), Njala University"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Subjects Taught (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Integrated Science, Biology, Chemistry"
                    value={formData.subjectsInput}
                    onChange={(e) => setFormData({ ...formData, subjectsInput: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Assigned Grades / Classes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JSS 1, JSS 2, Class 6"
                    value={formData.assignedGradesInput}
                    onChange={(e) => setFormData({ ...formData, assignedGradesInput: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Employment Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active Duty</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Probation">Probationary Period</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Monthly Salary Stipend (SLL / NLe)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlySalarySLL}
                    onChange={(e) => setFormData({ ...formData, monthlySalarySLL: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Residential Address & Campus Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Sewa Road, Bo City. Also supervises after-school STEM club."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTeacher(null);
                  }}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingTeacher ? 'Save Changes' : 'Confirm Registration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Teacher Detail Card */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 transition-all ${
            themeMode === 'academic-light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTeacher.avatar}
                  alt={selectedTeacher.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-bold text-lg">{selectedTeacher.name}</h3>
                  <p className="text-xs font-mono text-blue-600 dark:text-blue-400">
                    {selectedTeacher.employeeId} • {selectedTeacher.role}
                  </p>
                  <p className="text-xs text-slate-500">{selectedTeacher.schoolTier} Division</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-4 text-sm">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1 text-xs">
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  Academic Qualification:
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedTeacher.qualification}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block">Employment Type</span>
                  <span className="font-semibold">{selectedTeacher.employmentType}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block">Joining Date</span>
                  <span className="font-semibold">{selectedTeacher.joiningDate}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block">Contact Phone</span>
                  <span className="font-semibold">{selectedTeacher.phone}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block">Institutional Email</span>
                  <span className="font-semibold truncate block">{selectedTeacher.email}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Subjects Taught
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedTeacher.subjects.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Assigned Classes
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedTeacher.assignedGrades.map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {selectedTeacher.notes && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                  <span className="text-slate-400 block font-semibold mb-0.5">Faculty Notes:</span>
                  <p className="text-slate-600 dark:text-slate-300">{selectedTeacher.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              {canEditTeacher && (
                <button
                  type="button"
                  onClick={() => {
                    const t = selectedTeacher;
                    setSelectedTeacher(null);
                    handleOpenEditModal(t);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTeacherId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 transition-all ${
            themeMode === 'academic-light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg">Confirm Faculty Deletion</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Are you sure you want to remove this teacher from Jonathan's Child Care Academic Faculty registry? This action will permanently remove their records from Firestore.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTeacherId(null)}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Teacher Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
