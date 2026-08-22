import React, { useState } from 'react';
import {
  X,
  Download,
  Trash2,
  Play,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  CheckCircle,
  ExternalLink,
  HardDrive
} from 'lucide-react';

export default function DownloadsDrawer({
  downloads = [],
  onClose,
  onPlayVideo,
  onClearDownloads,
  onDeleteDownload
}) {
  const [filter, setFilter] = useState('all');

  const filtered = downloads.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'videos') return d.type === 'video';
    if (filter === 'music') return d.type === 'audio';
    if (filter === 'images') return d.type === 'image';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl animate-slide-up">
        {/* Header */}
        <header className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Soul Downloads ({downloads.length})</h3>
          </div>

          <div className="flex items-center gap-2">
            {downloads.length > 0 && (
              <button
                onClick={onClearDownloads}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                title="Clear All"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Simulated Storage Status */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              <span>Soul Fast Storage</span>
            </span>
            <span className="font-mono text-slate-300">1.4 GB / 64 GB</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 w-[15%]"></div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="p-3 bg-slate-900 flex items-center gap-1.5 overflow-x-auto border-b border-slate-800">
          {['all', 'videos', 'music', 'images'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition ${
                filter === cat ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Downloads List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Download className="w-12 h-12 stroke-1" />
              <p className="text-xs font-medium">No downloads yet in this category.</p>
            </div>
          ) : (
            filtered.map(item => (
              <div key={item.id} className="glass-card rounded-2xl p-3 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shrink-0 text-sky-400 border border-slate-800">
                    {item.type === 'video' ? <Video className="w-5 h-5" /> : item.type === 'audio' ? <Music className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>{item.format.toUpperCase()}</span>
                      <span>•</span>
                      <span>{item.timestamp || 'Just now'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.type === 'video' && (
                    <button
                      onClick={() => onPlayVideo(item.url, item.title)}
                      className="p-2 rounded-xl bg-sky-600/20 hover:bg-sky-600 text-sky-400 hover:text-white transition"
                      title="Play in Soul Player"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}
                  <a
                    href={item.url}
                    download
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Open / Download"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => onDeleteDownload(item.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
