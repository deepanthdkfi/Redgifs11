import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Lock,
  RotateCw,
  X,
  Shield,
  BookOpen,
  Download,
  Globe,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Mic,
  QrCode,
  Layers
} from 'lucide-react';

const SEARCH_ENGINES = [
  { id: 'google', name: 'Google', icon: '🔍', queryUrl: 'https://www.google.com/search?q=' },
  { id: 'duckduckgo', name: 'DuckDuckGo', icon: '🦆', queryUrl: 'https://duckduckgo.com/?q=' },
  { id: 'bing', name: 'Bing', icon: '🌐', queryUrl: 'https://www.bing.com/search?q=' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', queryUrl: 'https://www.youtube.com/results?search_query=' },
  { id: 'reddit', name: 'Reddit', icon: '🤖', queryUrl: 'https://www.reddit.com/search/?q=' },
  { id: 'wikipedia', name: 'Wikipedia', icon: '📚', queryUrl: 'https://en.wikipedia.org/wiki/Special:Search?search=' }
];

export default function TopBar({
  currentUrl,
  isLoading,
  onNavigate,
  onReload,
  onOpenMediaSniffer,
  onOpenReader,
  onOpenQRCode,
  mediaCount = 0,
  adsBlocked = 0,
  hasArticle = false,
  adBlockMode,
  onToggleAdBlock,
  isIncognito,
  searchEngine = 'duckduckgo',
  onSelectSearchEngine
}) {
  const [inputVal, setInputVal] = useState(currentUrl || '');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showEngineDropdown, setShowEngineDropdown] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isFocused) {
      setInputVal(currentUrl === 'about:home' || !currentUrl ? '' : currentUrl);
    }
  }, [currentUrl, isFocused]);

  // Fetch search suggestions with debounce
  useEffect(() => {
    if (!isFocused || !inputVal.trim() || inputVal.startsWith('http')) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(inputVal)}`);
        const data = await res.json();
        if (data && data.suggestions) {
          setSuggestions(data.suggestions);
        }
      } catch (e) {
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [inputVal, isFocused]);

  // Click outside to close engine dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowEngineDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    let target = inputVal.trim();
    if (!/^https?:\/\//i.test(target)) {
      if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(target) && !target.includes(' ')) {
        target = 'https://' + target;
      } else {
        const engine = SEARCH_ENGINES.find(s => s.id === searchEngine) || SEARCH_ENGINES[0];
        target = engine.queryUrl + encodeURIComponent(target);
      }
    }
    setIsFocused(false);
    onNavigate(target);
  };

  const handleSuggestionClick = (text) => {
    const engine = SEARCH_ENGINES.find(s => s.id === searchEngine) || SEARCH_ENGINES[0];
    const url = engine.queryUrl + encodeURIComponent(text);
    setIsFocused(false);
    onNavigate(url);
  };

  // Voice Search helper
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported by this browser engine.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListeningVoice(true);
    recognition.onend = () => setIsListeningVoice(false);
    recognition.onerror = () => setIsListeningVoice(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputVal(transcript);
      const engine = SEARCH_ENGINES.find(s => s.id === searchEngine) || SEARCH_ENGINES[0];
      onNavigate(engine.queryUrl + encodeURIComponent(transcript));
    };

    recognition.start();
  };

  const activeEngineObj = SEARCH_ENGINES.find(s => s.id === searchEngine) || SEARCH_ENGINES[1];

  const getCleanDomain = (url) => {
    if (!url || url === 'about:home') return 'Soul Search or URL';
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <header className="relative z-40 w-full bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-3 py-2 transition-all">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        {/* Incognito Badge or Brand Icon */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isIncognito ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-semibold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              Secret
            </div>
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-sky-500/20 font-black text-sm tracking-tighter cursor-pointer hover:scale-105 transition-transform"
                 onClick={() => onNavigate('about:home')}
                 title="Soul Browser Home">
              ⚡
            </div>
          )}
        </div>

        {/* Search Engine Selector Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setShowEngineDropdown(!showEngineDropdown)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-200 transition"
            title="Change Search Engine"
          >
            <span>{activeEngineObj.icon}</span>
            <span className="hidden sm:inline font-medium">{activeEngineObj.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showEngineDropdown && (
            <div className="absolute top-full left-0 mt-1.5 w-44 rounded-2xl glass-dropdown p-1.5 shadow-2xl z-50 animate-fade-in">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-1">Search Provider</div>
              {SEARCH_ENGINES.map(engine => (
                <button
                  key={engine.id}
                  onClick={() => {
                    onSelectSearchEngine(engine.id);
                    setShowEngineDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-left transition ${
                    engine.id === searchEngine ? 'bg-sky-600/30 text-sky-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-sm">{engine.icon}</span>
                  <span>{engine.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Omnibar Address & Search Input */}
        <div className="relative flex-1">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <div className="absolute left-3 flex items-center text-slate-400 pointer-events-none">
              {currentUrl && currentUrl !== 'about:home' && currentUrl.startsWith('https') ? (
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Search className="w-3.5 h-3.5 text-sky-400" />
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={isFocused ? "Search Google or type a web address..." : getCleanDomain(currentUrl)}
              className="w-full bg-slate-950/70 border border-slate-700/60 focus:border-sky-500 rounded-2xl pl-9 pr-24 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
            />

            {/* In-bar Action Buttons */}
            <div className="absolute right-2 flex items-center gap-1 text-slate-400">
              {inputVal && (
                <button
                  type="button"
                  onClick={() => setInputVal('')}
                  className="p-1 hover:text-slate-200 rounded-full hover:bg-slate-800 transition"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-1.5 rounded-full transition ${isListeningVoice ? 'bg-red-500 text-white animate-ping' : 'hover:text-sky-400 hover:bg-slate-800'}`}
                title="Voice Search"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onReload}
                className="p-1.5 hover:text-sky-400 hover:bg-slate-800 rounded-full transition"
                title={isLoading ? "Stop" : "Reload"}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
              </button>
            </div>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {isFocused && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-dropdown rounded-2xl overflow-hidden shadow-2xl z-50 animate-fade-in">
              <div className="p-1.5 space-y-0.5">
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onMouseDown={() => handleSuggestionClick(s)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white cursor-pointer transition"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate flex-1">{s}</span>
                    <span className="text-[10px] text-slate-400 font-mono">search</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Status Badges & Quick Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* AdBlock Shield Indicator */}
          <button
            onClick={onToggleAdBlock}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-xs font-semibold transition ${
              adBlockMode !== 'off'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
            title={`AdBlock Shield: ${adBlockMode} (${adsBlocked} blocked)`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-mono">{adsBlocked}</span>
          </button>

          {/* Reader Mode Button */}
          {currentUrl && currentUrl !== 'about:home' && (
            <button
              onClick={onOpenReader}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-amber-300 transition"
              title="Clean Reader Mode"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          )}

          {/* Media Sniffer Trigger with Pulsating Badge */}
          <button
            onClick={onOpenMediaSniffer}
            className={`relative flex items-center gap-1 px-2 py-1.5 rounded-xl border transition ${
              mediaCount > 0
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 border-sky-400 text-white shadow-lg shadow-sky-500/30'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Soul Media Sniffer (Videos, Audio, Images)"
          >
            <Download className={`w-3.5 h-3.5 ${mediaCount > 0 ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-bold font-mono">{mediaCount}</span>
            {mediaCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-slate-900 animate-ping"></span>
            )}
          </button>

          {/* QR Code generator */}
          {currentUrl && currentUrl !== 'about:home' && (
            <button
              onClick={onOpenQRCode}
              className="hidden sm:flex p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition"
              title="Share URL via QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading Progress Bar */}
      {isLoading && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 animate-pulse w-full"></div>
        </div>
      )}
    </header>
  );
}
