import React, { useState } from 'react';
import {
  Microscope,
  Calendar,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Search,
  Filter,
  Loader2,
  X,
  BookOpen,
  ShieldCheck,
  Layers,
  FileDown,
  Cpu,
  Flame,
  Atom,
  BarChart2,
  TrendingUp,
} from 'lucide-react';
import { LabEquipment, LabSession, EquipmentAllocation } from '../types';
import { ASSET_IMAGES, LAB_TEACHERS_LIST } from '../data/mockData';
import { EquipmentAllocationManager } from './EquipmentAllocationManager';
import { EquipmentUtilizationChart } from './EquipmentUtilizationChart';
import { LabHierarchyTreeView } from './LabHierarchyTreeView';
import { exportLabAllocationsPdf } from '../utils/pdfExporter';

interface ScienceLabPortalProps {
  equipment: LabEquipment[];
  labSessions: LabSession[];
  allocations: EquipmentAllocation[];
  onAddEquipment: (item: LabEquipment) => void;
  onAddLabSession: (session: LabSession) => void;
  onAddAllocation: (allocation: EquipmentAllocation) => void;
  onUpdateAllocation: (allocation: EquipmentAllocation) => void;
  onDeleteAllocation: (allocationId: string) => void;
  searchQuery: string;
}

export const ScienceLabPortal: React.FC<ScienceLabPortalProps> = ({
  equipment,
  labSessions,
  allocations,
  onAddEquipment,
  onAddLabSession,
  onAddAllocation,
  onUpdateAllocation,
  onDeleteAllocation,
  searchQuery,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'treeview' | 'allocations' | 'inventory' | 'sessions' | 'stem-ai'>('analytics');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);

  // AI STEM Lesson Plan Generator State
  const [stemTopic, setStemTopic] = useState('Light Optics & Refraction in Lenses');
  const [stemSubject, setStemSubject] = useState<'Biology' | 'Chemistry' | 'Physics' | 'Mathematics'>('Physics');
  const [stemTargetGrade, setStemTargetGrade] = useState('JSS 2 STEM');
  const [stemOutput, setStemOutput] = useState('');
  const [isGeneratingStem, setIsGeneratingStem] = useState(false);

  // New Equipment Form State
  const [eqName, setEqName] = useState('');
  const [eqCategory, setEqCategory] = useState<'Biology' | 'Chemistry' | 'Physics' | 'Mathematics' | 'STEM Robotics'>('Biology');
  const [eqQuantity, setEqQuantity] = useState(10);
  const [eqLocation, setEqLocation] = useState('Optics Bench Alpha');

  // New Lab Session Form State
  const [sessTitle, setSessTitle] = useState('');
  const [sessSubject, setSessSubject] = useState<'Integrated Science' | 'Biology' | 'Chemistry' | 'Physics' | 'Mathematics'>('Integrated Science');
  const [sessDate, setSessDate] = useState('2026-08-21');
  const [sessTime, setSessTime] = useState('10:00 AM - 11:30 AM');
  const [sessTeacher, setSessTeacher] = useState('Mr. Emmanuel Bio');
  const [sessGrade, setSessGrade] = useState('JSS 2 (STEM Track)');

  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch = eq.name.toLowerCase().includes(searchQuery.toLowerCase()) || eq.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || eq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGenerateStemPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingStem(true);
    setStemOutput('');

    try {
      const availableApparatus = equipment.map((e) => e.name);
      const response = await fetch('/api/gemini/stem-lab-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: stemTopic,
          subject: stemSubject,
          targetGrade: stemTargetGrade,
          durationMinutes: 60,
          availableEquipment: availableApparatus,
        }),
      });
      const data = await response.json();
      if (data.result) {
        setStemOutput(data.result);
      } else {
        setStemOutput('Failed to generate STEM lab lesson plan.');
      }
    } catch (err) {
      console.error(err);
      setStemOutput('Error calling AI service.');
    } finally {
      setIsGeneratingStem(false);
    }
  };

  const handleCreateEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqName.trim()) return;
    const newItem: LabEquipment = {
      id: `LAB-EQ-0${equipment.length + 1}`,
      name: eqName,
      category: eqCategory,
      quantity: Number(eqQuantity),
      condition: 'Excellent',
      lastInspected: new Date().toISOString().split('T')[0],
      storageLocation: eqLocation || `Cabinet Station ${eqCategory[0]}`,
    };
    onAddEquipment(newItem);
    setShowAddEquipmentModal(false);
    setEqName('');
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessTitle.trim()) return;
    const newSess: LabSession = {
      id: `SESS-${200 + labSessions.length + 1}`,
      title: sessTitle,
      subject: sessSubject,
      date: sessDate,
      timeSlot: sessTime,
      teacherName: sessTeacher,
      targetGrade: sessGrade,
      maxCapacity: 25,
      bookedCount: 18,
      apparatusNeeded: ['Microscopes', 'Glassware', 'Measuring Tools'],
    };
    onAddLabSession(newSess);
    setShowScheduleModal(false);
    setSessTitle('');
  };

  return (
    <div className="space-y-6 pb-12" id="science-lab-portal-root">
      {/* Banner & Intro Header */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
        <div className="absolute inset-0 z-0">
          <img
            src={ASSET_IMAGES.scienceLab}
            alt="JCC Science and Math Lab"
            className="w-full h-full object-cover opacity-25"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold uppercase tracking-wider">
              <Microscope className="w-3.5 h-3.5 text-cyan-400" />
              Specialized STEM Teaching Laboratory • Bo District
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Science & Mathematics Teaching Laboratory
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Equipped with biological compound microscopes, chemical titration fume stations, solar energy photovoltaic kits, and 3D geometry manipulatives — supporting Nursery, Primary, and Secondary STEM curriculums in Bo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddEquipmentModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Add Apparatus</span>
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-900/40 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Class Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('treeview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'treeview'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-300" />
          <span>Lab & Inventory (Treeview)</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-cyan-950 text-cyan-200 border border-cyan-800">
            {equipment.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'analytics'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          <span>Utilization & Demand Analytics</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
            30-Day
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('allocations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'allocations'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Resource Allocation & Teacher Scheduling</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-cyan-950 text-cyan-200 border border-cyan-800">
            {allocations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'inventory'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Microscope className="w-4 h-4 text-cyan-400" />
          <span>Apparatus Inventory Table</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sessions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'sessions'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Scheduled Practical Classes</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stem-ai')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'stem-ai'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>AI STEM Protocol Generator</span>
        </button>
      </div>

      {/* SUB-TAB -1: LAB HIERARCHY TREEVIEW */}
      {activeSubTab === 'treeview' && (
        <LabHierarchyTreeView
          equipment={equipment}
          allocations={allocations}
          labSessions={labSessions}
          searchQuery={searchQuery}
        />
      )}

      {/* SUB-TAB 0: APPARATUS UTILIZATION & DEMAND FREQUENCY CHART */}
      {activeSubTab === 'analytics' && (
        <EquipmentUtilizationChart
          equipment={equipment}
          allocations={allocations}
        />
      )}

      {/* SUB-TAB 1: RESOURCE ALLOCATION & ANTI-DOUBLE-BOOKING MANAGER */}
      {activeSubTab === 'allocations' && (
        <EquipmentAllocationManager
          equipment={equipment}
          allocations={allocations}
          onAddAllocation={onAddAllocation}
          onUpdateAllocation={onUpdateAllocation}
          onDeleteAllocation={onDeleteAllocation}
          searchQuery={searchQuery}
        />
      )}

      {/* SUB-TAB 2: APPARATUS INVENTORY & STOCK */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase">Category:</span>
              {['All', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'STEM Robotics'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-cyan-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddEquipmentModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New Apparatus
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEquipment.map((item) => {
              // Count active allocations for this apparatus
              const currentlyAllocated = allocations
                .filter((a) => a.equipmentId === item.id && a.status === 'In Use')
                .reduce((sum, a) => sum + a.quantityAllocated, 0);

              const availableInLab = Math.max(0, item.quantity - currentlyAllocated);

              return (
                <div
                  key={item.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-cyan-500/50 p-5 transition-all shadow-lg space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {item.category}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> {item.condition}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-1 leading-snug">{item.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">ID: {item.id}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Total Stock</span>
                      <span className="font-extrabold text-white text-sm">{item.quantity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">In Active Use</span>
                      <span className="font-bold text-amber-400 text-sm">{currentlyAllocated}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Available Now</span>
                      <span className="font-bold text-emerald-400 text-sm">{availableInLab}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span>📍 {item.storageLocation}</span>
                    <span className="text-[11px] text-slate-400">Inspected: {item.lastInspected}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SCHEDULED CLASS SESSIONS */}
      {activeSubTab === 'sessions' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" /> Upcoming Practical STEM Laboratory Class Sessions
              </h3>
              <p className="text-xs text-slate-400">Scheduled experiments for Primary & JSS classes in Bo District</p>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1"
            >
              + Book Lab Class Slot
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {labSessions.map((sess) => (
              <div
                key={sess.id}
                className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {sess.subject}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    {sess.bookedCount} / {sess.maxCapacity} Seats Booked
                  </span>
                </div>

                <h4 className="font-bold text-white text-base">{sess.title}</h4>

                <div className="text-xs text-slate-300 space-y-1">
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {sess.date} ({sess.timeSlot})
                  </p>
                  <p className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Instructor: {sess.teacherName} • Target: {sess.targetGrade}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex flex-wrap gap-1">
                  {sess.apparatusNeeded.map((app, i) => (
                    <span key={i} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      🔬 {app}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: AI STEM LESSON PLAN GENERATOR */}
      {activeSubTab === 'stem-ai' && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900 border border-cyan-800/50 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI STEM Experiment & Lesson Plan Generator</h3>
              <p className="text-xs text-slate-300">
                Generate practical, apparatus-specific lab experiment guides tailored for Jonathan's Child Care STEM students.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerateStemPlan} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Experiment Topic</label>
              <input
                type="text"
                required
                value={stemTopic}
                onChange={(e) => setStemTopic(e.target.value)}
                placeholder="e.g. Acid-Base Titration"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Subject</label>
              <select
                value={stemSubject}
                onChange={(e) => setStemSubject(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Grade</label>
              <select
                value={stemTargetGrade}
                onChange={(e) => setStemTargetGrade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Primary 6 STEM">Primary 6 STEM</option>
                <option value="JSS 1">JSS 1</option>
                <option value="JSS 2 STEM">JSS 2 STEM</option>
                <option value="JSS 3">JSS 3</option>
                <option value="SSS 2 Science">SSS 2 Science</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={isGeneratingStem}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingStem ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Drafting STEM Lesson Guide...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Interactive STEM Guide</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {stemOutput && (
            <div className="p-5 rounded-xl bg-slate-950 border border-cyan-800/80 text-xs text-slate-200 space-y-3 font-mono leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between text-cyan-400 font-semibold font-sans border-b border-slate-800 pb-2">
                <span>🔬 Official JCC STEM Lab Experiment Procedure</span>
                <button
                  onClick={() => navigator.clipboard.writeText(stemOutput)}
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  Copy Markdown
                </button>
              </div>
              {stemOutput}
            </div>
          )}
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" /> Add Apparatus to Science Lab
              </h3>
              <button onClick={() => setShowAddEquipmentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEquipment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Equipment / Tool Name</label>
                <input
                  type="text"
                  required
                  value={eqName}
                  onChange={(e) => setEqName(e.target.value)}
                  placeholder="e.g. Digital Spectrophotometer"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={eqCategory}
                    onChange={(e) => setEqCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="STEM Robotics">STEM Robotics</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={eqQuantity}
                    onChange={(e) => setEqQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Storage Location / Bench</label>
                <input
                  type="text"
                  value={eqLocation}
                  onChange={(e) => setEqLocation(e.target.value)}
                  placeholder="e.g. Cabinet A - Optics Station"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEquipmentModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Lab Class Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" /> Book Practical Class Session
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={sessTitle}
                  onChange={(e) => setSessTitle(e.target.value)}
                  placeholder="e.g. Optics & Lens Magnification"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={sessDate}
                    onChange={(e) => setSessDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Subject</label>
                  <select
                    value={sessSubject}
                    onChange={(e) => setSessSubject(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Integrated Science">Integrated Science</option>
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={sessTime}
                    onChange={(e) => setSessTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Grade</label>
                  <input
                    type="text"
                    value={sessGrade}
                    onChange={(e) => setSessGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Instructor / Teacher</label>
                <select
                  value={sessTeacher}
                  onChange={(e) => setSessTeacher(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  {LAB_TEACHERS_LIST.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Book Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
