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
  PackageCheck,
  ShieldCheck,
  Radio,
  SlidersHorizontal,
  Smartphone
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
  const [selectedQualities, setSelectedQualities] = useState({});
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
      alert('Download zip error: ' + e.message);
    } finally {
      setIsZipping(false);
    }
  };

  const triggerVideoDownload = (v) => {
    const chosenQuality = selectedQualities[v.id] || (v.qualities && v.qualities[0]?.quality) || '1080p Full HD';
    const cleanTitle = (v.title || 'SoulX_Video').replace(/[^a-zA-Z0-9_-]/g, '_');

    onAddDownload({
      id: 'dl-' + Date.now(),
      title: `${cleanTitle} [${chosenQuality}]`,
      url: v.url,
      type: 'video',
      format: v.isM3U8 ? 'm3u8 -> mp4' : (v.format || 'mp4'),
      size: chosenQuality,
      timestamp: 'Just now'
    });

    // 1DM Direct Stream & M3U8 Conversion download link
    const downloadEndpoint = `/api/download/m3u8?url=${encodeURIComponent(v.url)}&quality=${encodeURIComponent(chosenQuality)}&title=${encodeURIComponent(cleanTitle)}`;
    const a = document.createElement('a');
    a.href = downloadEndpoint;
    a.download = `${cleanTitle}.mp4`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const triggerAudioOrFileDownload = (item) => {
    onAddDownload({
      id: 'dl-' + Date.now(),
      title: item.title || 'Soul_Download',
      url: item.url,
      type: item.type || 'audio',
      format: item.format || 'mp3',
      timestamp: 'Just now'
    });

    const a = document.createElement('a');
    a.href = item.url;
    a.download = (item.title || 'download').replace(/[^a-zA-Z0-9_-]/g, '_') + '.' + (item.format || 'mp3');
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Soul 1DM Media Sniffer</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                  Zero Popups
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-bold font-mono">
                  {totalCount} Streams Found
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-sm sm:max-w-md">{pageTitle || pageUrl}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/SoulX-Browser-v2.5.0.apk"
              download="SoulX-Browser-v2.5.0.apk"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow transition"
              title="Download SoulX Android APK"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Get APK (v2.5)</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Tab Selection Bar */}
        <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'videos' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos & M3U8 ({videos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('images')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'images' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Images ({images.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audios')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'audios' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Audio ({audios.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'files' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>APK & Files ({files.length})</span>
            </button>
          </div>

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
                  <span>{isZipping ? 'Packaging...' : `Download Zip (${selectedImages.size})`}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* VIDEOS TAB (1DM Style with Quality Selector & M3U8 Fetcher) */}
          {activeTab === 'videos' && (
            <div className="space-y-4">
              {videos.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Video className="w-12 h-12 stroke-1" />
                  <p className="text-sm font-medium">No video streams detected on this webpage.</p>
                </div>
              ) : (
                videos.map(v => {
                  const currentQual = selectedQualities[v.id] || (v.qualities && v.qualities[0]?.quality) || '1080p Full HD';
                  return (
                    <div key={v.id} className="glass-card rounded-2xl p-4 flex flex-col space-y-3 border border-slate-800 hover:border-sky-500/40 transition">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-24 h-16 rounded-xl bg-slate-950 flex items-center justify-center shrink-0 overflow-hidden relative border border-slate-800">
                            {v.poster ? (
                              <img src={v.poster} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Video className="w-7 h-7 text-sky-400" />
                            )}
                            <span className="absolute bottom-1 right-1 px-1 rounded bg-black/90 text-[9px] font-mono text-sky-400 font-bold">
                              {v.isM3U8 ? 'HLS M3U8' : 'MP4 4K'}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-100 truncate">{v.title}</h4>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono shrink-0">
                                Original Stream
                              </span>
                            </div>

                            <div className="flex items-center flex-wrap gap-2 mt-1.5 text-xs text-slate-400">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 font-mono font-bold">
                                {v.resolution}
                              </span>
                              <span className="font-mono text-[11px] text-slate-400 truncate max-w-[200px]">
                                {v.url}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 1DM Multi-Quality Bitrate Selector */}
                        {v.qualities && v.qualities.length > 0 && (
                          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-stretch sm:self-center">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400 shrink-0 ml-1" />
                            <select
                              value={currentQual}
                              onChange={(e) => setSelectedQualities({ ...selectedQualities, [v.id]: e.target.value })}
                              className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none pr-2 cursor-pointer"
                            >
                              {v.qualities.map((q, idx) => (
                                <option key={idx} value={q.quality} className="bg-slate-900 text-slate-100">
                                  {q.quality} ({q.resolution})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        {/* Play in Soul Player */}
                        <button
                          onClick={() => onPlayVideo(v.url, v.title)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play in Soul Player</span>
                        </button>

                        {/* 1DM 1-Click Stream Download */}
                        <button
                          onClick={() => triggerVideoDownload(v)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>1DM Download ({currentQual.split(' ')[0]})</span>
                        </button>

                        {/* Copy Source Link */}
                        <button
                          onClick={() => handleCopy(v.url, v.id)}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title="Copy Direct Stream URL"
                        >
                          {copiedId === v.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* IMAGES TAB */}
          {activeTab === 'images' && (
            <div>
              {images.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <ImageIcon className="w-12 h-12 stroke-1" />
                  <p className="text-sm font-medium">No gallery images found.</p>
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

                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition ${
                          isSelected ? 'bg-sky-500 text-white' : 'bg-black/60 text-transparent border border-white/40'
                        }`}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>

                        <div className="p-2 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="truncate">{img.format.toUpperCase()}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerAudioOrFileDownload(img);
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
                        <span className="text-[11px] text-slate-400 font-mono">{a.format.toUpperCase()} 320kbps</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <audio controls src={a.url} className="h-8 max-w-[200px]" />
                      <button
                        onClick={() => triggerAudioOrFileDownload(a)}
                        className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition"
                        title="Download MP3"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* FILES & APK TAB */}
          {activeTab === 'files' && (
            <div className="space-y-3">
              {/* SoulX Official APK Card */}
              <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-purple-500/40 bg-purple-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-500/30">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">SoulX Browser Android APK (v2.5.0)</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">
                        Official Release
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Standalone Android installation package with Zero-Popup Guard & 1DM Sniffer.</p>
                  </div>
                </div>

                <a
                  href="/SoulX-Browser-v2.5.0.apk"
                  download="SoulX-Browser-v2.5.0.apk"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition self-stretch sm:self-center justify-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download APK (Direct)</span>
                </a>
              </div>

              {files.map(f => (
                <div key={f.id} className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-sm font-bold text-slate-100 truncate">{f.title}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">Format: {f.format.toUpperCase()}</span>
                    </div>
                  </div>
                  <a
                    href={f.url}
                    download
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
