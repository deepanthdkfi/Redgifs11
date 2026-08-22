import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, QrCode as QrIcon, Copy, ExternalLink, Check } from 'lucide-react';

export default function QRCodeModal({ url, title, onClose }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 240,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [url]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 w-full max-w-sm flex flex-col items-center space-y-4 shadow-2xl">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <QrIcon className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Scan with Mobile</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Canvas */}
        <div className="bg-white p-3 rounded-2xl shadow-inner">
          <canvas ref={canvasRef} className="rounded-xl"></canvas>
        </div>

        <div className="text-center space-y-1 max-w-full">
          <div className="text-xs font-bold text-slate-200 truncate">{title || 'Webpage'}</div>
          <div className="text-[11px] text-slate-400 font-mono truncate px-2">{url}</div>
        </div>

        <div className="flex items-center gap-2 w-full pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied URL' : 'Copy URL'}</span>
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
