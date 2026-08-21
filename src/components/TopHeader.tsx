import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  HeartHandshake,
  MapPin,
  Palette,
  Sun,
  Moon,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  GraduationCap,
  Heart,
  Microscope,
  Trophy,
  Users,
  Bot,
} from 'lucide-react';
import { ModuleTab, UserSession, ThemeMode } from '../types';

interface TopHeaderProps {
  activeTab: ModuleTab;
  setActiveTab: (tab: ModuleTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentUser: UserSession;
  onOpenMobileSidebar: () => void;
  themeMode: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  currentUser,
  onOpenMobileSidebar,
  themeMode,
  onThemeChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  const getTabTitle = (tab: ModuleTab) => {
    switch (tab) {
      case 'overview':
        return { title: 'Overview Dashboard', subtitle: 'Institutional KPIs & Highlights', icon: LayoutDashboard };
      case 'school':
        return { title: 'JCC Academic School & Fees', subtitle: 'Pupil Enrollment, Grading & Accounts', icon: GraduationCap };
      case 'orphanage':
        return { title: 'Orphanage & Welfare Center', subtitle: 'Residential Welfare, Care Plans & MSWGCA', icon: Heart };
      case 'science-lab':
        return { title: 'Science & Math Teaching Lab', subtitle: 'STEM Equipment, Scheduling & Safety', icon: Microscope };
      case 'jcc-fc':
        return { title: 'JCC FC Football Management', subtitle: 'SRFA Regional Champions & Squad Roster', icon: Trophy };
      case 'community':
        return { title: 'Community & Social Hub', subtitle: 'Outreach Panels, Youth Summits & Feeds', icon: Users };
      case 'sponsorship':
        return { title: 'Sponsors & Grants Portal', subtitle: 'Institutional Funding & Philanthropy', icon: HeartHandshake };
      case 'ai-hub':
        return { title: 'AI Command Center', subtitle: 'Gemini AI Intelligent Academic & Sports Engine', icon: Bot };
      default:
        return { title: 'Jonathan’s Child Care', subtitle: 'Bo District System', icon: LayoutDashboard };
    }
  };

  const currentTabInfo = getTabTitle(activeTab);
  const TabIcon = currentTabInfo.icon;

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
      themeMode === 'academic-light'
        ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
        : themeMode === 'deep-navy'
        ? 'bg-[#081226]/95 border-slate-800 text-slate-100 shadow-md'
        : 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-md'
    }`}>
      {/* Top utility sub-bar */}
      <div className={`px-4 py-1 text-[11px] border-b flex justify-between items-center ${
        themeMode === 'academic-light'
          ? 'bg-slate-50 border-slate-100 text-slate-500'
          : 'bg-slate-950 border-slate-800/80 text-slate-400'
      }`}>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-emerald-600">
            <MapPin className="w-3 h-3" /> Bo District, Sierra Leone
          </span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className={`hidden sm:inline ${themeMode === 'academic-light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Jonathan's Child Care Ministries & JCC FC
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${themeMode === 'academic-light' ? 'text-slate-800' : 'text-slate-200'}`}>
            {currentUser.name}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-emerald-600 font-medium">
            {currentUser.role}
          </span>
        </div>
      </div>

      {/* Main Top Header Controls */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Hamburger & Active Section Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="btn-open-sidebar"
            onClick={onOpenMobileSidebar}
            className={`p-2 rounded-xl lg:hidden shrink-0 transition-colors border ${
              themeMode === 'academic-light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
            aria-label="Open Left Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-xl shrink-0 hidden sm:flex border ${
              themeMode === 'academic-light'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              <TabIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-base sm:text-lg font-bold tracking-tight truncate ${
                themeMode === 'academic-light' ? 'text-slate-900' : 'text-white'
              }`}>
                {currentTabInfo.title}
              </h2>
              <p className={`text-xs truncate hidden md:block ${
                themeMode === 'academic-light' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {currentTabInfo.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right: Search Bar */}
        <div className="flex-1 max-w-md hidden md:block relative">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
            themeMode === 'academic-light' ? 'text-slate-400' : 'text-slate-400'
          }`} />
          <input
            id="top-global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records, students, apparatus, players..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              themeMode === 'academic-light'
                ? 'bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-emerald-500'
                : 'bg-slate-800/90 text-slate-200 placeholder-slate-400 border-slate-700 focus:border-transparent'
            }`}
          />
        </div>

        {/* Right Tools & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Theme Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                themeMode === 'academic-light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
              }`}
              title="Theme Style"
            >
              <Palette className="w-4 h-4 text-amber-500" />
              <span className="hidden xl:inline">
                {themeMode === 'academic-light' ? 'White / Light' : themeMode === 'deep-navy' ? 'Navy' : 'Midnight'}
              </span>
              <ChevronDown className={`w-3 h-3 hidden sm:inline ${themeMode === 'academic-light' ? 'text-slate-500' : 'text-slate-400'}`} />
            </button>

            {showThemeDropdown && (
              <div className={`absolute right-0 mt-2 w-52 rounded-xl shadow-2xl py-1.5 z-50 text-xs border ${
                themeMode === 'academic-light'
                  ? 'bg-white border-slate-200 text-slate-800'
                  : 'bg-slate-900 border-slate-700 text-slate-100'
              }`}>
                <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  themeMode === 'academic-light' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Visual Palette
                </div>
                <button
                  onClick={() => {
                    onThemeChange('academic-light');
                    setShowThemeDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                    themeMode === 'academic-light'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Academic Light (White)
                  </span>
                  {themeMode === 'academic-light' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                </button>
                <button
                  onClick={() => {
                    onThemeChange('midnight-emerald');
                    setShowThemeDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                    themeMode === 'midnight-emerald'
                      ? 'bg-emerald-600/30 text-emerald-300 font-bold'
                      : themeMode === 'academic-light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-emerald-500" /> Midnight Slate
                  </span>
                  {themeMode === 'midnight-emerald' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                </button>
                <button
                  onClick={() => {
                    onThemeChange('deep-navy');
                    setShowThemeDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                    themeMode === 'deep-navy'
                      ? 'bg-indigo-600/30 text-indigo-300 font-bold'
                      : themeMode === 'academic-light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-indigo-500" /> Deep Royal Navy
                  </span>
                  {themeMode === 'deep-navy' && <CheckCircle2 className="w-3 h-3 text-indigo-500" />}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-xl border relative transition-colors ${
                themeMode === 'academic-light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
              }`}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl py-2 z-50 text-xs border ${
                themeMode === 'academic-light'
                  ? 'bg-white border-slate-200 text-slate-800'
                  : 'bg-slate-900 border-slate-700 text-slate-100'
              }`}>
                <div className={`px-4 py-2 border-b font-semibold flex justify-between items-center ${
                  themeMode === 'academic-light' ? 'border-slate-100' : 'border-slate-800'
                }`}>
                  <span>Bo District Institutional Bulletins</span>
                  <span className="text-[11px] text-emerald-600">Live</span>
                </div>
                <div className={`divide-y max-h-64 overflow-y-auto ${
                  themeMode === 'academic-light' ? 'divide-slate-100' : 'divide-slate-800/60'
                }`}>
                  <div className={`p-3 cursor-pointer ${themeMode === 'academic-light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/50'}`}>
                    <p className="font-semibold text-emerald-600">JCC Academic System Online</p>
                    <p className={`text-[11px] mt-0.5 ${themeMode === 'academic-light' ? 'text-slate-600' : 'text-slate-300'}`}>
                      Ready for student registration, fee tracking, and term grading in Bo.
                    </p>
                  </div>
                  <div className={`p-3 cursor-pointer ${themeMode === 'academic-light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/50'}`}>
                    <p className="font-semibold text-cyan-600">Science Lab Portal Active</p>
                    <p className={`text-[11px] mt-0.5 ${themeMode === 'academic-light' ? 'text-slate-600' : 'text-slate-300'}`}>
                      Practical STEM apparatus booking & session scheduling available.
                    </p>
                  </div>
                  <div className={`p-3 cursor-pointer ${themeMode === 'academic-light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/50'}`}>
                    <p className="font-semibold text-amber-600">JCC FC Championship Division</p>
                    <p className={`text-[11px] mt-0.5 ${themeMode === 'academic-light' ? 'text-slate-600' : 'text-slate-300'}`}>
                      Southern Region Women’s Football season fixtures & roster ready.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Sponsor / Grant Action */}
          <button
            onClick={() => setActiveTab('sponsorship')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-sm transition-all border border-emerald-500/30"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Sponsor JCC</span>
          </button>
        </div>
      </div>
    </header>
  );
};
