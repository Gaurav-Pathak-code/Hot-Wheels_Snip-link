import React, { useState } from 'react';

interface TimelineProps {
  data: { date: string; label: string; clicks: number }[];
}

export function ClicksTimelineChart({ data }: TimelineProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No click telemetry recorded in this range yet.
      </div>
    );
  }

  const maxClicks = Math.max(...data.map((d) => d.clicks), 5);
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartW;
    const y = height - paddingY - (d.clicks / maxClicks) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full relative">
      {/* Tooltip */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <div
          className="absolute z-10 pointer-events-none -top-2 transform -translate-x-1/2 bg-slate-900/95 border border-cyan-500/40 text-white text-xs py-1.5 px-3 rounded-xl shadow-xl transition-all"
          style={{ left: `${(points[hoveredIdx].x / width) * 100}%` }}
        >
          <p className="font-semibold text-cyan-400">{points[hoveredIdx].label}</p>
          <p className="font-mono text-slate-200">{points[hoveredIdx].clicks} clicks</p>
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 sm:h-64 overflow-visible">
        <defs>
          <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = height - paddingY - pct * chartH;
          const val = Math.round(pct * maxClicks);
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text x={paddingX - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-500 font-mono">
                {val}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaD} fill="url(#cyanGradient)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="url(#strokeGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points & Hover targets */}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === i ? 6 : 3.5}
              className={`transition-all duration-150 ${
                hoveredIdx === i ? 'fill-cyan-300 stroke-slate-900 stroke-2' : 'fill-cyan-400 stroke-[#080d1a] stroke-2'
              }`}
            />
            {/* Invisible large target for touch/hover */}
            <rect x={p.x - 15} y={0} width={30} height={height} fill="transparent" />
          </g>
        ))}

        {/* X Axis labels */}
        {points.filter((_, i) => i % 2 === 0 || i === points.length - 1).map((p, i) => (
          <text key={i} x={p.x} y={height - 8} textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

interface HourlyProps {
  data: { hour: number; label: string; clicks: number }[];
}

export function HourlyActivityChart({ data }: HourlyProps) {
  const maxClicks = Math.max(...data.map((d) => d.clicks), 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-1 sm:gap-1.5 h-36 pt-4 pb-2">
        {data.map((d) => {
          const heightPct = Math.max((d.clicks / maxClicks) * 100, 4);
          const isPeak = d.clicks === maxClicks && maxClicks > 0;
          return (
            <div key={d.hour} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip */}
              <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-white text-[10px] py-1 px-1.5 rounded pointer-events-none whitespace-nowrap z-20">
                {d.label}: {d.clicks} clicks
              </div>
              <div
                style={{ height: `${heightPct}%` }}
                className={`w-full rounded-t transition-all duration-300 ${
                  isPeak ? 'bg-cyan-400 shadow-lg shadow-cyan-500/30' : 'bg-slate-700 hover:bg-cyan-500/70'
                }`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-800">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  );
}
