import React from 'react';
import { WifiOff, Database, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-[#140f06] border border-amber-500/50 px-4 py-2.5 text-xs text-amber-200 shadow-2xl shadow-amber-950/40 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
        <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      </div>
      <div>
        <div className="font-mono font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
          <span>OFFLINE STANDALONE MODE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        </div>
        <p className="text-[10px] text-amber-200/80 font-mono">
          Local persistence active • All 9 modules, SM-2 reviews, timers & heuristics operational.
        </p>
      </div>
    </div>
  );
};

export const NetworkStatusBadge: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div
      className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono border transition-colors ${
        isOnline
          ? 'bg-[#00f5a0]/10 text-[#00f5a0] border-[#00f5a0]/30'
          : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
      }`}
      title={
        isOnline
          ? 'Network Online: Cloud AI features & sync active'
          : 'Offline Mode: 100% of local features, storage, and fallback heuristics active'
      }
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isOnline ? 'bg-[#00f5a0] shadow-[0_0_6px_#00f5a0]' : 'bg-amber-400 animate-pulse'
        }`}
      />
      <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
    </div>
  );
};
