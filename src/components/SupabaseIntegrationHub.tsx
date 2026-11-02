import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Download,
  Key,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  HardDrive,
  FileCode,
  Sparkles,
  Info,
  Lock,
} from 'lucide-react';

import {
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  generateSupabaseSqlSchema,
  batchSyncTable,
  fetchTableFromSupabase,
  SupabaseConfig,
} from '../services/supabaseService';

import {
  Student,
  OrphanRecord,
  LabEquipment,
  LabSession,
  EquipmentAllocation,
  Player,
  Match,
  CommunityEvent,
  Sponsorship,
  FeeNotification,
  UserSession,
  ThemeMode,
} from '../types';
import { hasPermission } from '../services/authService';
import { AccessRestrictedBanner } from './AccessRestrictedBanner';

interface SupabaseIntegrationHubProps {
  students: Student[];
  orphans: OrphanRecord[];
  labEquipment: LabEquipment[];
  labSessions: LabSession[];
  allocations: EquipmentAllocation[];
  players: Player[];
  matches: Match[];
  events: CommunityEvent[];
  sponsorships: Sponsorship[];
  notifications: FeeNotification[];
  onImportStudents?: (imported: Student[]) => void;
  onImportPlayers?: (imported: Player[]) => void;
  currentUser?: UserSession;
  onOpenPrivilegeModal?: () => void;
  themeMode?: ThemeMode;
}

export const SupabaseIntegrationHub: React.FC<SupabaseIntegrationHubProps> = ({
  students,
  orphans,
  labEquipment,
  labSessions,
  allocations,
  players,
  matches,
  events,
  sponsorships,
  notifications,
  onImportStudents,
  onImportPlayers,
  currentUser,
  onOpenPrivilegeModal,
  themeMode,
}) => {
  const [config, setConfig] = useState<SupabaseConfig>(getSavedSupabaseConfig);
  const [urlInput, setUrlInput] = useState<string>(config.url || '');
  const [keyInput, setKeyInput] = useState<string>(config.anonKey || '');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    latencyMs?: number;
  } | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'connection' | 'schema' | 'sync' | 'explorer'>('connection');
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  // Sync Statuses
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<Record<string, { status: 'idle' | 'syncing' | 'success' | 'error'; count: number; error?: string }>>({});
  const [syncSummary, setSyncSummary] = useState<string | null>(null);

  // Table Explorer
  const [selectedTable, setSelectedTable] = useState<string>('students');
  const [explorerData, setExplorerData] = useState<any[]>([]);
  const [isLoadingExplorer, setIsLoadingExplorer] = useState<boolean>(false);
  const [explorerError, setExplorerError] = useState<string | null>(null);

  const sqlSchema = generateSupabaseSqlSchema();

  const canManageSupabase = currentUser ? hasPermission(currentUser, 'database:manage_supabase') : true;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection(urlInput, keyInput);
      setTestResult(result);
      if (result.success && canManageSupabase) {
        const updated: SupabaseConfig = {
          url: urlInput.trim(),
          anonKey: keyInput.trim(),
          autoSync: config.autoSync,
          lastConnectedAt: new Date().toISOString(),
        };
        setConfig(updated);
        saveSupabaseConfig(updated);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = () => {
    if (!canManageSupabase) {
      setTestResult({
        success: false,
        message: 'Access Denied: Saving Supabase credentials requires Director / Administrator clearance.',
      });
      return;
    }
    const updated: SupabaseConfig = {
      url: urlInput.trim(),
      anonKey: keyInput.trim(),
      autoSync: config.autoSync,
      lastConnectedAt: config.lastConnectedAt,
    };
    setConfig(updated);
    saveSupabaseConfig(updated);
    setTestResult({
      success: true,
      message: 'Supabase credentials saved successfully.',
    });
  };

  const handleClear = () => {
    if (!canManageSupabase) {
      setTestResult({
        success: false,
        message: 'Access Denied: Modifying connection settings requires Director clearance.',
      });
      return;
    }
    clearSupabaseConfig();
    setUrlInput('');
    setKeyInput('');
    setConfig({ url: '', anonKey: '', autoSync: true });
    setTestResult(null);
  };

  const handleToggleAutoSync = () => {
    const updated = { ...config, autoSync: !config.autoSync };
    setConfig(updated);
    saveSupabaseConfig(updated);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleDownloadSchema = () => {
    const blob = new Blob([sqlSchema], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'jcc_bo_supabase_schema.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSyncAllToSupabase = async () => {
    if (!config.url || !config.anonKey) {
      setTestResult({
        success: false,
        message: 'Please connect to Supabase first before running data replication.',
      });
      return;
    }

    setIsSyncingAll(true);
    setSyncSummary(null);

    const tablesToSync: { name: string; items: any[] }[] = [
      { name: 'students', items: students },
      { name: 'orphans', items: orphans },
      { name: 'lab_equipment', items: labEquipment },
      { name: 'lab_sessions', items: labSessions },
      { name: 'equipment_allocations', items: allocations },
      { name: 'players', items: players },
      { name: 'matches', items: matches },
      { name: 'community_events', items: events },
      { name: 'sponsorships', items: sponsorships },
      { name: 'fee_notifications', items: notifications },
    ];

    let totalSynced = 0;
    const progressObj: typeof syncProgress = {};

    for (const table of tablesToSync) {
      progressObj[table.name] = { status: 'syncing', count: 0 };
      setSyncProgress({ ...progressObj });

      const res = await batchSyncTable(table.name, table.items);
      if (res.success) {
        totalSynced += res.count;
        progressObj[table.name] = { status: 'success', count: res.count };
      } else {
        progressObj[table.name] = { status: 'error', count: 0, error: res.error };
      }
      setSyncProgress({ ...progressObj });
    }

    setIsSyncingAll(false);
    setSyncSummary(`Successfully replicated ${totalSynced} records to Supabase tables.`);
  };

  const handleExploreTable = async (tableName: string) => {
    setSelectedTable(tableName);
    setIsLoadingExplorer(true);
    setExplorerError(null);
    const res = await fetchTableFromSupabase<any>(tableName);
    setIsLoadingExplorer(false);
    if (res.success && res.data) {
      setExplorerData(res.data);
    } else {
      setExplorerError(res.error || 'Failed to query table.');
      setExplorerData([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* RBAC Access Guard Banner */}
      {!canManageSupabase && (
        <AccessRestrictedBanner
          actionName="Supabase PostgreSQL Schema DDL & API Credentials"
          currentRole={currentUser ? currentUser.role : 'Public / Sponsor'}
          requiredRole="Director / Administrator (Executive Board Level 4)"
          onOpenPrivilegeModal={onOpenPrivilegeModal || (() => {})}
          themeMode={themeMode || 'academic-light'}
        />
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 backdrop-blur-md">
                <Database className="w-6 h-6" />
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
                PostgreSQL & Cloud Storage
              </span>
              {config.url && config.anonKey ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-bold rounded-full">
                  <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
                  Supabase Configured
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full border border-amber-500/30">
                  Ready for Setup
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Supabase Integration Hub
            </h1>
            <p className="text-emerald-100/80 text-sm sm:text-base mt-1 max-w-2xl">
              Connect Jonathan’s Child Care & JCC FC directly to Supabase PostgreSQL,
              replicate all academic and football records, and deploy full SQL schemas with Row Level Security.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveSubTab('schema')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition backdrop-blur-md border border-white/10 shadow-sm"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              View SQL Schema
            </button>
            <button
              onClick={() => setActiveSubTab('sync')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-bold transition shadow-lg shadow-emerald-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              Replicate Records
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Architecture & Quota Notice Card */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Dual Cloud Architecture: Firebase Firestore + Supabase PostgreSQL
            </p>
            <p className="leading-relaxed">
              <strong>Firebase Firestore</strong> is actively provisioned and synchronizing data in real time for this applet (<code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-xs font-mono">ai-studio-jccbomanagementh...</code>).
              Google Cloud SQL Developer Edition has reached its quota limit on the project, so you can connect your own <strong>Supabase project</strong> here for unlimited relational tables, SQL queries, and instant backup replication!
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('connection')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 -mb-px whitespace-nowrap ${
            activeSubTab === 'connection'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          Connection Credentials
        </button>
        <button
          onClick={() => setActiveSubTab('schema')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 -mb-px whitespace-nowrap ${
            activeSubTab === 'schema'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          1-Click SQL Schema
        </button>
        <button
          onClick={() => setActiveSubTab('sync')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 -mb-px whitespace-nowrap ${
            activeSubTab === 'sync'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Data Replication ({students.length + players.length + orphans.length} items)
        </button>
        <button
          onClick={() => setActiveSubTab('explorer')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 -mb-px whitespace-nowrap ${
            activeSubTab === 'explorer'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Live Table Explorer
        </button>
      </div>

      {/* Tab 1: Connection Credentials */}
      {activeSubTab === 'connection' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Supabase Project API Configuration
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 mb-6">
                Enter your Supabase Project URL and Anon API Key from your{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-medium underline inline-flex items-center gap-1"
                >
                  Supabase Dashboard <ExternalLink className="w-3 h-3" />
                </a>{' '}
                under <strong>Project Settings → API</strong>.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Project URL (Endpoint)
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Format: <code className="font-mono">https://[your-project-ref].supabase.co</code>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Supabase Anon / Public Key (API Key)
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Use the <strong>anon / public</strong> key (safe for client-side API requests with Row Level Security).
                  </span>
                </div>

                {/* Auto-Sync Toggle */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                      Dual-Write Real-Time Sync
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Automatically replicate every add/edit/delete operation to Supabase alongside Firestore.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAutoSync}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      config.autoSync ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        config.autoSync ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting || !urlInput || !keyInput}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-emerald-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    {isTesting ? 'Testing Ping...' : 'Test Connection'}
                  </button>

                  <button
                    onClick={handleSaveConfig}
                    disabled={!urlInput || !keyInput}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
                  >
                    Save Credentials
                  </button>

                  {(config.url || urlInput) && (
                    <button
                      onClick={handleClear}
                      className="px-3.5 py-2.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-medium transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Test Result Message */}
                {testResult && (
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 mt-3 ${
                      testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    )}
                    <div className="text-xs sm:text-sm">
                      <p className="font-semibold">
                        {testResult.success ? 'Supabase Connection Verified!' : 'Connection Verification Failed'}
                      </p>
                      <p className="mt-0.5">{testResult.message}</p>
                      {testResult.latencyMs && (
                        <p className="text-[11px] opacity-80 mt-1 font-mono">
                          Latency: {testResult.latencyMs}ms
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Setup Guide Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                3-Step Supabase Setup
              </h3>
              <ol className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                    1
                  </span>
                  <span>
                    Create a free project at{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 underline font-medium"
                    >
                      supabase.com
                    </a>.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </span>
                  <span>
                    Go to the <strong>SQL Editor</strong> tab on Supabase and paste our <strong>1-Click Schema</strong>.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                    3
                  </span>
                  <span>
                    Copy your <strong>Project URL</strong> & <strong>anon key</strong> here and click <strong>Test Connection</strong>.
                  </span>
                </li>
              </ol>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-5">
              <h4 className="font-semibold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Enterprise Security Included
              </h4>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                Our generated schema automatically enables PostgreSQL Row Level Security (RLS) on all 10 core tables with public read/write policies configured for instantaneous connection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 1-Click SQL Schema */}
      {activeSubTab === 'schema' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                PostgreSQL Schema DDL for Supabase SQL Editor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Creates all 10 tables, indexes, JSONB document fields, and Row Level Security (RLS) policies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySchema}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                {copiedSchema ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSchema ? 'Copied to Clipboard!' : 'Copy SQL Schema'}
              </button>
              <button
                onClick={handleDownloadSchema}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download .sql
              </button>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>jcc_bo_supabase_schema.sql (PostgreSQL 15+)</span>
              <span className="text-emerald-400 font-semibold">10 Tables • 6 Indexes • 20 RLS Policies</span>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-[500px] leading-relaxed selection:bg-emerald-500 selection:text-slate-950">
              <code>{sqlSchema}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Data Replication / Sync */}
      {activeSubTab === 'sync' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Full Database Replication
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Replicate your current live system state (pupils, players, orphans, science equipment) into your Supabase PostgreSQL database.
                </p>
              </div>

              <button
                onClick={handleSyncAllToSupabase}
                disabled={isSyncingAll}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
              >
                {isSyncingAll ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                {isSyncingAll ? 'Replicating Records...' : 'Push All Records to Supabase'}
              </button>
            </div>

            {syncSummary && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {syncSummary}
              </div>
            )}

            {/* Tables Sync Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'students', label: 'Academic Students', count: students.length },
                { name: 'orphans', label: 'Orphanage Residents', count: orphans.length },
                { name: 'lab_equipment', label: 'Science Lab Equipment', count: labEquipment.length },
                { name: 'lab_sessions', label: 'Lab Teaching Sessions', count: labSessions.length },
                { name: 'equipment_allocations', label: 'Lab Allocations', count: allocations.length },
                { name: 'players', label: 'JCC FC Squad Players', count: players.length },
                { name: 'matches', label: 'JCC FC Fixtures & Matches', count: matches.length },
                { name: 'community_events', label: 'Community Events', count: events.length },
                { name: 'sponsorships', label: 'Sponsors & Grants', count: sponsorships.length },
                { name: 'fee_notifications', label: 'Fee Reminder Alerts', count: notifications.length },
              ].map((table) => {
                const status = syncProgress[table.name]?.status;
                const syncedCount = syncProgress[table.name]?.count;
                const error = syncProgress[table.name]?.error;

                return (
                  <div
                    key={table.name}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {table.label}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {table.count} local
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 font-mono flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                      <span>public.{table.name}</span>
                      {status === 'syncing' && (
                        <span className="text-amber-500 flex items-center gap-1 font-sans">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                        </span>
                      )}
                      {status === 'success' && (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-sans font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> {syncedCount} Synced
                        </span>
                      )}
                      {status === 'error' && (
                        <span className="text-rose-500 flex items-center gap-1 font-sans" title={error}>
                          <AlertCircle className="w-3 h-3" /> Error
                        </span>
                      )}
                      {!status && (
                        <span className="text-slate-400 font-sans">Idle</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Live Table Explorer */}
      {activeSubTab === 'explorer' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Live Supabase Table Inspector
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Execute real-time SELECT queries against your Supabase PostgreSQL instance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedTable}
                onChange={(e) => handleExploreTable(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="students">public.students</option>
                <option value="orphans">public.orphans</option>
                <option value="lab_equipment">public.lab_equipment</option>
                <option value="players">public.players</option>
                <option value="matches">public.matches</option>
                <option value="community_events">public.community_events</option>
                <option value="sponsorships">public.sponsorships</option>
              </select>

              <button
                onClick={() => handleExploreTable(selectedTable)}
                disabled={isLoadingExplorer}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
              >
                {isLoadingExplorer ? 'Querying...' : 'Fetch Rows'}
              </button>
            </div>
          </div>

          {explorerError && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{explorerError}</span>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto max-h-96">
            {explorerData.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px] tracking-wider sticky top-0">
                  <tr>
                    {Object.keys(explorerData[0]).slice(0, 7).map((col) => (
                      <th key={col} className="p-2.5 border-b border-slate-200 dark:border-slate-700">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {explorerData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 font-mono text-[11px]">
                      {Object.keys(row).slice(0, 7).map((col) => (
                        <td key={col} className="p-2.5 text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                          {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                {isLoadingExplorer
                  ? 'Loading records from Supabase...'
                  : 'No records found or table not yet seeded. Use "Push All Records" to replicate data.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
