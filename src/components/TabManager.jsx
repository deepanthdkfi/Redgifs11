import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Lock,
  Globe,
  Search,
  LayoutGrid,
  Columns,
  List,
  Layers,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function TabManager({
  tabs,
  activeTabId,
  isIncognito,
  onSelectTab,
  onCloseTab,
  onCloseAllTabs,
  onNewTab,
  onToggleIncognito,
  onCloseManager
}) {
  const [tabLayout, setTabLayout] = useState('grid'); // 'grid' | 'stack' | 'list'
  const [searchQuery, setSearchQuery] = useState('');

  const currentTabs = tabs.filter(t => (isIncognito ? t.isIncognito : !t.isIncognito));

  const filteredTabs = currentTabs.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-2xl animate-fade-in select-none">
      {/* Tab Manager Header */}
      <header className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between gap-3">
        {/* Incognito & Regular Tabs Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => onToggleIncognito(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              !isIncognito
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Standard ({tabs.filter(t => !t.isIncognito).length})</span>
          </button>

          <button
            onClick={() => onToggleIncognito(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isIncognito
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Secret ({tabs.filter(t => t.isIncognito).length})</span>
          </button>
        </div>

        {/* Layout Switcher & Close */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTabLayout('grid')}
              className={`p-1.5 rounded-lg transition ${tabLayout === 'grid' ? 'bg-slate-700 text-sky-400' : 'text-slate-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTabLayout('stack')}
              className={`p-1.5 rounded-lg transition ${tabLayout === 'stack' ? 'bg-slate-700 text-sky-400' : 'text-slate-400'}`}
              title="Stack View"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTabLayout('list')}
              className={`p-1.5 rounded-lg transition ${tabLayout === 'list' ? 'bg-slate-700 text-sky-400' : 'text-slate-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onCloseManager}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
            title="Done"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tab Search & Controls */}
      <div className="px-4 py-2 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search open tabs..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {currentTabs.length > 0 && (
            <button
              onClick={onCloseAllTabs}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Close All</span>
            </button>
          )}

          <button
            onClick={onNewTab}
            className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Tab</span>
          </button>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredTabs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200">No Tabs Found</h3>
              <p className="text-xs text-slate-400 mt-1">Open a new tab to start browsing effortlessly.</p>
            </div>
            <button
              onClick={onNewTab}
              className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition"
            >
              Create New Tab
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-4 ${
              tabLayout === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : tabLayout === 'list'
                ? 'grid-cols-1 max-w-2xl mx-auto'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
            }`}
          >
            {filteredTabs.map(tab => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`group relative flex flex-col rounded-3xl overflow-hidden cursor-pointer transition transform hover:scale-[1.02] active:scale-[0.98] ${
                    isActive
                      ? 'tab-card-active border-2 border-sky-500 bg-slate-900 shadow-xl shadow-sky-500/20'
                      : 'bg-slate-900/80 border border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header Bar */}
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800">
                    <div className="flex items-center gap-2 truncate flex-1 pr-2">
                      <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] shrink-0">
                        {tab.url === 'about:home' ? '⚡' : '🌐'}
                      </div>
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {tab.title || 'New Tab'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                      className="p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                      title="Close tab"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Preview Body */}
                  <div className="h-36 sm:h-44 bg-slate-950 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/5 to-purple-500/5 pointer-events-none"></div>

                    {tab.url === 'about:home' ? (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto text-lg font-bold">
                          ⚡
                        </div>
                        <div className="text-xs font-bold text-slate-300">Soul Start Page</div>
                        <div className="text-[10px] text-slate-400">Speed Dials & Discovery</div>
                      </div>
                    ) : (
                      <div className="space-y-2 max-w-[85%]">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-sm font-mono font-bold uppercase">
                          {tab.url.replace(/^https?:\/\//, '').slice(0, 2)}
                        </div>
                        <div className="text-xs font-medium text-slate-300 truncate">{tab.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{tab.url}</div>
                      </div>
                    )}

                    {/* Media Sniffed Badge on Tab */}
                    {tab.media && (tab.media.videos?.length > 0 || tab.media.images?.length > 0) && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-sky-500/30 border border-sky-400/40 text-sky-300 text-[10px] font-bold">
                        🎥 {((tab.media.videos?.length || 0) + (tab.media.images?.length || 0))} media
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tab Manager Bottom Toolbar */}
      <footer className="p-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Total Tabs: <span className="font-bold text-slate-200">{tabs.length}</span>
        </div>
        <button
          onClick={onCloseManager}
          className="px-6 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
        >
          Return to Page
        </button>
      </footer>
    </div>
  );
}
