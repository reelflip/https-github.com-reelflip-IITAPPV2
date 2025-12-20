import React from 'react';
import { CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export type SyncStatus = 'SYNCING' | 'SYNCED' | 'ERROR' | 'IDLE';

interface SyncStatusBadgeProps {
  status: SyncStatus;
  show?: boolean;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ status, show = true }) => {
  if (!show || status === 'IDLE') return null;

  const styles = {
    SYNCING: "bg-blue-50 text-blue-600 border-blue-200",
    SYNCED: "bg-green-50 text-green-700 border-green-200",
    ERROR: "bg-red-50 text-red-700 border-red-200"
  };

  const labels = {
    SYNCING: "Syncing...",
    SYNCED: "Synced",
    ERROR: "Not Synced"
  };

  const icons = {
    SYNCING: <RefreshCw size={12} className="animate-spin" />,
    SYNCED: <CheckCircle2 size={12} />,
    ERROR: <AlertTriangle size={12} />
  };

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all duration-300 animate-in fade-in zoom-in-95 ${styles[status as keyof typeof styles]}`}>
      {icons[status as keyof typeof icons]}
      <span>{labels[status as keyof typeof labels]}</span>
    </div>
  );
};