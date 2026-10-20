import React, { useState } from 'react';
import {
  X,
  PlayCircle,
  ExternalLink,
  Smartphone,
  Monitor,
  Globe,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { LinkItem } from '../types.js';
import { triggerTestClick } from '../utils/api.js';
import { getLiveShortUrl } from '../utils/format.js';

interface LinkTesterModalProps {
  link?: LinkItem | null;
  links: LinkItem[];
  onClose: () => void;
  onRefresh: () => void;
}

export function LinkTesterModal({
  link: initialLink,
  links,
  onClose,
  onRefresh,
}: LinkTesterModalProps) {
  const [selectedCode, setSelectedCode] = useState(
    initialLink ? initialLink.code : links[0]?.code || ''
  );
  const [device, setDevice] = useState<'mobile' | 'desktop' | 'tablet'>('mobile');
  const [browser, setBrowser] = useState('Safari');
  const [os, setOs] = useState('iOS');
  const [country, setCountry] = useState('US');
  const [referrer, setReferrer] = useState('https://twitter.com/linkpulse');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const selectedLink = links.find((l) => l.code === selectedCode) || initialLink;
  const shortUrl = selectedLink
    ? getLiveShortUrl(selectedLink.code, selectedLink.shortUrl)
    : '';

  const handleDeviceChange = (dev: 'mobile' | 'desktop' | 'tablet') => {
    setDevice(dev);
    if (dev === 'mobile') {
      setBrowser('Safari');
      setOs('iOS');
    } else if (dev === 'desktop') {
      setBrowser('Chrome');
      setOs('macOS');
    } else {
      setBrowser('Safari');
      setOs('iOS (iPad)');
    }
  };

  const handleTriggerRealClick = async () => {
    if (!selectedCode) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await triggerTestClick(selectedCode, {
        deviceType: device,
        browser,
        os,
        country,
        referrer,
      });
      setResult(res);
      onRefresh();
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0e172a] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <PlayCircle className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Redirect & Rule Tester</h2>
              <p className="text-xs text-slate-400">
                Trigger real visitor telemetry to test expiry locks, click quotas, and routing logic.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Link Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Select Link to Test
            </label>
            <select
              value={selectedCode}
              onChange={(e) => {
                setSelectedCode(e.target.value);
                setResult(null);
              }}
              className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
            >
              {links.map((l) => (
                <option key={l.id} value={l.code}>
                  /{l.code} — ({l.status}) {l.title || l.url}
                </option>
              ))}
            </select>
          </div>

          {selectedLink && (
            /* Current Link Status Snapshot */
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-cyan-400">
                  /r/{selectedLink.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {selectedLink.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Target: <span className="text-slate-300">{selectedLink.url}</span>
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 pt-1">
                <span>Clicks: {selectedLink.clicks} {selectedLink.maxClicks ? `/ ${selectedLink.maxClicks}` : ''}</span>
                {selectedLink.expiresAt && (
                  <span>Expires: {new Date(selectedLink.expiresAt).toLocaleDateString()}</span>
                )}
                {selectedLink.password && (
                  <span className="text-amber-400">Locked: Passcode required</span>
                )}
              </div>
            </div>
          )}

          {/* Device & Profile Selector */}
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Simulated Visitor Profile
            </label>

            {/* Device Switcher */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'mobile', label: 'Mobile (iPhone)', icon: Smartphone },
                { id: 'desktop', label: 'Desktop (Mac/PC)', icon: Monitor },
                { id: 'tablet', label: 'Tablet (iPad)', icon: Monitor },
              ].map((item) => {
                const Icon = item.icon;
                const active = device === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleDeviceChange(item.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      active
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Geo & Referrer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Visitor Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                >
                  <option value="US">🇺🇸 United States</option>
                  <option value="GB">🇬🇧 United Kingdom</option>
                  <option value="DE">🇩🇪 Germany</option>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="IN">🇮🇳 India</option>
                  <option value="JP">🇯🇵 Japan</option>
                  <option value="FR">🇫🇷 France</option>
                  <option value="AU">🇦🇺 Australia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Referrer Source
                </label>
                <select
                  value={referrer}
                  onChange={(e) => setReferrer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                >
                  <option value="https://twitter.com/linkpulse">Twitter / X</option>
                  <option value="https://linkedin.com/feed">LinkedIn</option>
                  <option value="https://youtube.com/watch?v=demo">YouTube</option>
                  <option value="https://google.com/search">Google Search</option>
                  <option value="">Direct / Bookmark (No Referrer)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleTriggerRealClick}
              disabled={loading || !selectedCode}
              className="flex-1 py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <Zap className="size-4" />
              {loading ? 'Recording Click...' : 'Trigger Real Click Telemetry'}
            </button>

            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-5 rounded-2xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all text-center"
            >
              <ExternalLink className="size-4 text-cyan-400" />
              Open Live in New Tab
            </a>
          </div>

          {/* Output feedback */}
          {result && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <span className="text-slate-400 uppercase font-sans font-bold text-[10px]">
                Server Response:
              </span>
              {result.error ? (
                <p className="text-rose-400">{result.error}</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-emerald-400">
                    ✓ Click registered! Status: <span className="font-bold">{result.result?.status}</span>
                  </p>
                  <p className="text-slate-300">
                    Destination: <span className="text-cyan-400">{result.result?.targetUrl}</span>
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Current total clicks: {result.result?.link?.clicks}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
