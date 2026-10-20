import React, { useState } from 'react';
import {
  FolderTree,
  FolderPlus,
  Plus,
  Trash2,
  Folder as FolderIcon,
  MousePointerClick,
  Link2,
  Check,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { Folder, LinkItem } from '../types.js';
import { createFolder, deleteFolder } from '../utils/api.js';

interface FoldersViewProps {
  folders: Folder[];
  links: LinkItem[];
  onRefresh: () => void;
  onSelectFolderToFilter: (folderId: string) => void;
}

export function FoldersView({
  folders,
  links,
  onRefresh,
  onSelectFolderToFilter,
}: FoldersViewProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#38bdf8');
  const [loading, setLoading] = useState(false);

  const colors = ['#38bdf8', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createFolder({ name: name.trim(), description: description.trim(), color });
      setName('');
      setDescription('');
      setShowCreate(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, folderName: string) => {
    if (!window.confirm(`Are you sure you want to delete folder "${folderName}"? Links in this folder will be unassigned but not deleted.`)) {
      return;
    }
    try {
      await deleteFolder(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete folder');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <FolderTree className="size-4" /> Workspace Organization
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Workspaces & Folders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Keep your links structured across teams, departments, clients, and promotions.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-purple-500/20"
        >
          <FolderPlus className="size-4" />
          {showCreate ? 'Close Form' : 'New Folder'}
        </button>
      </div>

      {/* Inline Create Folder Form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="p-6 rounded-3xl bg-[#0e172a]/90 border border-purple-500/30 shadow-2xl space-y-4 max-w-2xl"
        >
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FolderPlus className="size-4 text-purple-400" /> Create Workspace Folder
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Folder Name <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Q4 Affiliates, YouTube Bios"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Theme Accent Color
              </label>
              <div className="flex items-center gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="size-7 rounded-xl border border-slate-700 flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="size-3 text-slate-950 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Brief summary of what goes in this folder..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-purple-500/20 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      )}

      {/* Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {folders.map((folder) => {
          const folderLinks = links.filter((l) => l.folderId === folder.id);
          const totalFolderClicks = folderLinks.reduce((acc, l) => acc + l.clicks, 0);

          return (
            <div
              key={folder.id}
              className="group p-6 rounded-3xl bg-[#0e172a]/80 border border-slate-800 hover:border-purple-500/40 transition-all shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="size-11 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: `${folder.color}25`, border: `1px solid ${folder.color}50`, color: folder.color }}
                  >
                    <FolderIcon className="size-5" />
                  </div>

                  <button
                    onClick={() => handleDelete(folder.id, folder.name)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 transition-all"
                    title="Delete folder"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {folder.name}
                  </h3>
                  {folder.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {folder.description}
                    </p>
                  )}
                </div>

                {/* Metrics */}
                <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Links</span>
                    <p className="font-mono font-bold text-white mt-0.5">{folderLinks.length}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Total Clicks</span>
                    <p className="font-mono font-bold text-purple-400 mt-0.5">{totalFolderClicks}</p>
                  </div>
                </div>
              </div>

              {/* View Links in Folder Button */}
              <div className="pt-5 mt-4 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSelectFolderToFilter(folder.id)}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5"
                >
                  <span>Filter workspace by this folder</span>
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
