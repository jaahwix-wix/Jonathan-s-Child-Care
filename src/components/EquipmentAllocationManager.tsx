import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  Microscope,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Filter,
  Search,
  FileDown,
  Printer,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Trash2,
  Edit3,
  X,
  Layers,
  ChevronRight,
  MapPin,
  Flame,
  BatteryCharging,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { EquipmentAllocation, LabEquipment, ConflictCheckResult } from '../types';
import { LAB_TEACHERS_LIST, LAB_TIME_SLOTS, LAB_STATIONS_LIST } from '../data/mockData';
import { checkLabEquipmentConflict, getEquipmentDailyTimeline } from '../utils/labConflictDetector';
import { exportLabAllocationsPdf, exportEquipmentPassPdf } from '../utils/pdfExporter';

interface EquipmentAllocationManagerProps {
  equipment: LabEquipment[];
  allocations: EquipmentAllocation[];
  onAddAllocation: (allocation: EquipmentAllocation) => void;
  onUpdateAllocation: (allocation: EquipmentAllocation) => void;
  onDeleteAllocation: (allocationId: string) => void;
  searchQuery: string;
}

export const EquipmentAllocationManager: React.FC<EquipmentAllocationManagerProps> = ({
  equipment,
  allocations,
  onAddAllocation,
  onUpdateAllocation,
  onDeleteAllocation,
  searchQuery,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-21');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [activeViewMode, setActiveViewMode] = useState<'matrix' | 'cards' | 'timeline'>('matrix');

  // Modal State
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [editingAllocation, setEditingAllocation] = useState<EquipmentAllocation | null>(null);

  // Form Fields for New/Edit Allocation
  const [formTeacherName, setFormTeacherName] = useState<string>(LAB_TEACHERS_LIST[0].name);
  const [formEquipmentId, setFormEquipmentId] = useState<string>(equipment[0]?.id || 'LAB-EQ-01');
  const [formQuantity, setFormQuantity] = useState<number>(6);
  const [formDate, setFormDate] = useState<string>('2026-08-21');
  const [formTimeSlot, setFormTimeSlot] = useState<string>(LAB_TIME_SLOTS[0]);
  const [formLabStation, setFormLabStation] = useState<string>(LAB_STATIONS_LIST[0]);
  const [formSubject, setFormSubject] = useState<'Integrated Science' | 'Biology' | 'Chemistry' | 'Physics' | 'Mathematics'>('Physics');
  const [formTargetGrade, setFormTargetGrade] = useState<string>('JSS 2 (STEM Track)');
  const [formPurpose, setFormPurpose] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  // Selected teacher details helper
  const selectedTeacherObj = useMemo(() => {
    return LAB_TEACHERS_LIST.find((t) => t.name === formTeacherName) || LAB_TEACHERS_LIST[0];
  }, [formTeacherName]);

  const selectedEquipmentObj = useMemo(() => {
    return equipment.find((e) => e.id === formEquipmentId) || equipment[0];
  }, [equipment, formEquipmentId]);

  // Real-time conflict validation for current form inputs
  const liveConflictCheck: ConflictCheckResult = useMemo(() => {
    if (!formEquipmentId || !formTeacherName || !formDate || !formTimeSlot) {
      return {
        hasConflict: false,
        type: 'NONE',
        conflictMessage: '',
        conflictingAllocations: [],
        availableQuantity: 0,
        totalQuantity: 0,
      };
    }

    return checkLabEquipmentConflict({
      date: formDate,
      timeSlot: formTimeSlot,
      equipmentId: formEquipmentId,
      requestedQuantity: Number(formQuantity) || 1,
      teacherName: formTeacherName,
      labStation: formLabStation,
      allocations,
      equipmentList: equipment,
      excludeAllocationId: editingAllocation?.id,
    });
  }, [formDate, formTimeSlot, formEquipmentId, formQuantity, formTeacherName, formLabStation, allocations, equipment, editingAllocation]);

  // Open modal in Create mode
  const handleOpenCreateModal = (prefillSlot?: string, prefillEquipmentId?: string) => {
    setEditingAllocation(null);
    setFormTeacherName(LAB_TEACHERS_LIST[0].name);
    setFormEquipmentId(prefillEquipmentId || equipment[0]?.id || 'LAB-EQ-01');
    setFormQuantity(4);
    setFormDate(selectedDate);
    setFormTimeSlot(prefillSlot || LAB_TIME_SLOTS[0]);
    setFormLabStation(LAB_STATIONS_LIST[0]);
    setFormSubject('Physics');
    setFormTargetGrade('JSS 2 (STEM Track)');
    setFormPurpose('');
    setFormNotes('');
    setShowBookingModal(true);
  };

  // Open modal in Edit mode
  const handleOpenEditModal = (alloc: EquipmentAllocation) => {
    setEditingAllocation(alloc);
    setFormTeacherName(alloc.teacherName);
    setFormEquipmentId(alloc.equipmentId);
    setFormQuantity(alloc.quantityAllocated);
    setFormDate(alloc.date);
    setFormTimeSlot(alloc.timeSlot);
    setFormLabStation(alloc.labStation);
    setFormSubject(alloc.subject);
    setFormTargetGrade(alloc.targetGrade);
    setFormPurpose(alloc.purpose);
    setFormNotes(alloc.notes || '');
    setShowBookingModal(true);
  };

  // Save or update allocation
  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEquipmentId || !formTeacherName || !formPurpose.trim()) return;

    if (liveConflictCheck.hasConflict) {
      alert(`Cannot book: ${liveConflictCheck.conflictMessage}`);
      return;
    }

    const eq = equipment.find((item) => item.id === formEquipmentId);
    const teacher = LAB_TEACHERS_LIST.find((t) => t.name === formTeacherName);

    if (editingAllocation) {
      const updated: EquipmentAllocation = {
        ...editingAllocation,
        equipmentId: formEquipmentId,
        equipmentName: eq ? eq.name : editingAllocation.equipmentName,
        equipmentCategory: eq ? eq.category : editingAllocation.equipmentCategory,
        quantityAllocated: Number(formQuantity),
        teacherName: formTeacherName,
        teacherDepartment: teacher ? teacher.department : editingAllocation.teacherDepartment,
        teacherPhone: teacher ? teacher.phone : editingAllocation.teacherPhone,
        targetGrade: formTargetGrade,
        subject: formSubject,
        date: formDate,
        timeSlot: formTimeSlot,
        labStation: formLabStation,
        purpose: formPurpose,
        notes: formNotes,
      };
      onUpdateAllocation(updated);
    } else {
      const newAllocation: EquipmentAllocation = {
        id: `ALLOC-${String(allocations.length + 1).padStart(3, '0')}`,
        equipmentId: formEquipmentId,
        equipmentName: eq ? eq.name : 'Lab Apparatus',
        equipmentCategory: eq ? eq.category : 'Biology',
        quantityAllocated: Number(formQuantity),
        teacherName: formTeacherName,
        teacherDepartment: teacher ? teacher.department : 'STEM Faculty',
        teacherPhone: teacher ? teacher.phone : '+232 76 000 000',
        targetGrade: formTargetGrade,
        subject: formSubject,
        date: formDate,
        timeSlot: formTimeSlot,
        labStation: formLabStation,
        purpose: formPurpose,
        status: 'Confirmed',
        allocatedAt: new Date().toISOString().split('T')[0],
        approvedBy: 'Mr. Emmanuel Bio (Lab Supervisor)',
        notes: formNotes,
      };
      onAddAllocation(newAllocation);
    }

    setShowBookingModal(false);
  };

  // Toggle status between Confirmed -> In Use -> Completed
  const handleToggleStatus = (alloc: EquipmentAllocation) => {
    let nextStatus: EquipmentAllocation['status'] = 'In Use';
    if (alloc.status === 'Confirmed') nextStatus = 'In Use';
    else if (alloc.status === 'In Use') nextStatus = 'Completed';
    else nextStatus = 'Confirmed';

    onUpdateAllocation({
      ...alloc,
      status: nextStatus,
    });
  };

  // Filtered allocations for current view
  const filteredAllocations = useMemo(() => {
    return allocations.filter((a) => {
      const matchesSearch =
        a.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDate = activeViewMode === 'timeline' ? true : a.date === selectedDate;
      const matchesTeacher = selectedTeacherFilter === 'All' || a.teacherName === selectedTeacherFilter;
      const matchesCategory = selectedCategoryFilter === 'All' || a.equipmentCategory === selectedCategoryFilter;
      const matchesStatus = selectedStatusFilter === 'All' || a.status === selectedStatusFilter;

      return matchesSearch && matchesDate && matchesTeacher && matchesCategory && matchesStatus;
    });
  }, [allocations, searchQuery, selectedDate, selectedTeacherFilter, selectedCategoryFilter, selectedStatusFilter, activeViewMode]);

  // Overall conflict count across the whole system
  const systemConflictsCount = useMemo(() => {
    let count = 0;
    // Check all combinations
    allocations.forEach((a, i) => {
      const others = allocations.filter((_, idx) => idx !== i);
      const res = checkLabEquipmentConflict({
        date: a.date,
        timeSlot: a.timeSlot,
        equipmentId: a.equipmentId,
        requestedQuantity: a.quantityAllocated,
        teacherName: a.teacherName,
        labStation: a.labStation,
        allocations: others,
        equipmentList: equipment,
      });
      if (res.hasConflict) count++;
    });
    return Math.floor(count / 2); // Avoid double counting pairs
  }, [allocations, equipment]);

  // Total apparatus units checked out right now
  const totalUnitsInUse = useMemo(() => {
    return allocations
      .filter((a) => a.status === 'In Use')
      .reduce((sum, a) => sum + a.quantityAllocated, 0);
  }, [allocations]);

  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(allocations.map((a) => a.date)));
    if (!dates.includes('2026-08-21')) dates.push('2026-08-21');
    if (!dates.includes('2026-08-22')) dates.push('2026-08-22');
    if (!dates.includes('2026-08-23')) dates.push('2026-08-23');
    return dates.sort();
  }, [allocations]);

  return (
    <div className="space-y-6" id="equipment-allocation-manager">
      {/* Top Banner & Metric Summary */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/60 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Anti-Double-Booking Protection Active
              </span>
              {systemConflictsCount === 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  0 Schedule Collisions
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  {systemConflictsCount} Conflict(s) Detected
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Science Lab Resource Allocation & Teacher Scheduling
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl">
              Track apparatus distribution among science teachers, inspect live time-slot capacity, and prevent double-booking collisions for physics, chemistry, biology, and robotics practicals in Bo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-export-lab-schedule"
              onClick={() => exportLabAllocationsPdf(allocations)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
              title="Download official PDF report of all allocations"
            >
              <FileDown className="w-4 h-4 text-cyan-400" />
              <span>Export Schedule PDF</span>
            </button>

            <button
              id="btn-new-equipment-booking"
              onClick={() => handleOpenCreateModal()}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/40 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Allocate Apparatus</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Allocations</span>
            <span className="text-lg font-black text-cyan-300">{allocations.length} Bookings</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Apparatus In Active Use</span>
            <span className="text-lg font-black text-emerald-400">{totalUnitsInUse} Units</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned STEM Teachers</span>
            <span className="text-lg font-black text-amber-300">{LAB_TEACHERS_LIST.length} Instructors</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Lab Station Zones</span>
            <span className="text-lg font-black text-indigo-300">{LAB_STATIONS_LIST.length} Dedicated Benches</span>
          </div>
        </div>
      </div>

      {/* Controls: Date Picker, Filters & View Mode Selector */}
      <div className="bg-slate-900/95 border border-slate-800 p-4 rounded-2xl space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Lab Date:
            </span>
            {uniqueDates.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedDate === d
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveViewMode('matrix')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeViewMode === 'matrix' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Time-Slot Matrix
            </button>
            <button
              onClick={() => setActiveViewMode('cards')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeViewMode === 'cards' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Allocation Cards
            </button>
            <button
              onClick={() => setActiveViewMode('timeline')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeViewMode === 'timeline' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All-Dates Master Ledger
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 font-semibold">Teacher:</span>
            <select
              value={selectedTeacherFilter}
              onChange={(e) => setSelectedTeacherFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="All">All Teachers ({LAB_TEACHERS_LIST.length})</option>
              {LAB_TEACHERS_LIST.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} ({t.department.split('&')[0]})
                </option>
              ))}
            </select>

            <span className="text-slate-400 font-semibold ml-2">Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="All">All Apparatus</option>
              <option value="Biology">Biology</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
              <option value="STEM Robotics">STEM Robotics</option>
            </select>

            <span className="text-slate-400 font-semibold ml-2">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Use">In Use</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <span className="text-slate-400">
            Showing <strong className="text-cyan-400 font-bold">{filteredAllocations.length}</strong> active allocation records
          </span>
        </div>
      </div>

      {/* VIEW 1: Interactive Time-Slot Matrix (Anti-Double-Booking Timeline View) */}
      {activeViewMode === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Equipment Time-Slot Schedule & Capacity Radar — {selectedDate}
              </h3>
              <span className="text-xs text-slate-400">Click "+ Allocate" on any slot to assign apparatus</span>
            </div>

            <div className="space-y-4">
              {LAB_TIME_SLOTS.map((slot) => {
                const slotBookings = allocations.filter(
                  (a) => a.date === selectedDate && a.timeSlot === slot && a.status !== 'Completed'
                );

                return (
                  <div
                    key={slot}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 hover:border-slate-600 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/50 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs font-bold">
                          🕒 {slot}
                        </span>
                        <span className="text-xs text-slate-300 font-semibold">
                          {slotBookings.length === 0 ? (
                            <span className="text-emerald-400">● Laboratory Open & 100% Apparatus Available</span>
                          ) : (
                            <span className="text-cyan-300">
                              ● {slotBookings.length} Teacher(s) Scheduled • {slotBookings.reduce((sum, b) => sum + b.quantityAllocated, 0)} Units In Use
                            </span>
                          )}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenCreateModal(slot)}
                        className="px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-semibold transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Book Apparatus in this Slot
                      </button>
                    </div>

                    {/* Bookings within this slot */}
                    {slotBookings.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400 italic">
                        No equipment reserved for this slot. All optical benches, titration sets, and robotics kits are free.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                        {slotBookings.map((booking) => {
                          const eq = equipment.find((e) => e.id === booking.equipmentId);
                          const totalUnits = eq ? eq.quantity : 12;
                          const percent = Math.round((booking.quantityAllocated / totalUnits) * 100);

                          return (
                            <div
                              key={booking.id}
                              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/60 transition-all space-y-2.5 shadow-md flex flex-col justify-between"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-start justify-between gap-1">
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                    {booking.equipmentCategory}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                      booking.status === 'In Use'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                        : booking.status === 'Completed'
                                        ? 'bg-slate-700 text-slate-300'
                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    }`}
                                  >
                                    {booking.status}
                                  </span>
                                </div>

                                <h4 className="text-xs font-bold text-white leading-tight">
                                  {booking.equipmentName}
                                </h4>

                                <p className="text-[11px] text-cyan-300 font-semibold flex items-center gap-1.5">
                                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                                  {booking.teacherName} ({booking.teacherDepartment.split('&')[0]})
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  Grade: <strong>{booking.targetGrade}</strong> • Subj: {booking.subject}
                                </p>
                                <p className="text-[10px] text-slate-300 line-clamp-2 italic">
                                  "{booking.purpose}"
                                </p>
                              </div>

                              {/* Station & Quantity Meter */}
                              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="text-slate-400">Allocated Units:</span>
                                  <span className="font-extrabold text-white">
                                    {booking.quantityAllocated} of {totalUnits} ({percent}%)
                                  </span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-cyan-500 h-1.5 rounded-full"
                                    style={{ width: `${Math.min(100, percent)}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  📍 {booking.labStation}
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                                <button
                                  onClick={() => handleToggleStatus(booking)}
                                  className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
                                  title="Toggle status between Confirmed, In Use, and Completed"
                                >
                                  {booking.status === 'Confirmed'
                                    ? '▶ Check Out'
                                    : booking.status === 'In Use'
                                    ? '✓ Return & Release'
                                    : '↺ Re-open'}
                                </button>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => exportEquipmentPassPdf(booking)}
                                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                                    title="Print Teacher Equipment Pass"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditModal(booking)}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                                    title="Edit allocation"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove allocation for ${booking.teacherName}?`)) {
                                        onDeleteAllocation(booking.id);
                                      }
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                                    title="Cancel allocation"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Detailed Allocation Cards */}
      {activeViewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAllocations.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <Microscope className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No lab equipment allocations match the active filters.</p>
              <button
                onClick={() => {
                  setSelectedTeacherFilter('All');
                  setSelectedCategoryFilter('All');
                  setSelectedStatusFilter('All');
                }}
                className="text-xs text-cyan-400 underline font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredAllocations.map((alloc) => {
              const eq = equipment.find((e) => e.id === alloc.equipmentId);
              return (
                <div
                  key={alloc.id}
                  className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-400 font-bold">{alloc.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          alloc.status === 'In Use'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : alloc.status === 'Completed'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {alloc.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{alloc.equipmentName}</h3>

                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1.5 text-xs text-slate-300">
                      <p className="font-semibold text-cyan-300 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                        {alloc.teacherName}
                      </p>
                      <p className="text-slate-400 text-[11px]">Dept: {alloc.teacherDepartment}</p>
                      <p className="text-slate-400 text-[11px]">Contact: {alloc.teacherPhone}</p>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1 pt-1">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <strong>{alloc.date}</strong> ({alloc.timeSlot})
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {alloc.labStation}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        <strong>Target:</strong> {alloc.targetGrade} • <strong>Subject:</strong> {alloc.subject}
                      </p>
                      <p className="text-slate-300 text-xs bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-slate-400 font-semibold">Practical:</span> {alloc.purpose}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Allocated Units:</span>
                      <span className="font-bold text-white text-sm">
                        {alloc.quantityAllocated} Units ({eq ? `${eq.quantity} Total in Stock` : ''})
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => handleToggleStatus(alloc)}
                        className="flex-1 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-semibold transition-all"
                      >
                        {alloc.status === 'Confirmed'
                          ? 'Check Out'
                          : alloc.status === 'In Use'
                          ? 'Release Equipment'
                          : 'Re-activate'}
                      </button>

                      <button
                        onClick={() => exportEquipmentPassPdf(alloc)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1"
                        title="Download Pass"
                      >
                        <Printer className="w-3.5 h-3.5 text-cyan-400" /> Pass
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(alloc)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete allocation ${alloc.id}?`)) onDeleteAllocation(alloc.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 3: Master All-Dates Ledger Table */}
      {activeViewMode === 'timeline' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Complete Master Laboratory Allocation Ledger
            </h3>
            <span className="text-xs text-slate-400">Total {filteredAllocations.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Date & Slot</th>
                  <th className="p-3">Teacher / Dept</th>
                  <th className="p-3">Apparatus & Category</th>
                  <th className="p-3 text-center">Units</th>
                  <th className="p-3">Station</th>
                  <th className="p-3">Class & Purpose</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAllocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-cyan-400">{alloc.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{alloc.date}</div>
                      <div className="text-[11px] text-slate-400">{alloc.timeSlot}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-white">{alloc.teacherName}</div>
                      <div className="text-[10px] text-slate-400">{alloc.teacherDepartment}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{alloc.equipmentName}</div>
                      <span className="text-[10px] uppercase font-bold text-cyan-300">{alloc.equipmentCategory}</span>
                    </td>
                    <td className="p-3 text-center font-bold text-white">{alloc.quantityAllocated}</td>
                    <td className="p-3 text-slate-300 text-[11px] max-w-[150px] truncate">{alloc.labStation}</td>
                    <td className="p-3 max-w-[200px]">
                      <div className="font-semibold text-white">{alloc.targetGrade}</div>
                      <div className="text-[11px] text-slate-400 truncate">{alloc.purpose}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          alloc.status === 'In Use'
                            ? 'bg-amber-500/20 text-amber-300'
                            : alloc.status === 'Completed'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {alloc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => exportEquipmentPassPdf(alloc)}
                          className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                          title="Print Pass"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(alloc)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove allocation ${alloc.id}?`)) onDeleteAllocation(alloc.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ALLOCATION / BOOKING MODAL WITH REAL-TIME CONFLICT SCANNER */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-cyan-800/80 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                  <Microscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingAllocation ? `Edit Lab Allocation (${editingAllocation.id})` : 'Allocate Lab Apparatus to Teacher'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time conflict scanner checks teacher overlap and equipment availability
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* REAL-TIME CONFLICT ALERT / SUCCESS BANNER */}
            {liveConflictCheck.hasConflict ? (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-600/80 text-xs space-y-2 text-rose-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-white block">Double-Booking Collision Detected!</strong>
                    <span>{liveConflictCheck.conflictMessage}</span>
                  </div>
                </div>

                {liveConflictCheck.suggestedAlternativeSlots && liveConflictCheck.suggestedAlternativeSlots.length > 0 && (
                  <div className="pt-2 border-t border-rose-900/60">
                    <span className="text-[11px] font-bold text-cyan-300 block mb-1">
                      💡 Suggested 100% Conflict-Free Time Slots:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {liveConflictCheck.suggestedAlternativeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setFormTimeSlot(slot)}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-cyan-700 text-cyan-200 text-[11px] font-semibold border border-cyan-700/60 transition-all flex items-center gap-1"
                        >
                          <span>🕒 {slot}</span>
                          <span className="text-[9px] text-emerald-400 font-bold">(Free)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-700/60 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Schedule Validated:</strong> Apparatus and teacher slot are available with zero collisions.
                </span>
              </div>
            )}

            <form onSubmit={handleSaveAllocation} className="space-y-4 text-xs">
              {/* Teacher Selector */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Assigning Teacher / Instructor
                </label>
                <select
                  value={formTeacherName}
                  onChange={(e) => setFormTeacherName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {LAB_TEACHERS_LIST.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} — {t.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipment & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Equipment / Apparatus To Allocate
                  </label>
                  <select
                    value={formEquipmentId}
                    onChange={(e) => setFormEquipmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} ({eq.quantity} Total In Lab - {eq.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Units Needed
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedEquipmentObj?.quantity || 50}
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Lab Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Time Slot</label>
                  <select
                    value={formTimeSlot}
                    onChange={(e) => setFormTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {LAB_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Station Location */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Assigned Lab Station / Bench Location
                </label>
                <select
                  value={formLabStation}
                  onChange={(e) => setFormLabStation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {LAB_STATIONS_LIST.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject & Target Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Subject</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Integrated Science">Integrated Science</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Class Grade</label>
                  <select
                    value={formTargetGrade}
                    onChange={(e) => setFormTargetGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Class 5 STEM">Class 5 STEM</option>
                    <option value="Class 6">Class 6 (Primary STEM)</option>
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2 (STEM Track)">JSS 2 (STEM Track)</option>
                    <option value="JSS 3">JSS 3</option>
                    <option value="SSS 1 (Science)">SSS 1 (Science)</option>
                    <option value="SSS 2 (STEM Science)">SSS 2 (STEM Science)</option>
                    <option value="SSS 3 (WASSCE Prep)">SSS 3 (WASSCE Prep)</option>
                  </select>
                </div>
              </div>

              {/* Purpose & Practical Description */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Practical Purpose / Experiment Topic
                </label>
                <input
                  type="text"
                  required
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="e.g. Acid-Base Titration & pH Measurement Assessment"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Safety Notes */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Preparation & Calibration Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Safety goggles required; reagents prepared by lab technician."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={liveConflictCheck.hasConflict}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {editingAllocation ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Update Schedule</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Confirm Apparatus Allocation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
