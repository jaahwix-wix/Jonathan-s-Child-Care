import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  GraduationCap,
  Trophy,
  Microscope,
} from 'lucide-react';
import { UserSession } from '../types';
import { DEFAULT_USERS, ASSET_IMAGES } from '../data/mockData';

interface LoginGatewayProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginGateway: React.FC<LoginGatewayProps> = ({ onLoginSuccess }) => {
  const [selectedUser, setSelectedUser] = useState<UserSession>(DEFAULT_USERS[0]);
  const [password, setPassword] = useState('jcc2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password.trim()) {
      setErrorMsg('Please enter your staff access PIN or security password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(selectedUser);
    }, 600);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Director / Administrator':
        return <Building2 className="w-5 h-5 text-emerald-400" />;
      case 'Head Teacher':
        return <GraduationCap className="w-5 h-5 text-emerald-400" />;
      case 'JCC FC Coach':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'STEM Lab Specialist':
        return <Microscope className="w-5 h-5 text-cyan-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Left Branding Column */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div className="space-y-6">
            {/* System Logo & Header */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-xl border-2 border-emerald-400/80 shrink-0">
                <img
                  src={ASSET_IMAGES.systemLogo}
                  alt="Jonathan's Child Care Ministries System Logo"
                  className="w-full h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">Jonathan's Child Care</h1>
                <p className="text-xs text-emerald-400 font-semibold">Bo District, Sierra Leone</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Secure Gateway
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                System Access & Administrative Portal
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Operating over 20 years in Child Care Ministries, High Academic Standards, STEM Education, and Women's Football. Please authenticate to access system records.
              </p>
            </div>

            {/* Selected User Quick Preview */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 shadow-inner">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shadow-md shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="truncate">
                  <h3 className="font-bold text-white text-sm truncate">{selectedUser.name}</h3>
                  <p className="text-xs text-emerald-400 font-semibold truncate">{selectedUser.role}</p>
                  <p className="text-[10px] text-slate-400 truncate">{selectedUser.department}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Granted Privileges Preview:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedUser.privileges.slice(0, 3).map((priv, idx) => (
                    <span key={idx} className="text-[10px] font-medium bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> {priv}
                    </span>
                  ))}
                  {selectedUser.privileges.length > 3 && (
                    <span className="text-[10px] text-slate-400 font-medium px-1">
                      +{selectedUser.privileges.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 text-center md:text-left flex items-center justify-between">
            <span>© 2026 JCC Ministries</span>
            <span className="text-emerald-400 font-bold">Encrypted SSL 256-Bit</span>
          </div>
        </div>

        {/* Right Authentication Form Column */}
        <div className="md:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" /> Select Authorized Profile
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                All staff users must authenticate with role credentials to access administrative student, player, and lab records.
              </p>
            </div>

            {/* Profile Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEFAULT_USERS.map((user) => {
                const isSelected = selectedUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/50'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-600"
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate">{user.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-emerald-400 font-medium truncate">{user.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Authentication Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2 border-t border-slate-800">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Authenticated Email / Username</span>
                  <span className="text-[10px] text-emerald-400">Verified ID</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    readOnly
                    value={selectedUser.email}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Staff Access PIN / Password</span>
                  <span className="text-[10px] text-slate-400 font-normal">Default PIN: <strong className="text-emerald-400 font-mono">jcc2026</strong></span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security access password..."
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials & Privileges...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authenticate & Launch System</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex items-center gap-2 mt-4">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Authorized staff members get full access to student rosters, player contracts, science apparatus, and downloadable PDF reports.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
