import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw, ExternalLink, ShieldAlert, BookOpen, AlertCircle } from 'lucide-react';

export default function WebView({
  tab,
  isActive,
  userAgentMode = 'desktop',
  adBlockMode = 'standard',
  onUpdateMetadata,
  onNavigate,
  onOpenReader
}) {
  const iframeRef = useRef(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoadingInternal, setIsLoadingInternal] = useState(true);

  const proxyUrl = tab.url && tab.url !== 'about:home'
    ? `/api/proxy?url=${encodeURIComponent(tab.url)}&ua=${userAgentMode}&adblock=${adBlockMode}`
    : null;

  useEffect(() => {
    setIsLoadingInternal(true);
    setLoadError(false);
  }, [tab.url, userAgentMode, adBlockMode]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'SOUL_PAGE_DATA' && isActive) {
        onUpdateMetadata(tab.id, {
          title: event.data.title || tab.title,
          favicon: event.data.favicon || tab.favicon,
          media: event.data.media || { videos: [], audios: [], images: [] },
          adsBlocked: event.data.adsBlocked || 0
        });
        setIsLoadingInternal(false);
      }

      if (event.data.type === 'SOUL_NAVIGATE' && isActive) {
        onNavigate(event.data.url);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [tab.id, isActive, tab.title, tab.favicon, onUpdateMetadata, onNavigate]);

  const handleIframeLoad = () => {
    setIsLoadingInternal(false);
  };

  const handleIframeError = () => {
    setIsLoadingInternal(false);
    setLoadError(true);
  };

  if (!proxyUrl) return null;

  return (
    <div className={`relative w-full h-full bg-slate-950 flex flex-col ${isActive ? 'block' : 'hidden'}`}>
      {/* Loading Indicator */}
      {isLoadingInternal && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xs font-semibold text-slate-400">Loading {new URL(tab.url || 'https://google.com').hostname}...</p>
        </div>
      )}

      {/* Main Iframe Viewer */}
      {!loadError ? (
        <iframe
          ref={iframeRef}
          src={proxyUrl}
          title={tab.title}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      ) : (
        /* Error Fallback view */
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-950 text-center">
          <div className="max-w-md p-6 rounded-3xl glass-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Unable to load webpage inside proxy</h3>
            <p className="text-xs text-slate-400">
              The website <span className="font-mono text-sky-400">{tab.url}</span> enforces strict frame or bot protection.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <a
                href={tab.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
              >
                <span>Open in Native Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => onOpenReader(tab.url)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Try Reader Mode</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
