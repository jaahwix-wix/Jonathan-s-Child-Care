import React, { useState, useEffect } from 'react';
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
  DEFAULT_USERS,
  ASSET_IMAGES,
} from './data/mockData';

import {
  COLLECTIONS,
  subscribeToCollection,
  saveDocument,
  removeDocument,
  saveMultipleDocuments,
} from './services/firestoreService';

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

  // Live Firestore-backed Application State
  const [students, setStudents] = useState<Student[]>([]);
  const [orphans, setOrphans] = useState<OrphanRecord[]>([]);
  const [labEquipment, setLabEquipment] = useState<LabEquipment[]>([]);
  const [labSessions, setLabSessions] = useState<LabSession[]>([]);
  const [allocations, setAllocations] = useState<EquipmentAllocation[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [notifications, setNotifications] = useState<FeeNotification[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>([]);

  // Firestore Real-Time Subscriptions
  useEffect(() => {
    const unsubStudents = subscribeToCollection<Student>(COLLECTIONS.STUDENTS, setStudents);
    const unsubOrphans = subscribeToCollection<OrphanRecord>(COLLECTIONS.ORPHANS, setOrphans);
    const unsubEquipment = subscribeToCollection<LabEquipment>(COLLECTIONS.LAB_EQUIPMENT, setLabEquipment);
    const unsubSessions = subscribeToCollection<LabSession>(COLLECTIONS.LAB_SESSIONS, setLabSessions);
    const unsubAllocations = subscribeToCollection<EquipmentAllocation>(COLLECTIONS.EQUIPMENT_ALLOCATIONS, setAllocations);
    const unsubPlayers = subscribeToCollection<Player>(COLLECTIONS.PLAYERS, setPlayers);
    const unsubMatches = subscribeToCollection<Match>(COLLECTIONS.MATCHES, setMatches);
    const unsubEvents = subscribeToCollection<CommunityEvent>(COLLECTIONS.EVENTS, setEvents);
    const unsubPosts = subscribeToCollection<InstagramPost>(COLLECTIONS.INSTAGRAM_POSTS, setInstagramPosts);
    const unsubSponsorships = subscribeToCollection<Sponsorship>(COLLECTIONS.SPONSORSHIPS, setSponsorships);
    const unsubNotifications = subscribeToCollection<FeeNotification>(COLLECTIONS.FEE_NOTIFICATIONS, setNotifications);
    const unsubTrophies = subscribeToCollection<Trophy>(COLLECTIONS.TROPHIES, setTrophies);

    return () => {
      unsubStudents();
      unsubOrphans();
      unsubEquipment();
      unsubSessions();
      unsubAllocations();
      unsubPlayers();
      unsubMatches();
      unsubEvents();
      unsubPosts();
      unsubSponsorships();
      unsubNotifications();
      unsubTrophies();
    };
  }, []);

  // Student Firestore Handlers
  const handleAddStudent = async (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev.filter((s) => s.id !== newStudent.id)]);
    await saveDocument(COLLECTIONS.STUDENTS, newStudent);
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    await saveDocument(COLLECTIONS.STUDENTS, updatedStudent);
  };

  const handleDeleteStudent = async (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    await removeDocument(COLLECTIONS.STUDENTS, studentId);
  };

  // Fee Notification Firestore Handlers
  const handleAddNotification = async (notif: FeeNotification) => {
    setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
    await saveDocument(COLLECTIONS.FEE_NOTIFICATIONS, notif);
  };

  const handleUpdateNotification = async (updatedNotif: FeeNotification) => {
    setNotifications((prev) => prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n)));
    await saveDocument(COLLECTIONS.FEE_NOTIFICATIONS, updatedNotif);
  };

  const handleDeleteNotification = async (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    await removeDocument(COLLECTIONS.FEE_NOTIFICATIONS, notifId);
  };

  const handleBatchDispatch = async (urgencyFilter?: NotificationUrgency) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = notifications.map((n) => {
      if (!urgencyFilter || n.urgency === urgencyFilter) {
        return {
          ...n,
          status: 'Delivered' as const,
          sentDate: today,
        };
      }
      return n;
    });
    setNotifications(updated);
    const affected = updated.filter((n) => !urgencyFilter || n.urgency === urgencyFilter);
    if (affected.length > 0) {
      await saveMultipleDocuments(COLLECTIONS.FEE_NOTIFICATIONS, affected);
    }
  };

  // Orphan Firestore Handlers
  const handleAddOrphan = async (newOrphan: OrphanRecord) => {
    setOrphans((prev) => [newOrphan, ...prev.filter((o) => o.id !== newOrphan.id)]);
    await saveDocument(COLLECTIONS.ORPHANS, newOrphan);
  };

  const handleUpdateOrphan = async (updatedOrphan: OrphanRecord) => {
    setOrphans((prev) => prev.map((o) => (o.id === updatedOrphan.id ? updatedOrphan : o)));
    await saveDocument(COLLECTIONS.ORPHANS, updatedOrphan);
  };

  // Science Lab Apparatus & Session Handlers
  const handleAddEquipment = async (item: LabEquipment) => {
    setLabEquipment((prev) => [item, ...prev.filter((e) => e.id !== item.id)]);
    await saveDocument(COLLECTIONS.LAB_EQUIPMENT, item);
  };

  const handleAddLabSession = async (session: LabSession) => {
    setLabSessions((prev) => [session, ...prev.filter((s) => s.id !== session.id)]);
    await saveDocument(COLLECTIONS.LAB_SESSIONS, session);
  };

  // Science Lab Resource Allocation Handlers
  const handleAddAllocation = async (newAlloc: EquipmentAllocation) => {
    setAllocations((prev) => [newAlloc, ...prev.filter((a) => a.id !== newAlloc.id)]);
    await saveDocument(COLLECTIONS.EQUIPMENT_ALLOCATIONS, newAlloc);
  };

  const handleUpdateAllocation = async (updatedAlloc: EquipmentAllocation) => {
    setAllocations((prev) => prev.map((a) => (a.id === updatedAlloc.id ? updatedAlloc : a)));
    await saveDocument(COLLECTIONS.EQUIPMENT_ALLOCATIONS, updatedAlloc);
  };

  const handleDeleteAllocation = async (allocId: string) => {
    setAllocations((prev) => prev.filter((a) => a.id !== allocId));
    await removeDocument(COLLECTIONS.EQUIPMENT_ALLOCATIONS, allocId);
  };

  // JCC FC Player Handlers
  const handleAddPlayer = async (player: Player) => {
    setPlayers((prev) => [player, ...prev.filter((p) => p.id !== player.id)]);
    await saveDocument(COLLECTIONS.PLAYERS, player);
  };

  const handleUpdatePlayer = async (updatedPlayer: Player) => {
    setPlayers((prev) => prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
    await saveDocument(COLLECTIONS.PLAYERS, updatedPlayer);
  };

  const handleDeletePlayer = async (playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    await removeDocument(COLLECTIONS.PLAYERS, playerId);
  };

  // JCC FC Match Handlers
  const handleAddMatch = async (match: Match) => {
    setMatches((prev) => [match, ...prev.filter((m) => m.id !== match.id)]);
    await saveDocument(COLLECTIONS.MATCHES, match);
  };

  const handleUpdateMatch = async (updatedMatch: Match) => {
    setMatches((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
    await saveDocument(COLLECTIONS.MATCHES, updatedMatch);
  };

  const handleDeleteMatch = async (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    await removeDocument(COLLECTIONS.MATCHES, matchId);
  };

  // Event & Sponsorship Handlers
  const handleAddEvent = async (evt: CommunityEvent) => {
    setEvents((prev) => [evt, ...prev.filter((e) => e.id !== evt.id)]);
    await saveDocument(COLLECTIONS.EVENTS, evt);
  };

  const handleAddSponsorship = async (spon: Sponsorship) => {
    setSponsorships((prev) => [spon, ...prev.filter((s) => s.id !== spon.id)]);
    await saveDocument(COLLECTIONS.SPONSORSHIPS, spon);
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

  // Determine root theme class names & layout styling with white default background
  const themeClasses =
    themeMode === 'academic-light'
      ? 'min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between'
      : themeMode === 'deep-navy'
      ? 'min-h-screen bg-[#050b18] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between'
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
              trophies={trophies}
              events={events}
              instagramPosts={instagramPosts}
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
              trophies={trophies}
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
              instagramPosts={instagramPosts}
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
