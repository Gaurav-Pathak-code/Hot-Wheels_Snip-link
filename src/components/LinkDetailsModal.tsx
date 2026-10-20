import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  MousePointerClick,
  Lock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  PlayCircle,
  Save,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import type { LinkItem, ClickEvent } from '../types.js';
import { fetchLinkDetails, updateLink, triggerTestClick } from '../utils/api.js';
import { getLiveShortUrl } from '../utils/format.js';

interface LinkDetailsModalProps {
  link: LinkItem;
  onClose: () => void;
  onUpdated: (link: LinkItem) => void;
}

export function LinkDetailsModal({ link, onClose, onUpdated }: LinkDetailsModalProps) {
  const [data, setData] = useState<{ link: LinkItem; clicks: ClickEvent[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'edit'>('analytics');

  // Edit form state
  const [editTitle, setEditTitle] = useState(link.title || '');
  const [editUrl, setEditUrl] = useState(link.url || '');
  const [editExpiresAt, setEditExpiresAt] = useState(
    link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : ''
  );
  const [editMaxClicks, setEditMaxClicks] = useState<number | ''>(link.maxClicks ?? '');
  const [editPassword, setEditPassword] = useState(link.password || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quick test click trigger
  const [testingClick, setTestingClick] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchLinkDetails(link.code);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [link.code]);

  const copyUrl = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await updateLink(link.code, {
        title: editTitle,
        url: editUrl,
        expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
        maxClicks: editMaxClicks ? Number(editMaxClicks) : null,
        password: editPassword.trim() || null,
      });
      onUpdated(updated);
      setData((prev) => (prev ? { ...prev, link: updated } : null));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleTestClick = async () => {
    setTestingClick(true);
    try {
      await triggerTestClick(link.code, {
        deviceType: 'mobile',
        browser: 'Safari',
        os: 'iOS',
        country: 'US',
        referrer: 'https://twitter.com/linkpulse',
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to test click');
    } finally {
      setTestingClick(false);
    }
  };

  const currentLink = data?.link || link;
  const clicks = data?.clicks || [];

  // Group metrics
  const devices = clicks.reduce((acc, c) => {
    acc[c.deviceType] = (acc[c.deviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const browsers = clicks.reduce((acc, c) => {
    acc[c.browser] = (acc[c.browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countries = clicks.reduce((acc, c) => {
    const key = `${c.countryCode || 'US'}|${c.country || 'Unknown'}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const shortUrl = getLiveShortUrl(currentLink.code, currentLink.shortUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#0e172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-mono">/r/{currentLink.code}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {currentLink.status}
              </span>
              {currentLink.password && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Lock className="size-3" /> Password
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate max-w-lg mt-1">
              Destination: <span className="text-slate-300">{currentLink.url}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyUrl(shortUrl)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="size-4" />
              <span className="hidden sm:inline">Open</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'analytics'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Visitor Analytics & Telemetry ({clicks.length} logs)
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'edit'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Edit Expiry, Limits & Security
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'analytics' ? (
            <>
              {/* Stat Counters Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Total Clicks
                  </span>
                  <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                    {currentLink.clicks}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Click Limit Cap
                  </span>
                  <p className="text-xl font-bold font-mono text-white mt-1">
                    {currentLink.maxClicks ? `${currentLink.clicks}/${currentLink.maxClicks}` : 'Unlimited'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Expiry Status
                  </span>
                  <p className="text-xs font-semibold text-white mt-2 truncate">
                    {currentLink.expiresAt
                      ? new Date(currentLink.expiresAt).toLocaleDateString()
                      : 'Never Expires'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Last Visit
                  </span>
                  <p className="text-xs font-semibold text-white mt-2 truncate">
                    {currentLink.lastVisitedAt
                      ? new Date(currentLink.lastVisitedAt).toLocaleTimeString()
                      : 'No visits yet'}
                  </p>
                </div>
              </div>

              {/* Quick Simulator Test Action inside modal */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Activity className="size-4" /> Live Redirect & Expiry Testing
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click to register a real click event with mobile user-agent to test rules and limits.
                  </p>
                </div>
                <button
                  onClick={handleTestClick}
                  disabled={testingClick}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  <PlayCircle className="size-3.5" />
                  {testingClick ? 'Registering...' : 'Simulate Visit Now'}
                </button>
              </div>

              {/* Devices & Locations Breakdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Device Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Monitor className="size-3.5 text-cyan-400" /> Device Distribution
                  </h4>
                  {Object.keys(devices).length === 0 ? (
                    <p className="text-xs text-slate-500">No clicks yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(devices).map(([dev, count]) => {
                        const pct = Math.round((count / (clicks.length || 1)) * 100);
                        return (
                          <div key={dev} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="capitalize text-slate-300">{dev}</span>
                              <span className="font-mono text-cyan-400">{count} ({pct}%)</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div style={{ width: `${pct}%` }} className="h-full bg-cyan-400 rounded-full" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Country Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Globe className="size-3.5 text-cyan-400" /> Geographic Visitors
                  </h4>
                  {Object.keys(countries).length === 0 ? (
                    <p className="text-xs text-slate-500">No location data yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(countries).slice(0, 4).map(([key, count]) => {
                        const [code, name] = key.split('|');
                        const pct = Math.round((count / (clicks.length || 1)) * 100);
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-300">{name} ({code})</span>
                              <span className="font-mono text-cyan-400">{count} ({pct}%)</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div style={{ width: `${pct}%` }} className="h-full bg-cyan-400 rounded-full" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Click Log Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Clock className="size-3.5 text-cyan-400" /> Recent Click Stream
                </h4>
                {clicks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    No clicks recorded for this short link yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-4 py-2.5">Timestamp</th>
                          <th className="px-4 py-2.5">Device & OS</th>
                          <th className="px-4 py-2.5">Browser</th>
                          <th className="px-4 py-2.5">Location</th>
                          <th className="px-4 py-2.5">Referrer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                        {clicks.slice(0, 15).map((c) => (
                          <tr key={c.id} className="hover:bg-slate-800/40 text-slate-300">
                            <td className="px-4 py-2 font-mono whitespace-nowrap">
                              {new Date(c.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 capitalize">
                              {c.deviceType} • {c.os}
                            </td>
                            <td className="px-4 py-2">{c.browser}</td>
                            <td className="px-4 py-2">
                              {c.city}, {c.country}
                            </td>
                            <td className="px-4 py-2 text-slate-400 truncate max-w-[150px]">
                              {c.referrerDomain}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Edit Form */
            <form onSubmit={handleSave} className="space-y-5 max-w-xl">
              {saveSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="size-4" />
                  Link settings updated successfully!
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Link Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Target Destination URL
                </label>
                <input
                  type="text"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-cyan-400" /> Expiry Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editExpiresAt}
                    onChange={(e) => setEditExpiresAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Leave empty to never expire.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <MousePointerClick className="size-3.5 text-cyan-400" /> Click Limit Cap
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={editMaxClicks}
                    onChange={(e) => setEditMaxClicks(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Leave empty for unlimited clicks.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="size-3.5 text-amber-400" /> Secret Passcode
                </label>
                <input
                  type="text"
                  placeholder="Set secret passcode (leave blank to disable)"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20"
              >
                <Save className="size-3.5" />
                {saving ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
