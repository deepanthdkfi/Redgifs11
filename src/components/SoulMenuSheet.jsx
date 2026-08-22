import React from 'react';
import {
  X,
  Shield,
  BookOpen,
  Download,
  Laptop,
  Smartphone,
  Moon,
  Camera,
  Languages,
  Code,
  QrCode,
  Bookmark,
  Clock,
  Settings,
  Lock,
  Share2,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';

export default function SoulMenuSheet({
  isOpen,
  onClose,
  adBlockMode,
  onToggleAdBlock,
  userAgentMode,
  onToggleUserAgent,
  isIncognito,
  onToggleIncognito,
  onOpenReader,
  onOpenMediaSniffer,
  onOpenDownloads,
  onOpenBookmarks,
  onOpenHistory,
  onOpenSettings,
  onOpenQRCode,
  onOpenPageSource,
  onOpenScreenshot,
  onAddCurrentBookmark,
  currentUrl
}) {
  if (!isOpen) return null;

  const isHome = !currentUrl || currentUrl === 'about:home';

  const menuItems = [
    {
      id: 'sniffer',
      title: 'Media Sniffer',
      subtitle: 'Videos & Images',
      icon: Download,
      color: 'from-sky-500 to-indigo-600',
      action: onOpenMediaSniffer,
      disabled: false
    },
    {
      id: 'reader',
      title: 'Clean Reader',
      subtitle: 'Distraction-free',
      icon: BookOpen,
      color: 'from-amber-500 to-orange-600',
      action: onOpenReader,
      disabled: isHome
    },
    {
      id: 'adblock',
      title: `AdBlock (${adBlockMode})`,
      subtitle: 'Tap to cycle mode',
      icon: Shield,
      color: adBlockMode !== 'off' ? 'from-emerald-500 to-teal-600' : 'from-slate-600 to-slate-700',
      action: onToggleAdBlock,
      disabled: false
    },
    {
      id: 'ua',
      title: userAgentMode === 'desktop' ? 'Desktop Mode' : 'Mobile Mode',
      subtitle: 'User-Agent',
      icon: userAgentMode === 'desktop' ? Laptop : Smartphone,
      color: 'from-blue-500 to-cyan-600',
      action: onToggleUserAgent,
      disabled: false
    },
    {
      id: 'incognito',
      title: isIncognito ? 'Exit Secret' : 'Secret Mode',
      subtitle: 'Isolated tab & privacy',
      icon: Lock,
      color: isIncognito ? 'from-purple-600 to-pink-600' : 'from-slate-700 to-slate-800',
      action: () => onToggleIncognito(!isIncognito),
      disabled: false
    },
    {
      id: 'bookmark',
      title: 'Bookmark Page',
      subtitle: 'Save to collection',
      icon: Bookmark,
      color: 'from-pink-500 to-rose-600',
      action: onAddCurrentBookmark,
      disabled: isHome
    },
    {
      id: 'screenshot',
      title: 'Page Snapshot',
      subtitle: 'Capture image',
      icon: Camera,
      color: 'from-indigo-500 to-purple-600',
      action: onOpenScreenshot,
      disabled: isHome
    },
    {
      id: 'qr',
      title: 'Share via QR',
      subtitle: 'Scan on mobile',
      icon: QrCode,
      color: 'from-teal-500 to-emerald-600',
      action: onOpenQRCode,
      disabled: isHome
    },
    {
      id: 'source',
      title: 'View Source',
      subtitle: 'DOM HTML code',
      icon: Code,
      color: 'from-slate-600 to-slate-800',
      action: onOpenPageSource,
      disabled: isHome
    },
    {
      id: 'downloads',
      title: 'Downloads',
      subtitle: 'Storage & files',
      icon: Download,
      color: 'from-sky-600 to-blue-700',
      action: onOpenDownloads,
      disabled: false
    },
    {
      id: 'history',
      title: 'History & Tabs',
      subtitle: 'Recent searches',
      icon: Clock,
      color: 'from-amber-600 to-red-600',
      action: onOpenHistory,
      disabled: false
    },
    {
      id: 'settings',
      title: 'Soul Settings',
      subtitle: 'Theme & gestures',
      icon: Settings,
      color: 'from-slate-700 to-zinc-800',
      action: onOpenSettings,
      disabled: false
    }
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-slide-up space-y-4 max-h-[85vh] overflow-y-auto"
      >
        {/* Sheet Top Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold">
              ⚡
            </div>
            <h3 className="text-base font-bold text-white">Soul Quick Actions</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4x3 Power Tool Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => {
                  item.action();
                  if (item.id !== 'adblock' && item.id !== 'ua' && item.id !== 'incognito') {
                    onClose();
                  }
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition group ${
                  item.disabled
                    ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-slate-950/70 border-slate-800/90 hover:border-sky-500/50 hover:bg-slate-800/80 active:scale-95 text-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition duration-200`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold mt-2 truncate w-full text-center group-hover:text-white">
                  {item.title}
                </span>
                <span className="text-[9px] text-slate-400 truncate w-full text-center hidden sm:block">
                  {item.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
