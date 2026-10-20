/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Link2,
  BarChart3,
  QrCode,
  FolderTree,
  Target,
  Smartphone,
  PlayCircle,
  Download,
  Plus,
  RefreshCw,
  ExternalLink,
  Zap,
} from 'lucide-react';
import type { LinkItem, Folder, Campaign } from './types.js';
import { fetchLinks, fetchFolders, fetchCampaigns, updateLink, deleteLink } from './utils/api.js';
import { Navigation, type TabType } from './components/Navigation.js';
import { ShortenerCard } from './components/ShortenerCard.js';
import { LinksTable } from './components/LinksTable.js';
import { AnalyticsView } from './components/AnalyticsView.js';
import { QrStudioView } from './components/QrStudioView.js';
import { FoldersView } from './components/FoldersView.js';
import { CampaignsView } from './components/CampaignsView.js';
import { BioBuilderView } from './components/BioBuilderView.js';
import { LinkDetailsModal } from './components/LinkDetailsModal.js';
import { LinkTesterModal } from './components/LinkTesterModal.js';
import { ExportImportModal } from './components/ExportImportModal.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedLinkDetails, setSelectedLinkDetails] = useState<LinkItem | null>(null);
  const [testerLink, setTesterLink] = useState<LinkItem | null>(null);
  const [showTesterModal, setShowTesterModal] = useState(false);
  const [qrPrefilledLink, setQrPrefilledLink] = useState<LinkItem | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Filter pass-through from Folders / Campaigns
  const [overrideFolderFilter, setOverrideFolderFilter] = useState<string>('all');

  const loadAll = useCallback(async () => {
    try {
      const [linksData, foldersData, campaignsData] = await Promise.all([
        fetchLinks(),
        fetchFolders(),
        fetchCampaigns(),
      ]);
      setLinks(linksData);
      setFolders(foldersData);
      setCampaigns(campaignsData);
    } catch (err) {
      console.error('Failed to load LinkPulse data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Handle toggling paused state
  const handleTogglePause = async (link: LinkItem) => {
    const nextStatus = link.status === 'paused' ? 'active' : 'paused';
    try {
      const updated = await updateLink(link.code, { status: nextStatus });
      setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    } catch (err: any) {
      alert(err.message || 'Failed to update link status');
    }
  };

  // Handle delete link
  const handleDeleteLink = async (code: string) => {
    try {
      await deleteLink(code);
      setLinks((prev) => prev.filter((l) => l.code !== code));
    } catch (err: any) {
      alert(err.message || 'Failed to delete link');
    }
  };

  // Open QR Studio with selected link
  const handleOpenQr = (link: LinkItem) => {
    setQrPrefilledLink(link);
    setCurrentTab('qr-studio');
  };

  // Open Live Tester Modal
  const handleOpenTester = (link: LinkItem) => {
    setTesterLink(link);
    setShowTesterModal(true);
  };

  // Quick switch from Folder view to Overview with folder filter
  const handleFilterByFolder = (folderId: string) => {
    setOverrideFolderFilter(folderId);
    setCurrentTab('overview');
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col antialiased selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Navigation Sidebar & Mobile Header */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'simulator') {
            setShowTesterModal(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        linksCount={links.length}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Workspace Header Bar */}
        <header className="sticky top-0 z-20 hidden lg:flex items-center justify-between px-8 py-3.5 bg-[#0b1120]/80 backdrop-blur-xl border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Environment:
            </span>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Cloud Production • {typeof window !== 'undefined' ? window.location.host : 'Live'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all"
            >
              <Download className="size-3.5 text-cyan-400" />
              Export / Import
            </button>

            <button
              onClick={() => {
                setTesterLink(links[0] || null);
                setShowTesterModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-amber-300 transition-all"
            >
              <Zap className="size-3.5" />
              Simulate Visit
            </button>

            <button
              onClick={() => loadAll()}
              className="p-2 rounded-xl border border-slate-800 bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh all data"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {loading ? (
            <div className="py-24 text-center">
              <div className="size-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-400 font-medium">Booting LinkPulse Engine...</p>
            </div>
          ) : (
            <>
              {currentTab === 'overview' && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Hero Shortener Card */}
                  <ShortenerCard
                    folders={folders}
                    campaigns={campaigns}
                    onLinkCreated={(newLink) => {
                      setLinks((prev) => [newLink, ...prev]);
                    }}
                    onOpenQr={handleOpenQr}
                    onOpenTester={handleOpenTester}
                  />

                  {/* Links Table & Filter Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                          <span>Link Catalog</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                            {links.length} total
                          </span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Manage short URLs, expiration rules, click quotas, and tags.
                        </p>
                      </div>
                    </div>

                    <LinksTable
                      links={links}
                      folders={folders}
                      campaigns={campaigns}
                      onOpenDetails={(l) => setSelectedLinkDetails(l)}
                      onOpenQr={handleOpenQr}
                      onOpenTester={handleOpenTester}
                      onTogglePause={handleTogglePause}
                      onDeleteLink={handleDeleteLink}
                      onRefresh={loadAll}
                    />
                  </div>
                </div>
              )}

              {currentTab === 'analytics' && <AnalyticsView />}

              {currentTab === 'qr-studio' && (
                <QrStudioView links={links} prefilledLink={qrPrefilledLink} />
              )}

              {currentTab === 'folders' && (
                <FoldersView
                  folders={folders}
                  links={links}
                  onRefresh={loadAll}
                  onSelectFolderToFilter={handleFilterByFolder}
                />
              )}

              {currentTab === 'campaigns' && (
                <CampaignsView
                  campaigns={campaigns}
                  links={links}
                  onRefresh={loadAll}
                  onSelectCampaignToFilter={handleFilterByFolder}
                />
              )}

              {currentTab === 'bio-pages' && <BioBuilderView />}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto px-8 py-6 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">LinkPulse</span>
            <span>— Advanced Link Management, Expiry Interceptor & Visitor Analytics</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Real HTTP 302 Redirects</span>
            <span>•</span>
            <span>Device & OS Detection</span>
            <span>•</span>
            <span>Expiry & Click Limit Gate</span>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      {selectedLinkDetails && (
        <LinkDetailsModal
          link={selectedLinkDetails}
          onClose={() => setSelectedLinkDetails(null)}
          onUpdated={(updated) => {
            setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
            setSelectedLinkDetails(updated);
          }}
        />
      )}

      {showTesterModal && (
        <LinkTesterModal
          link={testerLink}
          links={links}
          onClose={() => setShowTesterModal(false)}
          onRefresh={loadAll}
        />
      )}

      {showExportModal && (
        <ExportImportModal
          links={links}
          onClose={() => setShowExportModal(false)}
          onImportComplete={loadAll}
        />
      )}
    </div>
  );
}
