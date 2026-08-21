import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  UserCheck,
  UserX,
  Sparkles,
  Save,
  Users,
  Building,
  GraduationCap,
  History,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  BarChart3,
} from 'lucide-react';
import { Student, SchoolTier, AttendanceStatus, DailyAttendanceRecord } from '../types';
import { MonthlyAttendanceChart } from './MonthlyAttendanceChart';

interface DailyAttendanceTrackerProps {
  students: Student[];
  onUpdateStudent: (updatedStudent: Student) => void;
  onBatchUpdateAttendance?: (updates: Student[]) => Promise<void>;
  searchQuery: string;
}

export const DailyAttendanceTracker: React.FC<DailyAttendanceTrackerProps> = ({
  students,
  onUpdateStudent,
  onBatchUpdateAttendance,
  searchQuery,
}) => {
  // Active view mode: daily register vs monthly analytics
  const [viewMode, setViewMode] = useState<'register' | 'monthly-chart'>('register');

  // Current selected attendance date (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTier, setSelectedTier] = useState<'All' | SchoolTier>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | AttendanceStatus | 'Unmarked'>('All');
  const [searchTerm, setSearchTerm] = useState<string>(searchQuery || '');
  const [teacherName, setTeacherName] = useState<string>('Class Teacher / Bursar');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);

  // Filter students based on tier, grade, search term
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedTier !== 'All' && s.schoolTier !== selectedTier) return false;
      if (selectedGrade !== 'All' && s.gradeLevel !== selectedGrade) return false;

      const record = s.dailyAttendance?.[selectedDate];
      const studentStatus: AttendanceStatus | 'Unmarked' = record?.status || 'Unmarked';
      if (statusFilter !== 'All' && studentStatus !== statusFilter) return false;

      const term = (searchTerm || searchQuery).toLowerCase();
      if (term) {
        const matchName = s.name.toLowerCase().includes(term);
        const matchId = s.id.toLowerCase().includes(term);
        const matchGrade = s.gradeLevel.toLowerCase().includes(term);
        const matchGuardian = s.guardianName.toLowerCase().includes(term);
        if (!matchName && !matchId && !matchGrade && !matchGuardian) return false;
      }
      return true;
    });
  }, [students, selectedTier, selectedGrade, statusFilter, searchTerm, searchQuery, selectedDate]);

  // Unique grade levels for filter dropdown
  const gradeLevels = useMemo(() => {
    const grades = new Set<string>();
    students.forEach((s) => {
      if (selectedTier === 'All' || s.schoolTier === selectedTier) {
        grades.add(s.gradeLevel);
      }
    });
    return Array.from(grades).sort();
  }, [students, selectedTier]);

  // Daily statistics for currently selected date
  const stats = useMemo(() => {
    const relevantStudents = selectedTier === 'All'
      ? students
      : students.filter((s) => s.schoolTier === selectedTier);

    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    let unmarked = 0;

    relevantStudents.forEach((s) => {
      const rec = s.dailyAttendance?.[selectedDate];
      if (!rec || !rec.status) {
        unmarked++;
      } else if (rec.status === 'Present') {
        present++;
      } else if (rec.status === 'Absent') {
        absent++;
      } else if (rec.status === 'Late') {
        late++;
      } else if (rec.status === 'Excused') {
        excused++;
      }
    });

    const total = relevantStudents.length;
    const marked = total - unmarked;
    const rate = marked > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { total, present, absent, late, excused, unmarked, rate };
  }, [students, selectedTier, selectedDate]);

  // Helper to re-calculate overall student attendance rate percentage
  const calculateStudentRate = (dailyMap: Record<string, DailyAttendanceRecord> = {}) => {
    const entries = Object.values(dailyMap);
    if (entries.length === 0) return 100;
    const attended = entries.filter((e) => e.status === 'Present' || e.status === 'Late' || e.status === 'Excused').length;
    return Math.round((attended / entries.length) * 100);
  };

  // Toggle or set individual student attendance for the selected date
  const handleSetAttendance = (student: Student, status: AttendanceStatus, notes?: string) => {
    const timestamp = new Date().toISOString();
    const updatedDaily: Record<string, DailyAttendanceRecord> = {
      ...(student.dailyAttendance || {}),
      [selectedDate]: {
        date: selectedDate,
        status,
        timestamp,
        recordedBy: teacherName,
        notes: notes || student.dailyAttendance?.[selectedDate]?.notes || '',
      },
    };

    const newRate = calculateStudentRate(updatedDaily);

    const updatedStudent: Student = {
      ...student,
      attendanceRate: newRate,
      dailyAttendance: updatedDaily,
      lastAttendanceUpdate: timestamp,
    };

    onUpdateStudent(updatedStudent);

    setSaveSuccessMsg(`Attendance for ${student.name} marked as ${status} (${new Date(timestamp).toLocaleTimeString()})`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Mark all currently visible / filtered students as Present in bulk
  const handleMarkAllFiltered = async (status: AttendanceStatus) => {
    if (filteredStudents.length === 0) return;
    setIsSavingAll(true);
    const timestamp = new Date().toISOString();

    const updatedList = filteredStudents.map((student) => {
      const updatedDaily: Record<string, DailyAttendanceRecord> = {
        ...(student.dailyAttendance || {}),
        [selectedDate]: {
          date: selectedDate,
          status,
          timestamp,
          recordedBy: teacherName,
        },
      };
      return {
        ...student,
        attendanceRate: calculateStudentRate(updatedDaily),
        dailyAttendance: updatedDaily,
        lastAttendanceUpdate: timestamp,
      };
    });

    if (onBatchUpdateAttendance) {
      await onBatchUpdateAttendance(updatedList);
    } else {
      updatedList.forEach((s) => onUpdateStudent(s));
    }

    setIsSavingAll(false);
    setSaveSuccessMsg(`Bulk updated ${updatedList.length} students to "${status}" for ${selectedDate}`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Quick date navigation
  const shiftDate = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* View Mode Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('register')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'register'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-300" />
            <span>Daily Roll-Call Register</span>
          </button>

          <button
            onClick={() => setViewMode('monthly-chart')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'monthly-chart'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-300" />
            <span>Monthly Attendance Patterns (Bar Chart)</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono px-3">
          {students.length} Pupils Enrolled
        </span>
      </div>

      {/* Conditionally Render Monthly Attendance Chart */}
      {viewMode === 'monthly-chart' ? (
        <MonthlyAttendanceChart students={students} />
      ) : (
        <>
          {/* Top Banner & Control Station */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Daily Student Attendance Register
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Live Firestore Sync
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Log presence, absence, late arrivals, and excused leaves with instant timestamp audit trail.
              </p>
            </div>
          </div>

          {/* Date Picker & Teacher Signer */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => shiftDate(-1)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 px-3 font-semibold text-white font-mono">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
                />
              </div>
              <button
                onClick={() => shiftDate(1)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-400 font-semibold">Teacher:</span>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none w-32 truncate"
                placeholder="Teacher Name"
              />
            </div>
          </div>
        </div>

        {/* Live Attendance Counters & Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Pupils</span>
            <span className="text-xl font-black text-white mt-1 block">{stats.total}</span>
            <span className="text-[10px] text-slate-500">{stats.total - stats.unmarked} marked</span>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'Present' ? 'All' : 'Present')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'Present'
                ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950/40'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-emerald-500/40'
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Present
            </span>
            <span className="text-xl font-black text-emerald-300 mt-1 block">{stats.present}</span>
            <span className="text-[10px] text-emerald-500/80">
              {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% of class
            </span>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'Absent' ? 'All' : 'Absent')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'Absent'
                ? 'bg-rose-950/60 border-rose-500 shadow-md shadow-rose-950/40'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-rose-500/40'
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Absent
            </span>
            <span className="text-xl font-black text-rose-300 mt-1 block">{stats.absent}</span>
            <span className="text-[10px] text-rose-500/80">
              {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% absent
            </span>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'Late' ? 'All' : 'Late')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'Late'
                ? 'bg-amber-950/60 border-amber-500 shadow-md shadow-amber-950/40'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-amber-500/40'
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Late
            </span>
            <span className="text-xl font-black text-amber-300 mt-1 block">{stats.late}</span>
            <span className="text-[10px] text-amber-500/80">Arrived late</span>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'Excused' ? 'All' : 'Excused')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'Excused'
                ? 'bg-purple-950/60 border-purple-500 shadow-md shadow-purple-950/40'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-purple-500/40'
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Excused
            </span>
            <span className="text-xl font-black text-purple-300 mt-1 block">{stats.excused}</span>
            <span className="text-[10px] text-purple-400/80">Welfare leave</span>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'Unmarked' ? 'All' : 'Unmarked')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'Unmarked'
                ? 'bg-slate-800 border-cyan-400 shadow-md'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Unmarked
            </span>
            <span className="text-xl font-black text-slate-200 mt-1 block">{stats.unmarked}</span>
            <span className="text-[10px] text-slate-400">Needs roll call</span>
          </div>
        </div>

        {/* Action Toolbar & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Filters: Tier & Grade */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Tier:</span>
              {(['All', 'Nursery', 'Primary', 'Secondary'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedTier(t);
                    setSelectedGrade('All');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedTier === t
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {gradeLevels.length > 0 && (
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Classes / Grades</option>
                {gradeLevels.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search pupil name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quick Bulk Marking Actions */}
          <div className="flex items-center gap-2">
            <button
              id="btn-mark-all-present"
              disabled={isSavingAll || filteredStudents.length === 0}
              onClick={() => handleMarkAllFiltered('Present')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark All {filteredStudents.length} Present</span>
            </button>

            <button
              id="btn-mark-all-absent"
              disabled={isSavingAll || filteredStudents.length === 0}
              onClick={() => handleMarkAllFiltered('Absent')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Mark Filtered Absent</span>
            </button>
          </div>
        </div>

        {/* Live Notification Feedback */}
        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Roster Attendance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span>Roll Call Register for {selectedDate}</span>
            <span className="text-xs text-slate-400 font-normal">
              ({filteredStudents.length} Students Listed)
            </span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {stats.rate}% Overall Attendance
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="font-semibold text-white">No students matched the active filters.</p>
            <p className="text-xs">Adjust the school tier, class selection, or search query above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Student Details</th>
                  <th className="px-4 py-3">Tier & Grade</th>
                  <th className="px-4 py-3">Term Rate</th>
                  <th className="px-4 py-3">Status for {selectedDate}</th>
                  <th className="px-4 py-3">Quick Toggle Actions</th>
                  <th className="px-4 py-3 text-right">Firestore Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredStudents.map((student) => {
                  const record = student.dailyAttendance?.[selectedDate];
                  const currentStatus: AttendanceStatus | 'Unmarked' = record?.status || 'Unmarked';
                  const formattedTime = record?.timestamp
                    ? new Date(record.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : '—';

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Student Info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-white block text-sm group-hover:text-emerald-400 transition-colors">
                              {student.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ID: {student.id} • Guardian: {student.guardianName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tier & Grade */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border block w-fit mb-1 ${
                            student.schoolTier === 'Secondary'
                              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                              : student.schoolTier === 'Primary'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {student.schoolTier}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 block">
                          {student.gradeLevel}
                        </span>
                      </td>

                      {/* Term Attendance Rate */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${
                                student.attendanceRate >= 85
                                  ? 'bg-emerald-500'
                                  : student.attendanceRate >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, student.attendanceRate)}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono font-bold text-xs ${
                              student.attendanceRate >= 85
                                ? 'text-emerald-400'
                                : student.attendanceRate >= 70
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {student.attendanceRate}%
                          </span>
                        </div>
                      </td>

                      {/* Current Status Pill */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit border ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : currentStatus === 'Absent'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : currentStatus === 'Late'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : currentStatus === 'Excused'
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {currentStatus === 'Present' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {currentStatus === 'Absent' && <XCircle className="w-3.5 h-3.5" />}
                          {currentStatus === 'Late' && <Clock className="w-3.5 h-3.5" />}
                          {currentStatus === 'Excused' && <ShieldCheck className="w-3.5 h-3.5" />}
                          {currentStatus === 'Unmarked' && <AlertCircle className="w-3.5 h-3.5" />}
                          <span>{currentStatus}</span>
                        </span>
                      </td>

                      {/* Quick Attendance Toggle Buttons */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {/* Present Button */}
                          <button
                            id={`btn-present-${student.id}`}
                            onClick={() => handleSetAttendance(student, 'Present')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow'
                                : 'bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 border border-slate-700'
                            }`}
                            title="Mark Present"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          {/* Absent Button */}
                          <button
                            id={`btn-absent-${student.id}`}
                            onClick={() => handleSetAttendance(student, 'Absent')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white shadow'
                                : 'bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-rose-300 border border-slate-700'
                            }`}
                            title="Mark Absent"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>

                          {/* Late Button */}
                          <button
                            id={`btn-late-${student.id}`}
                            onClick={() => handleSetAttendance(student, 'Late')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              currentStatus === 'Late'
                                ? 'bg-amber-600 text-white shadow'
                                : 'bg-slate-800 hover:bg-amber-600/30 text-slate-300 hover:text-amber-300 border border-slate-700'
                            }`}
                            title="Mark Late Arrival"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Late</span>
                          </button>

                          {/* Excused Button */}
                          <button
                            id={`btn-excused-${student.id}`}
                            onClick={() => handleSetAttendance(student, 'Excused')}
                            className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Excused'
                                ? 'bg-purple-600 text-white shadow'
                                : 'bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 border border-slate-700'
                            }`}
                            title="Mark Excused Absence"
                          >
                            <span>Excused</span>
                          </button>
                        </div>
                      </td>

                      {/* Timestamp & Signer Details */}
                      <td className="px-4 py-3.5 text-right font-mono">
                        {record?.timestamp ? (
                          <div>
                            <span className="text-emerald-400 font-bold block text-xs">
                              {formattedTime}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[130px] ml-auto">
                              By: {record.recordedBy || 'Teacher'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs italic">Not logged</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};
