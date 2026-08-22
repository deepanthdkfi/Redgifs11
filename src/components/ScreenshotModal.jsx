import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import { X, Camera, Download, RefreshCw, Check } from 'lucide-react';

export default function ScreenshotModal({ targetUrl, onClose }) {
  const [screenshotData, setScreenshotData] = useState(null);
  const [isCapturing, setIsCapturing] = useState(true);

  useEffect(() => {
    // Capture document viewport or app shell
    const capture = async () => {
      try {
        setIsCapturing(true);
        const canvas = await html2canvas(document.body, {
          backgroundColor: '#020617',
          scale: 1.5,
          logging: false
        });
        setScreenshotData(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Screenshot capture failed', err);
      } finally {
        setIsCapturing(false);
      }
    };

    setTimeout(capture, 300);
  }, []);

  const handleDownload = () => {
    if (!screenshotData) return;
    const a = document.createElement('a');
    a.href = screenshotData;
    a.download = `soul_snapshot_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Page Snapshot Preview</h3>
              <p className="text-[11px] text-slate-400">High-definition screenshot capture</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {screenshotData && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PNG</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Image Preview Container */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950 flex items-center justify-center">
          {isCapturing ? (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-mono">Rendering high-res snapshot...</span>
            </div>
          ) : screenshotData ? (
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl max-h-full">
              <img src={screenshotData} alt="Snapshot" className="max-h-[60vh] w-auto object-contain" />
            </div>
          ) : (
            <p className="text-xs text-red-400">Failed to render snapshot.</p>
          )}
        </div>
      </div>
    </div>
  );
}
