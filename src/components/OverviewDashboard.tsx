import React from 'react';
import {
  GraduationCap,
  Trophy,
  Microscope,
  Users,
  MapPin,
  Calendar,
  Award,
  ArrowRight,
  Sparkles,
  Flame,
  CheckCircle2,
  HeartHandshake,
  Heart,
  PlusCircle,
} from 'lucide-react';
import { ModuleTab, Student, Player, Match, Trophy as TrophyType, CommunityEvent, InstagramPost } from '../types';
import { ASSET_IMAGES } from '../data/mockData';
import { EnrollmentTrendChart } from './EnrollmentTrendChart';

interface OverviewDashboardProps {
  setActiveTab: (tab: ModuleTab) => void;
  students: Student[];
  players: Player[];
  matches: Match[];
  trophies: TrophyType[];
  events: CommunityEvent[];
  instagramPosts: InstagramPost[];
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  setActiveTab,
  students,
  players,
  matches,
  trophies,
  events,
  instagramPosts,
}) => {
  const topScorer = players.length > 0
    ? players.reduce((prev, current) => (prev.goals > current.goals ? prev : current), players[0])
    : null;

  const upcomingMatch = matches.find((m) => m.status === 'Upcoming') || matches[0] || null;
  const nextEvent = events.find((e) => e.status === 'Upcoming') || events[0] || null;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            src={ASSET_IMAGES.campusBanner}
            alt="Jonathan Child Care Bo Campus"
            className="w-full h-full object-cover opacity-35 filter contrast-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 shadow-xl border-2 border-emerald-400/80 shrink-0">
              <img
                src={ASSET_IMAGES.systemLogo}
                alt="Jonathan's Child Care Ministries Official System Logo"
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Bo District, Sierra Leone • Established 20+ Years
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Nurturing Minds, Building Champions in Bo
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Jonathan's Child Care (JCC) provides rigorous academic standards, a dedicated Science & Math Teaching Laboratory, holistic emotional child support, and powers <span className="text-amber-300 font-semibold">JCC FC</span> — Southern Region FA Women Football Champions.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('school')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Explore Academic School</span>
            </button>
            <button
              onClick={() => setActiveTab('jcc-fc')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-slate-950" />
              <span>JCC FC Football Hub</span>
            </button>
            <button
              onClick={() => setActiveTab('science-lab')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
            >
              <Microscope className="w-4 h-4 text-cyan-400" />
              <span>Science & Math Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div
          onClick={() => setActiveTab('school')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Enrolled Pupils</p>
              <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">
                {students.length} Registered
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
            <span className="text-emerald-400 font-medium">Nursery, Primary & JSS</span>
            <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => setActiveTab('science-lab')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">STEM Lab Facilities</p>
              <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-cyan-400 transition-colors">
                Active Stations
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Microscope className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
            <span className="text-cyan-400 font-medium">Equipped for Biology & Physics</span>
            <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Book Lab <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div
          onClick={() => setActiveTab('jcc-fc')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">JCC FC Squad</p>
              <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-amber-400 transition-colors">
                {players.length} Athletes
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
            <span className="text-amber-400 font-medium">SRFA Regional Champions</span>
            <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Fixtures <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div
          onClick={() => setActiveTab('community')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Community Panels</p>
              <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-purple-400 transition-colors">
                {events.length} Events
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
            <span className="text-purple-400 font-medium">Bo Youth & Civic Outreach</span>
            <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Events <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* 12-Month Student Enrollment Trend Data Visualization */}
      <EnrollmentTrendChart onNavigateToSchool={() => setActiveTab('school')} />

      {/* Dual Spotlight Section: School & Football */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spotlight 1: Academic & Science Lab Spotlight */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Jonathan's Child Care Academic Excellence</h2>
                <p className="text-xs text-slate-400">High standards, STEM track & student welfare in Bo</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('school')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              View All Students <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top Student Highlight */}
            {students.length > 0 ? (
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Enrolled Scholar
                </span>
                <div className="flex items-center gap-3">
                  <img
                    src={students[0].avatar}
                    alt={students[0].name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="font-bold text-white text-sm">{students[0].name}</p>
                    <p className="text-xs text-slate-400">{students[0].gradeLevel}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setActiveTab('school')}
                className="p-4 rounded-xl bg-slate-800/40 border border-dashed border-slate-700 space-y-2 cursor-pointer hover:border-emerald-500/50 transition-colors text-center"
              >
                <PlusCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-200">No Pupils Registered Yet</p>
                <p className="text-[11px] text-slate-400">Click to enroll new students in Firestore</p>
              </div>
            )}

            {/* Science Lab Facility Card */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                Teaching Lab Feature
              </span>
              <div>
                <p className="font-bold text-white text-sm">Dedicated Science & Math Lab</p>
                <p className="text-xs text-slate-300 mt-1">
                  Equipped for binocular microscopy, optics experiments, and chemistry titrations.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('science-lab')}
                className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1 pt-1"
              >
                Schedule Experiment <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Academic Progress Stats */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full Practical STEM Curriculum Active</span>
            </div>
            <button
              onClick={() => setActiveTab('ai-hub')}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Student Report Generator</span>
            </button>
          </div>
        </div>

        {/* Spotlight 2: JCC FC Football Club Spotlight */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">JCC FC (Women's Football Club)</h2>
                <p className="text-xs text-slate-400">Bo District First Division & SRFA Regional Champions</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('jcc-fc')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              Squad & Tactics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top Scorer Card */}
            {topScorer ? (
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Squad Striker
                </span>
                <div className="flex items-center gap-3">
                  <img
                    src={topScorer.photo}
                    alt={topScorer.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="font-bold text-white text-sm">{topScorer.name}</p>
                    <p className="text-xs text-amber-300 font-semibold">{topScorer.goals} Goals • {topScorer.assists} Assists</p>
                    <p className="text-[11px] text-slate-400">{topScorer.position} #{topScorer.jerseyNumber}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setActiveTab('jcc-fc')}
                className="p-4 rounded-xl bg-slate-800/40 border border-dashed border-slate-700 space-y-2 cursor-pointer hover:border-amber-500/50 transition-colors text-center"
              >
                <PlusCircle className="w-6 h-6 text-amber-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-200">No Players Added Yet</p>
                <p className="text-[11px] text-slate-400">Click to register squad members in Firestore</p>
              </div>
            )}

            {/* Upcoming Match Card */}
            {upcomingMatch ? (
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Match Fixture
                </span>
                <div>
                  <p className="font-bold text-white text-sm">vs {upcomingMatch.opponent}</p>
                  <p className="text-xs text-slate-300 mt-0.5">{upcomingMatch.competition}</p>
                  <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {upcomingMatch.date} • {upcomingMatch.venue}
                  </p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setActiveTab('jcc-fc')}
                className="p-4 rounded-xl bg-slate-800/40 border border-dashed border-slate-700 space-y-2 cursor-pointer hover:border-amber-500/50 transition-colors text-center"
              >
                <Calendar className="w-6 h-6 text-amber-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-200">No Scheduled Matches</p>
                <p className="text-[11px] text-slate-400">Click to create match fixtures</p>
              </div>
            )}
          </div>

          {/* Trophy Cabinet Banner */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-amber-200">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Contending for Women’s Premier League Qualification!</span>
            </div>
            <button
              onClick={() => setActiveTab('ai-hub')}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Tactical Scouting Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Community Engagement & Instagram Social Feed Bar */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Community Panels & Social Outreach
            </h2>
            <p className="text-xs text-slate-400">
              Bo District Development Events, Youth Empowerment & Community Outreach
            </p>
          </div>
          <button
            onClick={() => setActiveTab('community')}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
          >
            Manage Events <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {nextEvent ? (
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                Upcoming Community Summit
              </span>
              <p className="font-bold text-white text-base mt-1">{nextEvent.title}</p>
              <p className="text-xs text-slate-300">{nextEvent.date} • {nextEvent.location}</p>
            </div>
            <button
              onClick={() => setActiveTab('community')}
              className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              View Event
            </button>
          </div>
        ) : (
          <div
            onClick={() => setActiveTab('community')}
            className="p-4 rounded-xl bg-slate-800/40 border border-dashed border-slate-700 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
          >
            <Users className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-200">No Community Events Listed</p>
            <p className="text-[11px] text-slate-400">Click to create outreach summits and workshops</p>
          </div>
        )}
      </div>
    </div>
  );
};
