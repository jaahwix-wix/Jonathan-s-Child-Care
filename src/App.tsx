import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { SchoolManagement } from './components/SchoolManagement';
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
  Player,
  Match,
  Trophy,
  CommunityEvent,
  InstagramPost,
  Sponsorship,
  UserSession,
} from './types';

import {
  INITIAL_STUDENTS,
  INITIAL_LAB_EQUIPMENT,
  INITIAL_LAB_SESSIONS,
  INITIAL_PLAYERS,
  INITIAL_MATCHES,
  TROPHIES,
  INITIAL_EVENTS,
  INSTAGRAM_POSTS,
  INITIAL_SPONSORSHIPS,
  DEFAULT_USERS,
  ASSET_IMAGES,
} from './data/mockData';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserSession>(DEFAULT_USERS[0]);

  const [activeTab, setActiveTab] = useState<ModuleTab>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Application Dynamic State
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [labEquipment, setLabEquipment] = useState<LabEquipment[]>(INITIAL_LAB_EQUIPMENT);
  const [labSessions, setLabSessions] = useState<LabSession[]>(INITIAL_LAB_SESSIONS);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [events, setEvents] = useState<CommunityEvent[]>(INITIAL_EVENTS);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>(INITIAL_SPONSORSHIPS);

  // Handlers
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const handleAddEquipment = (item: LabEquipment) => {
    setLabEquipment((prev) => [item, ...prev]);
  };

  const handleAddLabSession = (session: LabSession) => {
    setLabSessions((prev) => [session, ...prev]);
  };

  const handleAddPlayer = (player: Player) => {
    setPlayers((prev) => [player, ...prev]);
  };

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col justify-between">
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
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'science-lab' && (
            <ScienceLabPortal
              equipment={labEquipment}
              labSessions={labSessions}
              onAddEquipment={handleAddEquipment}
              onAddLabSession={handleAddLabSession}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'jcc-fc' && (
            <JccFcManagement
              players={players}
              matches={matches}
              trophies={TROPHIES}
              onAddPlayer={handleAddPlayer}
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
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 mt-12">
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
            <button onClick={() => setActiveTab('school')} className="hover:text-emerald-400">Academic School</button>
            <button onClick={() => setActiveTab('science-lab')} className="hover:text-cyan-400">Science Lab</button>
            <button onClick={() => setActiveTab('jcc-fc')} className="hover:text-amber-400">JCC FC Football</button>
            <button onClick={() => setActiveTab('community')} className="hover:text-purple-400">Instagram & Events</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
