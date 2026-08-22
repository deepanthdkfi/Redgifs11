import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Clock,
  Trash2,
  ExternalLink,
  Search,
  Plus,
  Star,
  Download,
  Upload
} from 'lucide-react';

export default function HistoryBookmarksModal({
  initialTab = 'bookmarks',
  bookmarks = [],
  history = [],
  onNavigate,
  onAddBookmark,
  onDeleteBookmark,
  onClearHistory,
  onDeleteHistoryItem,
  onClose
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookmarks = bookmarks.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = history.filter(h =>
    (h.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportBookmarks = () => {
    const blob = new Blob([JSON.stringify(bookmarks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soul_bookmarks_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl h-[75vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Tabs */}
        <header className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'bookmarks' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks ({bookmarks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'history' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>History ({history.length})</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Search Bar & Sub-actions */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {activeTab === 'history' && history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-bold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          {activeTab === 'bookmarks' && (
            <button
              onClick={handleExportBookmarks}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              title="Export Bookmarks"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {activeTab === 'bookmarks' ? (
            filteredBookmarks.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Bookmark className="w-12 h-12 stroke-1" />
                <p className="text-xs font-medium">No bookmarks saved yet.</p>
              </div>
            ) : (
              filteredBookmarks.map(b => (
                <div
                  key={b.id}
                  onClick={() => {
                    onNavigate(b.url);
                    onClose();
                  }}
                  className="glass-card rounded-2xl p-3 flex items-center justify-between gap-3 cursor-pointer hover:border-sky-500/40 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold shrink-0">
                      ★
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate group-hover:text-sky-300">{b.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{b.url}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBookmark(b.id);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )
          ) : (
            filteredHistory.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Clock className="w-12 h-12 stroke-1" />
                <p className="text-xs font-medium">Your browsing history is clean.</p>
              </div>
            ) : (
              filteredHistory.map(h => (
                <div
                  key={h.id}
                  onClick={() => {
                    onNavigate(h.url);
                    onClose();
                  }}
                  className="glass-card rounded-2xl p-3 flex items-center justify-between gap-3 cursor-pointer hover:border-sky-500/40 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center text-xs shrink-0">
                      🌐
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate group-hover:text-sky-300">{h.title || h.url}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span className="truncate">{h.url}</span>
                        <span>•</span>
                        <span className="shrink-0">{h.time || 'Recently'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistoryItem(h.id);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
