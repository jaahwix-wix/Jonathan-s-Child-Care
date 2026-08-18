import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  User,
  GraduationCap,
  Sparkles,
  BookOpen,
  DollarSign,
  Heart,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Search,
  Maximize2,
  Minimize2,
  FileText,
  CreditCard,
  Building,
  Layers,
  ArrowRight,
  Info,
  Printer,
} from 'lucide-react';
import { Student, SchoolTier } from '../types';

interface StudentDirectoryTreeViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onOpenPaymentModal: (student: Student) => void;
  onPrintIdCard?: (student: Student) => void;
  searchQuery: string;
}

export const StudentDirectoryTreeView: React.FC<StudentDirectoryTreeViewProps> = ({
  students,
  onSelectStudent,
  onOpenPaymentModal,
  onPrintIdCard,
  searchQuery,
}) => {
  // Expanded nodes state: e.g. "root", "tier-Nursery", "grade-Nursery-1", etc.
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    return new Set(['root', 'tier-Secondary', 'grade-JSS 2 (STEM Track)', 'grade-JSS 1', 'tier-Primary']);
  });

  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('All');
  const [selectedFeeFilter, setSelectedFeeFilter] = useState<string>('All');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<string>(['root', 'tier-Nursery', 'tier-Primary', 'tier-Secondary']);
    treeData.tiers.forEach((tier) => {
      all.add(`tier-${tier.name}`);
      tier.grades.forEach((g) => all.add(`grade-${g.name}`));
    });
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(['root']));
  };

  // Build Hierarchical Tree Structure: Root -> School Tiers (Nursery/Primary/Secondary) -> Grade Levels -> Students
  const treeData = useMemo(() => {
    const filtered = students.filter((s) => {
      const tier = s.schoolTier || (s.gradeLevel.toLowerCase().includes('nursery') ? 'Nursery' : s.gradeLevel.toLowerCase().includes('primary') || s.gradeLevel.toLowerCase().includes('class') ? 'Primary' : 'Secondary');
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = selectedTierFilter === 'All' || tier === selectedTierFilter;
      const matchesFee =
        selectedFeeFilter === 'All' ||
        (selectedFeeFilter === 'Fully Paid' && s.remainingBalance === 0) ||
        (selectedFeeFilter === 'Outstanding' && s.remainingBalance > 0);
      return matchesSearch && matchesTier && matchesFee;
    });

    const tiersOrder: SchoolTier[] = ['Nursery', 'Primary', 'Secondary'];
    const tiers = tiersOrder.map((tierName) => {
      const tierStudents = filtered.filter((s) => (s.schoolTier || 'Secondary') === tierName);
      
      // Group by grade level
      const gradeMap: Record<string, Student[]> = {};
      tierStudents.forEach((st) => {
        if (!gradeMap[st.gradeLevel]) {
          gradeMap[st.gradeLevel] = [];
        }
        gradeMap[st.gradeLevel].push(st);
      });

      const grades = Object.keys(gradeMap).map((gradeName) => ({
        name: gradeName,
        students: gradeMap[gradeName],
        totalPaid: gradeMap[gradeName].reduce((acc, s) => acc + s.totalPaid, 0),
        totalDue: gradeMap[gradeName].reduce((acc, s) => acc + s.totalTermFee, 0),
      }));

      return {
        name: tierName,
        count: tierStudents.length,
        grades,
        totalPaid: tierStudents.reduce((acc, s) => acc + s.totalPaid, 0),
        totalDue: tierStudents.reduce((acc, s) => acc + s.totalTermFee, 0),
      };
    });

    return {
      totalCount: filtered.length,
      tiers,
    };
  }, [students, searchQuery, selectedTierFilter, selectedFeeFilter]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6" id="student-directory-treeview-root">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Hierarchical Student & Fee Directory Tree
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {treeData.totalCount} Pupils Plotted
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Explore students structured by <strong>School Tier &gt; Grade Level &gt; Student Ledger</strong> with instant status rollups.
              </p>
            </div>
          </div>
        </div>

        {/* Tree Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 font-medium transition-colors"
              title="Expand All Nodes"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 font-medium transition-colors"
              title="Collapse All Nodes"
            >
              <Minimize2 className="w-3.5 h-3.5" /> Collapse All
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 px-2 font-semibold">Tier:</span>
            {['All', 'Nursery', 'Primary', 'Secondary'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTierFilter(t)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedTierFilter === t
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hierarchical Tree Container */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 sm:p-6 space-y-3 font-sans overflow-x-auto">
        {/* ROOT NODE: Jonathan's Child Care Ministries */}
        <div className="space-y-2">
          <div
            onClick={() => toggleNode('root')}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
              expandedNodes.has('root')
                ? 'bg-slate-900 border-emerald-500/40 shadow-lg'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <button className="text-slate-400 hover:text-white">
                {expandedNodes.has('root') ? (
                  <ChevronDown className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <Building className="w-5 h-5 text-emerald-400" />
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">
                  Jonathan's Child Care Ministries — Academic Complex
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Root Institution
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400 hidden sm:inline font-mono">
                {treeData.totalCount} Enrolled Students
              </span>
            </div>
          </div>

          {/* ROOT CHILDREN: SCHOOL TIERS */}
          {expandedNodes.has('root') && (
            <div className="pl-4 sm:pl-7 border-l-2 border-slate-800 space-y-3 mt-2 ml-3">
              {treeData.tiers.map((tier) => {
                const tierNodeId = `tier-${tier.name}`;
                const isTierExpanded = expandedNodes.has(tierNodeId);

                return (
                  <div key={tier.name} className="space-y-2">
                    {/* TIER NODE */}
                    <div
                      onClick={() => toggleNode(tierNodeId)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all border ${
                        isTierExpanded
                          ? 'bg-slate-900 border-cyan-500/40 shadow-md'
                          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button className="text-slate-400 hover:text-white">
                          {isTierExpanded ? (
                            <ChevronDown className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        {isTierExpanded ? (
                          <FolderOpen className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Folder className="w-4 h-4 text-cyan-400" />
                        )}
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {tier.name} School Department
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {tier.count} pupils
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-400 text-[11px] font-mono hidden md:inline">
                          Collected: <strong className="text-emerald-400">NLe {tier.totalPaid.toLocaleString()}</strong> / NLe {tier.totalDue.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* TIER CHILDREN: GRADE LEVELS */}
                    {isTierExpanded && (
                      <div className="pl-4 sm:pl-7 border-l-2 border-slate-800/80 space-y-2 ml-3">
                        {tier.grades.map((grade) => {
                          const gradeNodeId = `grade-${grade.name}`;
                          const isGradeExpanded = expandedNodes.has(gradeNodeId);

                          return (
                            <div key={grade.name} className="space-y-1.5">
                              {/* GRADE NODE */}
                              <div
                                onClick={() => toggleNode(gradeNodeId)}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                                  isGradeExpanded
                                    ? 'bg-slate-900/90 border-amber-500/40'
                                    : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <button className="text-slate-400 hover:text-white">
                                    {isGradeExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                  </button>
                                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                                  <span className="font-semibold text-slate-200 text-xs">
                                    Class: {grade.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    ({grade.students.length} students)
                                  </span>
                                </div>

                                <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
                                  Term Balance: <span className="text-amber-300 font-bold">NLe {(grade.totalDue - grade.totalPaid).toLocaleString()}</span>
                                </div>
                              </div>

                              {/* GRADE CHILDREN: PUPILS LEAF NODES */}
                              {isGradeExpanded && (
                                <div className="pl-4 sm:pl-6 border-l-2 border-slate-800/60 space-y-1 ml-2.5 pt-1">
                                  {grade.students.map((student) => {
                                    const isSelected = selectedNodeId === student.id;

                                    return (
                                      <div
                                        key={student.id}
                                        onClick={() => {
                                          setSelectedNodeId(student.id);
                                          onSelectStudent(student);
                                        }}
                                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all text-xs border ${
                                          isSelected
                                            ? 'bg-emerald-950/60 border-emerald-500 text-white shadow'
                                            : 'bg-slate-900/30 border-transparent hover:bg-slate-900/80 hover:border-slate-800 text-slate-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <img
                                            src={student.avatar}
                                            alt={student.name}
                                            className="w-6 h-6 rounded-full object-cover border border-slate-700 shrink-0"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-white">{student.name}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">({student.id})</span>
                                            {student.scholarshipStatus !== 'Self-Funded' && (
                                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                                                {student.scholarshipStatus}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <div className="text-right hidden sm:block">
                                            <span className="text-[11px] font-mono text-slate-300 block">
                                              Paid: <strong className="text-emerald-400">NLe {student.totalPaid.toLocaleString()}</strong> / {student.totalTermFee.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                              Plan: {student.paymentPlan}
                                            </span>
                                          </div>

                                          <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                              student.feeStatus === 'Fully Paid'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                : student.feeStatus === 'Partially Paid'
                                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                            }`}
                                          >
                                            {student.feeStatus}
                                          </span>

                                          {onPrintIdCard && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onPrintIdCard(student);
                                              }}
                                              className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 text-[10px] font-semibold transition-colors flex items-center gap-1 border border-slate-700"
                                              title="Print Student ID Card"
                                            >
                                              <Printer className="w-3 h-3 text-cyan-400" />
                                              <span className="hidden md:inline">ID Card</span>
                                            </button>
                                          )}

                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onOpenPaymentModal(student);
                                            }}
                                            className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 text-[10px] font-semibold transition-colors flex items-center gap-1 border border-slate-700"
                                            title="Record Installment Payment"
                                          >
                                            <CreditCard className="w-3 h-3 text-emerald-400" />
                                            <span className="hidden md:inline">Pay</span>
                                          </button>
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
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
