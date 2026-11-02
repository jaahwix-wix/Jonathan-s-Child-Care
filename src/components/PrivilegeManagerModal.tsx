import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Users,
  Key,
  FileText,
  AlertTriangle,
  X,
  ExternalLink,
  RefreshCw,
  Building,
  GraduationCap,
  Heart,
  Microscope,
  Trophy,
  Database,
  Bot,
  Sliders,
  Eye,
  Activity,
} from 'lucide-react';
import { UserSession, UserRole, ThemeMode, SecurityAuditEntry } from '../types';
import {
  INSTITUTIONAL_USERS,
  CAPABILITY_MATRIX_ROWS,
  getSecurityAuditLogs,
  logSecurityAudit,
  hasPermission,
} from '../services/authService';

interface PrivilegeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onSwitchUser?: (user: UserSession) => void;
  themeMode: ThemeMode;
}

export const PrivilegeManagerModal: React.FC<PrivilegeManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  themeMode,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'audit' | 'tester'>('matrix');
  const [auditLogs, setAuditLogs] = useState<SecurityAuditEntry[]>(() => getSecurityAuditLogs());
  const [testResult, setTestResult] = useState<{ action: string; allowed: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestChallenge = (challengeAction: 'delete_student' | 'register_student' | 'register_teacher' | 'view_medical' | 'database_ddl' | 'submit_match') => {
    let allowed = false;
    let required = '';
    let message = '';

    const isAdmin =
      currentUser.role === 'Director / Administrator' ||
      currentUser.email === 'jaahwix@gmail.com' ||
      currentUser.permissions.includes('system:full_control');

    if (challengeAction === 'register_teacher') {
      allowed = isAdmin && hasPermission(currentUser, 'teachers:create');
      required = 'Administrator Clearance (Exclusive Authority)';
      message = allowed
        ? `Access Granted: ${currentUser.name} is the verified Administrator authorized to register faculty & teachers.`
        : `Access Denied: ${currentUser.name} (${currentUser.role}) cannot register teachers. Only the Administrator is authorized.`;
    } else if (challengeAction === 'register_student') {
      allowed = isAdmin && hasPermission(currentUser, 'students:create');
      required = 'Administrator Clearance (Exclusive Authority)';
      message = allowed
        ? `Access Granted: ${currentUser.name} is the verified Administrator authorized to register students.`
        : `Access Denied: ${currentUser.name} (${currentUser.role}) cannot register students. Only the Administrator is authorized.`;
    } else if (challengeAction === 'delete_student') {
      allowed = hasPermission(currentUser, 'students:delete');
      required = 'students:delete (Head Teacher or Director)';
      message = allowed
        ? `Access Granted: ${currentUser.name} holds student deletion clearance.`
        : `Access Denied: ${currentUser.name} (${currentUser.role}) cannot delete academic student files.`;
    } else if (challengeAction === 'view_medical') {
      allowed = hasPermission(currentUser, 'orphans:confidential_notes');
      required = 'orphans:confidential_notes (Welfare Officer or Director)';
      message = allowed
        ? `Access Granted: Medical and trauma documentation unredacted.`
        : `Access Denied: Confidential child welfare files are restricted to Social Welfare Officers.`;
    } else if (challengeAction === 'database_ddl') {
      allowed = hasPermission(currentUser, 'database:manage_supabase');
      required = 'database:manage_supabase (Executive Board Level 4)';
      message = allowed
        ? `Access Granted: Cloud Supabase PostgreSQL migration console unlocked.`
        : `Access Denied: Schema migrations restricted to Director / Administrator.`;
    } else if (challengeAction === 'submit_match') {
      allowed = hasPermission(currentUser, 'football:log_matches');
      required = 'football:log_matches (JCC FC Coach or Director)';
      message = allowed
        ? `Access Granted: Match result scoreline logger authorized.`
        : `Access Denied: Football competition reporting reserved for JCC FC Coaching staff.`;
    }

    const auditEntry = logSecurityAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action: `Privilege Challenge: ${challengeAction}`,
      module: 'overview',
      status: allowed ? 'Authorized' : 'Denied',
      details: `${message} (Required: ${required})`,
    });

    setAuditLogs((prev) => [auditEntry, ...prev]);
    setTestResult({ action: challengeAction, allowed, message });
  };

  const isLight = themeMode === 'academic-light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">Authorization & Privilege Center</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                  RBAC Active
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Role-Based Access Control, Institutional Clearance & Permission Matrix for Bo District Hub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Operator Banner */}
        <div
          className={`px-5 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isLight ? 'bg-emerald-50/70 border-emerald-100 text-emerald-950' : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-xs shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{currentUser.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${currentUser.badgeColor}`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                {currentUser.department} • <span className="font-mono">{currentUser.clearanceLevel}</span>
              </p>
            </div>
          </div>
          <div className="text-right flex items-center sm:block gap-2 justify-between">
            <div className="text-[11px] font-mono text-emerald-800">
              Session ID: <span className="font-bold">{currentUser.id}</span>
            </div>
            <div className="text-[10px] text-emerald-600">
              Granted Permissions: {currentUser.permissions.length} Active
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex border-b px-5 pt-2 gap-2 text-xs font-semibold overflow-x-auto shrink-0 ${
            isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-950/40'
          }`}
        >
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'border-emerald-500 text-emerald-600'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" /> Capabilities Matrix
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tester'
                ? 'border-emerald-500 text-emerald-600'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" /> Privilege Simulator
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-emerald-500 text-emerald-600'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Security Audit Log ({auditLogs.length})
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: CAPABILITIES MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm">Role-Based Access Control (RBAC) Matrix</h4>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Active permissions matrix across the 6 institutional staff roles in Bo District.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Authorized
                  </span>
                  <span className="flex items-center gap-1 text-rose-500 font-semibold">
                    <XCircle className="w-3.5 h-3.5" /> Restricted
                  </span>
                </div>
              </div>

              <div className="border rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={isLight ? 'bg-slate-100 text-slate-700 border-b' : 'bg-slate-950 text-slate-300 border-b border-slate-800'}>
                      <th className="py-2.5 px-3 font-bold">Institutional Capability</th>
                      <th className="py-2.5 px-2 text-center font-bold">Category</th>
                      <th className={`py-2.5 px-2 text-center font-bold ${currentUser.role === 'Director / Administrator' ? 'bg-emerald-500/20 text-emerald-600' : ''}`}>
                        Director
                      </th>
                      <th className={`py-2.5 px-2 text-center font-bold ${currentUser.role === 'Head Teacher' ? 'bg-emerald-500/20 text-emerald-600' : ''}`}>
                        Head Teacher
                      </th>
                      <th className={`py-2.5 px-2 text-center font-bold ${currentUser.role === 'Welfare & Orphanage Officer' ? 'bg-emerald-500/20 text-emerald-600' : ''}`}>
                        Welfare Officer
                      </th>
                      <th className={`py-2.5 px-2 text-center font-bold ${currentUser.role === 'STEM Lab Specialist' ? 'bg-emerald-500/20 text-emerald-600' : ''}`}>
                        STEM Lead
                      </th>
                      <th className={`py-2.5 px-2 text-center font-bold ${currentUser.role === 'JCC FC Coach' ? 'bg-emerald-500/20 text-emerald-600' : ''}`}>
                        JCC FC Coach
                      </th>
                      <th className={`py-2.5 px-2 text-center font-bold ${currentUser.role === 'Community Sponsor' ? 'bg-emerald-500/20 text-emerald-600' : ''}`}>
                        Sponsor
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800'}`}>
                    {CAPABILITY_MATRIX_ROWS.map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          isLight
                            ? idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                            : idx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-900/60'
                        }
                      >
                        <td className="py-2 px-3 font-medium">
                          {row.capability}
                        </td>
                        <td className="py-2 px-2 text-center text-[10px] text-slate-500 font-mono">
                          {row.category}
                        </td>
                        <td className={`py-2 px-2 text-center ${currentUser.role === 'Director / Administrator' ? 'bg-emerald-500/10' : ''}`}>
                          {row.director ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <XCircle className="w-4 h-4 text-slate-300 inline" />}
                        </td>
                        <td className={`py-2 px-2 text-center ${currentUser.role === 'Head Teacher' ? 'bg-emerald-500/10' : ''}`}>
                          {row.headTeacher ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <XCircle className="w-4 h-4 text-slate-300 inline" />}
                        </td>
                        <td className={`py-2 px-2 text-center ${currentUser.role === 'Welfare & Orphanage Officer' ? 'bg-emerald-500/10' : ''}`}>
                          {row.welfareOfficer ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <XCircle className="w-4 h-4 text-slate-300 inline" />}
                        </td>
                        <td className={`py-2 px-2 text-center ${currentUser.role === 'STEM Lab Specialist' ? 'bg-emerald-500/10' : ''}`}>
                          {row.stemSpecialist ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <XCircle className="w-4 h-4 text-slate-300 inline" />}
                        </td>
                        <td className={`py-2 px-2 text-center ${currentUser.role === 'JCC FC Coach' ? 'bg-emerald-500/10' : ''}`}>
                          {row.coach ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <XCircle className="w-4 h-4 text-slate-300 inline" />}
                        </td>
                        <td className={`py-2 px-2 text-center ${currentUser.role === 'Community Sponsor' ? 'bg-emerald-500/10' : ''}`}>
                          {row.sponsor ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <XCircle className="w-4 h-4 text-slate-300 inline" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVILEGE SIMULATOR / CHALLENGE TESTER */}
          {activeTab === 'tester' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm">Privilege Enforcement Simulator</h4>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Trigger real-time authorization checks against the active profile (
                  <span className="font-bold text-emerald-600">{currentUser.name} - {currentUser.role}</span>
                  ) to see how access denial and approvals are enforced.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-800/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-blue-600">
                      <GraduationCap className="w-4 h-4" /> Academic Teachers
                    </span>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      teachers:create
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Attempt to register, onboard, and assign new faculty teachers to school curriculum.
                  </p>
                  <button
                    onClick={() => handleTestChallenge('register_teacher')}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    Challenge Teacher Registration
                  </button>
                </div>

                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-800/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-600">
                      <GraduationCap className="w-4 h-4" /> Pupil Enrollment
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      students:create
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Attempt to register a new pupil, configure installment payment, and assign grade level.
                  </p>
                  <button
                    onClick={() => handleTestChallenge('register_student')}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    Challenge Pupil Enrollment
                  </button>
                </div>

                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-800/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-blue-600">
                      <GraduationCap className="w-4 h-4" /> Academic Records
                    </span>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      students:delete
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Attempt to permanently purge student academic enrollment and transcript file.
                  </p>
                  <button
                    onClick={() => handleTestChallenge('delete_student')}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    Challenge Student Purge
                  </button>
                </div>

                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-800/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-rose-600">
                      <Heart className="w-4 h-4" /> Child Welfare
                    </span>
                    <span className="text-[10px] font-mono bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                      orphans:confidential_notes
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Attempt to read protected psychological trauma notes and MSWGCA medical cases.
                  </p>
                  <button
                    onClick={() => handleTestChallenge('view_medical')}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                  >
                    Challenge Medical File Access
                  </button>
                </div>

                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-800/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-600">
                      <Database className="w-4 h-4" /> Supabase PostgreSQL
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      database:manage_supabase
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Attempt to execute SQL DDL migration scripts and alter cloud database schema.
                  </p>
                  <button
                    onClick={() => handleTestChallenge('database_ddl')}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    Challenge Supabase DDL
                  </button>
                </div>

                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-800/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-amber-600">
                      <Trophy className="w-4 h-4" /> JCC FC Football
                    </span>
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      football:log_matches
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Attempt to record official Southern Region Football Association match result.
                  </p>
                  <button
                    onClick={() => handleTestChallenge('submit_match')}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                  >
                    Challenge Match Score Submit
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-4 rounded-xl border animate-in fade-in ${
                    testResult.allowed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {testResult.allowed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h5 className="font-bold text-sm">
                        {testResult.allowed ? 'Privilege Authorized' : 'Authorization Denied'}
                      </h5>
                      <p className="text-xs mt-1">{testResult.message}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">Security Audit Trail</h4>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Immutable records of all role changes, permission evaluations, and authorization queries.
                  </p>
                </div>
                <button
                  onClick={() => setAuditLogs(getSecurityAuditLogs())}
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:underline font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Trail
                </button>
              </div>

              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                      log.status === 'Denied'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                        : isLight
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-800/80 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {log.status === 'Denied' ? (
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{log.action}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            log.status === 'Denied' ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          Operator: <span className="font-semibold">{log.userName}</span> ({log.role})
                        </p>
                        {log.details && (
                          <p className={`text-[11px] mt-1 font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950/70 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Enforcing Jonathan's Child Care Institutional Security Directives</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
