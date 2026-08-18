import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Trophy,
  Users,
  Shield,
  Layers,
  MapPin,
  Calendar,
  Flame,
  Maximize2,
  Minimize2,
  Activity,
  Award,
  Zap,
} from 'lucide-react';
import { Player, Match, Trophy as TrophyType } from '../types';

interface FootballSquadHierarchyTreeViewProps {
  players: Player[];
  matches: Match[];
  trophies: TrophyType[];
  onSelectPlayer?: (player: Player) => void;
  searchQuery: string;
}

export const FootballSquadHierarchyTreeView: React.FC<FootballSquadHierarchyTreeViewProps> = ({
  players,
  matches,
  trophies,
  onSelectPlayer,
  searchQuery,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    return new Set(['club-root', 'pos-Forward', 'pos-Midfielder', 'squad-Senior First Team Squad']);
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
    const all = new Set<string>(['club-root']);
    treeData.positions.forEach((pos) => {
      all.add(`pos-${pos.name}`);
    });
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(['club-root']));
  };

  // Build Tree Structure: JCC FC Club -> Tactical Positions (Goalkeeper / Defender / Midfielder / Forward) -> Players
  const treeData = useMemo(() => {
    const filtered = players.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    const positionsList = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'];

    const positions = positionsList.map((posName) => {
      const posPlayers = filtered.filter((p) => p.position === posName);
      return {
        name: posName,
        players: posPlayers,
        totalGoals: posPlayers.reduce((acc, p) => acc + p.goals, 0),
        totalAssists: posPlayers.reduce((acc, p) => acc + p.assists, 0),
      };
    });

    return {
      totalSquad: filtered.length,
      positions,
    };
  }, [players, searchQuery]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6" id="football-squad-treeview-root">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                JCC FC Squad & Tactical Hierarchy Tree
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {treeData.totalSquad} Registered Athletes
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Squad depth tree grouped by <strong>Tactical Position &gt; Athlete Profile &gt; Performance Metrics</strong>.
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
        {/* ROOT: JCC FC */}
        <div className="space-y-2">
          <div
            onClick={() => toggleNode('club-root')}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
              expandedNodes.has('club-root')
                ? 'bg-slate-900 border-amber-500/40 shadow-lg'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <button className="text-slate-400 hover:text-white">
                {expandedNodes.has('club-root') ? (
                  <ChevronDown className="w-4 h-4 text-amber-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <Trophy className="w-5 h-5 text-amber-400" />
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">
                  JCC FC — Southern Region FA Champions
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Bo District 1st Division
                </span>
              </div>
            </div>

            <span className="text-slate-400 text-xs font-mono hidden sm:inline">
              {trophies.length} Major Titles • 4 Positional Lines
            </span>
          </div>

          {/* ROOT CHILDREN: POSITIONS */}
          {expandedNodes.has('club-root') && (
            <div className="pl-4 sm:pl-7 border-l-2 border-slate-800 space-y-3 mt-2 ml-3">
              {treeData.positions.map((pos) => {
                const posNodeId = `pos-${pos.name}`;
                const isPosExpanded = expandedNodes.has(posNodeId);

                return (
                  <div key={pos.name} className="space-y-2">
                    {/* POSITION NODE */}
                    <div
                      onClick={() => toggleNode(posNodeId)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all border ${
                        isPosExpanded
                          ? 'bg-slate-900 border-amber-500/40 shadow-md'
                          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button className="text-slate-400 hover:text-white">
                          {isPosExpanded ? (
                            <ChevronDown className="w-4 h-4 text-amber-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        {isPosExpanded ? (
                          <FolderOpen className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Folder className="w-4 h-4 text-amber-400" />
                        )}
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {pos.name} Line
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {pos.players.length} players
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 font-mono hidden sm:block">
                        Goals: <strong className="text-amber-400">{pos.totalGoals}</strong> | Assists: <strong className="text-emerald-400">{pos.totalAssists}</strong>
                      </div>
                    </div>

                    {/* PLAYERS LEAF NODES */}
                    {isPosExpanded && (
                      <div className="pl-4 sm:pl-7 border-l-2 border-slate-800/80 space-y-1.5 ml-3">
                        {pos.players.map((player) => (
                          <div
                            key={player.id}
                            onClick={() => onSelectPlayer && onSelectPlayer(player)}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/30 hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all text-xs text-slate-300 cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={player.avatar}
                                alt={player.name}
                                className="w-7 h-7 rounded-full object-cover border border-amber-500 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">#{player.jerseyNumber} {player.name}</span>
                                  {player.isCaptain && (
                                    <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">
                                      Captain
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Age {player.age} • Rating: {player.rating}/10 • Speed: {player.pace || 88} • {player.nationality}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right font-mono text-[11px] text-slate-300 hidden sm:block">
                                <span>⚽ {player.goals}G</span> <span className="text-slate-500">|</span> <span>🎯 {player.assists}A</span>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  player.fitness === 'Match Fit'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                }`}
                              >
                                {player.fitness}
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
      </div>
    </div>
  );
};
