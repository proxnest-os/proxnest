/**
 * ProxNest Cloud — Resource Graphs Component
 * Displays CPU, RAM, and disk usage over time using Chart.js
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';
import { api } from '../lib/api';
import {
  Activity, Cpu, MemoryStick, HardDrive, Loader2, RefreshCw,
  Clock, AlertTriangle, BarChart3, Layers,
} from 'lucide-react';
import { clsx } from 'clsx';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  TimeScale,
);

// ─── Types ─────────────────────────────────────

interface MetricPoint {
  ts: number;
  cpu: number;
  ram_used: number;
  ram_total: number;
  disk_used: number;
  disk_total: number;
  load_avg: number;
  guests_running: number;
  guests_stopped: number;
}

interface MetricsResponse {
  points: MetricPoint[];
  from: number;
  to: number;
  count: number;
  interval: string;
}

type TimeRange = '1h' | '6h' | '24h' | '3d' | '7d';

// ─── Chart theme colors ────────────────────────

const COLORS = {
  cpu: {
    line: 'rgb(129, 140, 248)',     // indigo-400
    fill: 'rgba(129, 140, 248, 0.1)',
    gradient: ['rgba(129, 140, 248, 0.3)', 'rgba(129, 140, 248, 0.0)'],
  },
  ram: {
    line: 'rgb(52, 211, 153)',      // emerald-400
    fill: 'rgba(52, 211, 153, 0.1)',
    gradient: ['rgba(52, 211, 153, 0.3)', 'rgba(52, 211, 153, 0.0)'],
  },
  disk: {
    line: 'rgb(251, 191, 36)',      // amber-400
    fill: 'rgba(251, 191, 36, 0.1)',
    gradient: ['rgba(251, 191, 36, 0.3)', 'rgba(251, 191, 36, 0.0)'],
  },
  load: {
    line: 'rgb(244, 114, 182)',     // pink-400
    fill: 'rgba(244, 114, 182, 0.1)',
    gradient: ['rgba(244, 114, 182, 0.3)', 'rgba(244, 114, 182, 0.0)'],
  },
  guests: {
    running: 'rgb(52, 211, 153)',
    stopped: 'rgb(148, 163, 184)',
  },
};

// ─── Shared chart options ──────────────────────

function makeChartOptions(title: string, yMax?: number, yLabel?: string, isPercent = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: { size: 11, weight: 'bold' as const },
        bodyFont: { size: 11 },
        callbacks: {
          title: (items: any[]) => {
            if (items[0]) {
              return new Date(items[0].parsed.x).toLocaleString(undefined, {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              });
            }
            return '';
          },
          label: (context: any) => {
            const v = context.parsed.y;
            if (isPercent) return ` ${context.dataset.label}: ${v.toFixed(1)}%`;
            return ` ${context.dataset.label}: ${v.toFixed(1)}${yLabel ? ' ' + yLabel : ''}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: { tooltipFormat: 'PPpp' },
        grid: { color: 'rgba(148, 163, 184, 0.06)' },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
          maxTicksLimit: 8,
        },
        border: { display: false },
      },
      y: {
        min: 0,
        max: yMax,
        grid: { color: 'rgba(148, 163, 184, 0.06)' },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
          callback: (value: any) => isPercent ? `${value}%` : value,
        },
        border: { display: false },
      },
    },
    elements: {
      point: { radius: 0, hitRadius: 8, hoverRadius: 4 },
      line: { tension: 0.35, borderWidth: 2 },
    },
    animation: { duration: 500 },
  };
}

// ─── Range Button ──────────────────────────────

function RangeButton({ range, active, onClick }: { range: TimeRange; active: boolean; onClick: () => void }) {
  const labels: Record<TimeRange, string> = { '1h': '1H', '6h': '6H', '24h': '24H', '3d': '3D', '7d': '7D' };
  return (
    <button
      onClick={onClick}
      className={clsx(
        'text-[11px] px-2.5 py-1 rounded-lg transition-all font-medium',
        active
          ? 'bg-nest-600/30 text-white border border-nest-400/20'
          : 'text-nest-400 hover:text-white bg-nest-800/30 hover:bg-nest-800/60',
      )}
    >
      {labels[range]}
    </button>
  );
}

// ─── Stat Mini Card ────────────────────────────

function StatMini({ label, value, color, icon: Icon }: {
  label: string; value: string; color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-nest-900/30 border border-nest-800/50">
      <Icon size={13} className={color} />
      <div>
        <p className="text-[10px] text-nest-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

// ─── Chart Card ────────────────────────────────

function ChartCard({ title, icon: Icon, iconColor, children, stats }: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  children: React.ReactNode;
  stats?: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl glow-border overflow-hidden">
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={clsx('p-1.5 rounded-lg', iconColor)}>
              <Icon size={14} className="text-white/80" />
            </div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
          </div>
          {stats && <div className="flex items-center gap-2">{stats}</div>}
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="h-[200px]">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────

export function ResourceGraphs({ serverId }: { serverId: number }) {
  const [range, setRange] = useState<TimeRange>('24h');
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMetrics = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const result = await api.sendCommand(serverId, 'metrics.history', { range, maxPoints: 300 });
      if (result.success && result.data) {
        setData(result.data as MetricsResponse);
      } else {
        setError(result.error || 'Failed to load metrics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, [serverId, range]);

  useEffect(() => {
    fetchMetrics(true);
    // Auto-refresh every 60s
    refreshTimerRef.current = setInterval(() => fetchMetrics(false), 60_000);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [fetchMetrics]);

  // ─── Computed chart data ──────────────────

  const points = data?.points || [];
  const timestamps = points.map(p => p.ts * 1000);

  const lastPoint = points.length > 0 ? points[points.length - 1] : null;
  const currentCpu = lastPoint?.cpu ?? 0;
  const currentRamPct = lastPoint && lastPoint.ram_total > 0
    ? (lastPoint.ram_used / lastPoint.ram_total * 100) : 0;
  const currentDiskPct = lastPoint && lastPoint.disk_total > 0
    ? (lastPoint.disk_used / lastPoint.disk_total * 100) : 0;

  // CPU chart data
  const cpuChartData = {
    labels: timestamps,
    datasets: [{
      label: 'CPU Usage',
      data: points.map(p => ({ x: p.ts * 1000, y: p.cpu })),
      borderColor: COLORS.cpu.line,
      backgroundColor: COLORS.cpu.fill,
      fill: true,
    }],
  };

  // RAM chart data
  const ramChartData = {
    labels: timestamps,
    datasets: [{
      label: 'RAM Used',
      data: points.map(p => ({ x: p.ts * 1000, y: p.ram_total > 0 ? (p.ram_used / p.ram_total * 100) : 0 })),
      borderColor: COLORS.ram.line,
      backgroundColor: COLORS.ram.fill,
      fill: true,
    }],
  };

  // Disk chart data
  const diskChartData = {
    labels: timestamps,
    datasets: [{
      label: 'Disk Used',
      data: points.map(p => ({ x: p.ts * 1000, y: p.disk_total > 0 ? (p.disk_used / p.disk_total * 100) : 0 })),
      borderColor: COLORS.disk.line,
      backgroundColor: COLORS.disk.fill,
      fill: true,
    }],
  };

  // Load average chart data
  const loadChartData = {
    labels: timestamps,
    datasets: [{
      label: 'Load Average',
      data: points.map(p => ({ x: p.ts * 1000, y: p.load_avg })),
      borderColor: COLORS.load.line,
      backgroundColor: COLORS.load.fill,
      fill: true,
    }],
  };

  // Guests chart data
  const guestsChartData = {
    labels: timestamps,
    datasets: [
      {
        label: 'Running',
        data: points.map(p => ({ x: p.ts * 1000, y: p.guests_running })),
        borderColor: COLORS.guests.running,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        fill: true,
      },
      {
        label: 'Stopped',
        data: points.map(p => ({ x: p.ts * 1000, y: p.guests_stopped })),
        borderColor: COLORS.guests.stopped,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        fill: true,
      },
    ],
  };

  // ─── Render ───────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <BarChart3 size={16} className="text-nest-400" />
          Resource Graphs
          {data && (
            <span className="text-xs text-nest-500 font-normal ml-1">
              {data.count} data points
            </span>
          )}
        </h2>
        <div className="flex items-center gap-3">
          {/* Range selector */}
          <div className="flex items-center gap-1 glass rounded-lg p-0.5">
            {(['1h', '6h', '24h', '3d', '7d'] as TimeRange[]).map(r => (
              <RangeButton key={r} range={r} active={range === r} onClick={() => setRange(r)} />
            ))}
          </div>
          <button
            onClick={() => fetchMetrics(true)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass text-nest-300 hover:text-white transition-colors"
          >
            <RefreshCw size={12} className={clsx(loading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Current Stats Summary */}
      {lastPoint && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatMini
            label="CPU Now"
            value={`${currentCpu.toFixed(1)}%`}
            color="text-indigo-400"
            icon={Cpu}
          />
          <StatMini
            label="RAM Now"
            value={`${currentRamPct.toFixed(1)}%`}
            color="text-emerald-400"
            icon={MemoryStick}
          />
          <StatMini
            label="Disk Now"
            value={`${currentDiskPct.toFixed(1)}%`}
            color="text-amber-400"
            icon={HardDrive}
          />
          <StatMini
            label="Load Avg"
            value={lastPoint.load_avg.toFixed(2)}
            color="text-pink-400"
            icon={Activity}
          />
        </div>
      )}

      {/* Loading state */}
      {loading && !data && (
        <div className="glass rounded-xl p-12 text-center glow-border">
          <Loader2 size={32} className="text-nest-400 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-nest-400">Loading metrics history…</p>
          <p className="text-xs text-nest-500 mt-1">Data collection starts after agent connects</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="glass rounded-xl p-8 text-center glow-border">
          <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
          <p className="text-sm text-nest-300 mb-1">Could not load metrics</p>
          <p className="text-xs text-nest-500">{error}</p>
          <button
            onClick={() => fetchMetrics(true)}
            className="mt-3 text-xs text-nest-300 hover:text-white underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* No data state */}
      {!loading && !error && data && points.length === 0 && (
        <div className="glass rounded-xl p-8 text-center glow-border">
          <Clock size={32} className="text-nest-600 mx-auto mb-3" />
          <p className="text-sm text-nest-400">No metrics data yet</p>
          <p className="text-xs text-nest-500 mt-1">
            Data will appear after the agent sends a few heartbeats (every ~30 seconds)
          </p>
        </div>
      )}

      {/* Charts */}
      {!loading && !error && points.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* CPU */}
          <ChartCard
            title="CPU Usage"
            icon={Cpu}
            iconColor="bg-indigo-500/20"
            stats={
              <span className="text-xs text-indigo-400 font-mono">
                {currentCpu.toFixed(1)}%
              </span>
            }
          >
            <Line
              data={cpuChartData}
              options={makeChartOptions('CPU', 100, '%', true)}
            />
          </ChartCard>

          {/* RAM */}
          <ChartCard
            title="Memory Usage"
            icon={MemoryStick}
            iconColor="bg-emerald-500/20"
            stats={
              <span className="text-xs text-emerald-400 font-mono">
                {lastPoint ? `${(lastPoint.ram_used / 1024).toFixed(1)} / ${(lastPoint.ram_total / 1024).toFixed(0)} GB` : '—'}
              </span>
            }
          >
            <Line
              data={ramChartData}
              options={makeChartOptions('RAM', 100, '%', true)}
            />
          </ChartCard>

          {/* Disk */}
          <ChartCard
            title="Disk Usage"
            icon={HardDrive}
            iconColor="bg-amber-500/20"
            stats={
              <span className="text-xs text-amber-400 font-mono">
                {lastPoint ? `${lastPoint.disk_used.toFixed(0)} / ${lastPoint.disk_total.toFixed(0)} GB` : '—'}
              </span>
            }
          >
            <Line
              data={diskChartData}
              options={makeChartOptions('Disk', 100, '%', true)}
            />
          </ChartCard>

          {/* Load Average */}
          <ChartCard
            title="Load Average"
            icon={Activity}
            iconColor="bg-pink-500/20"
            stats={
              <span className="text-xs text-pink-400 font-mono">
                {lastPoint?.load_avg.toFixed(2) ?? '—'}
              </span>
            }
          >
            <Line
              data={loadChartData}
              options={makeChartOptions('Load', undefined, '')}
            />
          </ChartCard>

          {/* Guests */}
          <ChartCard
            title="VMs & Containers"
            icon={Layers}
            iconColor="bg-cyan-500/20"
            stats={
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-400">
                  ● {lastPoint?.guests_running ?? 0} running
                </span>
                <span className="text-[10px] text-nest-500">
                  ● {lastPoint?.guests_stopped ?? 0} stopped
                </span>
              </div>
            }
          >
            <Line
              data={guestsChartData}
              options={{
                ...makeChartOptions('Guests', undefined, ''),
                plugins: {
                  ...makeChartOptions('Guests').plugins,
                  legend: {
                    display: true,
                    position: 'top' as const,
                    align: 'end' as const,
                    labels: {
                      boxWidth: 8,
                      boxHeight: 8,
                      usePointStyle: true,
                      pointStyle: 'circle',
                      color: '#94a3b8',
                      font: { size: 10 },
                      padding: 12,
                    },
                  },
                },
              }}
            />
          </ChartCard>
        </div>
      )}
    </div>
  );
}
