import React from 'react';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';
import { UserRole, ThemeMode } from '../types';

interface AccessRestrictedBannerProps {
  requiredRole: string;
  currentRole: UserRole;
  actionName: string;
  onOpenPrivilegeModal: () => void;
  themeMode: ThemeMode;
}

export const AccessRestrictedBanner: React.FC<AccessRestrictedBannerProps> = ({
  requiredRole,
  currentRole,
  actionName,
  onOpenPrivilegeModal,
  themeMode,
}) => {
  const isLight = themeMode === 'academic-light';

  return (
    <div
      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-4 ${
        isLight
          ? 'bg-amber-50/90 border-amber-200 text-amber-950'
          : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 shrink-0">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold">
            Action Restricted: {actionName}
          </p>
          <p className={isLight ? 'text-amber-800' : 'text-amber-300'}>
            Your active role (<span className="font-semibold">{currentRole}</span>) is in Read-Only mode for this operational domain. Requires <span className="font-semibold">{requiredRole}</span> clearance.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenPrivilegeModal}
        className="px-3 py-1.5 rounded-lg font-semibold bg-amber-600 hover:bg-amber-500 text-white shrink-0 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
      >
        <span>Manage Roles & Privileges</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
