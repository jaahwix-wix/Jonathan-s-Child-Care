import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ComposedChart,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Trophy,
  Activity,
  TrendingUp,
  Flame,
  Users,
  Shield,
  Zap,
  Calendar,
  Award,
  ChevronRight,
  Filter,
  BarChart3,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Match, Player } from '../types';

interface JccFcSeasonAnalyticsProps {
  matches: Match[];
  players: Player[];
}

type AnalyticsTab = 'outcomes' | 'participation' | 'goals-productivity';

export const JccFcSeasonAnalytics: React.FC<JccFcSeasonAnalyticsProps> = ({
  matches,
  players,
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('outcomes');
  const [positionFilter, setPositionFilter] = useState<string>('All');
  const [competitionFilter, setCompetitionFilter] = useState<string>('All');

  // Filtered finished matches
  const finishedMatches = useMemo(() => {
    return matches
      .filter((m) => m.status === 'Finished')
      .filter((m) => competitionFilter === 'All' || m.competition === competitionFilter);
  }, [matches, competitionFilter]);

  // Derived Match Outcomes Data for Season Timeline
  const matchOutcomesTimeline = useMemo(() => {
    let cumulativePoints = 0;
    let cumulativeGoalsScored = 0;
    let cumulativeGoalsConceded = 0;

    return finishedMatches.map((m, index) => {
      const goalsScored = m.isHome ? (m.scoreHome ?? 0) : (m.scoreAway ?? 0);
      const goalsConceded = m.isHome ? (m.scoreAway ?? 0) : (m.scoreHome ?? 0);
      const outcome =
        goalsScored > goalsConceded ? 'Win' : goalsScored === goalsConceded ? 'Draw' : 'Loss';
      
      const pts = outcome === 'Win' ? 3 : outcome === 'Draw' ? 1 : 0;
      cumulativePoints += pts;
      cumulativeGoalsScored += goalsScored;
      cumulativeGoalsConceded += goalsConceded;

      return {
        matchId: m.id,
        matchLabel: `MW ${index + 1}: vs ${m.opponent.replace(' FC', '').replace(' Queens', '')}`,
        opponent: m.opponent,
        competition: m.competition,
        date: m.date,
        venue: m.venue,
        isHome: m.isHome,
        outcome,
        goalsScored,
        goalsConceded,
        goalDiff: goalsScored - goalsConceded,
        points: pts,
        cumulativePoints,
        cumulativeGoalsScored,
        cumulativeGoalsConceded,
        attendance: m.attendance || 2800,
      };
    });
  }, [finishedMatches]);

  // Outcomes summary stats
  const totalMatches = finishedMatches.length;
  const totalWins = matchOutcomesTimeline.filter((m) => m.outcome === 'Win').length;
  const totalDraws = matchOutcomesTimeline.filter((m) => m.outcome === 'Draw').length;
  const totalLosses = matchOutcomesTimeline.filter((m) => m.outcome === 'Loss').length;
  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  const totalGoalsFor = matchOutcomesTimeline.reduce((acc, m) => acc + m.goalsScored, 0);
  const totalGoalsAgainst = matchOutcomesTimeline.reduce((acc, m) => acc + m.goalsConceded, 0);
  const cleanSheetsCount = matchOutcomesTimeline.filter((m) => m.goalsConceded === 0).length;

  // Outcome Distribution for Pie Chart
  const outcomePieData = [
    { name: 'Victories (Wins)', value: totalWins, color: '#10b981' }, // emerald-500
    { name: 'Draws (Ties)', value: totalDraws, color: '#f59e0b' },    // amber-500
    { name: 'Defeats (Losses)', value: totalLosses, color: '#ef4444' }, // red-500
  ].filter((d) => d.value > 0);

  // Home vs Away Stats
  const homeMatches = matchOutcomesTimeline.filter((m) => m.isHome);
  const awayMatches = matchOutcomesTimeline.filter((m) => !m.isHome);

  const homeVsAwayData = [
    {
      category: 'Home (Bo Stadium)',
      wins: homeMatches.filter((m) => m.outcome === 'Win').length,
      draws: homeMatches.filter((m) => m.outcome === 'Draw').length,
      losses: homeMatches.filter((m) => m.outcome === 'Loss').length,
      goalsScored: homeMatches.reduce((acc, m) => acc + m.goalsScored, 0),
      goalsConceded: homeMatches.reduce((acc, m) => acc + m.goalsConceded, 0),
      avgAttendance: homeMatches.length > 0 ? Math.round(homeMatches.reduce((a, m) => a + m.attendance, 0) / homeMatches.length) : 0,
    },
    {
      category: 'Away (Travelling)',
      wins: awayMatches.filter((m) => m.outcome === 'Win').length,
      draws: awayMatches.filter((m) => m.outcome === 'Draw').length,
      losses: awayMatches.filter((m) => m.outcome === 'Loss').length,
      goalsScored: awayMatches.reduce((acc, m) => acc + m.goalsScored, 0),
      goalsConceded: awayMatches.reduce((acc, m) => acc + m.goalsConceded, 0),
      avgAttendance: awayMatches.length > 0 ? Math.round(awayMatches.reduce((a, m) => a + m.attendance, 0) / awayMatches.length) : 0,
    },
  ];

  // Player Participation Frequency Data
  const playerParticipationData = useMemo(() => {
    const totalSeasonGames = 26; // Standard season length in SRFA/District league
    return players
      .filter((p) => positionFilter === 'All' || p.position === positionFilter)
      .map((p) => {
        const starts = p.starts ?? Math.max(1, p.appearances - 2);
        const subApps = p.subAppearances ?? Math.max(0, p.appearances - starts);
        const minutes = p.minutesPlayed ?? p.appearances * 85;
        const participationPct = Math.min(100, Math.round((p.appearances / totalSeasonGames) * 100));

        return {
          id: p.id,
          name: p.name.split(' ')[0] + ' ' + (p.name.split(' ')[1] || ''),
          fullName: p.name,
          jerseyNumber: p.jerseyNumber,
          position: p.position,
          appearances: p.appearances,
          starts,
          subAppearances: subApps,
          minutesPlayed: minutes,
          participationRate: participationPct,
          goals: p.goals,
          assists: p.assists,
          rating: p.overallRating,
          fitnessStatus: p.fitnessStatus,
        };
      })
      .sort((a, b) => b.appearances - a.appearances);
  }, [players, positionFilter]);

  // Custom Dark Recharts Tooltip for Match Outcomes
  const MatchCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700/90 p-4 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-amber-400 text-sm">{data.opponent}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black ${
                data.outcome === 'Win'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : data.outcome === 'Draw'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {data.outcome.toUpperCase()} ({data.goalsScored} - {data.goalsConceded})
            </span>
          </div>

          <div className="space-y-1 pt-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Competition:</span>
              <span className="font-medium text-white">{data.competition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Venue:</span>
              <span className="font-medium text-white">{data.venue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cumulative Points:</span>
              <span className="font-bold text-amber-400">{data.cumulativePoints} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Goal Difference:</span>
              <span className="font-bold text-emerald-400">+{data.goalDiff}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Match Attendance:</span>
              <span className="font-medium text-cyan-300">{data.attendance.toLocaleString()} fans</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Dark Tooltip for Player Participation
  const PlayerCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700/90 p-4 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white text-sm">
              #{data.jerseyNumber} {data.fullName}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
              {data.position}
            </span>
          </div>

          <div className="space-y-1.5 pt-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Season Appearances:</span>
              <span className="font-bold text-amber-400">{data.appearances} matches</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Starts vs Sub:</span>
              <span className="font-semibold text-white">
                {data.starts} Starts / {data.subAppearances} Sub
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Minutes on Pitch:</span>
              <span className="font-bold text-cyan-300">{data.minutesPlayed.toLocaleString()} mins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Participation Rate:</span>
              <span className="font-bold text-emerald-400">{data.participationRate}%</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400">Goals & Assists:</span>
              <span className="font-bold text-white">
                {data.goals} G / {data.assists} A
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            JCC FC Season Performance & Squad Frequency Engine
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            Match Outcomes & Squad Participation Analytics
          </h3>
          <p className="text-xs text-slate-400">
            Interactive Recharts visualizations tracking Bo District First Division & SRFA match results and squad rotation frequency.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('outcomes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'outcomes'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Match Outcomes & Form</span>
          </button>

          <button
            onClick={() => setActiveTab('participation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'participation'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Player Participation Frequency</span>
          </button>

          <button
            onClick={() => setActiveTab('goals-productivity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'goals-productivity'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Attack Productivity</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Win Rate</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-emerald-400">{winRate}%</span>
            <span className="text-[11px] text-slate-500">({totalWins}/{totalMatches} Matches)</span>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goals Scored</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-amber-400">{totalGoalsFor}</span>
            <span className="text-[11px] text-emerald-400 font-bold">+{(totalGoalsFor - totalGoalsAgainst)} GD</span>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goals Conceded</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-cyan-400">{totalGoalsAgainst}</span>
            <span className="text-[11px] text-slate-400">({(totalGoalsAgainst / (totalMatches || 1)).toFixed(1)}/gm)</span>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clean Sheets</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-emerald-400">{cleanSheetsCount}</span>
            <span className="text-[11px] text-slate-500">Matches</span>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Squad Strength</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-white">{players.length}</span>
            <span className="text-[11px] text-amber-400 font-bold">Registered</span>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Appearance</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-sm font-black text-amber-300 truncate">Hawa Kargbo</span>
            <span className="text-[11px] font-bold text-emerald-400">26</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MATCH OUTCOMES & SEASON FORM TRAJECTORY */}
      {/* ======================================================== */}
      {activeTab === 'outcomes' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 font-medium">Filter Competition:</span>
              {['All', 'SRFA Championship', 'Bo District First Division'].map((comp) => (
                <button
                  key={comp}
                  onClick={() => setCompetitionFilter(comp)}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                    competitionFilter === comp
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {comp}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Victories ({totalWins})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" /> Draws ({totalDraws})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" /> Defeats ({totalLosses})
              </span>
            </div>
          </div>

          {/* Main Chart 1: Cumulative Points & Goals Scored by Matchweek */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  Match Outcomes & Cumulative Points Trajectory
                </h4>
                <p className="text-[11px] text-slate-400">
                  Tracking match outcomes, goal differences, and league table momentum across matchdays.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                1st Place • Undefeated Home Record
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={matchOutcomesTimeline} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis
                    dataKey="matchLabel"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    label={{ value: 'Goals / GD', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#f59e0b"
                    fontSize={11}
                    tickLine={false}
                    label={{ value: 'Points Trajectory', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 10 }}
                  />
                  <Tooltip content={<MatchCustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <ReferenceLine yAxisId="left" y={0} stroke="#64748b" strokeDasharray="3 3" />
                  
                  {/* Goals Scored Bar */}
                  <Bar
                    yAxisId="left"
                    dataKey="goalsScored"
                    name="Goals Scored (JCC)"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  {/* Goals Conceded Bar */}
                  <Bar
                    yAxisId="left"
                    dataKey="goalsConceded"
                    name="Goals Conceded"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  {/* Cumulative Points Line */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulativePoints"
                    name="Cumulative League Points"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 5, strokeWidth: 2, stroke: '#0f172a' }}
                    activeDot={{ r: 7, fill: '#fcd34d' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Charts Grid: Home vs Away & Outcome Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Home vs Away Comparison */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Home vs Away Venue Performance
              </h4>
              <p className="text-[11px] text-slate-400">Comparing goal output and win rates at Bo Stadium vs away grounds.</p>

              <div className="h-56 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={homeVsAwayData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="wins" name="Victories" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="goalsScored" name="Goals Scored" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="goalsConceded" name="Goals Conceded" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Match Outcomes Share */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Season Outcome Distribution & Win Ratio
              </h4>
              <p className="text-[11px] text-slate-400">Percentage distribution of match outcomes over active season fixtures.</p>

              <div className="h-56 w-full flex items-center justify-center pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={outcomePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {outcomePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PLAYER PARTICIPATION FREQUENCY & MINUTES */}
      {/* ======================================================== */}
      {activeTab === 'participation' && (
        <div className="space-y-6">
          {/* Position Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 font-medium">Filter Squad Position:</span>
              {['All', 'Forward', 'Midfielder', 'Defender', 'Goalkeeper'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPositionFilter(pos)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    positionFilter === pos
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>

            <span className="text-slate-400">
              Tracking <strong className="text-amber-400">{playerParticipationData.length}</strong> squad members
            </span>
          </div>

          {/* Main Chart 2: Player Match Appearances (Starts vs Subs) & Participation Rate */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Player Match Participation Frequency (Starts vs Subs)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Tracking senior squad rotation, starting eleven selections, and substitute impact over the season.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Avg. Squad Readiness 98%
              </span>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={playerParticipationData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip content={<PlayerCustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  
                  <Bar dataKey="starts" name="Starting XI Matches" fill="#10b981" stackId="apps" radius={[0, 0, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="subAppearances" name="Substitute Appearances" fill="#f59e0b" stackId="apps" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Chart: Minutes Played Across the Squad */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Total Match Minutes on Pitch (Season Aggregate)
                </h4>
                <p className="text-[11px] text-slate-400">Total active match minutes logged per player across league & cup ties.</p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={playerParticipationData} margin={{ top: 10, right: 15, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="minutesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="m" />
                  <Tooltip content={<PlayerCustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="minutesPlayed"
                    name="Minutes Played"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#minutesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: GOALS & ATTACK PRODUCTIVITY */}
      {/* ======================================================== */}
      {activeTab === 'goals-productivity' && (
        <div className="space-y-6">
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Goals & Assists Productivity Distribution
                </h4>
                <p className="text-[11px] text-slate-400">
                  Individual scoring and playmaking impact relative to squad appearance volume.
                </p>
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={playerParticipationData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip content={<PlayerCustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="goals" name="Goals Scored" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="assists" name="Goal Assists" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
