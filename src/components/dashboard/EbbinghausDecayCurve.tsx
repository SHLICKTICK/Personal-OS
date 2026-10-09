import React, { useMemo, useState } from 'react';
import { Activity, Clock, ShieldCheck, AlertTriangle, Sparkles, Info } from 'lucide-react';
import {
  calculateCurrentRetention,
  generateDecayCurvePoints,
  DecayPoint,
  getDueStatus,
} from '../../utils/sm2Algorithm';

interface EbbinghausDecayCurveProps {
  topicTitle?: string;
  intervalDays?: number;
  easeFactor?: number;
  lastReviewedDate?: string;
  nextDueDate?: string;
  compact?: boolean;
}

export const EbbinghausDecayCurve: React.FC<EbbinghausDecayCurveProps> = ({
  topicTitle,
  intervalDays = 7,
  easeFactor = 2.5,
  lastReviewedDate,
  nextDueDate,
  compact = false,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DecayPoint | null>(null);

  const retentionStats = useMemo(() => {
    return calculateCurrentRetention(lastReviewedDate, intervalDays, easeFactor);
  }, [lastReviewedDate, intervalDays, easeFactor]);

  const maxDays = useMemo(() => {
    return Math.max(14, Math.round(intervalDays * 1.6));
  }, [intervalDays]);

  const points = useMemo(() => {
    return generateDecayCurvePoints(intervalDays, easeFactor, retentionStats.elapsedDays, maxDays);
  }, [intervalDays, easeFactor, retentionStats.elapsedDays, maxDays]);

  const dueInfo = useMemo(() => {
    return getDueStatus(nextDueDate);
  }, [nextDueDate]);

  // SVG coordinate calculations
  const svgWidth = 460;
  const svgHeight = compact ? 120 : 160;
  const padding = { top: 18, right: 24, bottom: 28, left: 36 };

  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  const getX = (day: number) => {
    return padding.left + (day / maxDays) * innerWidth;
  };

  const getY = (retentionPct: number) => {
    return padding.top + innerHeight - (retentionPct / 100) * innerHeight;
  };

  // Build SVG path
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, idx) => {
      const x = getX(pt.day);
      const y = getY(pt.retentionPct);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [points, maxDays, innerWidth, innerHeight]);

  // Gradient area path
  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const firstX = getX(points[0].day);
    const lastX = getX(points[points.length - 1].day);
    const baseY = padding.top + innerHeight;
    return `${pathD} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }, [pathD, points, maxDays, innerWidth, innerHeight]);

  const currentX = getX(retentionStats.elapsedDays);
  const currentY = getY(retentionStats.retentionPct);
  const thresholdY = getY(70); // 70% Critical threshold

  return (
    <div className="rounded-xl bg-[#061010] border border-[#162b29] p-4 font-mono select-none space-y-3">
      {/* Header telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex items-center justify-center text-[#00f5a0]">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#7a9490] font-bold">
              Ebbinghaus Forgetting Curve
            </div>
            {topicTitle && (
              <div className="text-xs font-bold text-[#e6f4f1] truncate max-w-[240px]">
                {topicTitle}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dueInfo.badgeBg} ${dueInfo.badgeText} ${dueInfo.badgeBorder}`}
          >
            {dueInfo.label}
          </span>
          <span className="text-xs font-bold text-[#00f5a0] bg-[#00f5a0]/10 px-2 py-0.5 rounded border border-[#00f5a0]/30">
            {retentionStats.retentionPct}% Retention
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden bg-[#040909] rounded-lg border border-[#102220] p-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="decayAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f5a0" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00f5a0" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="decayLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00f5a0" />
              <stop offset="70%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={getY(100)}
            x2={svgWidth - padding.right}
            y2={getY(100)}
            stroke="#162b29"
            strokeDasharray="2,2"
          />
          <line
            x1={padding.left}
            y1={thresholdY}
            x2={svgWidth - padding.right}
            y2={thresholdY}
            stroke="#f59e0b"
            strokeOpacity="0.5"
            strokeDasharray="3,3"
          />
          <line
            x1={padding.left}
            y1={getY(50)}
            x2={svgWidth - padding.right}
            y2={getY(50)}
            stroke="#ff5c5c"
            strokeOpacity="0.4"
            strokeDasharray="2,2"
          />

          {/* Critical Threshold Label */}
          <text
            x={svgWidth - padding.right - 4}
            y={thresholdY - 4}
            textAnchor="end"
            fontSize="8"
            fill="#f59e0b"
            opacity="0.8"
          >
            70% Optimal Retrieval Threshold
          </text>

          {/* Area fill */}
          <path d={areaD} fill="url(#decayAreaGradient)" />

          {/* Retention Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#decayLineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Current Position Marker (Elapsed Days) */}
          {currentX >= padding.left && currentX <= svgWidth - padding.right && (
            <g>
              <line
                x1={currentX}
                y1={padding.top}
                x2={currentX}
                y2={padding.top + innerHeight}
                stroke="#00f5a0"
                strokeWidth="1.5"
                strokeDasharray="3,2"
              />
              <circle
                cx={currentX}
                cy={currentY}
                r="5"
                fill="#00f5a0"
                className="animate-pulse"
              />
              <circle cx={currentX} cy={currentY} r="2" fill="#021810" />
              <text
                x={currentX}
                y={padding.top - 4}
                textAnchor="middle"
                fontSize="8"
                fill="#00f5a0"
                fontWeight="bold"
              >
                Today ({retentionStats.retentionPct}%)
              </text>
            </g>
          )}

          {/* X-Axis ticks */}
          <text x={padding.left} y={svgHeight - 10} fontSize="8" fill="#55736f" textAnchor="middle">
            0d
          </text>
          <text
            x={getX(maxDays / 2)}
            y={svgHeight - 10}
            fontSize="8"
            fill="#55736f"
            textAnchor="middle"
          >
            {Math.round(maxDays / 2)}d
          </text>
          <text
            x={svgWidth - padding.right}
            y={svgHeight - 10}
            fontSize="8"
            fill="#55736f"
            textAnchor="middle"
          >
            {maxDays}d
          </text>

          {/* Y-Axis ticks */}
          <text x={padding.left - 6} y={getY(100) + 3} fontSize="8" fill="#55736f" textAnchor="end">
            100%
          </text>
          <text x={padding.left - 6} y={thresholdY + 3} fontSize="8" fill="#f59e0b" textAnchor="end">
            70%
          </text>
          <text x={padding.left - 6} y={getY(50) + 3} fontSize="8" fill="#ff5c5c" textAnchor="end">
            50%
          </text>
        </svg>
      </div>

      {/* Footer Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] pt-1">
        <div className="p-2 rounded-lg bg-[#081515] border border-[#132626]">
          <span className="text-[#55736f] block">Memory Stability (S)</span>
          <span className="text-[#e6f4f1] font-bold text-xs">{retentionStats.stabilityScore}d</span>
        </div>
        <div className="p-2 rounded-lg bg-[#081515] border border-[#132626]">
          <span className="text-[#55736f] block">Ease Factor (EF)</span>
          <span className="text-[#00f5a0] font-bold text-xs">{easeFactor.toFixed(2)}</span>
        </div>
        <div className="p-2 rounded-lg bg-[#081515] border border-[#132626]">
          <span className="text-[#55736f] block">Decay Half-Life</span>
          <span className="text-[#38bdf8] font-bold text-xs">{retentionStats.halfLifeDays}d</span>
        </div>
        <div className="p-2 rounded-lg bg-[#081515] border border-[#132626]">
          <span className="text-[#55736f] block">To 50% Threshold</span>
          <span className="text-[#f59e0b] font-bold text-xs">
            {retentionStats.remainingHalfLifeDays > 0
              ? `${retentionStats.remainingHalfLifeDays}d left`
              : 'Crossed'}
          </span>
        </div>
      </div>
    </div>
  );
};
