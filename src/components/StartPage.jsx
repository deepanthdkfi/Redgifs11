import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  Zap,
  TrendingUp,
  CloudSun,
  Sun,
  CloudRain,
  Compass,
  Bookmark,
  Sparkles,
  Download,
  Flame,
  Newspaper,
  Check,
  Smartphone,
  ShieldCheck,
  Radio
} from 'lucide-react';

const DEFAULT_SPEED_DIALS = [
  { id: '1', title: 'Google', url: 'https://www.google.com', icon: 'https://www.google.com/favicon.ico', color: 'from-blue-500 to-emerald-500' },
  { id: '2', title: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.youtube.com/favicon.ico', color: 'from-red-500 to-rose-600' },
  { id: '3', title: 'Wikipedia', url: 'https://en.wikipedia.org', icon: 'https://en.wikipedia.org/favicon.ico', color: 'from-slate-400 to-slate-600' },
  { id: '4', title: 'GitHub', url: 'https://github.com', icon: 'https://github.com/favicon.ico', color: 'from-slate-700 to-slate-900' },
  { id: '5', title: 'Reddit', url: 'https://www.reddit.com', icon: 'https://www.reddit.com/favicon.ico', color: 'from-orange-500 to-amber-600' },
  { id: '6', title: 'RedGifs', url: 'https://www.redgifs.com', icon: 'https://www.redgifs.com/favicon.ico', color: 'from-rose-500 to-pink-600' },
  { id: '7', title: 'Hacker News', url: 'https://news.ycombinator.com', icon: 'https://news.ycombinator.com/favicon.ico', color: 'from-amber-500 to-orange-600' },
  { id: '8', title: 'Twitter / X', url: 'https://x.com', icon: 'https://abs.twimg.com/favicons/twitter.3.ico', color: 'from-sky-400 to-blue-600' }
];

export default function StartPage({
  onNavigate,
  searchEngine = 'duckduckgo',
  adsBlocked = 0,
  dataSavedMB = 12.4
}) {
  const [speedDials, setSpeedDials] = useState(() => {
    const saved = localStorage.getItem('soul_speed_dials');
    return saved ? JSON.parse(saved) : DEFAULT_SPEED_DIALS;
  });

  const [searchVal, setSearchVal] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [trendingData, setTrendingData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    localStorage.setItem('soul_speed_dials', JSON.stringify(speedDials));
  }, [speedDials]);

  useEffect(() => {
    fetch('/api/weather')
      .then(res => res.json())
      .then(data => setWeatherData(data))
      .catch(() => {});

    fetch('/api/trending')
      .then(res => res.json())
      .then(data => setTrendingData(data))
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    onNavigate(searchVal.trim());
  };

  const handleAddSpeedDial = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let validUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(validUrl)) validUrl = 'https://' + validUrl;

    const newItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url: validUrl,
      icon: `${validUrl}/favicon.ico`,
      color: 'from-indigo-500 to-purple-600'
    };

    setSpeedDials([...speedDials, newItem]);
    setNewTitle('');
    setNewUrl('');
    setIsAddModalOpen(false);
  };

  const handleDeleteSpeedDial = (id, e) => {
    e.stopPropagation();
    setSpeedDials(speedDials.filter(item => item.id !== id));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const filteredFeeds = trendingData?.quickFeeds?.filter(item => {
    if (activeCategory === 'All') return true;
    return item.category.toLowerCase() === activeCategory.toLowerCase();
  }) || [];

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-y-auto px-4 py-6 sm:py-10 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SOULX BROWSER • ZERO POPUPS • 1DM M3U8 DOWNLOADER</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
            {getGreeting()}, Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Zero unwanted popups, original high-bitrate video stream fetching & fluid Soul gestures.
          </p>
        </div>

        {/* Prominent Direct APK Download Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-sky-900/40 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 text-purple-300 flex items-center justify-center text-xl shrink-0">
              📱
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-sm font-bold text-white">SoulX Browser Android APK v2.5.0</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Ready</span>
              </div>
              <p className="text-xs text-slate-300">Click below to download the official Android installation package directly!</p>
            </div>
          </div>

          <a
            href="/SoulX-Browser-v2.5.0.apk"
            download="SoulX-Browser-v2.5.0.apk"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download APK (Direct)</span>
          </a>
        </div>

        {/* Big Omnibox Search Field */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto group">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition duration-300"></div>
          <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 group-hover:border-sky-500/60 rounded-3xl p-2 shadow-2xl transition">
            <div className="pl-3 pr-2 text-sky-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search or paste direct URL (e.g. YouTube, RedGifs, M3U8 stream)..."
              className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none px-2 py-2"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-lg shadow-sky-500/30 transition transform active:scale-95"
            >
              Search
            </button>
          </div>
        </form>

        {/* Trending Pills */}
        {trendingData?.trendingTopics && (
          <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider mr-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Trending:</span>
            </div>
            {trendingData.trendingTopics.map(t => (
              <button
                key={t.id}
                onClick={() => onNavigate(t.query)}
                className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white text-xs transition active:scale-95 flex items-center gap-1.5"
              >
                <span>{t.tag}</span>
              </button>
            ))}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-100 font-mono">0 Popups</div>
              <div className="text-[11px] text-slate-400 font-medium">100% Guarded</div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-100 font-mono">1DM Sniffer</div>
              <div className="text-[11px] text-slate-400 font-medium">M3U8 & 4K Ready</div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <CloudSun className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-base sm:text-lg font-black text-slate-100 font-mono">
                {weatherData ? weatherData.temp : '29°C'}
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate">
                {weatherData ? weatherData.city : 'Live Weather'}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-100 font-mono">{adsBlocked}</div>
              <div className="text-[11px] text-slate-400 font-medium">Ads Blocked</div>
            </div>
          </div>
        </div>

        {/* Speed Dial Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-sky-400" />
              <span>Speed Dial Shortcuts</span>
            </h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-semibold px-2 py-1 rounded-lg hover:bg-sky-500/10 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Shortcut</span>
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {speedDials.map(item => (
              <div
                key={item.id}
                onClick={() => onNavigate(item.url)}
                className="group relative flex flex-col items-center p-3 rounded-2xl glass-card cursor-pointer transition hover:scale-105 active:scale-95"
              >
                <button
                  onClick={(e) => handleDeleteSpeedDial(item.id, e)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                  title="Remove shortcut"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color || 'from-sky-500 to-indigo-600'} flex items-center justify-center text-white font-bold text-base shadow-md group-hover:shadow-sky-500/30 transition`}>
                  {item.title.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[11px] font-medium text-slate-300 mt-2 truncate w-full text-center group-hover:text-white">
                  {item.title}
                </span>
              </div>
            ))}

            <div
              onClick={() => setIsAddModalOpen(true)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-slate-700 hover:border-sky-500/60 hover:bg-slate-800/40 text-slate-500 hover:text-sky-400 cursor-pointer transition"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-800/50">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-medium mt-2">New</span>
            </div>
          </div>
        </div>

        {/* Discovery & Curated Feeds */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-purple-400" />
              <span>Soul Discovery Feed</span>
            </h2>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {['All', 'Tech', 'Privacy', 'Media'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    activeCategory === cat ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredFeeds.map(feed => (
              <div
                key={feed.id}
                onClick={() => onNavigate(feed.url)}
                className="glass-card rounded-2xl p-4 flex flex-col justify-between space-y-3 cursor-pointer hover:border-sky-500/40 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 font-semibold text-sky-400">{feed.category}</span>
                    <span>{feed.time}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 hover:text-sky-300 leading-snug line-clamp-2">
                    {feed.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-800">
                  <span>{feed.source}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Shortcut Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Add Speed Dial Shortcut</h3>
              <form onSubmit={handleAddSpeedDial} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Shortcut Name</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. OpenAI"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="e.g. https://openai.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition"
                  >
                    Add Shortcut
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
