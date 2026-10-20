import React, { useState, useMemo } from 'react';
import {
  Link2,
  Copy,
  Check,
  QrCode,
  BarChart2,
  Trash2,
  ExternalLink,
  Calendar,
  MousePointerClick,
  Lock,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  FolderTree,
  Tag,
  Search,
  Filter,
  ArrowUpDown,
  Shuffle,
  ShieldAlert,
  Clock,
  Sparkles,
  Target,
} from 'lucide-react';
import type { LinkItem, Folder, Campaign } from '../types.js';
import { getLiveShortUrl } from '../utils/format.js';

interface LinksTableProps {
  links: LinkItem[];
  folders: Folder[];
  campaigns: Campaign[];
  onOpenDetails: (link: LinkItem) => void;
  onOpenQr: (link: LinkItem) => void;
  onOpenTester: (link: LinkItem) => void;
  onTogglePause: (link: LinkItem) => void;
  onDeleteLink: (code: string) => void;
  onRefresh: () => void;
}

export function LinksTable({
  links,
  folders,
  campaigns,
  onOpenDetails,
  onOpenQr,
  onOpenTester,
  onTogglePause,
  onDeleteLink,
  onRefresh,
}: LinksTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'limited' | 'paused'>('all');
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'clicks' | 'expiry'>('newest');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [confirmDeleteCode, setConfirmDeleteCode] = useState<string | null>(null);

  const copyUrl = (shortUrl: string, code: string) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const folderMap = useMemo(() => {
    const map = new Map<string, Folder>();
    folders.forEach((f) => map.set(f.id, f));
    return map;
  }, [folders]);

  const campaignMap = useMemo(() => {
    const map = new Map<string, Campaign>();
    campaigns.forEach((c) => map.set(c.id, c));
    return map;
  }, [campaigns]);

  // Filter and sort links
  const filteredLinks = useMemo(() => {
    let result = [...links];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.code.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          (l.title && l.title.toLowerCase().includes(q)) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Status filter
    const now = Date.now();
    const threeDaysMs = 3 * 86400000;

    if (statusFilter === 'active') {
      result = result.filter((l) => l.status === 'active');
    } else if (statusFilter === 'expiring') {
      result = result.filter(
        (l) =>
          l.expiresAt &&
          new Date(l.expiresAt).getTime() > now &&
          new Date(l.expiresAt).getTime() - now < threeDaysMs
      );
    } else if (statusFilter === 'expired') {
      result = result.filter((l) => l.status === 'expired');
    } else if (statusFilter === 'limited') {
      result = result.filter((l) => l.status === 'limit_reached');
    } else if (statusFilter === 'paused') {
      result = result.filter((l) => l.status === 'paused');
    }

    // Folder filter
    if (folderFilter !== 'all') {
      result = result.filter((l) => l.folderId === folderFilter);
    }

    // Campaign filter
    if (campaignFilter !== 'all') {
      result = result.filter((l) => l.campaignId === campaignFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'clicks') {
        return b.clicks - a.clicks;
      }
      if (sortBy === 'expiry') {
        if (!a.expiresAt) return 1;
        if (!b.expiresAt) return -1;
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [links, search, statusFilter, folderFilter, campaignFilter, sortBy]);

  const getStatusBadge = (l: LinkItem) => {
    if (l.status === 'paused') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase tracking-wider">
          <PauseCircle className="size-3" /> Paused
        </span>
      );
    }
    if (l.status === 'expired') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
          <Clock className="size-3" /> Expired
        </span>
      );
    }
    if (l.status === 'limit_reached') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider">
          <AlertTriangle className="size-3" /> Limit Reached
        </span>
      );
    }

    // Check if expiring soon (< 48h)
    if (l.expiresAt) {
      const msLeft = new Date(l.expiresAt).getTime() - Date.now();
      if (msLeft > 0 && msLeft < 48 * 3600000) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
            <Clock className="size-3" /> Expiring Soon
          </span>
        );
      }
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter Tabs & Sort Controls */}
      <div className="flex flex-col gap-3">
        {/* Top filter row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="size-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code, URL, title or #tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Folder & Campaign Filter Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Folders</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>

            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  🎯 {c.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="newest">Newest First</option>
              <option value="clicks">Highest Clicks</option>
              <option value="expiry">Expiring Soonest</option>
            </select>
          </div>
        </div>

        {/* Status Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Links', count: links.length },
            { id: 'active', label: 'Active', count: links.filter((l) => l.status === 'active').length },
            { id: 'expiring', label: 'Expiring Soon' },
            { id: 'expired', label: 'Expired', count: links.filter((l) => l.status === 'expired').length },
            { id: 'limited', label: 'Limit Reached', count: links.filter((l) => l.status === 'limit_reached').length },
            { id: 'paused', label: 'Paused', count: links.filter((l) => l.status === 'paused').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 rounded-full ${statusFilter === tab.id ? 'bg-slate-950/20 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Links List */}
      {filteredLinks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-[#0e172a]/40">
          <div className="size-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Link2 className="size-6 text-slate-500" />
          </div>
          <h3 className="text-base font-semibold text-white">No links match your filters</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, folder selection, or create a brand new link above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLinks.map((link) => {
            const shortUrl = getLiveShortUrl(link.code, link.shortUrl);
            const folder = link.folderId ? folderMap.get(link.folderId) : undefined;
            const campaign = link.campaignId ? campaignMap.get(link.campaignId) : undefined;
            const isCopied = copiedCode === link.code;

            // Click limit progress calculation
            const clickProgressPct = link.maxClicks
              ? Math.min(Math.round((link.clicks / link.maxClicks) * 100), 100)
              : null;

            return (
              <div
                key={link.id}
                className="group rounded-2xl border border-slate-800/80 bg-[#0f172a]/70 hover:bg-[#131d35] hover:border-cyan-500/30 transition-all p-4 sm:p-5 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Title, Code, Destination, Tags */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Short Link URL */}
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-sm sm:text-base font-bold text-cyan-300 hover:text-cyan-200 transition-colors flex items-center gap-1.5"
                      >
                        /r/{link.code}
                        <ExternalLink className="size-3.5 opacity-60 group-hover:opacity-100" />
                      </a>

                      {/* Status Badge */}
                      {getStatusBadge(link)}

                      {/* Security / Special Badges */}
                      {link.password && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
                          <Lock className="size-3" /> Password Protected
                        </span>
                      )}

                      {link.abTest?.enabled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-semibold">
                          <Shuffle className="size-3" /> A/B Split Test
                        </span>
                      )}

                      {/* Folder chip */}
                      {folder && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
                          <FolderTree className="size-3" /> {folder.name}
                        </span>
                      )}

                      {/* Campaign chip */}
                      {campaign && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[10px] font-semibold">
                          <Target className="size-3" /> {campaign.name}
                        </span>
                      )}
                    </div>

                    {/* Link Title and Destination */}
                    <div>
                      {link.title && link.title !== link.code && (
                        <p className="text-xs sm:text-sm font-semibold text-white mb-0.5">
                          {link.title}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 max-w-xl">
                        <span className="text-slate-500 shrink-0">To:</span>
                        <span className="hover:text-slate-200 truncate">{link.url}</span>
                      </p>
                    </div>

                    {/* Expiry and Click Limit Info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400 pt-1">
                      {/* Expiration date */}
                      {link.expiresAt ? (
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="size-3 text-cyan-400" />
                          Expires: {new Date(link.expiresAt).toLocaleDateString()} {new Date(link.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-slate-500">No expiration</span>
                      )}

                      {/* Click Cap Progress */}
                      {link.maxClicks ? (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-mono">
                            <MousePointerClick className="size-3 text-cyan-400" />
                            {link.clicks} / {link.maxClicks} clicks
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              style={{ width: `${clickProgressPct}%` }}
                              className={`h-full ${
                                clickProgressPct! >= 100
                                  ? 'bg-rose-500'
                                  : clickProgressPct! >= 80
                                  ? 'bg-amber-400'
                                  : 'bg-cyan-400'
                              }`}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="font-mono text-slate-300 font-semibold">
                          {link.clicks} clicks
                        </span>
                      )}

                      {/* Tags */}
                      {link.tags && link.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {link.tags.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 self-end lg:self-center shrink-0">
                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => copyUrl(shortUrl, link.code)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                      title="Copy short URL"
                    >
                      {isCopied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                      <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    {/* QR Code Button */}
                    <button
                      type="button"
                      onClick={() => onOpenQr(link)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                      title="Generate customized QR code"
                    >
                      <QrCode className="size-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">QR</span>
                    </button>

                    {/* Analytics Detail Button */}
                    <button
                      type="button"
                      onClick={() => onOpenDetails(link)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                      title="View visitor analytics & click history"
                    >
                      <BarChart2 className="size-3.5" />
                      <span className="hidden sm:inline">Stats</span>
                    </button>

                    {/* Test Click / Simulator Button */}
                    <button
                      type="button"
                      onClick={() => onOpenTester(link)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                      title="Test live redirect and trigger telemetry"
                    >
                      <PlayCircle className="size-3.5" />
                      <span className="hidden sm:inline">Test</span>
                    </button>

                    {/* Pause / Resume Button */}
                    <button
                      type="button"
                      onClick={() => onTogglePause(link)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                      title={link.status === 'paused' ? 'Resume Link' : 'Pause Link'}
                    >
                      {link.status === 'paused' ? (
                        <PlayCircle className="size-4 text-emerald-400" />
                      ) : (
                        <PauseCircle className="size-4 text-slate-400" />
                      )}
                    </button>

                    {/* Delete Button */}
                    {confirmDeleteCode === link.code ? (
                      <div className="flex items-center gap-1 bg-rose-500/20 p-1 rounded-xl border border-rose-500/40">
                        <button
                          type="button"
                          onClick={() => onDeleteLink(link.code)}
                          className="px-2 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteCode(null)}
                          className="px-1.5 py-1 text-slate-400 hover:text-white text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteCode(link.code)}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-all"
                        title="Delete link"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
