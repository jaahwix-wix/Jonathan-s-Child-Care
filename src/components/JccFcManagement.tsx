import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  Users,
  Flame,
  Calendar,
  CheckCircle2,
  Shield,
  Zap,
  Activity,
  ChevronRight,
  Loader2,
  Plus,
  X,
  FileDown,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  BarChart3,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Player, Match, Trophy as TrophyType } from '../types';
import { ASSET_IMAGES } from '../data/mockData';
import { exportPlayersPdf } from '../utils/pdfExporter';
import { JccFcSeasonAnalytics } from './JccFcSeasonAnalytics';

interface JccFcManagementProps {
  players: Player[];
  matches: Match[];
  trophies: TrophyType[];
  onAddPlayer: (player: Player) => void;
  onUpdatePlayer?: (player: Player) => void;
  onDeletePlayer?: (playerId: string) => void;
  onAddMatch?: (match: Match) => void;
  onUpdateMatch?: (match: Match) => void;
  onDeleteMatch?: (matchId: string) => void;
  searchQuery: string;
}

export const JccFcManagement: React.FC<JccFcManagementProps> = ({
  players,
  matches,
  trophies,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  onAddMatch,
  onUpdateMatch,
  onDeleteMatch,
  searchQuery,
}) => {
  const [positionFilter, setPositionFilter] = useState<string>('All');
  const [selectedFormation, setSelectedFormation] = useState<'4-3-3' | '4-2-3-1' | '4-4-2'>('4-3-3');
  
  // Modals state
  const [showAddPlayerModal, setShowAddPlayerModal] = useState<boolean>(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletePlayerId, setDeletePlayerId] = useState<string | null>(null);

  const [showAddMatchModal, setShowAddMatchModal] = useState<boolean>(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [deleteMatchId, setDeleteMatchId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // AI Tactical Scouting Generator State
  const [opponentName, setOpponentName] = useState('Freetown City Queens');
  const [competition, setCompetition] = useState('National WPL Play-offs');
  const [venue, setVenue] = useState('Bo Stadium (Home)');
  const [tacticalOutput, setTacticalOutput] = useState('');
  const [isGeneratingTactics, setIsGeneratingTactics] = useState(false);

  // New / Edit Player Form State
  const [plyName, setPlyName] = useState('');
  const [plyPos, setPlyPos] = useState<'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward'>('Forward');
  const [plyNum, setPlyNum] = useState(11);
  const [plyAge, setPlyAge] = useState(20);
  const [plyAppearances, setPlyAppearances] = useState(18);
  const [plyStarts, setPlyStarts] = useState(16);
  const [plyGoals, setPlyGoals] = useState(8);
  const [plyAssists, setPlyAssists] = useState(5);
  const [plyCleanSheets, setPlyCleanSheets] = useState(0);
  const [plyRating, setPlyRating] = useState(82);
  const [plyFitness, setPlyFitness] = useState<'Match Ready' | 'Mild Fatigue' | 'Recovering'>('Match Ready');
  const [plyPhoto, setPlyPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');

  // Match Form State
  const [matchOpponent, setMatchOpponent] = useState('');
  const [matchComp, setMatchComp] = useState<'Bo District First Division' | 'SRFA Championship' | 'National WPL Play-offs' | 'Friendly Match'>('SRFA Championship');
  const [matchVenue, setMatchVenue] = useState('Bo Stadium (Home)');
  const [matchDate, setMatchDate] = useState('2026-08-25');
  const [matchTime, setMatchTime] = useState('04:00 PM');
  const [matchStatus, setMatchStatus] = useState<'Finished' | 'Live' | 'Upcoming'>('Upcoming');
  const [matchScoreHome, setMatchScoreHome] = useState<number>(2);
  const [matchScoreAway, setMatchScoreAway] = useState<number>(0);
  const [matchIsHome, setMatchIsHome] = useState<boolean>(true);
  const [matchTactics, setMatchTactics] = useState('4-3-3 High Press & Fast Counter');
  const [matchHighlights, setMatchHighlights] = useState('');

  const filteredPlayers = players.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === 'All' || p.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const handleGenerateTactics = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingTactics(true);
    setTacticalOutput('');

    try {
      const response = await fetch('/api/gemini/tactical-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opponentName,
          competition,
          venue,
          squadPlayers: players.map((p) => `${p.name} (${p.position})`),
          formation: selectedFormation,
        }),
      });
      const data = await response.json();
      if (data.result) {
        setTacticalOutput(data.result);
      } else {
        setTacticalOutput('Failed to generate tactical analysis.');
      }
    } catch (err) {
      console.error(err);
      setTacticalOutput('Error calling AI service.');
    } finally {
      setIsGeneratingTactics(false);
    }
  };

  // Player CRUD
  const handleOpenAddPlayerModal = () => {
    setPlyName('');
    setPlyPos('Forward');
    setPlyNum(players.length + 1);
    setPlyAge(20);
    setPlyAppearances(15);
    setPlyStarts(13);
    setPlyGoals(4);
    setPlyAssists(3);
    setPlyCleanSheets(0);
    setPlyRating(82);
    setPlyFitness('Match Ready');
    setPlyPhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
    setShowAddPlayerModal(true);
  };

  const handleOpenEditPlayerModal = (player: Player) => {
    setEditingPlayer(player);
    setPlyName(player.name);
    setPlyPos(player.position);
    setPlyNum(player.jerseyNumber);
    setPlyAge(player.age);
    setPlyAppearances(player.appearances);
    setPlyStarts(player.starts ?? Math.max(1, player.appearances - 2));
    setPlyGoals(player.goals);
    setPlyAssists(player.assists);
    setPlyCleanSheets(player.cleanSheets || 0);
    setPlyRating(player.overallRating);
    setPlyFitness(player.fitnessStatus);
    setPlyPhoto(player.photo);
  };

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plyName.trim()) return;
    const newPly: Player = {
      id: `PLY-0${players.length + 1}`,
      name: plyName,
      position: plyPos,
      jerseyNumber: Number(plyNum),
      age: Number(plyAge),
      appearances: Number(plyAppearances),
      starts: Number(plyStarts),
      subAppearances: Math.max(0, Number(plyAppearances) - Number(plyStarts)),
      minutesPlayed: Number(plyAppearances) * 85,
      goals: Number(plyGoals),
      assists: Number(plyAssists),
      cleanSheets: plyPos === 'Goalkeeper' ? Number(plyCleanSheets) : undefined,
      fitnessStatus: plyFitness,
      overallRating: Number(plyRating),
      schoolAlumni: true,
      photo: plyPhoto,
    };
    onAddPlayer(newPly);
    setShowAddPlayerModal(false);
    showToast(`Player ${newPly.name} (#${newPly.jerseyNumber}) registered.`);
  };

  const handleSaveEditPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer || !onUpdatePlayer) return;
    const updated: Player = {
      ...editingPlayer,
      name: plyName,
      position: plyPos,
      jerseyNumber: Number(plyNum),
      age: Number(plyAge),
      appearances: Number(plyAppearances),
      starts: Number(plyStarts),
      subAppearances: Math.max(0, Number(plyAppearances) - Number(plyStarts)),
      minutesPlayed: Number(plyAppearances) * 85,
      goals: Number(plyGoals),
      assists: Number(plyAssists),
      cleanSheets: plyPos === 'Goalkeeper' ? Number(plyCleanSheets) : undefined,
      fitnessStatus: plyFitness,
      overallRating: Number(plyRating),
      photo: plyPhoto,
    };
    onUpdatePlayer(updated);
    setEditingPlayer(null);
    showToast(`Player details for ${updated.name} updated.`);
  };

  const handleDeletePlayer = (id: string) => {
    if (onDeletePlayer) {
      onDeletePlayer(id);
      setDeletePlayerId(null);
      showToast(`Player removed from squad roster.`);
    }
  };

  // Match CRUD
  const handleOpenAddMatchModal = () => {
    setMatchOpponent('');
    setMatchComp('SRFA Championship');
    setMatchVenue('Bo Stadium (Home)');
    setMatchDate('2026-08-25');
    setMatchTime('04:00 PM');
    setMatchStatus('Upcoming');
    setMatchScoreHome(0);
    setMatchScoreAway(0);
    setMatchIsHome(true);
    setMatchTactics('4-3-3 High Pressing');
    setMatchHighlights('');
    setShowAddMatchModal(true);
  };

  const handleOpenEditMatchModal = (m: Match) => {
    setEditingMatch(m);
    setMatchOpponent(m.opponent);
    setMatchComp(m.competition);
    setMatchVenue(m.venue);
    setMatchDate(m.date);
    setMatchTime(m.time);
    setMatchStatus(m.status);
    setMatchScoreHome(m.scoreHome ?? 0);
    setMatchScoreAway(m.scoreAway ?? 0);
    setMatchIsHome(m.isHome);
    setMatchTactics(m.tacticalSetup || '4-3-3 Formation');
    setMatchHighlights(m.highlights ? m.highlights.join('\n') : '');
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchOpponent.trim() || !onAddMatch) return;

    const highlightsArr = matchHighlights.split('\n').map((h) => h.trim()).filter(Boolean);
    const outcome =
      matchStatus === 'Finished'
        ? matchIsHome
          ? matchScoreHome > matchScoreAway
            ? 'Win'
            : matchScoreHome === matchScoreAway
            ? 'Draw'
            : 'Loss'
          : matchScoreAway > matchScoreHome
          ? 'Win'
          : matchScoreAway === matchScoreHome
          ? 'Draw'
          : 'Loss'
        : undefined;

    const newM: Match = {
      id: `MCH-${Date.now().toString().slice(-4)}`,
      opponent: matchOpponent,
      competition: matchComp,
      venue: matchVenue,
      date: matchDate,
      time: matchTime,
      status: matchStatus,
      scoreHome: matchStatus === 'Finished' ? Number(matchScoreHome) : undefined,
      scoreAway: matchStatus === 'Finished' ? Number(matchScoreAway) : undefined,
      isHome: matchIsHome,
      result: outcome,
      attendance: matchStatus === 'Finished' ? (matchIsHome ? 3800 : 2500) : undefined,
      tacticalSetup: matchTactics,
      highlights: highlightsArr.length > 0 ? highlightsArr : undefined,
    };

    onAddMatch(newM);
    setShowAddMatchModal(false);
    showToast(`Match fixture against ${newM.opponent} added.`);
  };

  const handleSaveEditMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch || !onUpdateMatch) return;

    const highlightsArr = matchHighlights.split('\n').map((h) => h.trim()).filter(Boolean);
    const outcome =
      matchStatus === 'Finished'
        ? matchIsHome
          ? matchScoreHome > matchScoreAway
            ? 'Win'
            : matchScoreHome === matchScoreAway
            ? 'Draw'
            : 'Loss'
          : matchScoreAway > matchScoreHome
          ? 'Win'
          : matchScoreAway === matchScoreHome
          ? 'Draw'
          : 'Loss'
        : undefined;

    const updatedM: Match = {
      ...editingMatch,
      opponent: matchOpponent,
      competition: matchComp,
      venue: matchVenue,
      date: matchDate,
      time: matchTime,
      status: matchStatus,
      scoreHome: matchStatus === 'Finished' ? Number(matchScoreHome) : undefined,
      scoreAway: matchStatus === 'Finished' ? Number(matchScoreAway) : undefined,
      isHome: matchIsHome,
      result: outcome,
      tacticalSetup: matchTactics,
      highlights: highlightsArr.length > 0 ? highlightsArr : undefined,
    };

    onUpdateMatch(updatedM);
    setEditingMatch(null);
    showToast(`Match fixture #${updatedM.id} against ${updatedM.opponent} saved.`);
  };

  const handleDeleteMatch = (id: string) => {
    if (onDeleteMatch) {
      onDeleteMatch(id);
      setDeleteMatchId(null);
      showToast(`Match fixture deleted.`);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce text-xs font-bold border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Club Banner Header */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={ASSET_IMAGES.jccFcCrest}
              alt="JCC FC Emblem"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                  JCC FC / JCC Girls
                </span>
                <span className="text-xs font-medium text-amber-300">Bo District, Sierra Leone</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                JCC Football Club (Women's Team)
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Bo District First Division & Southern Region Football Association (SRFA) Champions • Contending for Women’s Premier League
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportPlayersPdf(players)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>Export Roster PDF</span>
            </button>

            <button
              onClick={handleOpenAddMatchModal}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-800/60 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Schedule / Record Match</span>
            </button>

            <button
              onClick={handleOpenAddPlayerModal}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Player</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RECHARTS SEASON VISUALIZATION COMPONENT */}
      {/* ======================================================== */}
      <JccFcSeasonAnalytics matches={matches} players={players} />

      {/* Trophy Cabinet Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> JCC Trophy Cabinet & Milestones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {trophies.map((trophy) => (
            <div
              key={trophy.id}
              className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border border-amber-800/40 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="text-xs font-extrabold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
                  {trophy.year}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-white text-base">{trophy.title}</h4>
                <p className="text-xs text-amber-400 font-medium mt-0.5">{trophy.organization}</p>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{trophy.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Fixtures & Outcome History (CRUD) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" /> Match Fixtures & Official Results
            </h3>
            <p className="text-xs text-slate-400">
              Manage fixture schedules, log scores, attendance records, and tactical notes.
            </p>
          </div>
          <button
            onClick={handleOpenAddMatchModal}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Match Fixture
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((m) => {
            const isFinished = m.status === 'Finished';
            const isHomeWinner = (m.scoreHome ?? 0) > (m.scoreAway ?? 0);
            const isAwayWinner = (m.scoreAway ?? 0) > (m.scoreHome ?? 0);
            const isDraw = (m.scoreHome ?? 0) === (m.scoreAway ?? 0) && isFinished;

            return (
              <div
                key={m.id}
                className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400">{m.competition}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'Finished'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : m.status === 'Live'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {m.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Score Board */}
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block">JCC FC (Bo)</span>
                      <span className="text-[10px] text-slate-400">{m.isHome ? 'Home Team' : 'Away Team'}</span>
                    </div>

                    <div className="px-3 py-1 bg-slate-950 rounded-md font-mono text-base font-black text-amber-400 border border-slate-700">
                      {isFinished ? `${m.scoreHome} - ${m.scoreAway}` : 'VS'}
                    </div>

                    <div className="space-y-0.5 text-right">
                      <span className="text-xs font-bold text-white block">{m.opponent}</span>
                      <span className="text-[10px] text-slate-400">{m.isHome ? 'Away Team' : 'Home Team'}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3 h-3 text-amber-400" /> {m.venue}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-cyan-400" /> {m.date} • {m.time}
                    </span>
                  </div>

                  {m.highlights && m.highlights.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-0.5">
                      <span className="font-semibold text-slate-300">Match Highlights:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                        {m.highlights.map((h, i) => (
                          <li key={i} className="truncate">{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Admin CRUD controls for Match */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEditMatchModal(m)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Match
                  </button>
                  <button
                    onClick={() => setDeleteMatchId(m.id)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-xs transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Senior Squad & Academy Roster */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase">Squad Position:</span>
            {['All', 'Forward', 'Midfielder', 'Defender', 'Goalkeeper'].map((pos) => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  positionFilter === pos
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-amber-400">{filteredPlayers.length}</strong> Players
          </span>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-amber-500/50 p-5 transition-all shadow-lg space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={player.photo}
                        alt={player.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -bottom-2 -right-2 bg-slate-950 text-amber-400 text-xs font-black px-2 py-0.5 rounded-full border border-amber-500">
                        #{player.jerseyNumber}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                        {player.name}
                      </h4>
                      <p className="text-xs text-amber-400 font-semibold">{player.position}</p>
                      <p className="text-[11px] text-slate-400">
                        Age {player.age} • Rating: <strong className="text-emerald-400">{player.overallRating}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Player Admin Controls */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleOpenEditPlayerModal(player)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                      title="Edit Player Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletePlayerId(player.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove Player"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Player Stats Grid */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block">Apps</span>
                    <span className="font-bold text-white text-xs">{player.appearances}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block">Goals</span>
                    <span className="font-bold text-amber-400 text-xs">{player.goals}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block">Assists</span>
                    <span className="font-bold text-cyan-400 text-xs">{player.assists}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block">Minutes</span>
                    <span className="font-bold text-emerald-400 text-xs">{player.minutesPlayed ?? player.appearances * 85}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> {player.fitnessStatus}
                </span>
                {player.schoolAlumni && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                    JCC School Alumni
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Match Formation Pitch & Tactics Board */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" /> Interactive Pitch Line-up & Tactics Board
            </h3>
            <p className="text-xs text-slate-400">Visual formation layout for SRFA & WPL Play-off matches</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-semibold">System:</span>
            {(['4-3-3', '4-2-3-1', '4-4-2'] as const).map((sys) => (
              <button
                key={sys}
                onClick={() => setSelectedFormation(sys)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedFormation === sys
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sys}
              </button>
            ))}
          </div>
        </div>

        {/* Pitch Graphic Container */}
        <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 border-2 border-emerald-600/50 p-4 shadow-inner flex flex-col justify-between text-white">
          <div className="absolute inset-0 border-2 border-emerald-400/20 rounded-xl m-3 pointer-events-none" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400/20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-emerald-400/20 rounded-full pointer-events-none" />

          {/* Attack Row */}
          <div className="relative z-10 flex justify-around items-center pt-4">
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center border-2 border-white shadow-lg group-hover:scale-110 transition-transform">
                #9
              </div>
              <span className="text-[11px] font-bold mt-1 bg-slate-950/80 px-2 py-0.5 rounded text-amber-300">
                Kadiatu Conteh (ST)
              </span>
            </div>
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center border-2 border-white shadow-lg group-hover:scale-110 transition-transform">
                #7
              </div>
              <span className="text-[11px] font-bold mt-1 bg-slate-950/80 px-2 py-0.5 rounded text-slate-200">
                Memunatu Sow (RW)
              </span>
            </div>
          </div>

          {/* Midfield Row */}
          <div className="relative z-10 flex justify-around items-center">
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center border-2 border-white shadow-lg group-hover:scale-110 transition-transform">
                #10
              </div>
              <span className="text-[11px] font-bold mt-1 bg-slate-950/80 px-2 py-0.5 rounded text-amber-300">
                Zainab Dumbuya (CM)
              </span>
            </div>
          </div>

          {/* Defense & Goalkeeper */}
          <div className="relative z-10 space-y-4 pb-2">
            <div className="flex justify-around items-center">
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center border-2 border-white shadow-lg group-hover:scale-110 transition-transform">
                  #4
                </div>
                <span className="text-[11px] font-bold mt-1 bg-slate-950/80 px-2 py-0.5 rounded text-slate-200">
                  Hawa Kargbo (CB)
                </span>
              </div>
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center border-2 border-white shadow-lg group-hover:scale-110 transition-transform">
                  #3
                </div>
                <span className="text-[11px] font-bold mt-1 bg-slate-950/80 px-2 py-0.5 rounded text-slate-200">
                  Bintu Jalloh (LB)
                </span>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-cyan-600 text-white font-black flex items-center justify-center border-2 border-amber-400 shadow-lg group-hover:scale-110 transition-transform">
                  #1
                </div>
                <span className="text-[11px] font-bold mt-1 bg-slate-950/80 px-2 py-0.5 rounded text-cyan-300">
                  Isatu Fofanah (GK)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Tactical Scouting Assistant */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border border-amber-800/50 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Tactical Scouting & Match Plan Generator</h3>
            <p className="text-xs text-slate-300">
              Generate match strategies, press triggers, and opponent threat counter-plans for JCC FC.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateTactics} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Opponent Club Name</label>
            <input
              type="text"
              required
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              placeholder="e.g. Freetown City Queens"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Competition</label>
            <select
              value={competition}
              onChange={(e) => setCompetition(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              <option value="National WPL Play-offs">National WPL Play-offs</option>
              <option value="SRFA Championship">SRFA Championship</option>
              <option value="Bo District First Division">Bo District First Division</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Venue</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Bo Stadium (Home)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isGeneratingTactics}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isGeneratingTactics ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Analyzing Scouting Data...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Generate Match Tactical Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>

        {tacticalOutput && (
          <div className="p-5 rounded-xl bg-slate-950 border border-amber-800/80 text-xs text-slate-200 space-y-3 font-mono leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
            <div className="flex items-center justify-between text-amber-400 font-semibold font-sans border-b border-slate-800 pb-2">
              <span>⚽ Official JCC FC Match Tactics & Scouting Report</span>
              <button
                onClick={() => navigator.clipboard.writeText(tacticalOutput)}
                className="text-[10px] text-slate-400 hover:text-white underline"
              >
                Copy Report
              </button>
            </div>
            {tacticalOutput}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD PLAYER */}
      {/* ======================================================== */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" /> Register JCC FC Player
              </h3>
              <button onClick={() => setShowAddPlayerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlayer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Player Full Name</label>
                <input
                  type="text"
                  required
                  value={plyName}
                  onChange={(e) => setPlyName(e.target.value)}
                  placeholder="e.g. Fatmata Turay"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Position</label>
                  <select
                    value={plyPos}
                    onChange={(e) => setPlyPos(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                  >
                    <option value="Forward">Forward</option>
                    <option value="Midfielder">Midfielder</option>
                    <option value="Defender">Defender</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jersey #</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={plyNum}
                    onChange={(e) => setPlyNum(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    min={14}
                    max={35}
                    value={plyAge}
                    onChange={(e) => setPlyAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Appearances</label>
                  <input
                    type="number"
                    min={0}
                    value={plyAppearances}
                    onChange={(e) => setPlyAppearances(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Goals</label>
                  <input
                    type="number"
                    min={0}
                    value={plyGoals}
                    onChange={(e) => setPlyGoals(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assists</label>
                  <input
                    type="number"
                    min={0}
                    value={plyAssists}
                    onChange={(e) => setPlyAssists(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlayerModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Register Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT PLAYER */}
      {/* ======================================================== */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" /> Update Player Profile #{editingPlayer.id}
              </h3>
              <button onClick={() => setEditingPlayer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPlayer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Player Full Name</label>
                <input
                  type="text"
                  required
                  value={plyName}
                  onChange={(e) => setPlyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Position</label>
                  <select
                    value={plyPos}
                    onChange={(e) => setPlyPos(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Forward">Forward</option>
                    <option value="Midfielder">Midfielder</option>
                    <option value="Defender">Defender</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jersey #</label>
                  <input
                    type="number"
                    value={plyNum}
                    onChange={(e) => setPlyNum(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={plyAge}
                    onChange={(e) => setPlyAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Appearances</label>
                  <input
                    type="number"
                    value={plyAppearances}
                    onChange={(e) => setPlyAppearances(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Goals</label>
                  <input
                    type="number"
                    value={plyGoals}
                    onChange={(e) => setPlyGoals(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assists</label>
                  <input
                    type="number"
                    value={plyAssists}
                    onChange={(e) => setPlyAssists(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Overall Rating (1-99)</label>
                  <input
                    type="number"
                    min={50}
                    max={99}
                    value={plyRating}
                    onChange={(e) => setPlyRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Fitness Status</label>
                  <select
                    value={plyFitness}
                    onChange={(e) => setPlyFitness(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Match Ready">Match Ready</option>
                    <option value="Mild Fatigue">Mild Fatigue</option>
                    <option value="Recovering">Recovering</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / SCHEDULE MATCH */}
      {/* ======================================================== */}
      {showAddMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Schedule or Record Match
              </h3>
              <button onClick={() => setShowAddMatchModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Opponent Club Name</label>
                <input
                  type="text"
                  required
                  value={matchOpponent}
                  onChange={(e) => setMatchOpponent(e.target.value)}
                  placeholder="e.g. Kenema Queens FC"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Competition</label>
                  <select
                    value={matchComp}
                    onChange={(e) => setMatchComp(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="SRFA Championship">SRFA Championship</option>
                    <option value="Bo District First Division">Bo District First Division</option>
                    <option value="National WPL Play-offs">National WPL Play-offs</option>
                    <option value="Friendly Match">Friendly Match</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={matchStatus}
                    onChange={(e) => setMatchStatus(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Finished">Finished</option>
                    <option value="Live">Live</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Match Date</label>
                  <input
                    type="date"
                    required
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Time</label>
                  <input
                    type="text"
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                    placeholder="04:00 PM"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Venue</label>
                <input
                  type="text"
                  value={matchVenue}
                  onChange={(e) => setMatchVenue(e.target.value)}
                  placeholder="Bo Stadium (Home)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              {matchStatus === 'Finished' && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Home Score</label>
                    <input
                      type="number"
                      min={0}
                      value={matchScoreHome}
                      onChange={(e) => setMatchScoreHome(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Away Score</label>
                    <input
                      type="number"
                      min={0}
                      value={matchScoreAway}
                      onChange={(e) => setMatchScoreAway(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMatchModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT MATCH */}
      {/* ======================================================== */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" /> Edit Match Fixture #{editingMatch.id}
              </h3>
              <button onClick={() => setEditingMatch(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Opponent Club Name</label>
                <input
                  type="text"
                  required
                  value={matchOpponent}
                  onChange={(e) => setMatchOpponent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Competition</label>
                  <select
                    value={matchComp}
                    onChange={(e) => setMatchComp(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="SRFA Championship">SRFA Championship</option>
                    <option value="Bo District First Division">Bo District First Division</option>
                    <option value="National WPL Play-offs">National WPL Play-offs</option>
                    <option value="Friendly Match">Friendly Match</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={matchStatus}
                    onChange={(e) => setMatchStatus(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Finished">Finished</option>
                    <option value="Live">Live</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Match Date</label>
                  <input
                    type="date"
                    required
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Venue</label>
                  <input
                    type="text"
                    value={matchVenue}
                    onChange={(e) => setMatchVenue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {matchStatus === 'Finished' && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Home Score</label>
                    <input
                      type="number"
                      value={matchScoreHome}
                      onChange={(e) => setMatchScoreHome(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Away Score</label>
                    <input
                      type="number"
                      value={matchScoreAway}
                      onChange={(e) => setMatchScoreAway(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Match Highlights (One per line)</label>
                <textarea
                  rows={3}
                  value={matchHighlights}
                  onChange={(e) => setMatchHighlights(e.target.value)}
                  placeholder="Goal by Kadiatu Conteh (14 min)..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMatch(null)}
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

      {/* Delete Player Confirmation */}
      {deletePlayerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h4 className="font-bold text-white text-base">Remove Player from Roster?</h4>
            <p className="text-xs text-slate-300">Are you sure you want to remove player #{deletePlayerId} from the squad?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletePlayerId(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePlayer(deletePlayerId)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Match Confirmation */}
      {deleteMatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h4 className="font-bold text-white text-base">Delete Match Record?</h4>
            <p className="text-xs text-slate-300">Are you sure you want to delete match fixture #{deleteMatchId}?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteMatchId(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMatch(deleteMatchId)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
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
