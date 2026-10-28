import React, { useState } from 'react';
import { Download, CheckCircle2, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone PWA mode, don't show prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Desktop / Android flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="px-2.5 py-1.5 rounded-lg bg-[#00f5a0]/15 hover:bg-[#00f5a0]/25 border border-[#00f5a0]/50 text-[#00f5a0] font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,245,160,0.15)] whitespace-nowrap animate-pulse hover:animate-none"
        title="Install PERSONAL OS as Standalone Desktop/Mobile App"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-2.5 py-1.5 rounded-lg bg-[#091414] hover:bg-[#0c1818] border border-[#162b29] text-[#7a9490] hover:text-[#00f5a0] font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Install on iPhone / iPad"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-xl bg-[#0a1214] border border-[#162b29] p-5 shadow-2xl text-[#e6f4f1]">
              <div className="flex items-center justify-between pb-3 border-b border-[#162b29]">
                <h3 className="font-mono text-sm font-bold text-[#00f5a0] flex items-center gap-2">
                  <Download className="w-4 h-4" /> Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded text-[#7a9490] hover:text-[#e6f4f1]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 text-xs text-[#a0b8b4] space-y-2">
                <p>To run PERSONAL OS completely standalone with offline caching on iOS:</p>
                <ol className="list-decimal list-inside space-y-1 text-[#e6f4f1] font-mono text-[11px] bg-[#050a0a] p-3 rounded-lg border border-[#162b29]">
                  <li>Tap the <strong className="text-[#00f5a0]">Share</strong> button in Safari toolbar.</li>
                  <li>Scroll down and tap <strong className="text-[#00f5a0]">Add to Home Screen</strong>.</li>
                  <li>Launch from your Home Screen for zero-latency standalone execution.</li>
                </ol>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-2 rounded-lg bg-[#00f5a0]/15 hover:bg-[#00f5a0]/25 text-[#00f5a0] font-mono text-xs font-bold border border-[#00f5a0]/40 transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
