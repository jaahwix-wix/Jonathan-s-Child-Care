import React, { useState } from 'react';
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
  ShieldCheck,
  Lock,
  LogOut,
  FileDown,
  FileText,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Palette,
  Sun,
  Moon,
  X,
  Building2,
  Award,
  Layers,
} from 'lucide-react';

import {
  ModuleTab,
  UserSession,
  Student,
  Player,
  OrphanRecord,
  EquipmentAllocation,
  ThemeMode,
} from '../types';
import { ASSET_IMAGES, DEFAULT_USERS } from '../data/mockData';
import {
  exportStudentsPdf,
  exportPlayersPdf,
  exportExecutiveCombinedPdf,
  exportOrphanRosterPdf,
  exportLabAllocationsPdf,
} from '../utils/pdfExporter';

interface SidebarProps {
  activeTab: ModuleTab;
  setActiveTab: (tab: ModuleTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
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

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPdfSection, setShowPdfSection] = useState(false);

  const navItems = [
    {
      id: 'overview' as ModuleTab,
      label: 'Overview Dashboard',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'school' as ModuleTab,
      label: 'JCC School & Fees',
      shortLabel: 'Academic School',
      icon: GraduationCap,
      badge: students.length > 0 ? `${students.length}` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'orphanage' as ModuleTab,
      label: 'Orphanage & Welfare',
      shortLabel: 'Child Welfare',
      icon: Heart,
      badge: orphans.length > 0 ? `${orphans.length}` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'science-lab' as ModuleTab,
      label: 'Science & Math Lab',
      shortLabel: 'STEM Lab',
      icon: Microscope,
      badge: 'STEM',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    {
      id: 'jcc-fc' as ModuleTab,
      label: 'JCC FC Football',
      shortLabel: 'JCC FC Hub',
      icon: Trophy,
      badge: players.length > 0 ? `${players.length}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'community' as ModuleTab,
      label: 'Community & Social',
      shortLabel: 'Outreach',
      icon: Users,
      badge: null,
    },
    {
      id: 'sponsorship' as ModuleTab,
      label: 'Sponsors & Grants',
      shortLabel: 'Donors',
      icon: HeartHandshake,
      badge: null,
    },
    {
      id: 'ai-hub' as ModuleTab,
      label: 'AI Command Center',
      shortLabel: 'AI Intelligence',
      icon: Bot,
      highlight: true,
      badge: 'Gemini AI',
      badgeColor: 'bg-amber-400 text-slate-950 font-bold',
    },
  ];

  const handleNavClick = (tabId: ModuleTab) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="system-left-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 border-r flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } ${
          themeMode === 'academic-light'
            ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
            : themeMode === 'deep-navy'
            ? 'bg-[#081226] border-slate-800 text-slate-100'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Top Branding Section */}
        <div className={`p-4 border-b shrink-0 ${
          themeMode === 'academic-light' ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between">
            <div
              onClick={() => handleNavClick('overview')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-white p-1 shadow-md border border-emerald-500/50 group-hover:scale-105 transition-transform shrink-0">
                <img
                  src={ASSET_IMAGES.systemLogo}
                  alt="Jonathan's Child Care Logo"
                  className="w-full h-full object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className={`text-sm font-bold tracking-tight truncate transition-colors ${
                    themeMode === 'academic-light'
                      ? 'text-slate-900 group-hover:text-emerald-700'
                      : 'text-white group-hover:text-emerald-300'
                  }`}>
                    Jonathan's Child Care
                  </h1>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded tracking-wider">
                    JCC & JCC FC
                  </span>
                  <span className={`text-[11px] truncate ${
                    themeMode === 'academic-light' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Bo District
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsOpenMobile(false)}
              className={`p-1.5 rounded-lg lg:hidden ${
                themeMode === 'academic-light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Regional Status Pill */}
          <div className={`mt-3 px-2.5 py-1.5 rounded-lg border flex items-center justify-between text-[11px] ${
            themeMode === 'academic-light'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
              : 'bg-emerald-950/50 border-emerald-800/40 text-emerald-300'
          }`}>
            <span className="flex items-center gap-1.5 font-medium truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              Bo District, Sierra Leone
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
              themeMode === 'academic-light'
                ? 'bg-emerald-200/80 text-emerald-900'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              20+ Yrs
            </span>
          </div>
        </div>

        {/* Scrollable Navigation Menu Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-400">
          {/* Main System Modules */}
          <div className="space-y-1">
            <div className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between ${
              themeMode === 'academic-light' ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <span>System Navigation</span>
              <span className="text-emerald-500 text-[9px] font-semibold">Active Menu</span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all text-left ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 border border-emerald-500 font-semibold'
                      : item.highlight
                      ? themeMode === 'academic-light'
                        ? 'bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent text-amber-900 hover:bg-amber-100/60 border border-amber-300/60 font-semibold'
                        : 'bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                      : themeMode === 'academic-light'
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? themeMode === 'academic-light' ? 'text-amber-600' : 'text-amber-400'
                          : themeMode === 'academic-light' ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md border shrink-0 ${
                        item.badgeColor || (
                          themeMode === 'academic-light'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        )
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick PDF Reports & Administrative Tools */}
          <div className={`space-y-1 pt-2 border-t ${
            themeMode === 'academic-light' ? 'border-slate-100' : 'border-slate-800/80'
          }`}>
            <button
              onClick={() => setShowPdfSection(!showPdfSection)}
              className={`w-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
                themeMode === 'academic-light'
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <FileDown className="w-3.5 h-3.5 text-emerald-500" />
                Administrative PDF Hub
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  showPdfSection ? 'rotate-180' : ''
                } ${themeMode === 'academic-light' ? 'text-slate-500' : 'text-slate-400'}`}
              />
            </button>

            {showPdfSection && (
              <div className="space-y-1 pl-2 pt-1">
                <button
                  onClick={() => exportStudentsPdf(students)}
                  className={`w-full px-2.5 py-1.5 text-left text-xs rounded-lg flex items-center gap-2 transition-colors ${
                    themeMode === 'academic-light'
                      ? 'text-slate-700 hover:text-emerald-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-800/60'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">Student Roster (PDF)</span>
                </button>

                <button
                  onClick={() => exportOrphanRosterPdf(orphans)}
                  className={`w-full px-2.5 py-1.5 text-left text-xs rounded-lg flex items-center gap-2 transition-colors ${
                    themeMode === 'academic-light'
                      ? 'text-slate-700 hover:text-rose-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-rose-300 hover:bg-slate-800/60'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">Orphan Welfare Roster (PDF)</span>
                </button>

                <button
                  onClick={() => exportPlayersPdf(players)}
                  className={`w-full px-2.5 py-1.5 text-left text-xs rounded-lg flex items-center gap-2 transition-colors ${
                    themeMode === 'academic-light'
                      ? 'text-slate-700 hover:text-amber-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Player Roster (PDF)</span>
                </button>

                <button
                  onClick={() => exportLabAllocationsPdf(allocations)}
                  className={`w-full px-2.5 py-1.5 text-left text-xs rounded-lg flex items-center gap-2 transition-colors ${
                    themeMode === 'academic-light'
                      ? 'text-slate-700 hover:text-cyan-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60'
                  }`}
                >
                  <Microscope className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span className="truncate">Science Lab Schedule (PDF)</span>
                </button>

                <button
                  onClick={() => exportExecutiveCombinedPdf(students, players)}
                  className={`w-full px-2.5 py-1.5 text-left text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                    themeMode === 'academic-light'
                      ? 'text-slate-900 hover:text-emerald-800 hover:bg-emerald-50'
                      : 'text-white hover:text-emerald-200 hover:bg-slate-800/80'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">Master Executive Audit (PDF)</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Palette Switcher in Left Menu */}
          <div className={`pt-2 border-t space-y-2 ${
            themeMode === 'academic-light' ? 'border-slate-100' : 'border-slate-800/80'
          }`}>
            <div className={`px-3 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              themeMode === 'academic-light' ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <Palette className="w-3.5 h-3.5 text-amber-500" />
              <span>Theme Archetype</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 px-1">
              <button
                onClick={() => onThemeChange('academic-light')}
                className={`p-1.5 rounded-lg text-center text-[10px] font-semibold border transition-all ${
                  themeMode === 'academic-light'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="Academic Light Theme"
              >
                Light
              </button>
              <button
                onClick={() => onThemeChange('midnight-emerald')}
                className={`p-1.5 rounded-lg text-center text-[10px] font-semibold border transition-all ${
                  themeMode === 'midnight-emerald'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                    : themeMode === 'academic-light'
                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="Midnight Slate Theme"
              >
                Midnight
              </button>
              <button
                onClick={() => onThemeChange('deep-navy')}
                className={`p-1.5 rounded-lg text-center text-[10px] font-semibold border transition-all ${
                  themeMode === 'deep-navy'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                    : themeMode === 'academic-light'
                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="Deep Royal Navy Theme"
              >
                Navy
              </button>
            </div>
          </div>
        </div>

        {/* Bottom User Session Card & Sign Out */}
        <div className={`p-3 border-t shrink-0 space-y-2 ${
          themeMode === 'academic-light' ? 'border-slate-100 bg-slate-50/80' : 'border-slate-800/80 bg-slate-950/50'
        }`}>
          {/* User Profile Info Card */}
          <div
            onClick={() => setShowAuthModal(true)}
            className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all group ${
              themeMode === 'academic-light'
                ? 'bg-white hover:bg-slate-100/80 border-slate-200 shadow-xs'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className={`font-bold text-xs truncate transition-colors ${
                  themeMode === 'academic-light' ? 'text-slate-900 group-hover:text-emerald-700' : 'text-white group-hover:text-emerald-300'
                }`}>
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium truncate">
                  {currentUser.role}
                </p>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>

          {/* Quick Action Footer Buttons */}
          <div className="flex items-center justify-between gap-2 px-1">
            <button
              onClick={() => setShowAuthModal(true)}
              className={`text-[11px] font-medium flex items-center gap-1 transition-colors ${
                themeMode === 'academic-light'
                  ? 'text-slate-600 hover:text-emerald-700'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Privileges</span>
            </button>

            <button
              onClick={onLogout}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Gateway</span>
            </button>
          </div>
        </div>
      </aside>

      {/* User Authentication & Privileges Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">System Access & Privileges</h3>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-white text-base truncate">{currentUser.name}</h4>
                <p className="text-xs text-emerald-400 font-semibold">{currentUser.role}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentUser.department} • {currentUser.email}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Granted System Privileges:
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {currentUser.privileges.map((priv, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> {priv}
                  </span>
                ))}
              </div>
            </div>

            {DEFAULT_USERS.length > 1 ? (
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Switch Authenticated Staff Account:
                </p>
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
                      <img
                        src={usr.avatar}
                        alt={usr.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="truncate min-w-0">
                        <p className="font-bold text-white truncate">{usr.name}</p>
                        <p className="text-[10px] opacity-80 truncate">{usr.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-800 pt-3 text-xs text-slate-400 flex items-center justify-between">
                <span>Account Status: <strong className="text-emerald-400 font-semibold">Primary Administrator (Full Access)</strong></span>
                <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono">USR-01</span>
              </div>
            )}

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
    </>
  );
};
