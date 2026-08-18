import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { SchoolManagement } from './components/SchoolManagement';
import { OrphanageManagement } from './components/OrphanageManagement';
import { ScienceLabPortal } from './components/ScienceLabPortal';
import { JccFcManagement } from './components/JccFcManagement';
import { CommunityEventsHub } from './components/CommunityEventsHub';
import { SponsorshipPortal } from './components/SponsorshipPortal';
import { AiCommandCenter } from './components/AiCommandCenter';
import { LoginGateway } from './components/LoginGateway';

import {
  ModuleTab,
  Student,
  LabEquipment,
  LabSession,
  EquipmentAllocation,
  Player,
  Match,
  Trophy,
  CommunityEvent,
  InstagramPost,
  Sponsorship,
  UserSession,
  OrphanRecord,
  FeeNotification,
  NotificationUrgency,
  ThemeMode,
} from './types';

import {
  INITIAL_STUDENTS,
  INITIAL_ORPHANS,
  INITIAL_LAB_EQUIPMENT,
  INITIAL_LAB_SESSIONS,
  INITIAL_EQUIPMENT_ALLOCATIONS,
  INITIAL_PLAYERS,
  INITIAL_MATCHES,
  TROPHIES,
  INITIAL_EVENTS,
  INSTAGRAM_POSTS,
  INITIAL_SPONSORSHIPS,
  DEFAULT_USERS,
  ASSET_IMAGES,
  INITIAL_FEE_NOTIFICATIONS,
} from './data/mockData';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserSession>(DEFAULT_USERS[0]);

  // Theme Management (Defaulting to Academic Light)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('jcc_theme_mode') as ThemeMode;
    return saved || 'academic-light';
  });

  const handleThemeChange = (newTheme: ThemeMode) => {
    setThemeMode(newTheme);
    localStorage.setItem('jcc_theme_mode', newTheme);
  };

  const [activeTab, setActiveTab] = useState<ModuleTab>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Application Dynamic State
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [orphans, setOrphans] = useState<OrphanRecord[]>(INITIAL_ORPHANS);
  const [labEquipment, setLabEquipment] = useState<LabEquipment[]>(INITIAL_LAB_EQUIPMENT);
  const [labSessions, setLabSessions] = useState<LabSession[]>(INITIAL_LAB_SESSIONS);
  const [allocations, setAllocations] = useState<EquipmentAllocation[]>(INITIAL_EQUIPMENT_ALLOCATIONS);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [events, setEvents] = useState<CommunityEvent[]>(INITIAL_EVENTS);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>(INITIAL_SPONSORSHIPS);
  const [notifications, setNotifications] = useState<FeeNotification[]>(INITIAL_FEE_NOTIFICATIONS);

  // Student CRUD Handlers
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  // Fee Notification CRUD Handlers
  const handleAddNotification = (notif: FeeNotification) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleUpdateNotification = (updatedNotif: FeeNotification) => {
    setNotifications((prev) => prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n)));
  };

  const handleDeleteNotification = (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  const handleBatchDispatch = (urgencyFilter?: NotificationUrgency) => {
    const today = new Date().toISOString().split('T')[0];
    setNotifications((prev) =>
      prev.map((n) => {
        if (!urgencyFilter || n.urgency === urgencyFilter) {
          return {
            ...n,
            status: 'Delivered',
            sentDate: today,
          };
        }
        return n;
      })
    );
  };

  // Orphan CRUD Handlers
  const handleAddOrphan = (newOrphan: OrphanRecord) => {
    setOrphans((prev) => [newOrphan, ...prev]);
  };

  const handleUpdateOrphan = (updatedOrphan: OrphanRecord) => {
    setOrphans((prev) => prev.map((o) => (o.id === updatedOrphan.id ? updatedOrphan : o)));
  };

  // Science Lab Apparatus & Session Handlers
  const handleAddEquipment = (item: LabEquipment) => {
    setLabEquipment((prev) => [item, ...prev]);
  };

  const handleAddLabSession = (session: LabSession) => {
    setLabSessions((prev) => [session, ...prev]);
  };

  // Science Lab Resource Allocation Handlers (Anti-Double-Booking)
  const handleAddAllocation = (newAlloc: EquipmentAllocation) => {
    setAllocations((prev) => [newAlloc, ...prev]);
  };

  const handleUpdateAllocation = (updatedAlloc: EquipmentAllocation) => {
    setAllocations((prev) => prev.map((a) => (a.id === updatedAlloc.id ? updatedAlloc : a)));
  };

  const handleDeleteAllocation = (allocId: string) => {
    setAllocations((prev) => prev.filter((a) => a.id !== allocId));
  };

  // JCC FC Player CRUD Handlers
  const handleAddPlayer = (player: Player) => {
    setPlayers((prev) => [player, ...prev]);
  };

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    setPlayers((prev) => prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
  };

  const handleDeletePlayer = (playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  };

  // JCC FC Match CRUD Handlers
  const handleAddMatch = (match: Match) => {
    setMatches((prev) => [match, ...prev]);
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    setMatches((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
  };

  const handleDeleteMatch = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  };

  // Event & Sponsorship Handlers
  const handleAddEvent = (evt: CommunityEvent) => {
    setEvents((prev) => [evt, ...prev]);
  };

  const handleAddSponsorship = (spon: Sponsorship) => {
    setSponsorships((prev) => [spon, ...prev]);
  };

  if (!isAuthenticated) {
    return (
      <LoginGateway
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // Determine root theme class names
  const themeClasses =
    themeMode === 'academic-light'
      ? 'min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between'
      : themeMode === 'deep-navy'
      ? 'min-h-screen bg-[#070c1b] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between'
      : 'min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col justify-between';

  return (
    <div className={themeClasses} data-theme={themeMode} id="app-root-container">
      <div>
        {/* Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onSwitchUser={setCurrentUser}
          onLogout={() => setIsAuthenticated(false)}
          students={students}
          players={players}
          orphans={orphans}
          allocations={allocations}
          themeMode={themeMode}
          onThemeChange={handleThemeChange}
        />

        {/* Main Workspace Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {activeTab === 'overview' && (
            <OverviewDashboard
              setActiveTab={setActiveTab}
              students={students}
              players={players}
              matches={matches}
              trophies={TROPHIES}
              events={events}
              instagramPosts={INSTAGRAM_POSTS}
            />
          )}

          {activeTab === 'school' && (
            <SchoolManagement
              students={students}
              notifications={notifications}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddNotification={handleAddNotification}
              onUpdateNotification={handleUpdateNotification}
              onDeleteNotification={handleDeleteNotification}
              onBatchDispatch={handleBatchDispatch}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'orphanage' && (
            <OrphanageManagement
              orphans={orphans}
              onAddOrphan={handleAddOrphan}
              onUpdateOrphan={handleUpdateOrphan}
              currentUser={currentUser}
              searchQuery={searchQuery}
              onNavigateToSchool={(studentId) => {
                setActiveTab('school');
                setSearchQuery(studentId);
              }}
            />
          )}

          {activeTab === 'science-lab' && (
            <ScienceLabPortal
              equipment={labEquipment}
              labSessions={labSessions}
              allocations={allocations}
              onAddEquipment={handleAddEquipment}
              onAddLabSession={handleAddLabSession}
              onAddAllocation={handleAddAllocation}
              onUpdateAllocation={handleUpdateAllocation}
              onDeleteAllocation={handleDeleteAllocation}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'jcc-fc' && (
            <JccFcManagement
              players={players}
              matches={matches}
              trophies={TROPHIES}
              onAddPlayer={handleAddPlayer}
              onUpdatePlayer={handleUpdatePlayer}
              onDeletePlayer={handleDeletePlayer}
              onAddMatch={handleAddMatch}
              onUpdateMatch={handleUpdateMatch}
              onDeleteMatch={handleDeleteMatch}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'community' && (
            <CommunityEventsHub
              events={events}
              instagramPosts={INSTAGRAM_POSTS}
              onAddEvent={handleAddEvent}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'sponsorship' && (
            <SponsorshipPortal
              sponsorships={sponsorships}
              onAddSponsorship={handleAddSponsorship}
            />
          )}

          {activeTab === 'ai-hub' && (
            <AiCommandCenter
              students={students}
              players={players}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 text-slate-400 py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-lg bg-white p-1 shadow-md border border-slate-700 shrink-0">
              <img
                src={ASSET_IMAGES.systemLogo}
                alt="Jonathan's Child Care Ministries Logo"
                className="w-full h-full object-contain rounded"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-0.5">
              <p className="font-bold text-white text-sm">Jonathan's Child Care (JCC) & JCC FC</p>
              <p className="text-slate-400">
                Bo District, Sierra Leone • Operating over 20 years in Child Care, High Academic Standards & Women's Football
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('school')} className="hover:text-emerald-400 transition-colors">Academic School</button>
            <button onClick={() => setActiveTab('orphanage')} className="hover:text-rose-400 font-semibold transition-colors">Orphanage & Welfare</button>
            <button onClick={() => setActiveTab('science-lab')} className="hover:text-cyan-400 transition-colors">Science Lab</button>
            <button onClick={() => setActiveTab('jcc-fc')} className="hover:text-amber-400 transition-colors">JCC FC</button>
            <button onClick={() => setActiveTab('sponsorship')} className="hover:text-emerald-400 transition-colors">Support JCC</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
