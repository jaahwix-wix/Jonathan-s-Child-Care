import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Heart,
  Home,
  ShieldCheck,
  User,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
  Maximize2,
  Minimize2,
  Building,
  GraduationCap,
  Activity,
} from 'lucide-react';
import { OrphanRecord, ResidentialPlacement } from '../types';

interface OrphanageWelfareTreeViewProps {
  orphans: OrphanRecord[];
  onSelectOrphan: (orphan: OrphanRecord) => void;
  searchQuery?: string;
}

export const OrphanageWelfareTreeView: React.FC<OrphanageWelfareTreeViewProps> = ({
  orphans,
  onSelectOrphan,
  searchQuery = '',
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    return new Set(['welfare-root', 'placement-JCC Bo Home (Cottage A - Girls)', 'placement-JCC Bo Home (Cottage B - Boys)']);
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
    const all = new Set<string>(['welfare-root']);
    treeData.placements.forEach((p) => {
      all.add(`placement-${p.name}`);
      p.categories.forEach((c) => all.add(`cat-${p.name}-${c.name}`));
    });
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(['welfare-root']));
  };

  // Build Tree Structure: Welfare Complex -> Residential Placements -> Orphan Categories -> Children Records
  const treeData = useMemo(() => {
    const filtered = orphans.filter((o) => {
      const matchesSearch =
        o.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.guardian?.guardianName || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    const placementsList: ResidentialPlacement[] = [
      'JCC Bo Home (Cottage A - Girls)',
      'JCC Bo Home (Cottage B - Boys)',
      'JCC Bo Early Years Cottage',
      'Kinship Caregiver Home (Bo District)',
      'Supported Foster Family',
    ];

    const placements = placementsList.map((placeName) => {
      const placeOrphans = filtered.filter((o) => o.residentialPlacement === placeName);

      // Group by orphan category
      const catMap: Record<string, OrphanRecord[]> = {};
      placeOrphans.forEach((o) => {
        const cat = o.orphanCategory;
        if (!catMap[cat]) {
          catMap[cat] = [];
        }
        catMap[cat].push(o);
      });

      const categories = Object.keys(catMap).map((catName) => ({
        name: catName,
        orphans: catMap[catName],
      }));

      return {
        name: placeName,
        count: placeOrphans.length,
        categories,
      };
    });

    return {
      totalChildren: filtered.length,
      placements,
    };
  }, [orphans, searchQuery]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6" id="orphanage-treeview-root">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Orphanage & Child Welfare Hierarchy Tree
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {treeData.totalChildren} Children Protected
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Welfare records grouped by <strong>Residential Care Placement &gt; Vulnerability Category &gt; Individual Child File</strong>.
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

      {/* Treeview Canvas */}
      <div className="bg-slate-950/70 rounded-xl p-4 sm:p-6 border border-slate-800/80 font-sans">
        {/* ROOT NODE: JCC BO RESIDENTIAL COMPOUND & WELFARE SERVICES */}
        <div className="space-y-3">
          <div
            onClick={() => toggleNode('welfare-root')}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-rose-500/40 hover:border-rose-500 cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center gap-3">
              <button className="text-slate-400 group-hover:text-white">
                {expandedNodes.has('welfare-root') ? (
                  <ChevronDown className="w-5 h-5 text-rose-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm sm:text-base">
                  Jonathan’s Child Care Ministries — Residential Care & Welfare Hierarchy
                </span>
                <span className="ml-2 text-xs text-rose-300 font-mono">
                  ({treeData.totalChildren} Active Resident & Kinship Children)
                </span>
              </div>
            </div>
            <span className="text-slate-400 text-xs font-mono hidden sm:inline">
              5 Placement Models • Bo District
            </span>
          </div>

          {/* ROOT CHILDREN: PLACEMENTS */}
          {expandedNodes.has('welfare-root') && (
            <div className="pl-4 sm:pl-7 border-l-2 border-slate-800 space-y-3 mt-2 ml-3">
              {treeData.placements.map((plc) => {
                const plcNodeId = `placement-${plc.name}`;
                const isPlcExpanded = expandedNodes.has(plcNodeId);

                return (
                  <div key={plc.name} className="space-y-2">
                    {/* PLACEMENT NODE */}
                    <div
                      onClick={() => toggleNode(plcNodeId)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all border ${
                        isPlcExpanded
                          ? 'bg-slate-900 border-rose-500/40 shadow-md'
                          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button className="text-slate-400 hover:text-white">
                          {isPlcExpanded ? (
                            <ChevronDown className="w-4 h-4 text-rose-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <Home className="w-4 h-4 text-rose-400" />
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {plc.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {plc.count} children
                        </span>
                      </div>
                    </div>

                    {/* PLACEMENT CHILDREN: CATEGORIES */}
                    {isPlcExpanded && (
                      <div className="pl-4 sm:pl-7 border-l-2 border-slate-800/80 space-y-2 ml-3">
                        {plc.categories.map((cat) => {
                          const catNodeId = `cat-${plc.name}-${cat.name}`;
                          const isCatExpanded = expandedNodes.has(catNodeId);

                          return (
                            <div key={cat.name} className="space-y-1.5">
                              {/* CATEGORY NODE */}
                              <div
                                onClick={() => toggleNode(catNodeId)}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                                  isCatExpanded
                                    ? 'bg-slate-900/90 border-amber-500/40'
                                    : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <button className="text-slate-400 hover:text-white">
                                    {isCatExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                  </button>
                                  <Folder className="w-3.5 h-3.5 text-amber-400" />
                                  <span className="font-semibold text-slate-200 text-xs">
                                    Category: {cat.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    ({cat.orphans.length} records)
                                  </span>
                                </div>
                              </div>

                              {/* ORPHAN CHILDREN: INDIVIDUAL RECORDS */}
                              {isCatExpanded && (
                                <div className="pl-4 sm:pl-6 border-l-2 border-slate-800/60 space-y-1 ml-2.5 pt-1">
                                  {cat.orphans.map((orphan) => (
                                    <div
                                      key={orphan.id}
                                      onClick={() => onSelectOrphan(orphan)}
                                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/30 hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all text-xs text-slate-300 cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <img
                                          src={orphan.avatar}
                                          alt={orphan.fullName}
                                          className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-white">{orphan.fullName}</span>
                                            <span className="text-[10px] text-rose-300 font-mono">({orphan.id})</span>
                                          </div>
                                          <p className="text-[11px] text-slate-400">
                                            Age {orphan.age} • {orphan.schoolTier} School ({orphan.gradeLevel}) • Cottage: {orphan.cottageOrDorm}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                          {orphan.privacyLevel}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
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
