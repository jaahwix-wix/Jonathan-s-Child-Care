import React, { useState } from 'react';
import {
  Lock,
  User,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { UserSession } from '../types';
import { DEFAULT_USERS, ASSET_IMAGES } from '../data/mockData';

interface LoginGatewayProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginGateway: React.FC<LoginGatewayProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // 1. Admin Authentication Check
      const isAdminUser =
        trimmedUser === 'admin' ||
        trimmedUser === 'jaahwix' ||
        trimmedUser === 'jaahwix@gmail.com';

      const isValidAdminPass =
        trimmedPass === 'jcc2026' ||
        trimmedPass === 'admin' ||
        trimmedPass === 'password';

      if (isAdminUser && isValidAdminPass) {
        setIsLoading(false);
        // Authenticate as the Executive Administrator (jaahwix@gmail.com)
        onLoginSuccess(DEFAULT_USERS[0]);
        return;
      }

      // 2. Generic staff check (matches any registered staff or teacher username/email)
      const matchedUser = DEFAULT_USERS.find(
        (u) =>
          u.email.toLowerCase() === trimmedUser ||
          u.name.toLowerCase() === trimmedUser ||
          u.id.toLowerCase() === trimmedUser
      );

      if (matchedUser && (trimmedPass === 'jcc2026' || trimmedPass === 'password')) {
        setIsLoading(false);
        onLoginSuccess(matchedUser);
        return;
      }

      setIsLoading(false);
      setErrorMsg('Invalid username or password. Please verify your credentials.');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(15,23,42,1))]">
      <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header with Logo */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white p-2 shadow-xl border-2 border-emerald-400/80 flex items-center justify-center">
            <img
              src={ASSET_IMAGES.systemLogo}
              alt="Jonathan's Child Care Ministries System Logo"
              className="w-full h-full object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Jonathan's Child Care
            </h1>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
              Bo District, Sierra Leone
            </p>
          </div>

          <div className="pt-1">
            <h2 className="text-base font-semibold text-slate-200">
              System Login
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your username and password to access the system
            </p>
          </div>
        </div>

        {/* Clean Login Form - ONLY Username & Password */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Enter username"
                autoComplete="username"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Minimal Footer */}
        <div className="pt-2 border-t border-slate-800 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-emerald-500" />
          <span>Authorized Personnel Only • Bo District, Sierra Leone</span>
        </div>

      </div>
    </div>
  );
};
