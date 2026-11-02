import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { OverviewDashboard } from './components/OverviewDashboard';
import { SchoolManagement } from './components/SchoolManagement';
import { OrphanageManagement } from './components/OrphanageManagement';
import { ScienceLabPortal } from './components/ScienceLabPortal';
import { JccFcManagement } from './components/JccFcManagement';
import { CommunityEventsHub } from './components/CommunityEventsHub';
import { SponsorshipPortal } from './components/SponsorshipPortal';
import { AiCommandCenter } from './components/AiCommandCenter';
import { SupabaseIntegrationHub } from './components/SupabaseIntegrationHub';
import { PrivilegeManagerModal } from './components/PrivilegeManagerModal';
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
  Teacher,
} from './types';

import {
  DEFAULT_USERS,
  ASSET_IMAGES,
  INITIAL_TEACHERS,
} from './data/mockData';

import {
  COLLECTIONS,
  subscribeToCollection,
  saveDocument,
  removeDocument,
  saveMultipleDocuments,
} from './services/firestoreService';

import {
  syncRecordToSupabase,
  deleteRecordFromSupabase,
} from './services/supabaseService';

export default function App() {
  // User Authentication Gate (Mandatory login before accepting the system)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('jcc_authenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    const savedUserId = sessionStorage.getItem('jcc_current_user_id');
    if (savedUserId) {
      const found = DEFAULT_USERS.find(
        (u) => u.id === savedUserId || u.email.toLowerCase() === savedUserId.toLowerCase()
      );
      if (found) return found;
    }
    return DEFAULT_USERS[0];
  });

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    sessionStorage.setItem('jcc_authenticated', 'true');
    sessionStorage.setItem('jcc_current_user_id', user.id);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('jcc_authenticated');
    sessionStorage.removeItem('jcc_current_user_id');
  };

  const [isPrivilegeModalOpen, setIsPrivilegeModalOpen] = useState<boolean>(false);

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

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
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);

  // Firestore Real-Time Subscriptions
  useEffect(() => {
    const unsubStudents = subscribeToCollection<Student>(COLLECTIONS.STUDENTS, setStudents);
    const unsubTeachers = subscribeToCollection<Teacher>(COLLECTIONS.TEACHERS, (data) => {
      if (data && data.length > 0) {
        setTeachers(data);
      } else {
        setTeachers(INITIAL_TEACHERS);
      }
    });
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
      unsubTeachers();
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

  // Student Firestore & Supabase Handlers
  const handleAddStudent = async (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev.filter((s) => s.id !== newStudent.id)]);
    await saveDocument(COLLECTIONS.STUDENTS, newStudent);
    syncRecordToSupabase('students', newStudent);
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    await saveDocument(COLLECTIONS.STUDENTS, updatedStudent);
    syncRecordToSupabase('students', updatedStudent);
  };

  const handleDeleteStudent = async (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    await removeDocument(COLLECTIONS.STUDENTS, studentId);
    deleteRecordFromSupabase('students', studentId);
  };

  // Teacher Firestore & Management Handlers
  const handleAddTeacher = async (newTeacher: Teacher) => {
    setTeachers((prev) => [newTeacher, ...prev.filter((t) => t.id !== newTeacher.id)]);
    await saveDocument(COLLECTIONS.TEACHERS, newTeacher);
    syncRecordToSupabase('teachers' as any, newTeacher);
  };

  const handleUpdateTeacher = async (updatedTeacher: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t)));
    await saveDocument(COLLECTIONS.TEACHERS, updatedTeacher);
    syncRecordToSupabase('teachers' as any, updatedTeacher);
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
    await removeDocument(COLLECTIONS.TEACHERS, teacherId);
    deleteRecordFromSupabase('teachers' as any, teacherId);
  };

  // Fee Notification Firestore & Supabase Handlers
  const handleAddNotification = async (notif: FeeNotification) => {
    setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
    await saveDocument(COLLECTIONS.FEE_NOTIFICATIONS, notif);
    syncRecordToSupabase('fee_notifications', notif);
  };

  const handleUpdateNotification = async (updatedNotif: FeeNotification) => {
    setNotifications((prev) => prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n)));
    await saveDocument(COLLECTIONS.FEE_NOTIFICATIONS, updatedNotif);
    syncRecordToSupabase('fee_notifications', updatedNotif);
  };

  const handleDeleteNotification = async (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    await removeDocument(COLLECTIONS.FEE_NOTIFICATIONS, notifId);
    deleteRecordFromSupabase('fee_notifications', notifId);
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
      affected.forEach((n) => syncRecordToSupabase('fee_notifications', n));
    }
  };

  // Orphan Firestore & Supabase Handlers
  const handleAddOrphan = async (newOrphan: OrphanRecord) => {
    setOrphans((prev) => [newOrphan, ...prev.filter((o) => o.id !== newOrphan.id)]);
    await saveDocument(COLLECTIONS.ORPHANS, newOrphan);
    syncRecordToSupabase('orphans', newOrphan);
  };

  const handleUpdateOrphan = async (updatedOrphan: OrphanRecord) => {
    setOrphans((prev) => prev.map((o) => (o.id === updatedOrphan.id ? updatedOrphan : o)));
    await saveDocument(COLLECTIONS.ORPHANS, updatedOrphan);
    syncRecordToSupabase('orphans', updatedOrphan);
  };

  // Science Lab Apparatus & Session Handlers
  const handleAddEquipment = async (item: LabEquipment) => {
    setLabEquipment((prev) => [item, ...prev.filter((e) => e.id !== item.id)]);
    await saveDocument(COLLECTIONS.LAB_EQUIPMENT, item);
    syncRecordToSupabase('lab_equipment', item);
  };

  const handleAddLabSession = async (session: LabSession) => {
    setLabSessions((prev) => [session, ...prev.filter((s) => s.id !== session.id)]);
    await saveDocument(COLLECTIONS.LAB_SESSIONS, session);
    syncRecordToSupabase('lab_sessions', session);
  };

  // Science Lab Resource Allocation Handlers
  const handleAddAllocation = async (newAlloc: EquipmentAllocation) => {
    setAllocations((prev) => [newAlloc, ...prev.filter((a) => a.id !== newAlloc.id)]);
    await saveDocument(COLLECTIONS.EQUIPMENT_ALLOCATIONS, newAlloc);
    syncRecordToSupabase('equipment_allocations', newAlloc);
  };

  const handleUpdateAllocation = async (updatedAlloc: EquipmentAllocation) => {
    setAllocations((prev) => prev.map((a) => (a.id === updatedAlloc.id ? updatedAlloc : a)));
    await saveDocument(COLLECTIONS.EQUIPMENT_ALLOCATIONS, updatedAlloc);
    syncRecordToSupabase('equipment_allocations', updatedAlloc);
  };

  const handleDeleteAllocation = async (allocId: string) => {
    setAllocations((prev) => prev.filter((a) => a.id !== allocId));
    await removeDocument(COLLECTIONS.EQUIPMENT_ALLOCATIONS, allocId);
    deleteRecordFromSupabase('equipment_allocations', allocId);
  };

  // JCC FC Player Handlers
  const handleAddPlayer = async (player: Player) => {
    setPlayers((prev) => [player, ...prev.filter((p) => p.id !== player.id)]);
    await saveDocument(COLLECTIONS.PLAYERS, player);
    syncRecordToSupabase('players', player);
  };

  const handleUpdatePlayer = async (updatedPlayer: Player) => {
    setPlayers((prev) => prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
    await saveDocument(COLLECTIONS.PLAYERS, updatedPlayer);
    syncRecordToSupabase('players', updatedPlayer);
  };

  const handleDeletePlayer = async (playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    await removeDocument(COLLECTIONS.PLAYERS, playerId);
    deleteRecordFromSupabase('players', playerId);
  };

  // JCC FC Match Handlers
  const handleAddMatch = async (match: Match) => {
    setMatches((prev) => [match, ...prev.filter((m) => m.id !== match.id)]);
    await saveDocument(COLLECTIONS.MATCHES, match);
    syncRecordToSupabase('matches', match);
  };

  const handleUpdateMatch = async (updatedMatch: Match) => {
    setMatches((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
    await saveDocument(COLLECTIONS.MATCHES, updatedMatch);
    syncRecordToSupabase('matches', updatedMatch);
  };

  const handleDeleteMatch = async (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    await removeDocument(COLLECTIONS.MATCHES, matchId);
    deleteRecordFromSupabase('matches', matchId);
  };

  // Event & Sponsorship Handlers
  const handleAddEvent = async (evt: CommunityEvent) => {
    setEvents((prev) => [evt, ...prev.filter((e) => e.id !== evt.id)]);
    await saveDocument(COLLECTIONS.EVENTS, evt);
    syncRecordToSupabase('community_events', evt);
  };

  const handleAddSponsorship = async (spon: Sponsorship) => {
    setSponsorships((prev) => [spon, ...prev.filter((s) => s.id !== spon.id)]);
    await saveDocument(COLLECTIONS.SPONSORSHIPS, spon);
    syncRecordToSupabase('sponsorships', spon);
  };

  // Mandatory Authentication Gate: user must log in before entering the system
  if (!isAuthenticated) {
    return <LoginGateway onLoginSuccess={handleLoginSuccess} />;
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
      {/* Left-Hand Side System Menu / Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        currentUser={currentUser}
        students={students}
        players={players}
        orphans={orphans}
        allocations={allocations}
        themeMode={themeMode}
        onThemeChange={handleThemeChange}
        onOpenPrivilegeModal={() => setIsPrivilegeModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Right-Hand Workspace Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0 w-full min-h-screen">
        {/* Top Header with Search and System Controls */}
        <TopHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          themeMode={themeMode}
          onThemeChange={handleThemeChange}
          onOpenPrivilegeModal={() => setIsPrivilegeModalOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Main Workspace Body */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              teachers={teachers}
              notifications={notifications}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddTeacher={handleAddTeacher}
              onUpdateTeacher={handleUpdateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onAddNotification={handleAddNotification}
              onUpdateNotification={handleUpdateNotification}
              onDeleteNotification={handleDeleteNotification}
              onBatchDispatch={handleBatchDispatch}
              searchQuery={searchQuery}
              currentUser={currentUser}
              onOpenPrivilegeModal={() => setIsPrivilegeModalOpen(true)}
              themeMode={themeMode}
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
              currentUser={currentUser}
              onOpenPrivilegeModal={() => setIsPrivilegeModalOpen(true)}
              themeMode={themeMode}
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
              currentUser={currentUser}
              onOpenPrivilegeModal={() => setIsPrivilegeModalOpen(true)}
              themeMode={themeMode}
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

          {activeTab === 'supabase' && (
            <SupabaseIntegrationHub
              students={students}
              orphans={orphans}
              labEquipment={labEquipment}
              labSessions={labSessions}
              allocations={allocations}
              players={players}
              matches={matches}
              events={events}
              sponsorships={sponsorships}
              notifications={notifications}
              currentUser={currentUser}
              onOpenPrivilegeModal={() => setIsPrivilegeModalOpen(true)}
              themeMode={themeMode}
            />
          )}
        </main>

        {/* Global Privilege & RBAC Management Modal */}
        <PrivilegeManagerModal
          isOpen={isPrivilegeModalOpen}
          onClose={() => setIsPrivilegeModalOpen(false)}
          currentUser={currentUser}
          onSwitchUser={(user) => {
            setCurrentUser(user);
            sessionStorage.setItem('jcc_current_user_id', user.id);
          }}
          themeMode={themeMode}
        />

        {/* System Footer */}
        <footer className={`backdrop-blur-md border-t py-6 px-4 mt-auto transition-colors ${
          themeMode === 'academic-light'
            ? 'bg-slate-50 border-slate-200 text-slate-600'
            : 'bg-slate-900/90 border-slate-800 text-slate-400'
        }`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className={`w-10 h-10 rounded-lg bg-white p-1 shadow-md border shrink-0 ${
                themeMode === 'academic-light' ? 'border-slate-200' : 'border-slate-700'
              }`}>
                <img
                  src={ASSET_IMAGES.systemLogo}
                  alt="Jonathan's Child Care Ministries Logo"
                  className="w-full h-full object-contain rounded"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-0.5">
                <p className={`font-bold text-sm ${themeMode === 'academic-light' ? 'text-slate-900' : 'text-white'}`}>
                  Jonathan's Child Care (JCC) & JCC FC
                </p>
                <p className={themeMode === 'academic-light' ? 'text-slate-500' : 'text-slate-400'}>
                  Bo District, Sierra Leone • Operating over 20 years in Child Care, High Academic Standards & Women's Football
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center font-medium">
              <button onClick={() => setActiveTab('school')} className="hover:text-emerald-600 transition-colors">Academic School</button>
              <button onClick={() => setActiveTab('orphanage')} className="hover:text-rose-600 font-semibold transition-colors">Orphanage & Welfare</button>
              <button onClick={() => setActiveTab('science-lab')} className="hover:text-cyan-600 transition-colors">Science Lab</button>
              <button onClick={() => setActiveTab('jcc-fc')} className="hover:text-amber-600 transition-colors">JCC FC</button>
              <button onClick={() => setActiveTab('sponsorship')} className="hover:text-emerald-600 transition-colors">Support JCC</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
