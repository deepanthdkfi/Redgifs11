import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import TopBar from './components/TopBar';
import BottomBar from './components/BottomBar';
import StartPage from './components/StartPage';
import WebView from './components/WebView';
import TabManager from './components/TabManager';
import MediaSnifferModal from './components/MediaSnifferModal';
import SoulVideoPlayer from './components/SoulVideoPlayer';
import ReaderModeModal from './components/ReaderModeModal';
import DownloadsDrawer from './components/DownloadsDrawer';
import HistoryBookmarksModal from './components/HistoryBookmarksModal';
import SoulMenuSheet from './components/SoulMenuSheet';
import SettingsModal from './components/SettingsModal';
import QRCodeModal from './components/QRCodeModal';
import PageSourceModal from './components/PageSourceModal';
import ScreenshotModal from './components/ScreenshotModal';

const INITIAL_TAB = {
  id: 'tab-1',
  title: 'Soul Start',
  url: 'about:home',
  favicon: '',
  history: ['about:home'],
  historyIndex: 0,
  isIncognito: false,
  media: { videos: [], audios: [], images: [], files: [] },
  adsBlocked: 0
};

export default function App() {
  // Theme & Global Settings
  const [theme, setTheme] = useState(() => localStorage.getItem('soul_theme') || 'theme-midnight');
  const [searchEngine, setSearchEngine] = useState(() => localStorage.getItem('soul_engine') || 'duckduckgo');
  const [adBlockMode, setAdBlockMode] = useState(() => localStorage.getItem('soul_adblock') || 'standard');
  const [userAgentMode, setUserAgentMode] = useState(() => localStorage.getItem('soul_ua') || 'desktop');
  const [totalAdsBlocked, setTotalAdsBlocked] = useState(148);

  // Tabs Management
  const [tabs, setTabs] = useState(() => {
    const saved = localStorage.getItem('soul_tabs');
    return saved ? JSON.parse(saved) : [INITIAL_TAB];
  });
  const [activeTabId, setActiveTabId] = useState(() => {
    const saved = localStorage.getItem('soul_active_tab');
    return saved || 'tab-1';
  });
  const [isIncognitoActive, setIsIncognitoActive] = useState(false);

  // History & Bookmarks
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('soul_history');
    return saved ? JSON.parse(saved) : [
      { id: 'h1', title: 'Soul Browser Official', url: 'https://html.duckduckgo.com', time: '10:30 AM' },
      { id: 'h2', title: 'Wikipedia - Modern Web Architecture', url: 'https://en.wikipedia.org', time: '11:15 AM' }
    ];
  });

  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('soul_bookmarks');
    return saved ? JSON.parse(saved) : [
      { id: 'b1', title: 'Google', url: 'https://www.google.com' },
      { id: 'b2', title: 'DuckDuckGo', url: 'https://duckduckgo.com' },
      { id: 'b3', title: 'GitHub', url: 'https://github.com' }
    ];
  });

  // Downloads List
  const [downloads, setDownloads] = useState(() => {
    const saved = localStorage.getItem('soul_downloads');
    return saved ? JSON.parse(saved) : [
      { id: 'd1', title: 'Sample_Nature_Clip.mp4', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', type: 'video', format: 'mp4', timestamp: 'Yesterday' }
    ];
  });

  // Modals & Sheets
  const [isTabManagerOpen, setIsTabManagerOpen] = useState(false);
  const [isMediaSnifferOpen, setIsMediaSnifferOpen] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [readerUrl, setReaderUrl] = useState('');
  const [activeVideoModal, setActiveVideoModal] = useState(null); // { url, title }
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [historyBookmarksConfig, setHistoryBookmarksConfig] = useState({ isOpen: false, tab: 'bookmarks' });
  const [isSoulMenuOpen, setIsSoulMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [isPageSourceOpen, setIsPageSourceOpen] = useState(false);
  const [isScreenshotOpen, setIsScreenshotOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('soul_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('soul_engine', searchEngine);
  }, [searchEngine]);

  useEffect(() => {
    localStorage.setItem('soul_adblock', adBlockMode);
  }, [adBlockMode]);

  useEffect(() => {
    localStorage.setItem('soul_ua', userAgentMode);
  }, [userAgentMode]);

  useEffect(() => {
    // Only persist non-incognito tabs
    const nonIncognitoTabs = tabs.filter(t => !t.isIncognito);
    localStorage.setItem('soul_tabs', JSON.stringify(nonIncognitoTabs));
    localStorage.setItem('soul_active_tab', activeTabId);
  }, [tabs, activeTabId]);

  useEffect(() => {
    localStorage.setItem('soul_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('soul_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('soul_downloads', JSON.stringify(downloads));
  }, [downloads]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Active Tab Object
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0] || INITIAL_TAB;

  // Navigation Handlers
  const handleNavigate = (targetUrl) => {
    if (!targetUrl) return;

    setTabs(prev => prev.map(t => {
      if (t.id === activeTab.id) {
        const nextHistory = [...t.history.slice(0, t.historyIndex + 1), targetUrl];
        return {
          ...t,
          url: targetUrl,
          title: targetUrl === 'about:home' ? 'Soul Start' : targetUrl.replace(/^https?:\/\//, '').split('/')[0],
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
          media: { videos: [], audios: [], images: [], files: [] }
        };
      }
      return t;
    }));

    // Record in History if not incognito and not home
    if (!activeTab.isIncognito && targetUrl !== 'about:home') {
      setHistory(prev => [
        {
          id: 'h-' + Date.now(),
          title: targetUrl.replace(/^https?:\/\//, '').split('/')[0],
          url: targetUrl,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev.slice(0, 99)
      ]);
    }

    // Sniff media automatically
    if (targetUrl !== 'about:home') {
      fetch(`/api/sniff?url=${encodeURIComponent(targetUrl)}`)
        .then(r => r.json())
        .then(data => {
          if (data && !data.error) {
            handleUpdateMetadata(activeTab.id, { media: data });
          }
        })
        .catch(() => {});
    }
  };

  const handleGoBack = () => {
    if (activeTab.historyIndex > 0) {
      const nextIndex = activeTab.historyIndex - 1;
      const prevUrl = activeTab.history[nextIndex];
      setTabs(prev => prev.map(t => {
        if (t.id === activeTab.id) {
          return {
            ...t,
            url: prevUrl,
            historyIndex: nextIndex
          };
        }
        return t;
      }));
    }
  };

  const handleGoForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const nextIndex = activeTab.historyIndex + 1;
      const nextUrl = activeTab.history[nextIndex];
      setTabs(prev => prev.map(t => {
        if (t.id === activeTab.id) {
          return {
            ...t,
            url: nextUrl,
            historyIndex: nextIndex
          };
        }
        return t;
      }));
    }
  };

  const handleGoHome = () => {
    handleNavigate('about:home');
  };

  const handleReload = () => {
    const current = activeTab.url;
    setTabs(prev => prev.map(t => {
      if (t.id === activeTab.id) {
        return { ...t, url: '' };
      }
      return t;
    }));
    setTimeout(() => {
      setTabs(prev => prev.map(t => {
        if (t.id === activeTab.id) {
          return { ...t, url: current };
        }
        return t;
      }));
    }, 50);
  };

  // Tab Manager Handlers
  const handleNewTab = (isSecret = isIncognitoActive) => {
    const newTab = {
      id: 'tab-' + Date.now(),
      title: 'Soul Start',
      url: 'about:home',
      favicon: '',
      history: ['about:home'],
      historyIndex: 0,
      isIncognito: isSecret,
      media: { videos: [], audios: [], images: [], files: [] },
      adsBlocked: 0
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setIsTabManagerOpen(false);
  };

  const handleCloseTab = (tabId) => {
    const remaining = tabs.filter(t => t.id !== tabId);
    if (remaining.length === 0) {
      const fresh = INITIAL_TAB;
      setTabs([fresh]);
      setActiveTabId(fresh.id);
    } else {
      setTabs(remaining);
      if (activeTabId === tabId) {
        setActiveTabId(remaining[remaining.length - 1].id);
      }
    }
  };

  const handleCloseAllTabs = () => {
    const fresh = { ...INITIAL_TAB, id: 'tab-' + Date.now(), isIncognito: isIncognitoActive };
    setTabs([fresh]);
    setActiveTabId(fresh.id);
  };

  const handleSwipeTabNext = () => {
    const currentList = tabs.filter(t => t.isIncognito === isIncognitoActive);
    const currIdx = currentList.findIndex(t => t.id === activeTabId);
    if (currIdx !== -1 && currIdx < currentList.length - 1) {
      setActiveTabId(currentList[currIdx + 1].id);
      showToast(`Switched to: ${currentList[currIdx + 1].title}`);
    }
  };

  const handleSwipeTabPrev = () => {
    const currentList = tabs.filter(t => t.isIncognito === isIncognitoActive);
    const currIdx = currentList.findIndex(t => t.id === activeTabId);
    if (currIdx > 0) {
      setActiveTabId(currentList[currIdx - 1].id);
      showToast(`Switched to: ${currentList[currIdx - 1].title}`);
    }
  };

  const handleUpdateMetadata = (tabId, data) => {
    setTabs(prev => prev.map(t => {
      if (t.id === tabId) {
        if (data.adsBlocked) {
          setTotalAdsBlocked(tot => tot + data.adsBlocked);
        }
        return {
          ...t,
          title: data.title || t.title,
          favicon: data.favicon || t.favicon,
          media: data.media ? { ...t.media, ...data.media } : t.media,
          adsBlocked: (t.adsBlocked || 0) + (data.adsBlocked || 0)
        };
      }
      return t;
    }));
  };

  const handleToggleAdBlock = () => {
    const modes = ['standard', 'strict', 'off'];
    const next = modes[(modes.indexOf(adBlockMode) + 1) % modes.length];
    setAdBlockMode(next);
    showToast(`AdBlock Shield: ${next.toUpperCase()}`);
  };

  const handleToggleUserAgent = () => {
    const next = userAgentMode === 'desktop' ? 'mobile' : 'desktop';
    setUserAgentMode(next);
    showToast(`User Agent: ${next.toUpperCase()}`);
    handleReload();
  };

  const handleAddCurrentBookmark = () => {
    if (!activeTab.url || activeTab.url === 'about:home') return;
    const item = {
      id: 'b-' + Date.now(),
      title: activeTab.title || 'Saved Page',
      url: activeTab.url
    };
    setBookmarks(prev => [item, ...prev]);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.9 } });
    showToast('Page Bookmarked Successfully! ★');
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setBookmarks([]);
    setHistory([]);
    setDownloads([]);
    setTabs([INITIAL_TAB]);
    setActiveTabId(INITIAL_TAB.id);
    showToast('All browser cache & history wiped clean.');
  };

  const totalMediaCount = (activeTab.media?.videos?.length || 0) +
    (activeTab.media?.images?.length || 0) +
    (activeTab.media?.audios?.length || 0) +
    (activeTab.media?.files?.length || 0);

  return (
    <div className={`h-screen w-screen flex flex-col ${theme} bg-slate-950 text-slate-100 overflow-hidden relative select-none font-sans`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-sky-600/90 backdrop-blur-md text-white text-xs font-bold shadow-2xl animate-fade-in border border-sky-400/40 flex items-center gap-2">
          <span>⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Address & Search Bar */}
      <TopBar
        currentUrl={activeTab.url}
        isLoading={false}
        onNavigate={handleNavigate}
        onReload={handleReload}
        onOpenMediaSniffer={() => setIsMediaSnifferOpen(true)}
        onOpenReader={() => {
          setReaderUrl(activeTab.url);
          setIsReaderOpen(true);
        }}
        onOpenQRCode={() => setIsQRCodeOpen(true)}
        mediaCount={totalMediaCount}
        adsBlocked={activeTab.adsBlocked || totalAdsBlocked}
        adBlockMode={adBlockMode}
        onToggleAdBlock={handleToggleAdBlock}
        isIncognito={activeTab.isIncognito}
        searchEngine={searchEngine}
        onSelectSearchEngine={setSearchEngine}
      />

      {/* Main Browser Viewport */}
      <main className="flex-1 w-full h-full relative overflow-hidden bg-slate-950">
        {activeTab.url === 'about:home' || !activeTab.url ? (
          <StartPage
            onNavigate={handleNavigate}
            searchEngine={searchEngine}
            adsBlocked={totalAdsBlocked}
            dataSavedMB={28.5}
          />
        ) : (
          <WebView
            key={activeTab.id}
            tab={activeTab}
            isActive={true}
            userAgentMode={userAgentMode}
            adBlockMode={adBlockMode}
            onUpdateMetadata={handleUpdateMetadata}
            onNavigate={handleNavigate}
            onOpenReader={(u) => {
              setReaderUrl(u || activeTab.url);
              setIsReaderOpen(true);
            }}
          />
        )}
      </main>

      {/* Signature Soul Bottom Bar */}
      <BottomBar
        canGoBack={activeTab.historyIndex > 0}
        canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onGoHome={handleGoHome}
        onOpenTabs={() => setIsTabManagerOpen(true)}
        onOpenMenu={() => setIsSoulMenuOpen(true)}
        onOpenMediaSniffer={() => setIsMediaSnifferOpen(true)}
        onOpenDownloads={() => setIsDownloadsOpen(true)}
        onOpenBookmarks={() => setHistoryBookmarksConfig({ isOpen: true, tab: 'bookmarks' })}
        tabCount={tabs.length}
        mediaCount={totalMediaCount}
        isIncognito={activeTab.isIncognito}
        onSwipeTabNext={handleSwipeTabNext}
        onSwipeTabPrev={handleSwipeTabPrev}
      />

      {/* 1. Tab Manager Modal */}
      {isTabManagerOpen && (
        <TabManager
          tabs={tabs}
          activeTabId={activeTabId}
          isIncognito={isIncognitoActive}
          onSelectTab={(id) => {
            setActiveTabId(id);
            setIsTabManagerOpen(false);
          }}
          onCloseTab={handleCloseTab}
          onCloseAllTabs={handleCloseAllTabs}
          onNewTab={() => handleNewTab(isIncognitoActive)}
          onToggleIncognito={(val) => {
            setIsIncognitoActive(val);
          }}
          onCloseManager={() => setIsTabManagerOpen(false)}
        />
      )}

      {/* 2. Media Sniffer Modal (Soul Superpower) */}
      {isMediaSnifferOpen && (
        <MediaSnifferModal
          mediaData={activeTab.media}
          pageTitle={activeTab.title}
          pageUrl={activeTab.url}
          onClose={() => setIsMediaSnifferOpen(false)}
          onPlayVideo={(url, title) => {
            setActiveVideoModal({ url, title });
            setIsMediaSnifferOpen(false);
          }}
          onAddDownload={(item) => {
            setDownloads(prev => [item, ...prev]);
            showToast(`Downloading ${item.title}`);
          }}
        />
      )}

      {/* 3. Soul Gesture Video Player */}
      {activeVideoModal && (
        <SoulVideoPlayer
          videoUrl={activeVideoModal.url}
          videoTitle={activeVideoModal.title}
          onClose={() => setActiveVideoModal(null)}
          onDownload={(item) => {
            setDownloads(prev => [{ ...item, id: 'd-' + Date.now(), timestamp: 'Just now' }, ...prev]);
            showToast(`Download started: ${item.title}`);
          }}
        />
      )}

      {/* 4. Distraction-Free Clean Reader Mode */}
      {isReaderOpen && (
        <ReaderModeModal
          url={readerUrl || activeTab.url}
          onClose={() => setIsReaderOpen(false)}
        />
      )}

      {/* 5. Downloads Center */}
      {isDownloadsOpen && (
        <DownloadsDrawer
          downloads={downloads}
          onClose={() => setIsDownloadsOpen(false)}
          onPlayVideo={(url, title) => setActiveVideoModal({ url, title })}
          onClearDownloads={() => setDownloads([])}
          onDeleteDownload={(id) => setDownloads(prev => prev.filter(d => d.id !== id))}
        />
      )}

      {/* 6. History & Bookmarks */}
      {historyBookmarksConfig.isOpen && (
        <HistoryBookmarksModal
          initialTab={historyBookmarksConfig.tab}
          bookmarks={bookmarks}
          history={history}
          onNavigate={(url) => {
            handleNavigate(url);
            setHistoryBookmarksConfig({ isOpen: false, tab: 'bookmarks' });
          }}
          onAddBookmark={(b) => setBookmarks(prev => [b, ...prev])}
          onDeleteBookmark={(id) => setBookmarks(prev => prev.filter(b => b.id !== id))}
          onClearHistory={() => setHistory([])}
          onDeleteHistoryItem={(id) => setHistory(prev => prev.filter(h => h.id !== id))}
          onClose={() => setHistoryBookmarksConfig({ isOpen: false, tab: 'bookmarks' })}
        />
      )}

      {/* 7. Soul Super Menu Action Sheet */}
      <SoulMenuSheet
        isOpen={isSoulMenuOpen}
        onClose={() => setIsSoulMenuOpen(false)}
        adBlockMode={adBlockMode}
        onToggleAdBlock={handleToggleAdBlock}
        userAgentMode={userAgentMode}
        onToggleUserAgent={handleToggleUserAgent}
        isIncognito={activeTab.isIncognito}
        onToggleIncognito={(val) => {
          handleNewTab(val);
          setIsSoulMenuOpen(false);
        }}
        onOpenReader={() => {
          setReaderUrl(activeTab.url);
          setIsReaderOpen(true);
        }}
        onOpenMediaSniffer={() => setIsMediaSnifferOpen(true)}
        onOpenDownloads={() => setIsDownloadsOpen(true)}
        onOpenBookmarks={() => setHistoryBookmarksConfig({ isOpen: true, tab: 'bookmarks' })}
        onOpenHistory={() => setHistoryBookmarksConfig({ isOpen: true, tab: 'history' })}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQRCode={() => setIsQRCodeOpen(true)}
        onOpenPageSource={() => setIsPageSourceOpen(true)}
        onOpenScreenshot={() => setIsScreenshotOpen(true)}
        onAddCurrentBookmark={handleAddCurrentBookmark}
        currentUrl={activeTab.url}
      />

      {/* 8. Settings & Customization Modal */}
      {isSettingsOpen && (
        <SettingsModal
          currentTheme={theme}
          onChangeTheme={setTheme}
          searchEngine={searchEngine}
          onSelectSearchEngine={setSearchEngine}
          adBlockMode={adBlockMode}
          onChangeAdBlockMode={setAdBlockMode}
          userAgentMode={userAgentMode}
          onChangeUserAgentMode={setUserAgentMode}
          onClearAllData={handleClearAllData}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* 9. QR Code Generator Modal */}
      {isQRCodeOpen && (
        <QRCodeModal
          url={activeTab.url}
          title={activeTab.title}
          onClose={() => setIsQRCodeOpen(false)}
        />
      )}

      {/* 10. Page Source & DOM Modal */}
      {isPageSourceOpen && (
        <PageSourceModal
          url={activeTab.url}
          onClose={() => setIsPageSourceOpen(false)}
        />
      )}

      {/* 11. Page Screenshot Modal */}
      {isScreenshotOpen && (
        <ScreenshotModal
          targetUrl={activeTab.url}
          onClose={() => setIsScreenshotOpen(false)}
        />
      )}
    </div>
  );
}
