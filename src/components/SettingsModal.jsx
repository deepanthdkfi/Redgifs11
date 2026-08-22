import React, { useState } from 'react';
import {
  X,
  Palette,
  Shield,
  Search,
  Sliders,
  Trash2,
  Sparkles,
  Info,
  Check,
  Globe,
  Lock,
  Cpu,
  Smartphone
} from 'lucide-react';

const THEMES = [
  { id: 'theme-midnight', name: 'Midnight Dark', color: '#0b0f19', border: '#38bdf8' },
  { id: 'theme-oled', name: 'Pure Pitch OLED', color: '#000000', border: '#60a5fa' },
  { id: 'theme-cyber', name: 'Cyber Cyan', color: '#090d16', border: '#06b6d4' },
  { id: 'theme-purple', name: 'Cosmic Purple', color: '#0f0b1a', border: '#a855f7' },
  { id: 'theme-emerald', name: 'Emerald Zen', color: '#061510', border: '#10b981' }
];

export default function SettingsModal({
  currentTheme,
  onChangeTheme,
  searchEngine,
  onSelectSearchEngine,
  adBlockMode,
  onChangeAdBlockMode,
  userAgentMode,
  onChangeUserAgentMode,
  onClearAllData,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('general');
  const [dataCleared, setDataCleared] = useState(false);

  const handleClear = () => {
    onClearAllData();
    setDataCleared(true);
    setTimeout(() => setDataCleared(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Soul Settings & Customization</h2>
              <p className="text-xs text-slate-400">Configure your clean, high-performance browser</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Setting Navigation Tabs */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          {['general', 'themes', 'privacy', 'about'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                activeTab === t ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* Default Search Engine */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Search className="w-4 h-4 text-sky-400" />
                  <span>Default Search Provider</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'duckduckgo', name: 'DuckDuckGo (Private)' },
                    { id: 'google', name: 'Google Search' },
                    { id: 'bing', name: 'Microsoft Bing' },
                    { id: 'youtube', name: 'YouTube' },
                    { id: 'reddit', name: 'Reddit Discussions' },
                    { id: 'wikipedia', name: 'Wikipedia' }
                  ].map(engine => (
                    <button
                      key={engine.id}
                      onClick={() => onSelectSearchEngine(engine.id)}
                      className={`p-3 rounded-2xl border text-xs font-semibold text-left transition flex items-center justify-between ${
                        searchEngine === engine.id
                          ? 'bg-sky-600/20 border-sky-500 text-sky-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span>{engine.name}</span>
                      {searchEngine === engine.id && <Check className="w-4 h-4 text-sky-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Agent Mode */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span>User Agent Emulation</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'desktop', name: 'Desktop Chrome' },
                    { id: 'mobile', name: 'Android Pixel' },
                    { id: 'tablet', name: 'iPad Pro' }
                  ].map(ua => (
                    <button
                      key={ua.id}
                      onClick={() => onChangeUserAgentMode(ua.id)}
                      className={`p-3 rounded-2xl border text-xs font-semibold text-center transition ${
                        userAgentMode === ua.id
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {ua.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* THEMES TAB */}
          {activeTab === 'themes' && (
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" />
                <span>Choose Soul Visual Theme</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEMES.map(theme => {
                  const isActive = currentTheme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => onChangeTheme(theme.id)}
                      className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                        isActive
                          ? 'border-sky-500 bg-slate-800/80 ring-2 ring-sky-500/30'
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border-2 shadow-inner"
                          style={{ backgroundColor: theme.color, borderColor: theme.border }}
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-100">{theme.name}</h4>
                          <span className="text-[10px] text-slate-400">Glassmorphic Modern UI</span>
                        </div>
                      </div>
                      {isActive && <Check className="w-5 h-5 text-sky-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              {/* AdBlock Level */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Soul Clean Engine (AdBlock & Tracker Shield)</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'strict', name: 'Strict Shield', desc: 'Blocks ads + trackers + promo popups' },
                    { id: 'standard', name: 'Standard (Recommended)', desc: 'Blocks all standard banner & pop ads' },
                    { id: 'off', name: 'Disabled', desc: 'Allow all ads & scripts' }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => onChangeAdBlockMode(mode.id)}
                      className={`p-3 rounded-2xl border text-xs text-left transition ${
                        adBlockMode === mode.id
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold">{mode.name}</div>
                      <div className="text-[10px] opacity-70 mt-1">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Data */}
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-red-300 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Browsing Data</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Clears local tabs, cache, speed dials, history and cookies.</p>
                </div>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition"
                >
                  {dataCleared ? 'Data Wiped Successfully!' : 'Clear All Browsing Data'}
                </button>
              </div>
            </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>SoulX Browser v2.5.0</span>
                </div>
                <p>
                  Inspired by Soul Browser, crafted for ultra-clean UI, instant media sniffing, gesture video player, reader mode, and lightweight performance.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Features:</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong className="text-slate-200">Media Sniffer:</strong> 1-click video/audio/image detection & batch ZIP download.</li>
                  <li><strong className="text-slate-200">Soul Video Player:</strong> Brightness/Volume swipe gestures, 0.5x-3x speed, screenshot frame.</li>
                  <li><strong className="text-slate-200">Distraction-Free Reader:</strong> Clean article typography with Text-To-Speech read aloud.</li>
                  <li><strong className="text-slate-200">Ad & Tracker Shield:</strong> Built-in fast cosmetic filter and anti-tracking engine.</li>
                  <li><strong className="text-slate-200">Tab Switcher:</strong> Standard vs Incognito tabs with 3D Grid & List layouts.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
