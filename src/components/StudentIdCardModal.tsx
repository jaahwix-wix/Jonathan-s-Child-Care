import React, { useRef } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  QrCode,
  Calendar,
  Phone,
  User,
  Heart,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { Student } from '../types';
import { ASSET_IMAGES } from '../data/mockData';

interface StudentIdCardModalProps {
  student: Student | null;
  onClose: () => void;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  student,
  onClose,
}) => {
  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const academicYear = '2026 / 2027';
  const issueDate = '01 Sept 2026';
  const expiryDate = '31 July 2027';

  // Tier color styling
  const tier = student.schoolTier || (student.gradeLevel?.toLowerCase().includes('nursery') ? 'Nursery' : student.gradeLevel?.toLowerCase().includes('jss') ? 'Secondary' : 'Primary');
  const tierColor =
    tier === 'Secondary'
      ? 'from-cyan-900 to-slate-900 border-cyan-500/40 text-cyan-300'
      : tier === 'Primary'
      ? 'from-emerald-900 to-slate-900 border-emerald-500/40 text-emerald-300'
      : 'from-pink-900 to-slate-900 border-pink-500/40 text-pink-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Container Box */}
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-8">
        
        {/* Header with Title & Action Controls */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Official Student Identity Card
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-normal">
                  {student.id}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Jonathan's Child Care Ministries • Bo District, Sierra Leone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-print-id-card"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print ID Card</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CARD PREVIEW AREA */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950/60 rounded-2xl border border-slate-800">
          <div
            ref={printContainerRef}
            id="printable-student-id-card"
            className="w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden border-2 border-emerald-500/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white font-sans relative select-none"
            style={{ minHeight: '260px' }}
          >
            {/* Top Branded Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 px-4 py-3 border-b-2 border-emerald-500/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md border border-emerald-400 shrink-0">
                  <img
                    src={ASSET_IMAGES.systemLogo}
                    alt="JCC Ministries Logo"
                    className="w-full h-full object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white tracking-tight uppercase leading-tight">
                    Jonathan's Child Care
                  </h3>
                  <p className="text-[9px] text-emerald-300 font-semibold tracking-wide">
                    Education Complex • Bo District, Sierra Leone
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {student.schoolTier || tier}
                </span>
                <p className="text-[8px] text-slate-400 font-mono mt-0.5">{academicYear}</p>
              </div>
            </div>

            {/* Middle ID Card Body */}
            <div className="p-4 grid grid-cols-12 gap-3 items-center">
              {/* Photo Column */}
              <div className="col-span-4 flex flex-col items-center space-y-1.5">
                <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-emerald-400 shadow-lg bg-slate-800 relative">
                  <img
                    src={student.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                    alt={student.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] font-bold text-center py-0.5 text-emerald-300">
                    STUDENT
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400">
                  {student.id}
                </span>
              </div>

              {/* Details Column */}
              <div className="col-span-8 space-y-1.5 text-left pl-1">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block leading-none">
                    Student Full Name
                  </span>
                  <h4 className="text-sm font-black text-white tracking-tight mt-0.5 leading-tight">
                    {student.name}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold block leading-none">
                      Class / Grade
                    </span>
                    <span className="font-bold text-emerald-300 text-xs mt-0.5 block">
                      {student.gradeLevel}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold block leading-none">
                      Age / Gender
                    </span>
                    <span className="font-semibold text-white text-xs mt-0.5 block">
                      {student.age || '—'} Yrs • {student.gender || 'Pupil'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold block leading-none">
                      Guardian Name
                    </span>
                    <span className="text-[11px] font-semibold text-slate-200 truncate block mt-0.5">
                      {student.guardianName || 'Dr. Jonathan Davies'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold block leading-none">
                      Emergency Phone
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 block mt-0.5">
                      {student.guardianPhone || '+232 76 555 123'}
                    </span>
                  </div>
                </div>

                {/* Status Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Enrolled & Verified
                  </span>
                  {student.scholarshipStatus && student.scholarshipStatus !== 'Self-Funded' && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                      {student.scholarshipStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom ID Card Footer with QR & Authorization Seal */}
            <div className="bg-slate-900/90 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-white text-slate-950">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-mono text-[8px] text-slate-300">VALID: {issueDate} — {expiryDate}</p>
                  <p className="text-[8px] text-slate-400">Bo Campus Verification Desk</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-serif italic text-emerald-300 text-[10px] leading-tight">
                  Dr. Jonathan Davies
                </p>
                <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">
                  Executive Director
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Info & Print Tips */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Standard PVC/Cardstock format (3.375" x 2.125"). Click <strong>Print ID Card</strong> to produce physical student badges.
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="text-emerald-400 hover:text-emerald-300 font-bold underline shrink-0 cursor-pointer"
          >
            Launch Print
          </button>
        </div>
      </div>
    </div>
  );
};
