import React from 'react';
import {
  Link2,
  BarChart3,
  QrCode,
  FolderTree,
  Target,
  Sparkles,
  Smartphone,
  PlayCircle,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export type TabType =
  | 'overview'
  | 'analytics'
  | 'qr-studio'
  | 'folders'
  | 'campaigns'
  | 'bio-pages'
  | 'simulator';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  linksCount: number;
}

export function Navigation({
  currentTab,
  onSelectTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  linksCount,
}: NavigationProps) {
  const navItems = [
    {
      id: 'overview' as TabType,
      label: 'Overview & Shortener',
      icon: Link2,
      badge: linksCount > 0 ? linksCount : undefined,
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics & Visitor Logs',
      icon: BarChart3,
    },
    {
      id: 'qr-studio' as TabType,
      label: 'QR Studio Pro',
      icon: QrCode,
    },
    {
      id: 'folders' as TabType,
      label: 'Workspaces & Folders',
      icon: FolderTree,
    },
    {
      id: 'campaigns' as TabType,
      label: 'Campaigns & Goals',
      icon: Target,
    },
    {
      id: 'bio-pages' as TabType,
      label: 'Bio Page Builder',
      icon: Smartphone,
    },
    {
      id: 'simulator' as TabType,
      label: 'Live Link Tester',
      icon: PlayCircle,
      highlight: true,
    },
  ];

  const handleSelect = (tab: TabType) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-[#0b1120] border-r border-slate-800/80 z-30 p-5">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-1 mb-8">
          <div className="size-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/25">
            <Link2 className="size-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white">LinkPulse</span>
              <span className="inline-block size-2 rounded-full bg-cyan-400 animate-pulse"></span>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400/80">
              Enterprise Hub
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : item.highlight
                    ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <Icon className={`size-4 ${active ? 'text-cyan-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-slate-800 text-slate-300 font-mono">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !active && (
                  <span className="size-2 rounded-full bg-amber-400 animate-ping"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom system status badge */}
        <div className="pt-4 mt-auto border-t border-slate-800/80 space-y-3">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 font-medium text-[11px]">
                <ShieldCheck className="size-3.5 text-emerald-400" /> Real Redirects
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">Active</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Express router /r/:code running with full expiry & click limiter.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0b1120]/95 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-slate-950 font-black">
            <Link2 className="size-4 stroke-[2.5]" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">LinkPulse</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm pt-14">
          <div className="bg-[#0b1120] border-b border-slate-800 p-5 space-y-2 max-h-[85vh] overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`size-5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs rounded-md bg-slate-800 text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
