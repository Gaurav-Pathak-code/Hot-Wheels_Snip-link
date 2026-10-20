import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Bot,
  Clock,
  Compass,
  TrendingUp,
  RefreshCw,
  Link2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { AnalyticsSummary } from '../types.js';
import { fetchAnalytics } from '../utils/api.js';
import { ClicksTimelineChart, HourlyActivityChart } from './AnalyticsCharts.js';

export function AnalyticsView() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRef = false) => {
    if (isRef) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetchAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="size-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-400">Loading comprehensive analytics data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-400">
        Could not load analytics. Please try again.
      </div>
    );
  }

  const getDeviceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('mobile')) return <Smartphone className="size-4 text-cyan-400" />;
    if (lower.includes('tablet')) return <Tablet className="size-4 text-purple-400" />;
    if (lower.includes('bot')) return <Bot className="size-4 text-amber-400" />;
    return <Monitor className="size-4 text-sky-400" />;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="size-4" /> Telemetry & Engagement
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Advanced Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Real visitor device detection, browser engines, operating systems, geographic breakdown, and peak engagement hours.
          </p>
        </div>

        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all shadow-sm"
        >
          <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Telemetry'}
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Clicks</p>
          <p className="text-3xl sm:text-4xl font-black font-mono text-cyan-400 mt-2">
            {data.totalClicks.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-2">
            <TrendingUp className="size-3.5" />
            <span>+{data.todayClicks} clicks today</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Links</p>
          <p className="text-3xl sm:text-4xl font-black font-mono text-white mt-2">
            {data.activeLinks}
            <span className="text-slate-500 text-lg font-normal"> / {data.totalLinks}</span>
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
            <CheckCircle2 className="size-3.5 text-emerald-400" />
            <span>{Math.round((data.activeLinks / (data.totalLinks || 1)) * 100)}% online</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">7-Day Momentum</p>
          <p className="text-3xl sm:text-4xl font-black font-mono text-amber-300 mt-2">
            {data.weekClicks.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
            <Calendar className="size-3.5 text-cyan-400" />
            <span>{data.monthClicks.toLocaleString()} past 30 days</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Expired / Capped</p>
          <p className="text-3xl sm:text-4xl font-black font-mono text-rose-400 mt-2">
            {data.expiredLinks + data.limitReachedLinks}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
            <AlertTriangle className="size-3.5 text-rose-400" />
            <span>{data.expiredLinks} expired, {data.limitReachedLinks} capped</span>
          </div>
        </div>
      </div>

      {/* Main Charts: 14-Day Click Trend & 24h Peak Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 14-Day Timeline */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="size-4 text-cyan-400" /> Clicks Over Time (Past 14 Days)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hover over data points to inspect specific daily visitor volumes.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
              Live Stream
            </span>
          </div>
          <ClicksTimelineChart data={data.clicksByDay} />
        </div>

        {/* Hourly Peak Activity */}
        <div className="p-6 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="size-4 text-amber-400" /> Peak Engagement Hours
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Distribution of visitor clicks across 24 hours of the day.
            </p>
          </div>
          <HourlyActivityChart data={data.hourlyTrend} />
          <p className="text-[11px] text-slate-500 text-center">
            Identifies ideal windows to launch your promotional campaigns.
          </p>
        </div>
      </div>

      {/* Breakdown Grids: Devices, Browsers, OS, Geographic, Referrers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Device Breakdown (Feature 2) */}
        <div className="p-6 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Monitor className="size-4 text-cyan-400" /> Visitor Device Type
            </h3>
            <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
              Feature 2
            </span>
          </div>
          <div className="space-y-3">
            {data.devices.map((dev) => (
              <div key={dev.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-300">
                    {getDeviceIcon(dev.name)} {dev.name}
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {dev.count} ({dev.percentage}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    style={{ width: `${dev.percentage}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Systems (Feature 2) */}
        <div className="p-6 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="size-4 text-purple-400" /> Operating Systems
            </h3>
            <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
              Feature 2
            </span>
          </div>
          <div className="space-y-3">
            {data.operatingSystems.map((os) => (
              <div key={os.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{os.name}</span>
                  <span className="font-mono text-purple-400 font-bold">
                    {os.count} ({os.percentage}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    style={{ width: `${os.percentage}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Browser Engines (Feature 2) */}
        <div className="p-6 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="size-4 text-emerald-400" /> Browsers
            </h3>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Feature 2
            </span>
          </div>
          <div className="space-y-3">
            {data.browsers.map((b) => (
              <div key={b.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{b.name}</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {b.count} ({b.percentage}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    style={{ width: `${b.percentage}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Analytics (Feature 2) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="size-4 text-cyan-400" /> Geographic Analytics by Country
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Reliable country detection resolved from incoming visitor network requests.
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
              Feature 2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {data.countries.slice(0, 8).map((c) => (
              <div key={c.code} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">
                      {c.code}
                    </span>
                    {c.name}
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {c.count} ({c.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    style={{ width: `${c.percentage}%` }}
                    className="h-full bg-cyan-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="p-6 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ArrowUpRight className="size-4 text-sky-400" /> Traffic Sources & Referrers
          </h3>
          <div className="space-y-3">
            {data.topReferrers.slice(0, 6).map((ref) => (
              <div key={ref.domain} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300 truncate max-w-[160px]">
                    {ref.domain}
                  </span>
                  <span className="font-mono text-sky-400 font-bold">
                    {ref.count} ({ref.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    style={{ width: `${ref.percentage}%` }}
                    className="h-full bg-sky-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
