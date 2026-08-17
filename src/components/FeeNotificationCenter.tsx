import React, { useState, useMemo } from 'react';
import {
  Bell,
  Send,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  Printer,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  X,
  FileDown,
  ShieldAlert,
  Calendar,
  Check,
  ChevronRight,
  Info,
  UserCheck,
} from 'lucide-react';
import {
  Student,
  FeeNotification,
  NotificationChannel,
  NotificationUrgency,
  NotificationDeliveryStatus,
  SchoolTier,
} from '../types';

interface FeeNotificationCenterProps {
  students: Student[];
  notifications: FeeNotification[];
  onAddNotification: (notif: FeeNotification) => void;
  onUpdateNotification: (notif: FeeNotification) => void;
  onDeleteNotification: (id: string) => void;
  onBatchDispatch: (urgencyFilter?: NotificationUrgency) => void;
  onNavigateToStudent?: (studentId: string) => void;
}

export const FeeNotificationCenter: React.FC<FeeNotificationCenterProps> = ({
  students,
  notifications,
  onAddNotification,
  onUpdateNotification,
  onDeleteNotification,
  onBatchDispatch,
  onNavigateToStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<FeeNotification | null>(null);
  const [previewNotification, setPreviewNotification] = useState<FeeNotification | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state for creating / editing notification
  const [formStudentId, setFormStudentId] = useState<string>(students[0]?.id || '');
  const [formInstallmentTitle, setFormInstallmentTitle] = useState('2nd Installment (Mid-Term Balance)');
  const [formAmountDue, setFormAmountDue] = useState<number>(800);
  const [formDueDate, setFormDueDate] = useState('2026-08-25');
  const [formUrgency, setFormUrgency] = useState<NotificationUrgency>('Due Imminent (Within 7 Days)');
  const [formChannel, setFormChannel] = useState<NotificationChannel>('SMS / Mobile Network (+232 Sierra Leone)');
  const [formStatus, setFormStatus] = useState<NotificationDeliveryStatus>('Scheduled');
  const [formCustomMessage, setFormCustomMessage] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Selected student in form
  const selectedFormStudent = useMemo(() => {
    return students.find((s) => s.id === formStudentId) || students[0];
  }, [students, formStudentId]);

  // Auto-generate default message text when student or urgency changes
  const generateSuggestedMessage = (student: Student, urgency: NotificationUrgency, amount: number, dueDate: string) => {
    const guardian = student.guardianName || 'Guardian';
    const studentName = student.name;
    const tier = student.schoolTier;

    if (urgency.includes('Overdue')) {
      return `[URGENT] JCC BURSARY OVERDUE NOTICE: Dear ${guardian}, please note that ${studentName} (${student.gradeLevel}) has an overdue fee installment of NLe ${amount.toLocaleString()} that was due on ${dueDate}. Please contact the Bursary Desk or Head Teacher urgently.`;
    }
    if (urgency.includes('Within 7 Days')) {
      return `JCC BURSARY PAYMENT REMINDER: Dear ${guardian}, this is an automated reminder that ${studentName} (${student.gradeLevel}) fee installment of NLe ${amount.toLocaleString()} is due in 7 days (${dueDate}). You may pay via Orange Money, Afrimoney, or at the campus bursary office.`;
    }
    if (urgency.includes('Partial')) {
      return `JCC BURSARY BALANCE UPDATE: Dear ${guardian}, we acknowledge your partial payment for ${studentName}. The remaining installment balance of NLe ${amount.toLocaleString()} is scheduled for ${dueDate}. Thank you for your partnership.`;
    }
    return `JCC NOTIFICATION: Dear ${guardian}, upcoming ${tier} school term installment of NLe ${amount.toLocaleString()} for ${studentName} is due on ${dueDate}.`;
  };

  // Open modal for new notification
  const handleOpenAddModal = (prefilledStudent?: Student) => {
    const stu = prefilledStudent || students[0];
    setFormStudentId(stu.id);
    const pendingIns = stu.installments?.find((i) => i.status !== 'Paid');
    const amount = pendingIns ? (pendingIns.amountDue - pendingIns.amountPaid) : stu.remainingBalance || 600;
    const due = pendingIns?.dueDate || '2026-08-25';
    
    setFormInstallmentTitle(pendingIns?.title || 'Term Tuition Installment');
    setFormAmountDue(amount);
    setFormDueDate(due);
    setFormUrgency('Due Imminent (Within 7 Days)');
    setFormChannel('SMS / Mobile Network (+232 Sierra Leone)');
    setFormStatus('Scheduled');
    setFormCustomMessage(generateSuggestedMessage(stu, 'Due Imminent (Within 7 Days)', amount, due));
    setFormNotes('Manual alert created by Bursar / Admin');
    setShowAddModal(true);
  };

  // Open modal to edit existing notification
  const handleOpenEditModal = (notif: FeeNotification) => {
    setEditingNotification(notif);
    setFormStudentId(notif.studentId);
    setFormInstallmentTitle(notif.installmentTitle);
    setFormAmountDue(notif.amountDue);
    setFormDueDate(notif.dueDate);
    setFormUrgency(notif.urgency);
    setFormChannel(notif.channel);
    setFormStatus(notif.status);
    setFormCustomMessage(notif.messageText);
    setFormNotes(notif.notes || '');
  };

  // Submit Add
  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormStudent) return;

    const newNotif: FeeNotification = {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      studentId: selectedFormStudent.id,
      studentName: selectedFormStudent.name,
      guardianName: selectedFormStudent.guardianName,
      guardianPhone: selectedFormStudent.guardianPhone,
      schoolTier: selectedFormStudent.schoolTier,
      gradeLevel: selectedFormStudent.gradeLevel,
      installmentTitle: formInstallmentTitle,
      amountDue: Number(formAmountDue),
      dueDate: formDueDate,
      daysRemaining: Math.ceil((new Date(formDueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
      urgency: formUrgency,
      channel: formChannel,
      status: formStatus,
      sentDate: formStatus === 'Delivered' ? new Date().toISOString().split('T')[0] : undefined,
      messageText: formCustomMessage || generateSuggestedMessage(selectedFormStudent, formUrgency, formAmountDue, formDueDate),
      automatedTrigger: false,
      notes: formNotes,
    };

    onAddNotification(newNotif);
    setShowAddModal(false);
    showToast(`Payment alert created for ${newNotif.guardianName} (${newNotif.studentName})`);
  };

  // Submit Update
  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotification || !selectedFormStudent) return;

    const updated: FeeNotification = {
      ...editingNotification,
      studentId: selectedFormStudent.id,
      studentName: selectedFormStudent.name,
      guardianName: selectedFormStudent.guardianName,
      guardianPhone: selectedFormStudent.guardianPhone,
      schoolTier: selectedFormStudent.schoolTier,
      gradeLevel: selectedFormStudent.gradeLevel,
      installmentTitle: formInstallmentTitle,
      amountDue: Number(formAmountDue),
      dueDate: formDueDate,
      daysRemaining: Math.ceil((new Date(formDueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
      urgency: formUrgency,
      channel: formChannel,
      status: formStatus,
      sentDate: formStatus === 'Delivered' && !editingNotification.sentDate ? new Date().toISOString().split('T')[0] : editingNotification.sentDate,
      messageText: formCustomMessage,
      notes: formNotes,
    };

    onUpdateNotification(updated);
    setEditingNotification(null);
    showToast(`Payment notification #${updated.id} successfully updated.`);
  };

  // Delete handler
  const handleConfirmDelete = (id: string) => {
    onDeleteNotification(id);
    setDeleteConfirmId(null);
    showToast(`Notification #${id} deleted.`);
  };

  // Quick Dispatch single alert
  const handleQuickDispatch = (notif: FeeNotification) => {
    const updated: FeeNotification = {
      ...notif,
      status: 'Delivered',
      sentDate: new Date().toISOString().split('T')[0],
      notes: (notif.notes ? notif.notes + ' • ' : '') + `Dispatched via ${notif.channel} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
    onUpdateNotification(updated);
    showToast(`Alert #${notif.id} dispatched via ${notif.channel} to ${notif.guardianPhone}`);
  };

  // Automated Scanner Trigger
  const handleRunAutomatedScan = () => {
    let newCreatedCount = 0;
    const today = new Date();

    students.forEach((stu) => {
      if (stu.remainingBalance > 0 && stu.installments) {
        stu.installments.forEach((ins) => {
          if (ins.status !== 'Paid') {
            const dueDateObj = new Date(ins.dueDate);
            const diffTime = dueDateObj.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

            // Check if notification already exists for this installment
            const existing = notifications.find(
              (n) => n.studentId === stu.id && (n.installmentId === ins.id || n.installmentTitle === ins.title)
            );

            if (!existing) {
              const urgency: NotificationUrgency =
                diffDays < 0
                  ? 'Overdue Notice (Immediate Action)'
                  : diffDays <= 7
                  ? 'Due Imminent (Within 7 Days)'
                  : 'Upcoming Mid-Term Deadline (14-30 Days)';

              const balanceDue = ins.amountDue - ins.amountPaid;

              const autoNotif: FeeNotification = {
                id: `AUTO-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`,
                studentId: stu.id,
                studentName: stu.name,
                guardianName: stu.guardianName,
                guardianPhone: stu.guardianPhone,
                schoolTier: stu.schoolTier,
                gradeLevel: stu.gradeLevel,
                installmentId: ins.id,
                installmentTitle: ins.title,
                amountDue: balanceDue > 0 ? balanceDue : ins.amountDue,
                dueDate: ins.dueDate,
                daysRemaining: diffDays,
                urgency,
                channel: 'SMS / Mobile Network (+232 Sierra Leone)',
                status: 'Scheduled',
                automatedTrigger: true,
                messageText: generateSuggestedMessage(stu, urgency, balanceDue, ins.dueDate),
                notes: `Auto-generated from ${ins.title} installment ledger scan.`,
              };

              onAddNotification(autoNotif);
              newCreatedCount++;
            }
          }
        });
      }
    });

    showToast(`Automated Scan Complete: ${newCreatedCount} new fee reminder alerts generated.`);
  };

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch =
        n.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.guardianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.guardianPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.installmentTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUrgency =
        urgencyFilter === 'All' ||
        (urgencyFilter === 'Overdue' && n.urgency.includes('Overdue')) ||
        (urgencyFilter === 'Imminent' && n.urgency.includes('Within 7 Days')) ||
        (urgencyFilter === 'Upcoming' && n.urgency.includes('Upcoming')) ||
        (urgencyFilter === 'Partial' && n.urgency.includes('Partial'));

      const matchesTier = tierFilter === 'All' || n.schoolTier === tierFilter;
      const matchesStatus = statusFilter === 'All' || n.status === statusFilter;

      return matchesSearch && matchesUrgency && matchesTier && matchesStatus;
    });
  }, [notifications, searchQuery, urgencyFilter, tierFilter, statusFilter]);

  // Statistics
  const overdueCount = notifications.filter((n) => n.urgency.includes('Overdue')).length;
  const imminentCount = notifications.filter((n) => n.urgency.includes('Within 7 Days')).length;
  const upcomingCount = notifications.filter((n) => n.urgency.includes('Upcoming')).length;
  const deliveredCount = notifications.filter((n) => n.status === 'Delivered').length;
  const pendingCount = notifications.filter((n) => n.status === 'Scheduled' || n.status === 'Pending Dispatch').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce text-xs font-bold border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Bell className="w-4 h-4 text-amber-400 animate-pulse" />
            Automated Guardian Fee Alert & Installment Reminder Engine
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            Fee Payment Notification System
          </h3>
          <p className="text-xs text-slate-400">
            Automated multi-channel alerts (SMS, WhatsApp, Print Notice) for upcoming installment deadlines and overdue term balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunAutomatedScan}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/40 text-xs font-bold shadow-md transition-all flex items-center gap-2"
            title="Scan student installments and generate reminders"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Scan & Auto-Sync Due Dates</span>
          </button>

          <button
            onClick={() => {
              onBatchDispatch();
              showToast('Batch Dispatch: All pending imminent & overdue alerts transmitted.');
            }}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-slate-950" />
            <span>1-Click Dispatch All Due Alerts</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Alert</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-rose-900/40 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Overdue Alerts
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-rose-400">{overdueCount}</span>
            <span className="text-[11px] text-slate-500">Immediate</span>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-900/40 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Due in ≤ 7 Days
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-amber-400">{imminentCount}</span>
            <span className="text-[11px] text-slate-500">Imminent</span>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-cyan-900/40 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> 14-30 Day Upcoming
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-cyan-400">{upcomingCount}</span>
            <span className="text-[11px] text-slate-500">Mid-Term</span>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-900/40 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Delivered Notices
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-emerald-400">{deliveredCount}</span>
            <span className="text-[11px] text-slate-500">Logged</span>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Send className="w-3.5 h-3.5 text-slate-400" /> Queue Scheduled
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-white">{pendingCount}</span>
            <span className="text-[11px] text-amber-400 font-bold">Pending</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, guardian, phone (+232)..."
            className="w-full bg-transparent border-none text-white focus:outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Urgency Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {['All', 'Overdue', 'Imminent', 'Upcoming'].map((urg) => (
              <button
                key={urg}
                onClick={() => setUrgencyFilter(urg)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  urgencyFilter === urg
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {urg}
              </button>
            ))}
          </div>

          {/* School Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg focus:outline-none"
          >
            <option value="All">All School Tiers</option>
            <option value="Nursery">Nursery School</option>
            <option value="Primary">Primary School</option>
            <option value="Secondary">Secondary School</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg focus:outline-none"
          >
            <option value="All">All Delivery Statuses</option>
            <option value="Scheduled">Scheduled / Queue</option>
            <option value="Delivered">Delivered & Logged</option>
            <option value="Pending Dispatch">Pending Dispatch</option>
          </select>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Alert ID / Status</th>
              <th className="px-4 py-3">Student & Grade</th>
              <th className="px-4 py-3">Guardian Recipient</th>
              <th className="px-4 py-3">Installment & Amount Due</th>
              <th className="px-4 py-3">Due Date & Timeline</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredNotifications.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No payment notifications match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredNotifications.map((notif) => {
                const isOverdue = notif.daysRemaining < 0;
                const isImminent = notif.daysRemaining >= 0 && notif.daysRemaining <= 7;

                return (
                  <tr key={notif.id} className="hover:bg-slate-900/50 transition-colors">
                    {/* Alert ID & Status */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-amber-400">{notif.id}</span>
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              notif.status === 'Delivered'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : notif.status === 'Scheduled'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {notif.status === 'Delivered' && <Check className="w-3 h-3 text-emerald-400" />}
                            {notif.status}
                          </span>
                        </div>
                        {notif.automatedTrigger && (
                          <span className="text-[9px] text-slate-500 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> Auto-Triggered
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Student & Grade */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{notif.studentName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {notif.schoolTier} • {notif.gradeLevel}
                      </span>
                    </td>

                    {/* Guardian Recipient */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-200">{notif.guardianName}</div>
                      <div className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-cyan-400" /> {notif.guardianPhone}
                      </div>
                    </td>

                    {/* Installment & Amount Due */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-300">{notif.installmentTitle}</div>
                      <div className="text-sm font-black text-amber-400">NLe {notif.amountDue.toLocaleString()}</div>
                    </td>

                    {/* Due Date & Timeline */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">{notif.dueDate}</div>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold mt-0.5 ${
                          isOverdue
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isImminent
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isOverdue
                          ? `${Math.abs(notif.daysRemaining)} Days Overdue`
                          : notif.daysRemaining === 0
                          ? 'Due Today'
                          : `${notif.daysRemaining} Days Left`}
                      </span>
                    </td>

                    {/* Channel */}
                    <td className="px-4 py-3.5">
                      <div className="text-[11px] text-slate-300 flex items-center gap-1">
                        {notif.channel.includes('SMS') && <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />}
                        {notif.channel.includes('WhatsApp') && <Phone className="w-3.5 h-3.5 text-emerald-400" />}
                        {notif.channel.includes('Print') && <Printer className="w-3.5 h-3.5 text-amber-400" />}
                        {notif.channel.includes('Email') && <Mail className="w-3.5 h-3.5 text-purple-400" />}
                        <span className="truncate max-w-[120px]">{notif.channel.split('(')[0]}</span>
                      </div>
                    </td>

                    {/* Admin Actions */}
                    <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                      {/* Preview / Read */}
                      <button
                        onClick={() => setPreviewNotification(notif)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Preview Full Notification Message"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      </button>

                      {/* Quick Dispatch */}
                      {notif.status !== 'Delivered' && (
                        <button
                          onClick={() => handleQuickDispatch(notif)}
                          className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
                          title="Dispatch Immediately"
                        >
                          <Send className="w-3.5 h-3.5 text-slate-950" />
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEditModal(notif)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                        title="Edit Alert Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirmId(notif.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD / CREATE CUSTOM NOTIFICATION */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Create Guardian Fee Alert
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotification} className="space-y-4 text-xs">
              {/* Select Student */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Student</label>
                <select
                  value={formStudentId}
                  onChange={(e) => {
                    const sid = e.target.value;
                    setFormStudentId(sid);
                    const stu = students.find((s) => s.id === sid);
                    if (stu) {
                      const amount = stu.remainingBalance || 600;
                      setFormCustomMessage(generateSuggestedMessage(stu, formUrgency, amount, formDueDate));
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.schoolTier} - {s.gradeLevel}) • Guardian: {s.guardianName} ({s.guardianPhone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Installment Title & Amount Due */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Installment Category</label>
                  <input
                    type="text"
                    required
                    value={formInstallmentTitle}
                    onChange={(e) => setFormInstallmentTitle(e.target.value)}
                    placeholder="e.g. 2nd Installment (Mid-Term)"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Amount Due (NLe)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formAmountDue}
                    onChange={(e) => {
                      const amt = Number(e.target.value);
                      setFormAmountDue(amt);
                      if (selectedFormStudent) {
                        setFormCustomMessage(generateSuggestedMessage(selectedFormStudent, formUrgency, amt, formDueDate));
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Due Date & Urgency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Installment Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => {
                      const d = e.target.value;
                      setFormDueDate(d);
                      if (selectedFormStudent) {
                        setFormCustomMessage(generateSuggestedMessage(selectedFormStudent, formUrgency, formAmountDue, d));
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Urgency Classification</label>
                  <select
                    value={formUrgency}
                    onChange={(e) => {
                      const u = e.target.value as NotificationUrgency;
                      setFormUrgency(u);
                      if (selectedFormStudent) {
                        setFormCustomMessage(generateSuggestedMessage(selectedFormStudent, u, formAmountDue, formDueDate));
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Due Imminent (Within 7 Days)">Due Imminent (Within 7 Days)</option>
                    <option value="Overdue Notice (Immediate Action)">Overdue Notice (Immediate Action)</option>
                    <option value="Upcoming Mid-Term Deadline (14-30 Days)">Upcoming Mid-Term Deadline (14-30 Days)</option>
                    <option value="Partial Payment Balance Reminder">Partial Payment Balance Reminder</option>
                  </select>
                </div>
              </div>

              {/* Channel & Initial Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Dispatch Channel</label>
                  <select
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value as NotificationChannel)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="SMS / Mobile Network (+232 Sierra Leone)">SMS / Mobile Network (+232)</option>
                    <option value="WhatsApp Guardian Direct">WhatsApp Guardian Direct</option>
                    <option value="Official Printed Installment Notice">Official Printed Notice</option>
                    <option value="School Email Alert">School Email Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as NotificationDeliveryStatus)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Scheduled">Scheduled (In Queue)</option>
                    <option value="Delivered">Delivered Immediately</option>
                    <option value="Pending Dispatch">Pending Dispatch</option>
                  </select>
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-300">Alert Message Body</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedFormStudent) {
                        setFormCustomMessage(generateSuggestedMessage(selectedFormStudent, formUrgency, formAmountDue, formDueDate));
                      }
                    }}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Re-generate Template
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={formCustomMessage}
                  onChange={(e) => setFormCustomMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Internal Notes</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Optional caseworker or bursar notes..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save & Schedule Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT NOTIFICATION */}
      {/* ======================================================== */}
      {editingNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" /> Edit Payment Alert #{editingNotification.id}
              </h3>
              <button onClick={() => setEditingNotification(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Student</label>
                  <input
                    type="text"
                    disabled
                    value={`${editingNotification.studentName} (${editingNotification.gradeLevel})`}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Guardian & Contact</label>
                  <input
                    type="text"
                    disabled
                    value={`${editingNotification.guardianName} (${editingNotification.guardianPhone})`}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Installment Category</label>
                  <input
                    type="text"
                    required
                    value={formInstallmentTitle}
                    onChange={(e) => setFormInstallmentTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Amount Due (NLe)</label>
                  <input
                    type="number"
                    required
                    value={formAmountDue}
                    onChange={(e) => setFormAmountDue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Channel</label>
                  <select
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value as NotificationChannel)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="SMS / Mobile Network (+232 Sierra Leone)">SMS (+232)</option>
                    <option value="WhatsApp Guardian Direct">WhatsApp Direct</option>
                    <option value="Official Printed Installment Notice">Printed Notice</option>
                    <option value="School Email Alert">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as NotificationDeliveryStatus)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Pending Dispatch">Pending Dispatch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Message Content</label>
                <textarea
                  rows={3}
                  value={formCustomMessage}
                  onChange={(e) => setFormCustomMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Caseworker / Audit Notes</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingNotification(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PREVIEW NOTIFICATION DISPATCH */}
      {/* ======================================================== */}
      {previewNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                Notification Preview #{previewNotification.id}
              </h3>
              <button onClick={() => setPreviewNotification(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-bold text-white">
                  {previewNotification.guardianName} ({previewNotification.guardianPhone})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pupil:</span>
                <span className="font-semibold text-emerald-400">
                  {previewNotification.studentName} ({previewNotification.schoolTier} - {previewNotification.gradeLevel})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Installment:</span>
                <span className="font-bold text-amber-400">
                  NLe {previewNotification.amountDue.toLocaleString()} (Due: {previewNotification.dueDate})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Channel:</span>
                <span className="font-medium text-cyan-300">{previewNotification.channel}</span>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block mb-1">Message Preview:</span>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-slate-200 font-mono text-[11px] leading-relaxed">
                  {previewNotification.messageText}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewNotification(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Close Preview
              </button>
              {previewNotification.status !== 'Delivered' && (
                <button
                  onClick={() => {
                    handleQuickDispatch(previewNotification);
                    setPreviewNotification(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-slate-950" />
                  <span>Dispatch Now</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ======================================================== */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Delete Alert Notice</h4>
                <p className="text-xs text-slate-400">Are you sure you want to delete notification #{deleteConfirmId}?</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              This action will remove the notification record from the automated queue and audit ledger.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
