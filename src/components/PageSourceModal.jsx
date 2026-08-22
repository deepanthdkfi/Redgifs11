import React, { useState, useEffect } from 'react';
import { X, Code, Copy, Check, Search, Download } from 'lucide-react';

export default function PageSourceModal({ url, onClose }) {
  const [sourceCode, setSourceCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/proxy?url=${encodeURIComponent(url)}`)
      .then(res => res.text())
      .then(text => {
        setSourceCode(text);
        setIsLoading(false);
      })
      .catch(e => {
        setSourceCode('<!-- Failed to load source: ' + e.message + ' -->');
        setIsLoading(false);
      });
  }, [url]);

  const handleCopy = () => {
    navigator.clipboard.writeText(sourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sourceCode], { type: 'text/html' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = `source_${Date.now()}.html`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Page Source & DOM Inspector</h3>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs sm:max-w-md">{url}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Download HTML"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Source viewer */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-300 select-text leading-relaxed">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-500">
              <span>Loading raw HTML source...</span>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap word-break">{sourceCode}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
