import React from 'react';
import {
  GraduationCap,
  Trophy,
  Microscope,
  Users,
  HeartHandshake,
  Heart,
  Bot,
  LayoutDashboard,
  MapPin,
  Sparkles,
  Bell,
  Search,
  ShieldCheck,
  Lock,
  LogOut,
  FileDown,
  FileText,
  ChevronDown,
  CheckCircle2,
  Palette,
  Sun,
  Moon,
} from 'lucide-react';

import { ModuleTab, UserSession, Student, Player, OrphanRecord, EquipmentAllocation, ThemeMode } from '../types';
import { ASSET_IMAGES, DEFAULT_USERS } from '../data/mockData';
import { exportStudentsPdf, exportPlayersPdf, exportExecutiveCombinedPdf, exportOrphanRosterPdf, exportLabAllocationsPdf } from '../utils/pdfExporter';

interface NavbarProps {
  activeTab: ModuleTab;
  setActiveTab: (tab: ModuleTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentUser: UserSession;
  onSwitchUser: (user: UserSession) => void;
  onLogout: () => void;
  students: Student[];
  players: Player[];
  orphans?: OrphanRecord[];
  allocations?: EquipmentAllocation[];
  themeMode: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  currentUser,
  onSwitchUser,
  onLogout,
  students,
  players,
  orphans = [],
  allocations = [],
  themeMode,
  onThemeChange,
}) => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showPdfDropdown, setShowPdfDropdown] = React.useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = React.useState(false);

  const navItems = [
    { id: 'overview' as ModuleTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'school' as ModuleTab, label: 'JCC School & Fees', icon: GraduationCap },
    { id: 'orphanage' as ModuleTab, label: 'Orphanage & Welfare', icon: Heart },
    { id: 'science-lab' as ModuleTab, label: 'Science & Math Lab', icon: Microscope },
    { id: 'jcc-fc' as ModuleTab, label: 'JCC FC Football', icon: Trophy },
    { id: 'community' as ModuleTab, label: 'Community & Social', icon: Users },
    { id: 'sponsorship' as ModuleTab, label: 'Sponsors & Grants', icon: HeartHandshake },
    { id: 'ai-hub' as ModuleTab, label: 'AI Command Center', icon: Bot, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-xl border-b border-emerald-900/50">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 px-4 py-2 text-xs text-emerald-200 border-b border-emerald-800/40">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Bo District, Sierra Leone
            </span>
            <span className="hidden sm:inline text-slate-300">
              • 20+ Years Educational Legacy & Welfare Excellence
            </span>
            <span className="hidden md:inline bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-semibold">
              🏆 SRFA Regional Champions - JCC FC
            </span>
          </div>
          <div className="flex items-center gap-3 font-medium">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Authenticated: {currentUser.name}
            </span>
            <span className="text-slate-500">|</span>
            <button
              onClick={onLogout}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px] font-bold"
            >
              <LogOut className="w-3 h-3" /> Lock Gateway
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 cursor-pointer group py-2"
          >
            <div className="relative w-12 h-12 rounded-xl bg-white p-1 shadow-lg group-hover:scale-105 transition-transform duration-200 border border-slate-700/80">
              <img
                src={ASSET_IMAGES.systemLogo}
                alt="Jonathan's Child Care Ministries System Logo"
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  Jonathan's Child Care
                </h1>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded tracking-wider">
                  JCC & JCC FC
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                Academic School & Science Lab • Bo District, Sierra Leone
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, players, equipment, events..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Action Center & PDF Export & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* PDF Export Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowPdfDropdown(!showPdfDropdown)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all border border-emerald-500/50"
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showPdfDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Administrative PDF Reports
                  </div>
                  <button
                    onClick={() => {
                      exportStudentsPdf(students);
                      setShowPdfDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-slate-200 hover:bg-emerald-600/20 hover:text-emerald-300 flex items-center gap-2 transition-colors"
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span>Download Student Roster (PDF)</span>
                  </button>
                  <button
                    onClick={() => {
                      exportOrphanRosterPdf(orphans);
                      setShowPdfDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-slate-200 hover:bg-rose-600/20 hover:text-rose-300 flex items-center gap-2 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>Download Orphan Welfare Roster (PDF)</span>
                  </button>
                  <button
                    onClick={() => {
                      exportPlayersPdf(players);
                      setShowPdfDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-slate-200 hover:bg-amber-600/20 hover:text-amber-300 flex items-center gap-2 transition-colors"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Download Player Roster (PDF)</span>
                  </button>
                  <button
                    onClick={() => {
                      exportLabAllocationsPdf(allocations);
                      setShowPdfDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-slate-200 hover:bg-cyan-600/20 hover:text-cyan-300 flex items-center gap-2 transition-colors"
                  >
                    <Microscope className="w-4 h-4 text-cyan-400" />
                    <span>Download Science Lab Schedule (PDF)</span>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    onClick={() => {
                      exportExecutiveCombinedPdf(students, players);
                      setShowPdfDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-white font-bold hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Master Executive Audit (PDF)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Theme Selector Dropdown Button */}
            <div className="relative">
              <button
                id="btn-theme-switcher"
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-sm transition-all border border-slate-700"
                title="Change Application Theme"
              >
                <Palette className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">
                  {themeMode === 'academic-light' ? 'Academic Light' : themeMode === 'midnight-emerald' ? 'Midnight Emerald' : 'Deep Navy'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showThemeDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Theme Archetype
                  </div>
                  <button
                    onClick={() => {
                      onThemeChange('academic-light');
                      setShowThemeDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                      themeMode === 'academic-light'
                        ? 'bg-emerald-600/30 text-emerald-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-400" />
                      Academic Light (Ivory & Emerald)
                    </span>
                    {themeMode === 'academic-light' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => {
                      onThemeChange('midnight-emerald');
                      setShowThemeDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                      themeMode === 'midnight-emerald'
                        ? 'bg-emerald-600/30 text-emerald-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-emerald-400" />
                      Midnight Slate & Emerald
                    </span>
                    {themeMode === 'midnight-emerald' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => {
                      onThemeChange('deep-navy');
                      setShowThemeDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                      themeMode === 'deep-navy'
                        ? 'bg-indigo-600/30 text-indigo-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-indigo-400" />
                      Royal Navy & Sapphire
                    </span>
                    {themeMode === 'deep-navy' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Authenticated User Profile & Privileges Button */}
            <button
              onClick={() => setShowAuthModal(!showAuthModal)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all shadow-sm"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border-2 border-emerald-400"
                referrerPolicy="no-referrer"
              />
              <div className="hidden md:block text-left">
                <span className="block font-bold leading-tight text-white">{currentUser.name}</span>
                <span className="block text-[10px] text-emerald-400 font-medium">{currentUser.role}</span>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900"></span>
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-sm">
                  <div className="px-4 py-2 border-b border-slate-800 font-semibold text-slate-200 flex justify-between items-center">
                    <span>Bo District Bulletins</span>
                    <span className="text-xs text-emerald-400 font-normal">3 New</span>
                  </div>
                  <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto">
                    <div className="p-3 hover:bg-slate-800/50 cursor-pointer">
                      <p className="font-medium text-emerald-300 text-xs">JCC FC Championship Play-off</p>
                      <p className="text-slate-300 text-xs mt-0.5">
                        National WPL Play-off fixture set vs Freetown City Queens at Bo Stadium.
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 block">2 hours ago</span>
                    </div>
                    <div className="p-3 hover:bg-slate-800/50 cursor-pointer">
                      <p className="font-medium text-amber-300 text-xs">Science & Math Lab Equipment</p>
                      <p className="text-slate-300 text-xs mt-0.5">
                        12 new compound microscopes inspected and ready for JSS 2 STEM session.
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 block">1 day ago</span>
                    </div>
                    <div className="p-3 hover:bg-slate-800/50 cursor-pointer">
                      <p className="font-medium text-blue-300 text-xs">Community Panel Registration</p>
                      <p className="text-slate-300 text-xs mt-0.5">
                        180 local leaders registered for Bo Youth Educational Summit.
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 block">2 days ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab('sponsorship')}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm shadow-md transition-all border border-emerald-400/30"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Sponsor JCC</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center space-x-1 overflow-x-auto pb-3 pt-1 scrollbar-none border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 border border-emerald-400/40'
                    : item.highlight
                    ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Authentication & Privilege Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">System Access & Privileges</h3>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-white">
                <Lock className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-0.5">
                <h4 className="font-bold text-white text-base">{currentUser.name}</h4>
                <p className="text-xs text-emerald-400 font-semibold">{currentUser.role}</p>
                <p className="text-[11px] text-slate-400">{currentUser.department} • {currentUser.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Granted System Privileges:</p>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.privileges.map((priv, idx) => (
                  <span key={idx} className="text-[11px] font-medium bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {priv}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-3">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Switch Authenticated User Profile:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEFAULT_USERS.map((usr) => (
                  <button
                    key={usr.id}
                    onClick={() => {
                      onSwitchUser(usr);
                      setShowAuthModal(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 ${
                      currentUser.id === usr.id
                        ? 'bg-emerald-600 text-white border-emerald-400 font-semibold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    <img src={usr.avatar} alt={usr.name} className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div className="truncate">
                      <p className="font-bold text-white truncate">{usr.name}</p>
                      <p className="text-[10px] opacity-80 truncate">{usr.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-800">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  onLogout();
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-4 h-4" /> Sign Out & Lock Gateway
              </button>

              <button
                onClick={() => setShowAuthModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
