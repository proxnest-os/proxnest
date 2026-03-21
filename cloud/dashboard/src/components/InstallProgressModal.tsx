/**
 * ProxNest Cloud — Install Progress Modal
 * Shows real-time Docker pull/install progress with layer-by-layer details.
 */

import { useEffect, useRef } from 'react';
import { X, Download, Box, Play, Settings, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import type { InstallProgress, PullLayer } from '../hooks/useInstallProgress';

// ─── Phase Config ───────────────────────────────

const PHASE_CONFIG: Record<string, { icon: typeof Download; label: string; color: string }> = {
  pulling: { icon: Download, label: 'Pulling image', color: 'text-sky-400' },
  creating: { icon: Box, label: 'Creating container', color: 'text-amber-400' },
  starting: { icon: Play, label: 'Starting container', color: 'text-emerald-400' },
  configuring: { icon: Settings, label: 'Configuring', color: 'text-violet-400' },
  done: { icon: CheckCircle2, label: 'Complete', color: 'text-emerald-400' },
  error: { icon: XCircle, label: 'Failed', color: 'text-rose-400' },
};

// ─── Layer Progress Bar ─────────────────────────

function LayerRow({ layer }: { layer: PullLayer }) {
  const percent = layer.total && layer.total > 0
    ? Math.round((layer.current || 0) / layer.total * 100)
    : null;

  const statusColor =
    layer.status === 'Download complete' || layer.status === 'Pull complete' || layer.status === 'Already exists'
      ? 'text-emerald-400'
      : layer.status === 'Downloading' || layer.status === 'Extracting'
        ? 'text-sky-400'
        : 'text-zinc-500';

  return (
    <div className="flex items-center gap-2 text-[11px] font-mono py-0.5">
      <span className="text-zinc-600 w-[80px] shrink-0 truncate">{layer.id}</span>
      <span className={clsx('w-[110px] shrink-0 truncate', statusColor)}>{layer.status}</span>
      <div className="flex-1 min-w-0">
        {percent !== null ? (
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-300',
                layer.status === 'Extracting' ? 'bg-amber-500/70' : 'bg-sky-500/70',
              )}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        ) : (
          layer.progress && <span className="text-zinc-600 text-[10px]">{layer.progress}</span>
        )}
      </div>
      {percent !== null && (
        <span className="text-zinc-500 w-[32px] text-right shrink-0">{percent}%</span>
      )}
    </div>
  );
}

// ─── Phase Timeline ─────────────────────────────

const PHASES = ['pulling', 'creating', 'starting', 'configuring', 'done'] as const;

function PhaseTimeline({ currentPhase }: { currentPhase: string }) {
  const currentIdx = PHASES.indexOf(currentPhase as any);
  const isError = currentPhase === 'error';

  return (
    <div className="flex items-center gap-1 mb-4">
      {PHASES.map((phase, idx) => {
        const config = PHASE_CONFIG[phase];
        const Icon = config.icon;
        const isActive = phase === currentPhase;
        const isDone = idx < currentIdx || currentPhase === 'done';
        const isFailed = isError && idx === currentIdx;

        return (
          <div key={phase} className="flex items-center gap-1">
            {idx > 0 && (
              <div className={clsx(
                'w-6 h-px',
                isDone ? 'bg-emerald-500/40' : 'bg-zinc-700',
              )} />
            )}
            <div className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all',
              isActive && !isFailed && 'bg-zinc-800 text-white ring-1 ring-zinc-600',
              isDone && 'text-emerald-400',
              isFailed && 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30',
              !isActive && !isDone && !isFailed && 'text-zinc-600',
            )}>
              <Icon size={10} />
              <span className="hidden sm:inline">{config.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────

interface Props {
  appName: string;
  appIcon?: string;
  progress: InstallProgress;
  onClose: () => void;
}

export function InstallProgressModal({ appName, appIcon, progress, onClose }: Props) {
  const layersRef = useRef<HTMLDivElement>(null);

  // Auto-scroll layers list
  useEffect(() => {
    if (layersRef.current) {
      layersRef.current.scrollTop = layersRef.current.scrollHeight;
    }
  }, [progress.layers]);

  const phaseConfig = PHASE_CONFIG[progress.phase] || PHASE_CONFIG.pulling;
  const PhaseIcon = phaseConfig.icon;
  const isDone = progress.phase === 'done';
  const isError = progress.phase === 'error';
  const canClose = isDone || isError;

  // Overall percent
  const overallPercent = progress.percent ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            {appIcon ? (
              <span className="text-2xl">{appIcon}</span>
            ) : (
              <Box size={20} className="text-zinc-400" />
            )}
            <div>
              <h3 className="text-sm font-semibold text-white">
                {isDone ? `${appName} Installed!` : isError ? `${appName} Failed` : `Installing ${appName}`}
              </h3>
              <p className={clsx('text-[11px] mt-0.5', phaseConfig.color)}>
                {progress.message}
              </p>
            </div>
          </div>
          {canClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Phase Timeline */}
        <div className="px-5 pt-4">
          <PhaseTimeline currentPhase={progress.phase} />
        </div>

        {/* Overall Progress Bar */}
        {!isDone && !isError && (
          <div className="px-5 pb-2">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
              <span>Overall progress</span>
              <span>{overallPercent}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Docker Pull Layers */}
        {progress.layers && progress.layers.length > 0 && (
          <div className="px-5 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                Image Layers {progress.image && `— ${progress.image}`}
              </span>
              <span className="text-[10px] text-zinc-600">
                {progress.layers.filter(l =>
                  l.status === 'Download complete' || l.status === 'Pull complete' || l.status === 'Already exists'
                ).length}/{progress.layers.length} complete
              </span>
            </div>
            <div
              ref={layersRef}
              className="max-h-[200px] overflow-y-auto rounded-lg bg-zinc-950/50 border border-zinc-800/50 p-2 scrollbar-thin"
            >
              {progress.layers.map(layer => (
                <LayerRow key={layer.id} layer={layer} />
              ))}
            </div>
          </div>
        )}

        {/* Spinner for non-pull phases */}
        {!progress.layers?.length && !isDone && !isError && (
          <div className="flex items-center justify-center py-8 gap-3">
            <Loader2 size={20} className="animate-spin text-sky-400" />
            <span className="text-sm text-zinc-400">{progress.message}</span>
          </div>
        )}

        {/* Error Display */}
        {isError && progress.error && (
          <div className="px-5 pb-4">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-[12px] text-rose-300 font-mono break-all">
              {progress.error}
            </div>
          </div>
        )}

        {/* Success Display */}
        {isDone && (
          <div className="px-5 pb-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-emerald-300 font-medium">
                  {appName} is running!
                </p>
                {progress.url && (
                  <a
                    href={progress.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-400/70 hover:text-emerald-300 flex items-center gap-1 mt-1"
                  >
                    <ExternalLink size={10} /> {progress.url}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 flex justify-end">
          {canClose ? (
            <button
              onClick={onClose}
              className={clsx(
                'px-4 py-2 rounded-lg text-xs font-medium transition-all',
                isDone
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
              )}
            >
              {isDone ? 'Done' : 'Close'}
            </button>
          ) : (
            <span className="text-[10px] text-zinc-600 flex items-center gap-1.5">
              <Loader2 size={10} className="animate-spin" />
              Do not close this window during installation
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
