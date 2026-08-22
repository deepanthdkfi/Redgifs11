import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Layers,
  Sparkles,
  Download,
  Menu,
  Shield,
  BookOpen,
  Plus,
  Share2,
  Bookmark
} from 'lucide-react';

export default function BottomBar({
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onGoHome,
  onOpenTabs,
  onOpenMenu,
  onOpenMediaSniffer,
  onOpenDownloads,
  onOpenBookmarks,
  tabCount = 1,
  mediaCount = 0,
  isIncognito,
  onSwipeTabNext,
  onSwipeTabPrev,
  customButtons = ['back', 'forward', 'home', 'sniffer', 'tabs', 'menu']
}) {
  const touchStartX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;
    if (diff > 50) {
      // Swiped right -> previous tab
      if (onSwipeTabPrev) onSwipeTabPrev();
    } else if (diff < -50) {
      // Swiped left -> next tab
      if (onSwipeTabNext) onSwipeTabNext();
    }
  };

  return (
    <nav
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative z-40 w-full ${
        isIncognito ? 'bg-purple-950/90 border-purple-900/60' : 'bg-slate-900/90 border-slate-800/80'
      } backdrop-blur-2xl border-t px-2 sm:px-4 py-2 select-none shadow-2xl transition-colors`}
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-1">
        {/* Back Button */}
        <button
          onClick={onGoBack}
          disabled={!canGoBack}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition ${
            canGoBack
              ? 'text-slate-200 hover:text-white hover:bg-slate-800/70 active:scale-95'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Back (Long press for History)"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-[10px] font-medium hidden xs:block">Back</span>
        </button>

        {/* Forward Button */}
        <button
          onClick={onGoForward}
          disabled={!canGoForward}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition ${
            canGoForward
              ? 'text-slate-200 hover:text-white hover:bg-slate-800/70 active:scale-95'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Forward"
        >
          <ChevronRight className="w-5 h-5" />
          <span className="text-[10px] font-medium hidden xs:block">Forward</span>
        </button>

        {/* Home Button */}
        <button
          onClick={onGoHome}
          className="flex flex-col items-center justify-center p-2 rounded-2xl text-slate-300 hover:text-sky-400 hover:bg-slate-800/70 active:scale-95 transition"
          title="Soul Start Page"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium hidden xs:block">Home</span>
        </button>

        {/* Media Sniffer Button (Soul Superpower) */}
        <button
          onClick={onOpenMediaSniffer}
          className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition active:scale-95 ${
            mediaCount > 0
              ? 'text-sky-400 font-bold hover:bg-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
          }`}
          title="Sniff Videos, Audio & Images"
        >
          <div className="relative">
            <Download className={`w-5 h-5 ${mediaCount > 0 ? 'text-sky-400' : ''}`} />
            {mediaCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-[10px] font-bold text-white shadow">
                {mediaCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium hidden xs:block">Sniffer</span>
        </button>

        {/* Tabs Manager Button */}
        <button
          onClick={onOpenTabs}
          className="flex flex-col items-center justify-center p-2 rounded-2xl text-slate-200 hover:text-sky-400 hover:bg-slate-800/70 active:scale-95 transition"
          title="Tab Manager"
        >
          <div className="relative flex items-center justify-center w-5 h-5 rounded-md border-2 border-current text-[11px] font-extrabold font-mono">
            {tabCount}
          </div>
          <span className="text-[10px] font-medium hidden xs:block">Tabs</span>
        </button>

        {/* Soul Super Menu Button */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center p-2 rounded-2xl text-slate-200 hover:text-sky-400 hover:bg-slate-800/70 active:scale-95 transition"
          title="Soul Quick Menu & Tools"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium hidden xs:block">Menu</span>
        </button>
      </div>

      {/* Swipe gesture helper indicator */}
      <div className="flex justify-center items-center mt-1">
        <div className="w-16 h-1 rounded-full bg-slate-700/60 hover:bg-slate-500 transition-colors" title="Swipe left/right to change tabs"></div>
      </div>
    </nav>
  );
}
