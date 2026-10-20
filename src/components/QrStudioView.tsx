import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import {
  QrCode,
  Download,
  Palette,
  Shield,
  Layers,
  Upload,
  FileSpreadsheet,
  Check,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Sliders,
  Archive,
  Image as ImageIcon,
} from 'lucide-react';
import type { LinkItem } from '../types.js';
import { getLiveShortUrl } from '../utils/format.js';

interface QrStudioViewProps {
  links: LinkItem[];
  prefilledLink?: LinkItem | null;
}

export function QrStudioView({ links, prefilledLink }: QrStudioViewProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  // Single Studio Settings
  const [url, setUrl] = useState(
    prefilledLink
      ? getLiveShortUrl(prefilledLink.code, prefilledLink.shortUrl)
      : links[0]
      ? getLiveShortUrl(links[0].code, links[0].shortUrl)
      : 'https://linkpulse.io'
  );
  const [fgColor, setFgColor] = useState('#06b6d4');
  const [bgColor, setBgColor] = useState('#0f172a');
  const [transparentBg, setTransparentBg] = useState(false);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [centerIcon, setCenterIcon] = useState<'none' | 'pulse' | 'star' | 'rocket' | 'globe'>('pulse');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  // Bulk Generator State
  const [bulkInput, setBulkInput] = useState(
    'https://github.com,GitHub\nhttps://news.ycombinator.com,HackerNews\nhttps://wikipedia.org,Wikipedia\nhttps://react.dev,React'
  );
  const [bulkResults, setBulkResults] = useState<{ url: string; label: string; dataUrl: string }[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [zipDownloading, setZipDownloading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Color presets
  const colorPresets = [
    { name: 'Cyan Pulse', fg: '#06b6d4', bg: '#0f172a' },
    { name: 'Emerald', fg: '#10b981', bg: '#064e3b' },
    { name: 'Sunset Amber', fg: '#f59e0b', bg: '#451a03' },
    { name: 'Electric Violet', fg: '#a855f7', bg: '#2e1065' },
    { name: 'Crisp Light', fg: '#090d16', bg: '#ffffff' },
    { name: 'High Contrast', fg: '#ffffff', bg: '#000000' },
  ];

  // Render QR Canvas
  useEffect(() => {
    if (!url.trim()) return;
    setGenerating(true);

    const generateQr = async () => {
      try {
        const effectiveBg = transparentBg ? '#00000000' : bgColor;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 512,
          margin: 2,
          color: {
            dark: fgColor,
            light: effectiveBg,
          },
          errorCorrectionLevel,
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate QR:', err);
      } finally {
        setGenerating(false);
      }
    };

    generateQr();
  }, [url, fgColor, bgColor, transparentBg, errorCorrectionLevel]);

  // Download Single QR
  const downloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `linkpulse-qr-${Date.now()}.png`;
    a.click();
  };

  const downloadSvg = async () => {
    try {
      const svgString = await QRCode.toString(url, {
        type: 'svg',
        color: {
          dark: fgColor,
          light: transparentBg ? '#00000000' : bgColor,
        },
        errorCorrectionLevel,
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `linkpulse-qr-${Date.now()}.svg`;
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk Generator
  const handleGenerateBulk = async () => {
    setBulkLoading(true);
    setBulkResults([]);
    try {
      const lines = bulkInput.split('\n').filter((l) => l.trim().length > 0);
      const results: { url: string; label: string; dataUrl: string }[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(',');
        const targetUrl = parts[0]?.trim();
        const label = parts[1]?.trim() || `Item ${i + 1}`;

        if (targetUrl) {
          const dataUrl = await QRCode.toDataURL(targetUrl, {
            width: 400,
            margin: 2,
            color: { dark: fgColor, light: bgColor },
            errorCorrectionLevel: 'M',
          });
          results.push({ url: targetUrl, label, dataUrl });
        }
      }
      setBulkResults(results);
    } catch (err) {
      console.error('Bulk generation error:', err);
    } finally {
      setBulkLoading(false);
    }
  };

  // Download All as ZIP
  const downloadAllZip = async () => {
    if (bulkResults.length === 0) return;
    setZipDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('linkpulse-qr-codes');

      for (let i = 0; i < bulkResults.length; i++) {
        const item = bulkResults[i];
        // Strip data:image/png;base64,
        const base64Data = item.dataUrl.replace(/^data:image\/png;base64,/, '');
        const filename = `${i + 1}_${item.label.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
        folder?.file(filename, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `linkpulse-bulk-qr-codes-${Date.now()}.zip`;
      a.click();
    } catch (err) {
      console.error('Error creating zip:', err);
    } finally {
      setZipDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <QrCode className="size-4" /> Vector & Raster Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            QR Studio Pro
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Design branded high-resolution QR codes, pick color themes, and batch-generate up to 50+ QR codes with one-click ZIP download.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'single'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom Designer
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bulk'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bulk Batch Generator
          </button>
        </div>
      </div>

      {activeTab === 'single' ? (
        /* SINGLE DESIGNER */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl space-y-5">
              {/* URL Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Target URL to Encode
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourlink.com"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />

                {/* Quick picker from existing short links */}
                {links.length > 0 && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 shrink-0">Or pick short link:</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) setUrl(e.target.value);
                      }}
                      className="text-xs bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-cyan-400 focus:outline-none"
                    >
                      <option value="">Select from your links...</option>
                      {links.map((l) => (
                        <option
                          key={l.id}
                          value={getLiveShortUrl(l.code, l.shortUrl)}
                        >
                          /{l.code} — {l.title || l.url}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Theme Presets */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                  <Palette className="size-3.5 text-cyan-400" /> Color Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setFgColor(preset.fg);
                        setBgColor(preset.bg);
                        setTransparentBg(false);
                      }}
                      className="p-2.5 rounded-xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-left flex items-center gap-2.5 transition-all text-xs"
                    >
                      <div className="flex -space-x-1 shrink-0">
                        <span
                          className="size-4 rounded-full border border-slate-700"
                          style={{ backgroundColor: preset.fg }}
                        />
                        <span
                          className="size-4 rounded-full border border-slate-700"
                          style={{ backgroundColor: preset.bg }}
                        />
                      </div>
                      <span className="font-medium text-slate-200 truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Foreground / Dot Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="size-9 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      disabled={transparentBg}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="size-9 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer p-0.5 disabled:opacity-40"
                    />
                    <input
                      type="text"
                      value={transparentBg ? 'Transparent' : bgColor}
                      disabled={transparentBg}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono disabled:opacity-40"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-[11px] text-slate-400 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transparentBg}
                      onChange={(e) => setTransparentBg(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-cyan-500 size-3.5"
                    />
                    <span>Transparent Background</span>
                  </label>
                </div>
              </div>

              {/* Error Correction & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Shield className="size-3.5 text-cyan-400" /> Error Correction Level
                  </label>
                  <select
                    value={errorCorrectionLevel}
                    onChange={(e) => setErrorCorrectionLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  >
                    <option value="L">Level L (7% recovery, sleek dots)</option>
                    <option value="M">Level M (15% recovery, balanced)</option>
                    <option value="Q">Level Q (25% recovery, robust)</option>
                    <option value="H">Level H (30% recovery, best with logos)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-cyan-400" /> Center Badge Icon
                  </label>
                  <select
                    value={centerIcon}
                    onChange={(e) => setCenterIcon(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  >
                    <option value="none">No Icon (Classic QR)</option>
                    <option value="pulse">Pulse Icon (LinkPulse)</option>
                    <option value="globe">Globe Icon</option>
                    <option value="rocket">Rocket Icon</option>
                    <option value="star">Star Icon</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Preview & Download Column */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-20 w-full p-8 rounded-3xl bg-[#0e172a]/90 border border-slate-800 shadow-2xl flex flex-col items-center text-center space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live High-Res Preview
              </span>

              {/* Canvas / Image Box */}
              <div className="relative p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-inner group">
                {qrDataUrl ? (
                  <div className="relative">
                    <img
                      src={qrDataUrl}
                      alt="Generated QR Code"
                      className="size-56 sm:size-64 object-contain rounded-2xl transition-transform group-hover:scale-102"
                    />

                    {/* Center Icon Overlay */}
                    {centerIcon !== 'none' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          className="size-12 rounded-2xl flex items-center justify-center shadow-xl border-2 border-slate-900"
                          style={{ backgroundColor: fgColor, color: bgColor === '#ffffff' ? '#090d16' : '#ffffff' }}
                        >
                          {centerIcon === 'pulse' && <QrCode className="size-6 stroke-[2.5]" />}
                          {centerIcon === 'globe' && <ExternalLink className="size-6" />}
                          {centerIcon === 'rocket' && <span className="text-xl">🚀</span>}
                          {centerIcon === 'star' && <span className="text-xl">⭐</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="size-64 flex items-center justify-center text-xs text-slate-500">
                    Generating...
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400 max-w-xs font-mono truncate">
                {url}
              </p>

              {/* Download Buttons */}
              <div className="w-full grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={downloadPng}
                  disabled={!qrDataUrl}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
                >
                  <Download className="size-4" /> Download PNG
                </button>

                <button
                  type="button"
                  onClick={downloadSvg}
                  disabled={!qrDataUrl}
                  className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <FileSpreadsheet className="size-4 text-cyan-400" /> Vector SVG
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* BULK BATCH GENERATOR */
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e172a]/80 border border-slate-800 shadow-xl space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Archive className="size-5 text-cyan-400" /> Batch QR Code Generator
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter multiple URLs (one per line, format: <code>URL,Label</code>) or upload a CSV file to generate multiple QR codes and download as a ZIP archive.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                URL List (URL, Label)
              </label>
              <textarea
                rows={5}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="https://example.com/promo1,SummerPromo&#10;https://example.com/promo2,WinterPromo"
                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleGenerateBulk}
                disabled={bulkLoading || !bulkInput.trim()}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
              >
                {bulkLoading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" /> Generating Batch...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" /> Generate {bulkInput.split('\n').filter((l) => l.trim()).length} QR Codes
                  </>
                )}
              </button>

              {bulkResults.length > 0 && (
                <button
                  type="button"
                  onClick={downloadAllZip}
                  disabled={zipDownloading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Archive className="size-4" />
                  {zipDownloading ? 'Compressing ZIP...' : `Download All ${bulkResults.length} QRs (.ZIP)`}
                </button>
              )}
            </div>
          </div>

          {/* Batch Grid Output */}
          {bulkResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Generated {bulkResults.length} QR Codes
                </h3>
                <span className="text-xs text-slate-400">Ready to download individually or as zip</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {bulkResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center space-y-3"
                  >
                    <img
                      src={item.dataUrl}
                      alt={item.label}
                      className="size-32 object-contain rounded-xl bg-white p-1"
                    />
                    <div className="w-full">
                      <p className="text-xs font-bold text-white truncate">{item.label}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{item.url}</p>
                    </div>
                    <a
                      href={item.dataUrl}
                      download={`${item.label}.png`}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-semibold flex items-center justify-center gap-1"
                    >
                      <Download className="size-3" /> Save PNG
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
