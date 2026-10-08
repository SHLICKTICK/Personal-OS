import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  AlertTriangle,
  Download,
  RefreshCw,
  Copy,
  Check,
  RotateCcw,
  Terminal,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { posRepository } from '../../storage/repository';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copiedRaw: boolean;
  copiedStack: boolean;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    copiedRaw: false,
    copiedStack: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('CRITICAL [PERSONAL OS] Uncaught Error Boundary Exception:', error, errorInfo);
  }

  private handleExportEmergencyJson = () => {
    try {
      let jsonPayload = '';
      const stored = window.localStorage.getItem('personal_os_v48_state_v1');
      if (stored) {
        jsonPayload = stored;
      } else {
        // Fallback to repository serializer
        const state = posRepository.loadState();
        jsonPayload = posRepository.exportJson(state);
      }

      const blob = new Blob([jsonPayload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emergency_personal_os_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to trigger emergency JSON export:', err);
    }
  };

  private handleCopyRawState = () => {
    try {
      const stored = window.localStorage.getItem('personal_os_v48_state_v1') || '{}';
      navigator.clipboard.writeText(stored);
      this.setState({ copiedRaw: true });
      setTimeout(() => this.setState({ copiedRaw: false }), 2500);
    } catch (err) {
      console.error('Failed to copy raw state:', err);
    }
  };

  private handleCopyStackTrace = () => {
    const { error, errorInfo } = this.state;
    const text = `ERROR: ${error?.message || 'Unknown'}\n\nSTACK:\n${error?.stack || ''}\n\nCOMPONENT STACK:\n${errorInfo?.componentStack || ''}`;
    try {
      navigator.clipboard.writeText(text);
      this.setState({ copiedStack: true });
      setTimeout(() => this.setState({ copiedStack: false }), 2500);
    } catch (err) {
      console.error('Failed to copy stack trace:', err);
    }
  };

  private handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleFactoryReset = () => {
    if (window.confirm('CRITICAL ACTION: Reset state to factory seed data? This will clear local storage and reload the application.')) {
      try {
        posRepository.resetToSeed();
        window.location.reload();
      } catch (err) {
        window.localStorage.clear();
        window.location.reload();
      }
    }
  };

  public render() {
    if (this.state.hasError) {
      const { error, errorInfo, copiedRaw, copiedStack, showDetails } = this.state;

      return (
        <div className="min-h-screen bg-[#050a0a] text-[#e6f4f1] flex items-center justify-center p-4 sm:p-6 font-mono select-none">
          <div className="w-full max-w-2xl bg-[#081414] border border-[#ef4444]/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Ambient Background Warning Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#ef4444]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            {/* Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-[#162b29] relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444]">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#ef4444]/15 text-[#ef4444] font-bold border border-[#ef4444]/30">
                      SYSTEM_HALT // KERNEL EXCEPTION
                    </span>
                    <span className="text-[10px] text-[#7a9490]">RECOVERY PROTOCOL ENGAGED</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-[#e6f4f1] tracking-tight uppercase mt-0.5">
                    EXECUTIVE OS RUNTIME SAFEGUARD
                  </h1>
                </div>
              </div>

              <div className="font-mono text-xs text-[#7a9490] hidden sm:block">
                TIMESTAMP: {new Date().toTimeString().slice(0, 8)}
              </div>
            </div>

            {/* Incident Explanation */}
            <div className="space-y-2 relative z-10">
              <p className="text-xs text-[#7a9490] leading-relaxed">
                An unexpected component rendering fault was captured by the top-level safety barrier.
                Your personal operating system state has been preserved in memory and storage.
                Use the emergency export tools below to archive your data prior to system reinitialization.
              </p>

              {/* Error Message Box */}
              <div className="p-3.5 rounded-xl bg-[#0b1a19] border border-[#ef4444]/30 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
                <div className="overflow-hidden">
                  <div className="text-[10px] text-[#ef4444] uppercase font-bold tracking-wider">
                    CAPTURED FAULT IDENTIFIER:
                  </div>
                  <div className="text-xs text-[#e6f4f1] font-bold break-words mt-0.5 font-mono">
                    {error?.message || 'Unknown runtime error occurred.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Grid: Data Preservation First */}
            <div className="space-y-3 pt-2 relative z-10">
              <div className="text-[10px] uppercase tracking-wider text-[#7a9490] font-bold flex items-center justify-between">
                <span>STAGE 1: EMERGENCY DATA ARCHIVAL & RECOVERY</span>
                <span className="text-[#00f5a0]">ZERO DATA LOSS GUARANTEE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Emergency JSON Export Button */}
                <button
                  onClick={this.handleExportEmergencyJson}
                  className="p-3.5 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#050a0a] font-mono text-xs font-black cursor-pointer transition-all shadow-lg shadow-[#00f5a0]/20 flex items-center justify-center gap-2 group"
                >
                  <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  DOWNLOAD EMERGENCY JSON
                </button>

                {/* Copy Raw State to Clipboard */}
                <button
                  onClick={this.handleCopyRawState}
                  className="p-3.5 rounded-xl bg-[#0e201e] hover:bg-[#162b29] text-[#4cd7f6] border border-[#4cd7f6]/40 font-mono text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  {copiedRaw ? <Check className="w-4 h-4 text-[#00f5a0]" /> : <Copy className="w-4 h-4" />}
                  {copiedRaw ? 'COPIED TO CLIPBOARD' : 'COPY RAW STATE (CLIPBOARD)'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Hot Reload / Restart */}
                <button
                  onClick={this.handleReload}
                  className="p-3 rounded-xl bg-[#0b1a19] hover:bg-[#162b29] text-[#e6f4f1] border border-[#162b29] font-mono text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#00f5a0]" />
                  RESTART APPLICATION
                </button>

                {/* Factory Reset Fallback */}
                <button
                  onClick={this.handleFactoryReset}
                  className="p-3 rounded-xl bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30 font-mono text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#ef4444]" />
                  RESET TO FACTORY SEED
                </button>
              </div>
            </div>

            {/* Diagnostic Stack Trace (Collapsible) */}
            <div className="pt-2 border-t border-[#162b29] relative z-10">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => this.setState({ showDetails: !showDetails })}
                  className="text-xs text-[#7a9490] hover:text-[#e6f4f1] flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <Terminal className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  <span>DIAGNOSTIC KERNEL TRACE</span>
                  {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showDetails && (
                  <button
                    onClick={this.handleCopyStackTrace}
                    className="text-[10px] text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedStack ? <Check className="w-3 h-3 text-[#00f5a0]" /> : <Copy className="w-3 h-3" />}
                    {copiedStack ? 'COPIED TRACE' : 'COPY STACK'}
                  </button>
                )}
              </div>

              {showDetails && (
                <div className="mt-3 p-3 rounded-xl bg-[#071010] border border-[#162b29] max-h-48 overflow-y-auto text-[11px] leading-relaxed text-[#ef4444] font-mono whitespace-pre-wrap select-text">
                  {error?.stack || error?.message || 'No stack trace available.'}
                  {errorInfo?.componentStack && (
                    <div className="mt-2 pt-2 border-t border-[#162b29] text-[#7a9490]">
                      {errorInfo.componentStack}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
