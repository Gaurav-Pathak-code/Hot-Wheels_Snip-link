import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  MousePointerClick,
  TrendingUp,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  Flag,
} from 'lucide-react';
import type { Campaign, LinkItem } from '../types.js';
import { createCampaign, deleteCampaign } from '../utils/api.js';

interface CampaignsViewProps {
  campaigns: Campaign[];
  links: LinkItem[];
  onRefresh: () => void;
  onSelectCampaignToFilter: (campaignId: string) => void;
}

export function CampaignsView({
  campaigns,
  links,
  onRefresh,
  onSelectCampaignToFilter,
}: CampaignsViewProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [targetClicks, setTargetClicks] = useState<number | ''>(500);
  const [color, setColor] = useState('#06b6d4');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createCampaign({
        name: name.trim(),
        description: description.trim(),
        utmCampaign: utmCampaign.trim() || name.trim().toLowerCase().replace(/\s+/g, '_'),
        targetClicks: targetClicks ? Number(targetClicks) : undefined,
        color,
      });
      setName('');
      setDescription('');
      setUtmCampaign('');
      setShowCreate(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, campName: string) => {
    if (!window.confirm(`Delete campaign "${campName}"? Associated links will remain active.`)) return;
    try {
      await deleteCampaign(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete campaign');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Target className="size-4" /> Strategic Tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Marketing Campaigns & Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Bundle multiple links under a unified promotional initiative, track overall click milestones, and unify UTM tags.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
        >
          <Plus className="size-4" />
          {showCreate ? 'Close Form' : 'New Campaign'}
        </button>
      </div>

      {/* Create Campaign Form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="p-6 sm:p-7 rounded-3xl bg-[#0e172a]/90 border border-cyan-500/30 shadow-2xl space-y-4 max-w-2xl"
        >
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="size-4 text-cyan-400" /> Create Marketing Campaign
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Campaign Name <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Black Friday 2026, Series A"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!utmCampaign) {
                    setUtmCampaign(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Target Click Goal
              </label>
              <input
                type="number"
                min="10"
                placeholder="e.g. 500"
                value={targetClicks}
                onChange={(e) => setTargetClicks(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                utm_campaign parameter
              </label>
              <input
                type="text"
                placeholder="auto-generated tag..."
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Description / Memo
              </label>
              <input
                type="text"
                placeholder="Target audience or channels..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Launch Campaign'}
            </button>
          </div>
        </form>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((camp) => {
          const campLinks = links.filter((l) => l.campaignId === camp.id);
          const totalClicks = campLinks.reduce((acc, l) => acc + l.clicks, 0);
          const target = camp.targetClicks || 500;
          const progressPct = Math.min(Math.round((totalClicks / target) * 100), 100);

          return (
            <div
              key={camp.id}
              className="p-6 sm:p-7 rounded-3xl bg-[#0e172a]/80 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xl space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Target className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{camp.name}</h3>
                      <span className="text-[10px] font-mono text-cyan-400">
                        utm_campaign={camp.utmCampaign}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(camp.id, camp.name)}
                    className="p-2 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 transition-all"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {camp.description && (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {camp.description}
                  </p>
                )}

                {/* Progress bar towards goal */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Flag className="size-3.5 text-cyan-400" /> Progress towards {target} clicks
                    </span>
                    <span className="font-mono font-bold text-cyan-300">
                      {totalClicks} / {target} ({progressPct}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      style={{ width: `${progressPct}%` }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Bundle stats */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Linked URLs</span>
                    <p className="text-base font-bold font-mono text-white mt-0.5">{campLinks.length} short links</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Total Engagement</span>
                    <p className="text-base font-bold font-mono text-cyan-400 mt-0.5">{totalClicks} clicks</p>
                  </div>
                </div>
              </div>

              {/* View linked URLs button */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSelectCampaignToFilter(camp.id)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                >
                  <span>Filter links by this campaign</span>
                  <ExternalLink className="size-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
