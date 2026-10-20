import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Link2,
  Sparkles,
  Calendar,
  MousePointerClick,
  FolderTree,
  Tag,
  Target,
  Lock,
  Compass,
  Shuffle,
  FileText,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  QrCode,
  ShieldAlert,
  Activity,
  Plus,
  X,
} from 'lucide-react';
import type { LinkItem, Folder, Campaign } from '../types.js';
import { createShortLink, checkLinkHealth } from '../utils/api.js';
import { getLiveShortUrl } from '../utils/format.js';

interface ShortenerCardProps {
  folders: Folder[];
  campaigns: Campaign[];
  onLinkCreated: (link: LinkItem) => void;
  onOpenQr: (link: LinkItem) => void;
  onOpenTester: (link: LinkItem) => void;
}

export function ShortenerCard({
  folders,
  campaigns,
  onLinkCreated,
  onOpenQr,
  onOpenTester,
}: ShortenerCardProps) {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [title, setTitle] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Expiry & Limits
  const [enableExpiry, setEnableExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [enableMaxClicks, setEnableMaxClicks] = useState(false);
  const [maxClicks, setMaxClicks] = useState<number | ''>(50);

  // Organization
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Password & Notes
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');

  // UTM Builder
  const [enableUtm, setEnableUtm] = useState(false);
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmContent, setUtmContent] = useState('');

  // A/B Testing
  const [enableAb, setEnableAb] = useState(false);
  const [abVariantUrl, setAbVariantUrl] = useState('');

  // Status & Created Link
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<LinkItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Health ping
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthResult, setHealthResult] = useState<{ healthy: boolean; statusCode?: number; title?: string } | null>(null);

  // Quick preset helpers
  const setExpiryInHours = (hours: number) => {
    const d = new Date(Date.now() + hours * 3600000);
    // Format to YYYY-MM-DDTHH:mm
    const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setExpiryDate(localIso);
    setEnableExpiry(true);
  };

  const applyUtmPreset = (preset: 'twitter' | 'linkedin' | 'newsletter' | 'google') => {
    setEnableUtm(true);
    if (preset === 'twitter') {
      setUtmSource('x.com');
      setUtmMedium('social');
      setUtmCampaign('organic_post');
    } else if (preset === 'linkedin') {
      setUtmSource('linkedin.com');
      setUtmMedium('social');
      setUtmCampaign('thought_leadership');
    } else if (preset === 'newsletter') {
      setUtmSource('newsletter');
      setUtmMedium('email');
      setUtmCampaign('weekly_dispatch');
    } else if (preset === 'google') {
      setUtmSource('google');
      setUtmMedium('cpc');
      setUtmCampaign('search_ads');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const runHealthCheck = async () => {
    if (!url.trim()) return;
    setHealthLoading(true);
    setHealthResult(null);
    try {
      const res = await checkLinkHealth(url);
      setHealthResult(res);
      if (res.title && !title) {
        setTitle(res.title);
      }
    } catch {
      setHealthResult({ healthy: false });
    } finally {
      setHealthLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a destination URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setCreatedLink(null);

    try {
      let utmParams: any = undefined;
      if (enableUtm && (utmSource || utmMedium || utmCampaign)) {
        utmParams = {
          source: utmSource || undefined,
          medium: utmMedium || undefined,
          campaign: utmCampaign || undefined,
          content: utmContent || undefined,
        };
      }

      let abTest: any = undefined;
      if (enableAb && abVariantUrl.trim()) {
        abTest = {
          enabled: true,
          variants: [
            { id: 'v1', url: url.trim(), weight: 50, clicks: 0 },
            { id: 'v2', url: abVariantUrl.trim(), weight: 50, clicks: 0 },
          ],
        };
      }

      const newLink = await createShortLink({
        url: url.trim(),
        slug: customSlug.trim() || undefined,
        title: title.trim() || undefined,
        expiresAt: enableExpiry && expiryDate ? new Date(expiryDate).toISOString() : null,
        maxClicks: enableMaxClicks && maxClicks ? Number(maxClicks) : null,
        folderId: selectedFolder || null,
        campaignId: selectedCampaign || null,
        tags,
        password: enablePassword && password.trim() ? password.trim() : null,
        utmParams,
        abTest,
        notes: notes.trim() || undefined,
      });

      setCreatedLink(newLink);
      onLinkCreated(newLink);

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#06b6d4', '#10b981', '#f59e0b'],
      });

      // Reset main inputs
      setUrl('');
      setCustomSlug('');
      setTitle('');
      setHealthResult(null);
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to create short link');
    } finally {
      setLoading(false);
    }
  };

  const copyShortUrl = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Shortener Card Box */}
      <div className="rounded-3xl border border-slate-800 bg-[#0e172a]/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Shorten a new link</span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
                Real Routing
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure expiration dates, click maximums, folders, tags, password gates, and UTM tags.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all"
          >
            {showAdvanced ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            {showAdvanced ? 'Hide Advanced Settings' : 'Advanced Controls'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-5">
          {/* Main URL Bar */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Destination URL <span className="text-cyan-400">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="https://example.com/my-launch-page-or-promo"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Health Ping Button */}
              <button
                type="button"
                onClick={runHealthCheck}
                disabled={healthLoading || !url.trim()}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 transition-all whitespace-nowrap"
                title="Verify destination server reachable"
              >
                <Activity className={`size-3.5 ${healthLoading ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
                {healthLoading ? 'Pinging...' : 'Verify URL'}
              </button>
            </div>

            {/* Health ping result badge */}
            {healthResult && (
              <div className="mt-2.5 flex items-center gap-2 text-xs">
                {healthResult.healthy ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                    <span className="size-1.5 rounded-full bg-emerald-400"></span>
                    Verified {healthResult.statusCode} OK — {healthResult.title || 'Reachable'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                    <AlertCircle className="size-3 text-amber-400" />
                    Destination warning: {healthResult.statusCode ? `Status ${healthResult.statusCode}` : 'Unreachable'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Slug & Title Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Custom Short Slug (Optional)
              </label>
              <div className="flex items-center rounded-2xl bg-slate-900/90 border border-slate-700/80 px-3.5 py-3 text-sm focus-within:border-cyan-500 transition-colors">
                <span className="text-slate-500 text-xs font-mono mr-1">/r/</span>
                <input
                  type="text"
                  placeholder="custom-alias"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase())}
                  className="bg-transparent text-white placeholder-slate-500 text-sm w-full focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Link Title / Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Q4 Marketing Campaign"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* ADVANCED SECTION ACCORDION */}
          {showAdvanced && (
            <div className="pt-4 border-t border-slate-800 space-y-6 animate-fadeIn">
              {/* Expiry & Click Limits (Feature 1) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <Calendar className="size-4" /> Link Expiry & Click Limits (Feature 1)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Expiry Date/Time */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableExpiry}
                        onChange={(e) => setEnableExpiry(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500 size-4"
                      />
                      <span>Set Expiration Date & Time</span>
                    </label>

                    {enableExpiry && (
                      <div className="space-y-2 pl-6">
                        <input
                          type="datetime-local"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => setExpiryInHours(24)}
                            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-400 font-medium"
                          >
                            +24 Hours
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpiryInHours(24 * 7)}
                            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-400 font-medium"
                          >
                            +7 Days
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpiryInHours(24 * 30)}
                            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-400 font-medium"
                          >
                            +30 Days
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Max Clicks Limit */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableMaxClicks}
                        onChange={(e) => setEnableMaxClicks(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500 size-4"
                      />
                      <span>Set Maximum Number of Clicks</span>
                    </label>

                    {enableMaxClicks && (
                      <div className="space-y-2 pl-6">
                        <input
                          type="number"
                          min="1"
                          max="100000"
                          placeholder="e.g. 50"
                          value={maxClicks}
                          onChange={(e) => setMaxClicks(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                        />
                        <p className="text-[11px] text-slate-500">
                          Automatically locks after reaching this click quota.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Workspaces & Link Organization (Feature 3) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <FolderTree className="size-4" /> Workspaces & Link Organization (Feature 3)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Folder Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Assign to Folder
                    </label>
                    <select
                      value={selectedFolder}
                      onChange={(e) => setSelectedFolder(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="">No folder (General)</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          📁 {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Campaign Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Assign to Campaign
                    </label>
                    <select
                      value={selectedCampaign}
                      onChange={(e) => setSelectedCampaign(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="">No campaign</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          🎯 {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags manager */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tags (Press Enter to add)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700 min-h-[42px]">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-rose-400"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder={tags.length === 0 ? "Type tag name and hit Enter (e.g. promo, twitter)..." : "Add another tag..."}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="flex-1 bg-transparent text-white placeholder-slate-500 text-xs focus:outline-none min-w-[140px]"
                    />
                  </div>
                </div>
              </div>

              {/* Password Protection & UTM Builder (New Features) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password Protection */}
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enablePassword}
                      onChange={(e) => setEnablePassword(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-cyan-500 size-4"
                    />
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Lock className="size-3.5" /> Password Protection Gate
                    </span>
                  </label>
                  {enablePassword && (
                    <input
                      type="text"
                      placeholder="Enter secret passcode..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                    />
                  )}
                  <p className="text-[11px] text-slate-500">
                    Visitors must enter this code before redirecting.
                  </p>
                </div>

                {/* A/B Testing */}
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableAb}
                      onChange={(e) => setEnableAb(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-cyan-500 size-4"
                    />
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Shuffle className="size-3.5" /> A/B Split URL Testing
                    </span>
                  </label>
                  {enableAb && (
                    <input
                      type="text"
                      placeholder="Variant B URL: https://..."
                      value={abVariantUrl}
                      onChange={(e) => setAbVariantUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  )}
                  <p className="text-[11px] text-slate-500">
                    Evenly splits 50% traffic to Variant A and 50% to Variant B.
                  </p>
                </div>
              </div>

              {/* UTM Builder */}
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableUtm}
                      onChange={(e) => setEnableUtm(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-cyan-500 size-4"
                    />
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Compass className="size-3.5" /> UTM Parameter Builder
                    </span>
                  </label>
                  {enableUtm && (
                    <div className="flex gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => applyUtmPreset('twitter')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        Twitter/X
                      </button>
                      <button
                        type="button"
                        onClick={() => applyUtmPreset('linkedin')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        LinkedIn
                      </button>
                      <button
                        type="button"
                        onClick={() => applyUtmPreset('newsletter')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        Newsletter
                      </button>
                    </div>
                  )}
                </div>

                {enableUtm && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="utm_source (e.g. newsletter)"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="utm_medium (e.g. email)"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="utm_campaign (e.g. summer_sale)"
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            >
              {loading ? (
                <>
                  <div className="size-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Shortening URL...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  <span>Create Short Link</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Successfully Created Highlight Card */}
      {createdLink && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-slate-900/90 border border-cyan-500/40 backdrop-blur-xl shadow-2xl animate-slideUp">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Link Created Successfully
                </span>
                {createdLink.password && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold flex items-center gap-1">
                    <Lock className="size-3" /> Password Protected
                  </span>
                )}
                {createdLink.expiresAt && (
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-semibold flex items-center gap-1">
                    <Calendar className="size-3" /> Expiring {new Date(createdLink.expiresAt).toLocaleDateString()}
                  </span>
                )}
                {createdLink.maxClicks && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-semibold flex items-center gap-1">
                    <MousePointerClick className="size-3" /> Max {createdLink.maxClicks} clicks
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={getLiveShortUrl(createdLink.code, createdLink.shortUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-lg sm:text-xl font-mono font-bold text-cyan-300 hover:text-cyan-200 underline underline-offset-4 flex items-center gap-1.5 break-all"
                >
                  {getLiveShortUrl(createdLink.code, createdLink.shortUrl)}
                  <ExternalLink className="size-4 shrink-0 opacity-70" />
                </a>
              </div>

              <p className="text-xs text-slate-400 truncate">
                Redirects to: <span className="text-slate-300">{createdLink.url}</span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
              <button
                type="button"
                onClick={() => copyShortUrl(getLiveShortUrl(createdLink.code, createdLink.shortUrl))}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>

              <button
                type="button"
                onClick={() => onOpenQr(createdLink)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all"
              >
                <QrCode className="size-3.5 text-cyan-400" />
                QR Code
              </button>

              <button
                type="button"
                onClick={() => onOpenTester(createdLink)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-amber-300 transition-all"
              >
                <Activity className="size-3.5" />
                Test Redirect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
