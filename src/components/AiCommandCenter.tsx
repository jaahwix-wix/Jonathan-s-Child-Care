import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  GraduationCap,
  Trophy,
  Microscope,
  HeartHandshake,
  Loader2,
  Copy,
  CheckCircle2,
  Send,
  Zap,
} from 'lucide-react';
import { Student, Player } from '../types';

interface AiCommandCenterProps {
  students: Student[];
  players: Player[];
}

export const AiCommandCenter: React.FC<AiCommandCenterProps> = ({
  students,
  players,
}) => {
  const [activeEngine, setActiveEngine] = useState<'report' | 'tactics' | 'stem' | 'grant'>('report');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [outputResult, setOutputResult] = useState('');

  // Form States
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedOpponent, setSelectedOpponent] = useState('Kenema Queens FC');
  const [selectedTopic, setSelectedTopic] = useState('Microscopic Cellular Organelles & Staining');
  const [selectedGrantTitle, setSelectedGrantTitle] = useState('Construction of Additional Science Lab Storage in Bo');

  const handleCopy = () => {
    if (!outputResult) return;
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunEngine = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOutputResult('');

    try {
      if (activeEngine === 'report') {
        const student = students.find((s) => s.id === selectedStudentId) || students[0];
        const res = await fetch('/api/gemini/student-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: student.name,
            gradeLevel: student.gradeLevel,
            grades: student.grades,
            emotionalNotes: student.emotionalSupportNotes,
          }),
        });
        const data = await res.json();
        setOutputResult(data.result || 'No output returned.');
      } else if (activeEngine === 'tactics') {
        const res = await fetch('/api/gemini/tactical-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            opponentName: selectedOpponent,
            competition: 'Southern Region Football Association Championship',
            venue: 'Bo Stadium (Home)',
            squadPlayers: players.map((p) => p.name),
            formation: '4-3-3',
          }),
        });
        const data = await res.json();
        setOutputResult(data.result || 'No output returned.');
      } else if (activeEngine === 'stem') {
        const res = await fetch('/api/gemini/stem-lab-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: selectedTopic,
            subject: 'Integrated Science',
            targetGrade: 'JSS 2 STEM Track',
            durationMinutes: 60,
            availableEquipment: ['Compound Microscopes', 'Glass Slides', 'Biological Stains'],
          }),
        });
        const data = await res.json();
        setOutputResult(data.result || 'No output returned.');
      } else if (activeEngine === 'grant') {
        const res = await fetch('/api/gemini/grant-writer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initiativeTitle: selectedGrantTitle,
            targetFundingUSD: 4000,
            fundingCategory: 'Science & Math Lab Equipment',
            projectDescription: 'Expanding laboratory microscopes and digital math tools for children in Bo District.',
          }),
        });
        const data = await res.json();
        setOutputResult(data.result || 'No output returned.');
      }
    } catch (err) {
      console.error(err);
      setOutputResult('An error occurred while generating content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 p-6 rounded-2xl border border-amber-800/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            Gemini 3.6 Flash AI Workbench
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">JCC Intelligent Command Center</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
            Unified AI tools for teachers, sports coaches, lab technicians, and directors at Jonathan's Child Care in Bo District.
          </p>
        </div>

        <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold border border-amber-500/40 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Server-Side Secure Gemini AI
        </span>
      </div>

      {/* Engine Switcher */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setActiveEngine('report');
            setOutputResult('');
          }}
          className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
            activeEngine === 'report'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-emerald-500/50'
          }`}
        >
          <GraduationCap className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="font-bold text-xs sm:text-sm">Academic Report</h4>
            <p className="text-[10px] opacity-80">Student Report Cards</p>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveEngine('tactics');
            setOutputResult('');
          }}
          className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
            activeEngine === 'tactics'
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-lg'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
          }`}
        >
          <Trophy className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="font-bold text-xs sm:text-sm">JCC FC Tactics</h4>
            <p className="text-[10px] opacity-80">Match Strategy & Scouting</p>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveEngine('stem');
            setOutputResult('');
          }}
          className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
            activeEngine === 'stem'
              ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/50'
          }`}
        >
          <Microscope className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="font-bold text-xs sm:text-sm">STEM Lab Guide</h4>
            <p className="text-[10px] opacity-80">Science Lab Practical Plans</p>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveEngine('grant');
            setOutputResult('');
          }}
          className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
            activeEngine === 'grant'
              ? 'bg-teal-600 text-white border-teal-400 shadow-lg'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-teal-500/50'
          }`}
        >
          <HeartHandshake className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="font-bold text-xs sm:text-sm">Grant Proposal</h4>
            <p className="text-[10px] opacity-80">Donor Sponsorship Application</p>
          </div>
        </button>
      </div>

      {/* Engine Controls & Output Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form Panel */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
          <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            {activeEngine === 'report' && 'Student Selection'}
            {activeEngine === 'tactics' && 'Match & Opponent Parameters'}
            {activeEngine === 'stem' && 'STEM Experiment Topic'}
            {activeEngine === 'grant' && 'Grant Initiative Details'}
          </h3>

          <form onSubmit={handleRunEngine} className="space-y-4 text-xs">
            {activeEngine === 'report' && (
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.gradeLevel})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeEngine === 'tactics' && (
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Opponent Football Club</label>
                <input
                  type="text"
                  value={selectedOpponent}
                  onChange={(e) => setSelectedOpponent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            )}

            {activeEngine === 'stem' && (
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Practical Experiment Topic</label>
                <input
                  type="text"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            )}

            {activeEngine === 'grant' && (
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Grant Proposal Focus</label>
                <input
                  type="text"
                  value={selectedGrantTitle}
                  onChange={(e) => setSelectedGrantTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Generation</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" /> Output Document
            </h3>
            {outputResult && (
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Document'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-5 text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap min-h-64 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-12">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p>Generating personalized content for Jonathan's Child Care...</p>
              </div>
            ) : outputResult ? (
              outputResult
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-12">
                <Sparkles className="w-8 h-8 text-slate-600" />
                <p>Select an AI engine and click "Run AI Generation" to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
