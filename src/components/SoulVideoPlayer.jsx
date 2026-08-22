import React, { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sun,
  Camera,
  RotateCcw,
  FastForward,
  Rewind,
  Download,
  Tv,
  Settings,
  Radio,
  Sliders
} from 'lucide-react';

export default function SoulVideoPlayer({
  videoUrl,
  videoTitle = 'Soul Video Player',
  onClose,
  onDownload
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [aspectRatio, setAspectRatio] = useState('contain');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [screenshotSuccess, setScreenshotSuccess] = useState(false);
  const [streamQualityInfo, setStreamQualityInfo] = useState('1080p Full HD');

  // HLS .m3u8 Player Integration
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const isM3U8 = videoUrl.includes('.m3u8') || videoUrl.includes('m3u8');

    if (isM3U8 && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setIsPlaying(true);
        if (hls.levels && hls.levels.length > 0) {
          const maxLevel = hls.levels[hls.levels.length - 1];
          setStreamQualityInfo(`${maxLevel.height || 1080}p HD (HLS Stream)`);
        }
      });
      hlsRef.current = hls;

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (isM3U8 && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple HLS support (Safari/iOS)
      video.src = videoUrl;
      video.play().catch(() => {});
    } else {
      video.src = videoUrl;
      video.play().catch(() => {});
    }
  }, [videoUrl]);

  // Auto-hide controls
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setTimeout(() => setShowControls(false), 3500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, showControls]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleTakeScreenshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1920;
    canvas.height = videoRef.current.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    ctx.filter = `brightness(${brightness})`;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `soul_frame_${Math.floor(currentTime)}s.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setScreenshotSuccess(true);
    setTimeout(() => setScreenshotSuccess(false), 2000);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleSkip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={() => setShowControls(true)}
      onClick={() => setShowControls(prev => !prev)}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
      style={{ filter: `brightness(${brightness})` }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        loop={isLooping}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        className="w-full h-full"
        style={{ objectFit: aspectRatio }}
      />

      {screenshotSuccess && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-sky-500/90 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Camera className="w-5 h-5" />
          <span>Frame Screenshot Saved! (PNG)</span>
        </div>
      )}

      {/* Overlay Player Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute inset-0 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-t from-black/90 via-transparent to-black/80 transition-opacity duration-300 pointer-events-auto ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="truncate max-w-xs sm:max-w-md">
              <h3 className="text-sm font-bold text-white truncate">{videoTitle}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 text-[10px] font-mono font-bold">
                  {streamQualityInfo}
                </span>
                <span className="text-[10px] text-slate-400">Soul Gesture Player</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Take Screenshot */}
            <button
              onClick={handleTakeScreenshot}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition"
              title="Capture Frame Screenshot"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Loop Toggle */}
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-2xl backdrop-blur-md transition ${isLooping ? 'bg-sky-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              title="Repeat Video"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Aspect Ratio Switcher */}
            <button
              onClick={() => {
                const modes = ['contain', 'cover', 'fill'];
                const nextIdx = (modes.indexOf(aspectRatio) + 1) % modes.length;
                setAspectRatio(modes[nextIdx]);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono uppercase backdrop-blur-md transition"
              title="Aspect Ratio"
            >
              {aspectRatio}
            </button>

            {/* Download Button */}
            {onDownload && (
              <button
                onClick={() => onDownload({ url: videoUrl, title: videoTitle, format: 'mp4' })}
                className="p-2 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition"
                title="1DM Download Video"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Center Skip & Play Controls */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => handleSkip(-10)}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition transform active:scale-90"
            title="Rewind 10s"
          >
            <Rewind className="w-6 h-6" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shadow-2xl shadow-sky-600/50 transition transform active:scale-95"
          >
            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>

          <button
            onClick={() => handleSkip(10)}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition transform active:scale-90"
            title="Fast Forward 10s"
          >
            <FastForward className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Controls Bar */}
        <div className="space-y-2">
          {/* Progress Timeline Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-300">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <span className="text-xs font-mono text-slate-400">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            {/* Gesture Sliders (Brightness & Volume) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Volume2 className="w-4 h-4" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (videoRef.current) videoRef.current.volume = v;
                  }}
                  className="w-16 sm:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
                <Sun className="w-4 h-4" />
                <input
                  type="range"
                  min={0.3}
                  max={1.8}
                  step={0.1}
                  value={brightness}
                  onChange={(e) => setBrightness(parseFloat(e.target.value))}
                  className="w-16 sm:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* Playback Speeds */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl backdrop-blur-md">
              {[0.75, 1, 1.5, 2, 3].map(speed => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold font-mono transition ${
                    playbackSpeed === speed ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
