import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sun,
  Moon,
  Type,
  Clock,
  User,
  Share2,
  Sparkles
} from 'lucide-react';

export default function ReaderModeModal({
  url,
  onClose
}) {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Styling settings
  const [theme, setTheme] = useState('oled'); // 'light' | 'sepia' | 'dark' | 'oled'
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('serif'); // 'sans' | 'serif' | 'mono'

  // Text to Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1);
  const synthRef = useRef(window.speechSynthesis || null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`/api/reader?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setArticle(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });

    return () => {
      if (synthRef.current && isSpeaking) {
        synthRef.current.cancel();
      }
    };
  }, [url]);

  const handleToggleSpeech = () => {
    if (!synthRef.current || !article) return;

    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    } else {
      const fullText = article.title + '. ' + (article.content || []).map(p => p.text).join(' ');
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = speechSpeed;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return 'bg-[#faf8f5] text-[#2d3748] border-[#e2e8f0]';
      case 'sepia':
        return 'bg-[#f4ecd8] text-[#5b4636] border-[#d8cbaf]';
      case 'dark':
        return 'bg-[#1e293b] text-[#e2e8f0] border-[#334155]';
      case 'oled':
      default:
        return 'bg-[#000000] text-[#f1f5f9] border-[#1e293b]';
    }
  };

  const getFontFamilyStyle = () => {
    if (fontFamily === 'serif') return { fontFamily: 'var(--font-serif)' };
    if (fontFamily === 'mono') return { fontFamily: 'var(--font-mono)' };
    return { fontFamily: 'var(--font-sans)' };
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-xl animate-fade-in select-none">
      {/* Top Header Bar */}
      <header className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-white">Soul Clean Reader</span>
        </div>

        {/* Reader Customization Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* TTS Read Aloud Button */}
          <button
            onClick={handleToggleSpeech}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              isSpeaking
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isSpeaking ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Pause Audio' : 'Read Aloud'}</span>
          </button>

          {/* Theme Switcher */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setTheme('light')}
              className={`w-6 h-6 rounded-lg bg-[#faf8f5] text-black text-[10px] font-bold ${theme === 'light' ? 'ring-2 ring-sky-400' : ''}`}
              title="Light Mode"
            >
              A
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`w-6 h-6 rounded-lg bg-[#f4ecd8] text-[#5b4636] text-[10px] font-bold ${theme === 'sepia' ? 'ring-2 ring-sky-400' : ''}`}
              title="Warm Sepia"
            >
              A
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`w-6 h-6 rounded-lg bg-[#1e293b] text-white text-[10px] font-bold ${theme === 'dark' ? 'ring-2 ring-sky-400' : ''}`}
              title="Dark Slate"
            >
              A
            </button>
            <button
              onClick={() => setTheme('oled')}
              className={`w-6 h-6 rounded-lg bg-black text-white text-[10px] font-bold ${theme === 'oled' ? 'ring-2 ring-sky-400' : ''}`}
              title="Pitch OLED"
            >
              A
            </button>
          </div>

          {/* Font Size controls */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="px-2 py-0.5 text-xs text-slate-300 hover:text-white font-bold"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-xs font-mono text-slate-400">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(28, fontSize + 2))}
              className="px-2 py-0.5 text-xs text-slate-300 hover:text-white font-bold"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Font Family selector */}
          <button
            onClick={() => {
              const fonts = ['serif', 'sans', 'mono'];
              const next = fonts[(fonts.indexOf(fontFamily) + 1) % fonts.length];
              setFontFamily(next);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 uppercase transition"
          >
            {fontFamily}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Reader Content Body */}
      <div className={`flex-1 overflow-y-auto ${getThemeClasses()} transition-colors duration-200 select-text`}>
        <div className="max-w-2xl mx-auto px-6 py-12 space-y-6" style={getFontFamilyStyle()}>
          {isLoading && (
            <div className="h-96 flex flex-col items-center justify-center space-y-3 select-none">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-mono">Parsing clean article text...</p>
            </div>
          )}

          {error && (
            <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-red-300 text-center space-y-2 select-none">
              <p className="font-bold">Failed to load reader mode.</p>
              <p className="text-xs">{error}</p>
            </div>
          )}

          {article && (
            <>
              {/* Article Header */}
              <div className="space-y-4 border-b pb-6 border-current/10">
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs opacity-75 font-sans">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{article.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span>{article.wordCount} words</span>
                  </div>
                </div>
              </div>

              {/* Lead Image if available */}
              {article.leadImage && (
                <div className="rounded-2xl overflow-hidden my-6 border border-current/10 shadow-lg select-none">
                  <img src={article.leadImage} alt="" className="w-full h-auto object-cover max-h-96" />
                </div>
              )}

              {/* Article Content Paragraphs */}
              <div className="space-y-5 leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
                {(article.content || []).map((block, idx) => {
                  if (block.type === 'h2') {
                    return <h2 key={idx} className="text-xl font-bold pt-4 font-sans">{block.text}</h2>;
                  }
                  if (block.type === 'h3') {
                    return <h3 key={idx} className="text-lg font-bold pt-2 font-sans">{block.text}</h3>;
                  }
                  if (block.type === 'blockquote') {
                    return (
                      <blockquote key={idx} className="border-l-4 border-amber-500 pl-4 italic opacity-90 my-3">
                        {block.text}
                      </blockquote>
                    );
                  }
                  return (
                    <p key={idx} className="text-justify leading-relaxed">
                      {block.text}
                    </p>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
