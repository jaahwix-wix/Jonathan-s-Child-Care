import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Microscope,
  Cpu,
  Layers,
  MapPin,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Plus,
  Maximize2,
  Minimize2,
  Atom,
} from 'lucide-react';
import { LabEquipment, EquipmentAllocation, LabSession } from '../types';

interface LabHierarchyTreeViewProps {
  equipment: LabEquipment[];
  allocations: EquipmentAllocation[];
  labSessions: LabSession[];
  onSelectAllocation?: (allocation: EquipmentAllocation) => void;
  searchQuery: string;
}

export const LabHierarchyTreeView: React.FC<LabHierarchyTreeViewProps> = ({
  equipment,
  allocations,
  labSessions,
  onSelectAllocation,
  searchQuery,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    return new Set(['lab-root', 'cat-Biology', 'cat-Chemistry', 'cat-Physics', 'station-Station Alpha (Optics Bench & Microscopes)']);
  });

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
    const all = new Set<string>(['lab-root']);
    treeData.categories.forEach((cat) => {
      all.add(`cat-${cat.name}`);
      cat.apparatuses.forEach((a) => all.add(`eq-${a.id}`));
    });
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(['lab-root']));
  };

  // Build Hierarchical Tree Structure: Science Lab Complex -> Disciplines/Categories -> Apparatuses -> Active Allocations & Bench Slots
  const treeData = useMemo(() => {
    const categoriesList = ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'STEM Robotics'];

    const categories = categoriesList.map((catName) => {
      const catEquipment = equipment.filter((e) => {
        const matchesSearch =
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.category.toLowerCase().includes(searchQuery.toLowerCase());
        return e.category === catName && matchesSearch;
      });

      const apparatuses = catEquipment.map((eq) => {
        const relatedAllocs = allocations.filter(
          (a) => a.equipmentId === eq.id || a.equipmentName.toLowerCase().includes(eq.name.toLowerCase().slice(0, 8))
        );

        return {
          ...eq,
          allocations: relatedAllocs,
          totalAllocatedUnits: relatedAllocs.reduce((sum, a) => sum + a.quantityAllocated, 0),
        };
      });

      return {
        name: catName,
        apparatuses,
        totalItems: catEquipment.reduce((acc, e) => acc + e.quantity, 0),
      };
    });

    return {
      totalEquipment: equipment.length,
      categories,
    };
  }, [equipment, allocations, searchQuery]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6" id="lab-hierarchy-treeview-root">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Laboratory Inventory & Station Allocation Tree
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {treeData.totalEquipment} Apparatus Types
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Hierarchical view across <strong>Discipline &gt; Apparatus &gt; Lab Bench Scheduling</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" /> Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 flex items-center gap-1.5"
          >
            <Minimize2 className="w-3.5 h-3.5" /> Collapse All
          </button>
        </div>
      </div>

      {/* Tree Container */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 sm:p-6 space-y-3 font-sans overflow-x-auto">
        {/* ROOT: Bo STEM Teaching Laboratory */}
        <div className="space-y-2">
          <div
            onClick={() => toggleNode('lab-root')}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
              expandedNodes.has('lab-root')
                ? 'bg-slate-900 border-cyan-500/40 shadow-lg'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <button className="text-slate-400 hover:text-white">
                {expandedNodes.has('lab-root') ? (
                  <ChevronDown className="w-4 h-4 text-cyan-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <Microscope className="w-5 h-5 text-cyan-400" />
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">
                  JCC Science & Math Teaching Laboratory
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Bo Facility Hub
                </span>
              </div>
            </div>

            <span className="text-slate-400 text-xs font-mono hidden sm:inline">
              5 Disciplines • 6 Workbenches
            </span>
          </div>

          {/* ROOT CHILDREN: DISCIPLINES / CATEGORIES */}
          {expandedNodes.has('lab-root') && (
            <div className="pl-4 sm:pl-7 border-l-2 border-slate-800 space-y-3 mt-2 ml-3">
              {treeData.categories.map((cat) => {
                const catNodeId = `cat-${cat.name}`;
                const isCatExpanded = expandedNodes.has(catNodeId);

                return (
                  <div key={cat.name} className="space-y-2">
                    {/* DISCIPLINE NODE */}
                    <div
                      onClick={() => toggleNode(catNodeId)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all border ${
                        isCatExpanded
                          ? 'bg-slate-900 border-emerald-500/40 shadow-md'
                          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button className="text-slate-400 hover:text-white">
                          {isCatExpanded ? (
                            <ChevronDown className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        {isCatExpanded ? (
                          <FolderOpen className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Folder className="w-4 h-4 text-emerald-400" />
                        )}
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {cat.name} Department
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {cat.apparatuses.length} tools ({cat.totalItems} units)
                        </span>
                      </div>
                    </div>

                    {/* DISCIPLINE CHILDREN: APPARATUSES */}
                    {isCatExpanded && (
                      <div className="pl-4 sm:pl-7 border-l-2 border-slate-800/80 space-y-2 ml-3">
                        {cat.apparatuses.map((app) => {
                          const eqNodeId = `eq-${app.id}`;
                          const isEqExpanded = expandedNodes.has(eqNodeId);

                          return (
                            <div key={app.id} className="space-y-1.5">
                              {/* APPARATUS NODE */}
                              <div
                                onClick={() => toggleNode(eqNodeId)}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                                  isEqExpanded
                                    ? 'bg-slate-900/90 border-cyan-500/40'
                                    : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <button className="text-slate-400 hover:text-white">
                                    {isEqExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                  </button>
                                  <Atom className="w-3.5 h-3.5 text-cyan-400" />
                                  <span className="font-bold text-white text-xs">
                                    {app.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    ({app.id})
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                                    Stock: <strong className="text-white">{app.quantity}</strong> | In Use: <strong className="text-amber-400">{app.totalAllocatedUnits}</strong>
                                  </span>
                                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    {app.condition}
                                  </span>
                                </div>
                              </div>

                              {/* APPARATUS CHILDREN: ALLOCATION SLOTS */}
                              {isEqExpanded && (
                                <div className="pl-4 sm:pl-6 border-l-2 border-slate-800/60 space-y-1 ml-2.5 pt-1">
                                  {app.allocations.length === 0 ? (
                                    <div className="p-2 text-[11px] text-slate-500 italic">
                                      No active class sessions booked for this apparatus. Ready for dispatch.
                                    </div>
                                  ) : (
                                    app.allocations.map((alc) => (
                                      <div
                                        key={alc.id}
                                        onClick={() => onSelectAllocation && onSelectAllocation(alc)}
                                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900/30 hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all text-xs text-slate-300"
                                      >
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-white">{alc.experimentTitle}</span>
                                            <span className="text-[10px] text-cyan-300 font-mono">({alc.id})</span>
                                          </div>
                                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                            <span>📅 {alc.allocatedDate} ({alc.timeSlot})</span>
                                            <span>•</span>
                                            <span>👤 {alc.teacherName}</span>
                                            <span>•</span>
                                            <span>📍 {alc.labStation}</span>
                                          </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-200 border border-cyan-800">
                                            {alc.quantityAllocated} units
                                          </span>
                                          <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                              alc.status === 'In Use'
                                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                                : alc.status === 'Confirmed'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                : 'bg-slate-800 text-slate-400 border-slate-700'
                                            }`}
                                          >
                                            {alc.status}
                                          </span>
                                        </div>
                                      </div>
                                    ))
                                  )}
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
