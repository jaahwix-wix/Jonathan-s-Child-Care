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
} from 'lucide-react';
import { Player, Match, Trophy as TrophyType } from '../types';
import { ASSET_IMAGES } from '../data/mockData';
import { exportPlayersPdf } from '../utils/pdfExporter';

interface JccFcManagementProps {
  players: Player[];
  matches: Match[];
  trophies: TrophyType[];
  onAddPlayer: (player: Player) => void;
  searchQuery: string;
}

export const JccFcManagement: React.FC<JccFcManagementProps> = ({
  players,
  matches,
  trophies,
  onAddPlayer,
  searchQuery,
}) => {
  const [positionFilter, setPositionFilter] = useState<string>('All');
  const [selectedFormation, setSelectedFormation] = useState<'4-3-3' | '4-2-3-1' | '4-4-2'>('4-3-3');
  const [showAddPlayerModal, setShowAddPlayerModal] = useState<boolean>(false);

  // AI Tactical Scouting Generator State
  const [opponentName, setOpponentName] = useState('Freetown City Queens');
  const [competition, setCompetition] = useState('National WPL Play-offs');
  const [venue, setVenue] = useState('Bo Stadium (Home)');
  const [tacticalOutput, setTacticalOutput] = useState('');
  const [isGeneratingTactics, setIsGeneratingTactics] = useState(false);

  // New Player Form State
  const [plyName, setPlyName] = useState('');
  const [plyPos, setPlyPos] = useState<'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward'>('Forward');
  const [plyNum, setPlyNum] = useState(11);
  const [plyAge, setPlyAge] = useState(20);

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

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plyName.trim()) return;
    const newPly: Player = {
      id: `PLY-0${players.length + 1}`,
      name: plyName,
      position: plyPos,
      jerseyNumber: Number(plyNum),
      age: Number(plyAge),
      appearances: 12,
      goals: plyPos === 'Forward' ? 8 : 2,
      assists: 4,
      fitnessStatus: 'Match Ready',
      overallRating: 82,
      schoolAlumni: true,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    };
    onAddPlayer(newPly);
    setShowAddPlayerModal(false);
    setPlyName('');
  };

  return (
    <div className="space-y-8 pb-12">
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportPlayersPdf(players)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>Export Roster PDF</span>
            </button>

            <button
              onClick={() => setShowAddPlayerModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Player</span>
            </button>
          </div>
        </div>
      </div>

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

                {/* Player Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Goals</span>
                    <span className="font-bold text-amber-400 text-sm">{player.goals}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Assists</span>
                    <span className="font-bold text-cyan-400 text-sm">{player.assists}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Clean Sheets</span>
                    <span className="font-bold text-emerald-400 text-sm">{player.cleanSheets ?? 'N/A'}</span>
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
          {/* Pitch Lines */}
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

      {/* Add Player Modal */}
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
    </div>
  );
};
