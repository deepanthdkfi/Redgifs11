import React, { useState } from 'react';
import {
  X,
  Play,
  Download,
  Video,
  Image as ImageIcon,
  Music,
  FileText,
  Copy,
  Check,
  Sparkles,
  Layers,
  ExternalLink,
  PackageCheck
} from 'lucide-react';

export default function MediaSnifferModal({
  mediaData = { videos: [], audios: [], images: [], files: [] },
  pageTitle = 'Current Page',
  pageUrl = '',
  onClose,
  onPlayVideo,
  onAddDownload
}) {
  const [activeTab, setActiveTab] = useState('videos');
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [isZipping, setIsZipping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const videos = mediaData.videos || [];
  const audios = mediaData.audios || [];
  const images = mediaData.images || [];
  const files = mediaData.files || [];

  const totalCount = videos.length + audios.length + images.length + files.length;

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSelectImage = (url) => {
    const next = new Set(selectedImages);
    if (next.has(url)) next.delete(url);
    else next.add(url);
    setSelectedImages(next);
  };

  const handleSelectAllImages = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map(img => img.url)));
    }
  };

  const handleBatchDownloadImages = async () => {
    if (selectedImages.size === 0) return;
    setIsZipping(true);
    try {
      const resp = await fetch('/api/download/zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: Array.from(selectedImages),
          zipName: `soul_images_${Date.now()}.zip`
        })
      });
      const blob = await resp.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `soul_images_bundle_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('Failed to package zip: ' + e.message);
    } finally {
      setIsZipping(false);
    }
  };

  const triggerDirectDownload = (item) => {
    onAddDownload({
      id: 'dl-' + Date.now(),
      title: item.title || 'Soul_Download',
      url: item.url,
      type: item.type || 'video',
      format: item.format || 'mp4',
      size: item.resolution || 'Auto',
      timestamp: new Date().toLocaleTimeString()
    });

    const a = document.createElement('a');
    a.href = item.url;
    a.download = (item.title || 'download').replace(/[^a-zA-Z0-9_-]/g, '_') + '.' + (item.format || 'mp4');
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <header className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Soul Media Sniffer</h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-bold font-mono">
                  {totalCount} Found
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-sm sm:max-w-md">{pageTitle || pageUrl}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Tab Selection */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'videos' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos ({videos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('images')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'images' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Images ({images.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audios')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'audios' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Audio ({audios.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'files' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Files ({files.length})</span>
            </button>
          </div>

          {/* Batch Image Actions */}
          {activeTab === 'images' && images.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAllImages}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold px-2 py-1"
              >
                {selectedImages.size === images.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedImages.size > 0 && (
                <button
                  onClick={handleBatchDownloadImages}
                  disabled={isZipping}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold shadow transition"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>{isZipping ? 'Zipping...' : `Download Zip (${selectedImages.size})`}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* VIDEOS TAB */}
          {activeTab === 'videos' && (
            <div>
              {videos.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Video className="w-12 h-12 stroke-1" />
                  <p className="text-sm font-medium">No video elements detected on this webpage.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map(v => (
                    <div key={v.id} className="glass-card rounded-2xl p-4 flex flex-col justify-between space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-20 h-16 rounded-xl bg-slate-950 flex items-center justify-center shrink-0 overflow-hidden relative border border-slate-800">
                          {v.poster ? (
                            <img src={v.poster} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Video className="w-6 h-6 text-sky-400" />
                          )}
                          <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-mono text-white">
                            {v.format.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">{v.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-sky-400">{v.resolution}</span>
                            <span className="truncate max-w-[150px]">{v.format}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => onPlayVideo(v.url, v.title)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Soul Player</span>
                        </button>

                        <button
                          onClick={() => triggerDirectDownload(v)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>

                        <button
                          onClick={() => handleCopy(v.url, v.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title="Copy Link"
                        >
                          {copiedId === v.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* IMAGES TAB */}
          {activeTab === 'images' && (
            <div>
              {images.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <ImageIcon className="w-12 h-12 stroke-1" />
                  <p className="text-sm font-medium">No high-resolution images sniffed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {images.map(img => {
                    const isSelected = selectedImages.has(img.url);
                    return (
                      <div
                        key={img.id}
                        onClick={() => handleToggleSelectImage(img.url)}
                        className={`group relative rounded-2xl overflow-hidden bg-slate-950 border cursor-pointer transition ${
                          isSelected ? 'border-sky-500 ring-2 ring-sky-500/40 shadow-lg' : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="h-32 w-full overflow-hidden bg-slate-900">
                          <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            loading="lazy"
                          />
                        </div>

                        {/* Selection Checkbox */}
                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition ${
                          isSelected ? 'bg-sky-500 text-white' : 'bg-black/60 text-transparent border border-white/40'
                        }`}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>

                        {/* Quick 1-click download on hover */}
                        <div className="p-2 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="truncate">{img.format.toUpperCase()}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerDirectDownload(img);
                            }}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-sky-600 text-white transition"
                            title="Download Image"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* AUDIOS TAB */}
          {activeTab === 'audios' && (
            <div className="space-y-3">
              {audios.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Music className="w-12 h-12 stroke-1" />
                  <p className="text-sm font-medium">No audio tracks detected.</p>
                </div>
              ) : (
                audios.map(a => (
                  <div key={a.id} className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <Music className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-slate-100 truncate">{a.title}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">{a.format.toUpperCase()} Audio</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <audio controls src={a.url} className="h-8 max-w-[200px]" />
                      <button
                        onClick={() => triggerDirectDownload(a)}
                        className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition"
                        title="Download Audio"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* FILES TAB */}
          {activeTab === 'files' && (
            <div className="space-y-3">
              {files.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <FileText className="w-12 h-12 stroke-1" />
                  <p className="text-sm font-medium">No downloadable documents found on this page.</p>
                </div>
              ) : (
                files.map(f => (
                  <div key={f.id} className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-slate-100 truncate">{f.title}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">Type: {f.format.toUpperCase()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => triggerDirectDownload(f)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
