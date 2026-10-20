import React, { useState } from 'react';
import { X, Download, Upload, FileText, Check, AlertCircle, Sparkles } from 'lucide-react';
import type { LinkItem } from '../types.js';

interface ExportImportModalProps {
  links: LinkItem[];
  onClose: () => void;
  onImportComplete: () => void;
}

export function ExportImportModal({ links, onClose, onImportComplete }: ExportImportModalProps) {
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const downloadCsv = () => {
    window.open('/api/export?format=csv', '_blank');
  };

  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(links, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `linkpulse-export-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSubmit = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    setImportMsg(null);
    try {
      // Parse lines: URL,code,title,maxClicks
      const lines = importText.split('\n').filter((l) => l.trim().length > 0);
      let successCount = 0;

      for (const line of lines) {
        const parts = line.split(',');
        const url = parts[0]?.trim();
        const code = parts[1]?.trim();
        const title = parts[2]?.trim();
        const maxClicks = parts[3] ? Number(parts[3].trim()) : undefined;

        if (url) {
          const res = await fetch('/api/links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, code, title, maxClicks }),
          });
          if (res.ok) successCount++;
        }
      }

      setImportMsg({ text: `Successfully imported ${successCount} links!` });
      setImportText('');
      onImportComplete();
    } catch (err: any) {
      setImportMsg({ text: err.message || 'Import failed', error: true });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-[#0e172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Download className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Data Export & Import</h2>
              <p className="text-xs text-slate-400">
                Download your link catalog or batch-import URLs in bulk.
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
        <div className="p-6 space-y-6">
          {/* Export Section */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Export Link Data
            </h3>
            <p className="text-xs text-slate-400">
              Download all {links.length} short links with click statistics, expiry dates, and tags.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={downloadCsv}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
              >
                <Download className="size-4" /> Download CSV
              </button>
              <button
                type="button"
                onClick={downloadJson}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <FileText className="size-4 text-cyan-400" /> Export JSON
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Bulk CSV / Text Import
            </h3>
            <p className="text-xs text-slate-400">
              Paste rows with format: <code>URL,custom_slug,title,max_clicks</code> (one per line)
            </p>
            <textarea
              rows={4}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="https://example.com/item1,item1,First Item,100&#10;https://example.com/item2,item2,Second Item,50"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            />

            {importMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  importMsg.error
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                }`}
              >
                {importMsg.error ? <AlertCircle className="size-4" /> : <Check className="size-4" />}
                {importMsg.text}
              </div>
            )}

            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={importing || !importText.trim()}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              <Upload className="size-4 text-cyan-400" />
              {importing ? 'Importing links...' : 'Import Links'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
