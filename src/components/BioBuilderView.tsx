import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Palette,
  Sparkles,
  Share2,
  Save,
  Eye,
  MousePointerClick,
  Globe,
  Twitter,
  Github,
  Linkedin,
} from 'lucide-react';
import type { BioPage, BioLinkItem } from '../types.js';
import { fetchBioPages, saveBioPage } from '../utils/api.js';

export function BioBuilderView() {
  const [bioPages, setBioPages] = useState<BioPage[]>([]);
  const [selectedBio, setSelectedBio] = useState<BioPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New link draft in editor
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchBioPages();
      setBioPages(res);
      if (res.length > 0 && !selectedBio) {
        setSelectedBio(res[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddLink = () => {
    if (!newTitle.trim() || !newUrl.trim() || !selectedBio) return;
    const newItem: BioLinkItem = {
      id: `bl-${Date.now()}`,
      title: newTitle.trim(),
      url: newUrl.trim(),
      subtitle: newSubtitle.trim() || undefined,
      clicks: 0,
    };
    setSelectedBio({
      ...selectedBio,
      links: [...selectedBio.links, newItem],
    });
    setNewTitle('');
    setNewUrl('');
    setNewSubtitle('');
  };

  const handleRemoveLink = (id: string) => {
    if (!selectedBio) return;
    setSelectedBio({
      ...selectedBio,
      links: selectedBio.links.filter((l) => l.id !== id),
    });
  };

  const handleSave = async () => {
    if (!selectedBio) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const saved = await saveBioPage(selectedBio);
      setSelectedBio(saved);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to save bio page');
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { id: 'slate', name: 'Midnight Slate', bg: 'bg-[#0f172a]', card: 'bg-slate-800/90 text-white border-slate-700' },
    { id: 'neon', name: 'Cyberpunk Neon', bg: 'bg-[#090d16]', card: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40' },
    { id: 'emerald', name: 'Emerald Forest', bg: 'bg-[#042f2e]', card: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40' },
    { id: 'sunset', name: 'Sunset Glow', bg: 'bg-[#451a03]', card: 'bg-amber-900/60 text-amber-200 border-amber-500/40' },
    { id: 'violet', name: 'Electric Violet', bg: 'bg-[#2e1065]', card: 'bg-purple-900/60 text-purple-200 border-purple-500/40' },
  ];

  if (loading && bioPages.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="size-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Loading Bio Link Builder...</p>
      </div>
    );
  }

  const currentTheme = themes.find((t) => t.id === selectedBio?.theme) || themes[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Smartphone className="size-4" /> Micro Landing Page
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Bio Link Page Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Create an all-in-one mobile landing page for your social profiles with clickable links, themes, and click analytics.
          </p>
        </div>

        {selectedBio && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              <Save className="size-4" />
              {saving ? 'Saving...' : 'Save Bio Page'}
            </button>
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="size-4" />
          Bio Page successfully published and live!
        </div>
      )}

      {selectedBio && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Editor Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Profile Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={selectedBio.title}
                    onChange={(e) => setSelectedBio({ ...selectedBio, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Handle / Slug (/bio/...)
                  </label>
                  <input
                    type="text"
                    value={selectedBio.slug}
                    onChange={(e) => setSelectedBio({ ...selectedBio, slug: e.target.value.toLowerCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Bio / Tagline
                </label>
                <textarea
                  rows={2}
                  value={selectedBio.bio}
                  onChange={(e) => setSelectedBio({ ...selectedBio, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Theme Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Palette className="size-3.5 text-cyan-400" /> Color Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {themes.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setSelectedBio({ ...selectedBio, theme: th.id as any })}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        selectedBio.theme === th.id
                          ? 'border-cyan-400 bg-cyan-500/15 text-white'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {th.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Links Stack Editor */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Featured Link Buttons ({selectedBio.links.length})
              </h3>

              {/* Add New Link Card */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-300">Add New Button</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Button Title (e.g. 🚀 My Portfolio)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Destination URL (https://...)"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Subtitle or description (optional)"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    disabled={!newTitle.trim() || !newUrl.trim()}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-40"
                  >
                    <Plus className="size-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Current Links List */}
              <div className="space-y-2 pt-2">
                {selectedBio.links.map((link) => (
                  <div
                    key={link.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate">{link.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{link.url}</p>
                      {link.subtitle && (
                        <p className="text-[10px] text-cyan-400 mt-0.5">{link.subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 text-[11px]">
                        {link.clicks} clicks
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(link.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Mobile Phone Mockup Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-20 flex flex-col items-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye className="size-4 text-cyan-400" /> Live Interactive Phone Preview
              </span>

              {/* Phone Frame */}
              <div
                className={`w-[320px] h-[580px] rounded-[42px] border-4 border-slate-800 p-4 shadow-2xl relative overflow-hidden flex flex-col ${currentTheme.bg}`}
              >
                {/* Speaker pill notch */}
                <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-4 shrink-0"></div>

                {/* Profile Avatar & Title */}
                <div className="text-center space-y-2 shrink-0">
                  <div className="size-16 rounded-full mx-auto border-2 border-cyan-400 p-0.5 shadow-lg overflow-hidden bg-slate-800">
                    <img
                      src={selectedBio.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80'}
                      alt="Avatar"
                      className="size-full object-cover rounded-full"
                    />
                  </div>
                  <h4 className="text-base font-bold text-white">{selectedBio.title}</h4>
                  <p className="text-xs text-slate-400 px-4 leading-snug">{selectedBio.bio}</p>
                </div>

                {/* Social icons */}
                <div className="flex justify-center gap-3 py-3 text-slate-400">
                  <span className="size-7 rounded-full bg-slate-800/80 flex items-center justify-center">
                    <Twitter className="size-3.5 text-cyan-400" />
                  </span>
                  <span className="size-7 rounded-full bg-slate-800/80 flex items-center justify-center">
                    <Github className="size-3.5 text-white" />
                  </span>
                  <span className="size-7 rounded-full bg-slate-800/80 flex items-center justify-center">
                    <Linkedin className="size-3.5 text-sky-400" />
                  </span>
                </div>

                {/* Links Stack in Mockup */}
                <div className="space-y-2.5 overflow-y-auto flex-1 px-1 py-1">
                  {selectedBio.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`block p-3 rounded-2xl border text-center transition-transform hover:scale-102 shadow-md ${currentTheme.card}`}
                    >
                      <p className="font-bold text-xs">{link.title}</p>
                      {link.subtitle && (
                        <p className="text-[10px] opacity-75 mt-0.5">{link.subtitle}</p>
                      )}
                    </a>
                  ))}
                </div>

                {/* Footer Brand */}
                <div className="pt-2 text-center text-[10px] text-slate-500 font-medium shrink-0">
                  ⚡ Powered by LinkPulse Bio
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
