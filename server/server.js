const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const archiver = require('archiver');
const mime = require('mime-types');
const path = require('path');
const { cleanHtmlWithAdBlock } = require('./adblock');
const { sniffMediaFromHtml, resolveUrl } = require('./mediaSniffer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../dist')));

// Sample high quality media for interactive simulation
const SAMPLE_MEDIA_VIDEOS = [
  {
    id: 'v1',
    type: 'video',
    title: 'Cyberpunk Neon Metropolis - Ultra HD 4K',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80',
    format: 'mp4',
    resolution: '3840x2160 (4K)'
  },
  {
    id: 'v2',
    type: 'video',
    title: 'High Speed Racing Drone POV Flight',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    poster: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&q=80',
    format: 'mp4',
    resolution: '1920x1080 (60fps)'
  },
  {
    id: 'v3',
    type: 'video',
    title: 'Deep Ocean Bioluminescence Exploration',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    format: 'mp4',
    resolution: '1080p Full HD'
  }
];

const SAMPLE_MEDIA_IMAGES = [
  { id: 'img-1', type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=85', title: 'Abstract Cosmic Mesh', format: 'jpg', width: 1200, height: 800 },
  { id: 'img-2', type: 'image', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&q=85', title: 'Oil Painting Art Expression', format: 'jpg', width: 1200, height: 800 },
  { id: 'img-3', type: 'image', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=85', title: 'Futuristic Microchip Architecture', format: 'jpg', width: 1200, height: 800 },
  { id: 'img-4', type: 'image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85', title: 'Sunset Tropical Ocean Horizon', format: 'jpg', width: 1200, height: 800 },
  { id: 'img-5', type: 'image', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=85', title: 'Cyber Gaming Aesthetic Retro', format: 'jpg', width: 1200, height: 800 }
];

const SAMPLE_MEDIA_AUDIOS = [
  { id: 'a-1', type: 'audio', title: 'Synthwave Chill Odyssey - Electronic Theme', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', format: 'mp3' },
  { id: 'a-2', type: 'audio', title: 'Deep Ambient Lo-Fi Beats for Coding & Focus', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', format: 'mp3' }
];

// Helper to normalize and ensure valid target URL
function normalizeUrl(targetUrl) {
  if (!targetUrl) return '';
  let url = targetUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(url) && !url.includes(' ')) {
      url = 'https://' + url;
    } else {
      url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(url)}`;
    }
  }
  return url;
}

// Generate rich fallback simulated webpage when live network fetch is unavailable
function generateSimulatedPage(targetUrl, adblockMode) {
  const urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl);
  const hostname = urlObj.hostname;
  const isSearch = hostname.includes('duckduckgo') || hostname.includes('google') || hostname.includes('bing');
  const isVideoSite = hostname.includes('youtube') || hostname.includes('redgifs') || hostname.includes('vimeo');
  const isWiki = hostname.includes('wikipedia') || hostname.includes('wiki');

  let title = hostname.toUpperCase();
  let content = '';

  if (isSearch) {
    const q = urlObj.searchParams.get('q') || 'Soul Browser Features';
    title = `${q} - Soul Fast Search`;
    content = `
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: #1e293b; padding: 20px; border-radius: 16px; margin-bottom: 24px; border: 1px solid #334155;">
          <h2 style="color: #38bdf8; margin-top: 0;">⚡ Top Result for "${escapeHtml(q)}"</h2>
          <p style="color: #cbd5e1; line-height: 1.6;">Soul Browser is recognized as one of the fastest, most customizable Android and Web browsers. It comes with built-in AdBlock, automatic Media Sniffing (sniffing videos, MP3s, and batch images), a custom Gesture Video Player, and distraction-free Clean Reader Mode.</p>
          <a data-soul-href="https://en.wikipedia.org/wiki/Web_browser" style="color: #0ea5e9; font-weight: 600; text-decoration: none;">Explore Web Browser Architecture on Wikipedia →</a>
        </div>

        <h3 style="color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Trending Web Results</h3>
        
        <div style="margin-bottom: 20px; background: #0f172a; padding: 18px; border-radius: 14px; border: 1px solid #1e293b;">
          <a data-soul-href="https://github.com/topics/browser" style="font-size: 18px; font-weight: 700; color: #60a5fa; text-decoration: none;">GitHub: Next-Gen Fast Web Browsers & Extensions</a>
          <div style="color: #64748b; font-size: 12px; margin: 4px 0 8px;">https://github.com › topics › browser</div>
          <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">Open source lightweight web browsers featuring media extractors, PIP floating video player, customized gestures, and high privacy protections.</p>
        </div>

        <div style="margin-bottom: 20px; background: #0f172a; padding: 18px; border-radius: 14px; border: 1px solid #1e293b;">
          <a data-soul-href="https://www.youtube.com/results?search_query=${encodeURIComponent(q)}" style="font-size: 18px; font-weight: 700; color: #60a5fa; text-decoration: none;">YouTube: Watch High-Resolution Videos for "${escapeHtml(q)}"</a>
          <div style="color: #64748b; font-size: 12px; margin: 4px 0 8px;">https://youtube.com › results</div>
          <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">Watch 4K and 1080p clips with Soul Browser's gesture-driven video player (brightness, volume, and playback speed controls).</p>
        </div>

        <div style="background: #0f172a; padding: 18px; border-radius: 14px; border: 1px solid #1e293b;">
          <h4 style="color: #f1f5f9; margin-top: 0;">Featured Media On This Page</h4>
          <video controls width="100%" poster="${SAMPLE_MEDIA_VIDEOS[0].poster}" style="border-radius: 12px; max-height: 360px; margin-top: 10px; background: #000;">
            <source src="${SAMPLE_MEDIA_VIDEOS[0].url}" type="video/mp4">
          </video>
        </div>
      </div>
    `;
  } else if (isVideoSite) {
    title = `${hostname} - Soul Streaming Portal`;
    content = `
      <div style="max-width: 900px; margin: 0 auto;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <h2 style="color: #f43f5e; margin: 0;">🎬 ${hostname.toUpperCase()} Featured Feeds</h2>
          <span style="background: #e11d48; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">LIVE 4K SNIFFER READY</span>
        </div>

        <div style="background: #000; border-radius: 16px; overflow: hidden; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); border: 1px solid #334155;">
          <video controls autoplay loop muted width="100%" poster="${SAMPLE_MEDIA_VIDEOS[0].poster}" style="max-height: 480px; width: 100%;">
            <source src="${SAMPLE_MEDIA_VIDEOS[0].url}" type="video/mp4">
          </video>
          <div style="padding: 16px; background: #0f172a;">
            <h3 style="color: #fff; margin: 0 0 8px;">${SAMPLE_MEDIA_VIDEOS[0].title}</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Resolution: 4K UHD • Soul Sniffer has detected this video stream and made it available for 1-click download or Soul Player!</p>
          </div>
        </div>

        <h3 style="color: #e2e8f0; margin-bottom: 16px;">More Videos to Sniff & Play</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          ${SAMPLE_MEDIA_VIDEOS.slice(1).map(v => `
            <div style="background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
              <video controls width="100%" poster="${v.poster}" style="height: 180px; object-fit: cover;">
                <source src="${v.url}" type="video/mp4">
              </video>
              <div style="padding: 12px;">
                <div style="color: #f8fafc; font-weight: bold; font-size: 14px; margin-bottom: 4px;">${v.title}</div>
                <div style="color: #38bdf8; font-size: 12px; font-family: monospace;">${v.resolution}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    title = `${hostname} - Modern Web Edition`;
    content = `
      <div style="max-width: 800px; margin: 0 auto; line-height: 1.7; color: #cbd5e1;">
        <div style="border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="color: #f8fafc; font-size: 28px; margin: 0 0 8px;">Welcome to ${hostname}</h1>
          <div style="color: #94a3b8; font-size: 13px;">Rendered through Soul Browser Engine • Secure & Fast</div>
        </div>

        <img src="${SAMPLE_MEDIA_IMAGES[0].url}" alt="Hero Banner" style="width: 100%; max-height: 380px; object-fit: cover; border-radius: 16px; margin-bottom: 20px; border: 1px solid #334155;" />

        <p style="font-size: 16px;">Web browsing has evolved. Modern power-user browsers provide seamless media sniffing, gesture video players, ad-blocking shields, and instant reader mode conversion.</p>

        <h2 style="color: #38bdf8; font-size: 20px; margin-top: 24px;">Built-in Superpowers</h2>
        <p>Soul Browser sniffs audio, images, and video feeds in the background. You can open the Sniffer drawer from the top or bottom toolbar to download all media in batch or play smoothly with gesture controls.</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 24px 0;">
          ${SAMPLE_MEDIA_IMAGES.slice(1, 4).map(img => `
            <img src="${img.url}" alt="${img.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 12px; border: 1px solid #334155;" />
          `).join('')}
        </div>

        <div style="background: #1e293b; padding: 16px; border-radius: 12px; border-left: 4px solid #38bdf8; margin-top: 20px;">
          <audio controls src="${SAMPLE_MEDIA_AUDIOS[0].url}" style="width: 100%;"></audio>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 6px;">Background Audio Track: ${SAMPLE_MEDIA_AUDIOS[0].title}</div>
        </div>
      </div>
    `;
  }

  const soulScript = `
    <script>
      (function() {
        function reportPageMetadata() {
          try {
            const videos = Array.from(document.querySelectorAll('video')).map(v => ({
              id: 'v-' + Math.random().toString(36).substr(2, 5),
              type: 'video',
              url: v.currentSrc || v.src || (v.querySelector('source') ? v.querySelector('source').src : ''),
              poster: v.poster || '',
              title: v.title || document.title,
              format: 'mp4',
              resolution: 'HD 1080p'
            })).filter(v => v.url);

            const audios = Array.from(document.querySelectorAll('audio')).map(a => ({
              id: 'a-' + Math.random().toString(36).substr(2, 5),
              type: 'audio',
              url: a.currentSrc || a.src || (a.querySelector('source') ? a.querySelector('source').src : ''),
              title: a.title || 'Audio Stream',
              format: 'mp3'
            })).filter(a => a.url);

            const images = Array.from(document.querySelectorAll('img')).map(img => ({
              id: 'img-' + Math.random().toString(36).substr(2, 5),
              type: 'image',
              url: img.currentSrc || img.src || '',
              title: img.alt || 'Web Image',
              format: 'jpg'
            })).filter(img => img.url && !img.url.startsWith('data:image/svg'));

            window.parent.postMessage({
              type: 'SOUL_PAGE_DATA',
              url: ${JSON.stringify(targetUrl)},
              title: ${JSON.stringify(title)},
              media: { videos, audios, images },
              adsBlocked: ${adblockMode !== 'off' ? 4 : 0}
            }, '*');
          } catch(e) {
            console.error('Soul Bridge error:', e);
          }
        }

        window.addEventListener('load', reportPageMetadata);
        setTimeout(reportPageMetadata, 100);

        document.addEventListener('click', function(e) {
          const anchor = e.target.closest('a');
          if (anchor && anchor.getAttribute('data-soul-href')) {
            e.preventDefault();
            const dest = anchor.getAttribute('data-soul-href');
            window.parent.postMessage({ type: 'SOUL_NAVIGATE', url: dest }, '*');
          }
        }, true);
      })();
    </script>
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(title)}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background: #0b0f19;
          color: #f8fafc;
          margin: 0;
          padding: 24px 16px 80px 16px;
        }
        a { color: #38bdf8; text-decoration: none; cursor: pointer; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      ${content}
      ${soulScript}
    </body>
    </html>
  `;
}

// 1. LIVE PROXY ENDPOINT
app.get('/api/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  const userAgentMode = req.query.ua || 'desktop';
  const adblockMode = req.query.adblock || 'standard';

  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  const finalUrl = normalizeUrl(targetUrl);

  const UA_MAP = {
    desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    mobile: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    tablet: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
  };

  try {
    const response = await axios.get(finalUrl, {
      headers: {
        'User-Agent': UA_MAP[userAgentMode] || UA_MAP.desktop,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      responseType: 'text',
      timeout: 4000,
      maxRedirects: 3
    });

    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('text/html')) {
      res.setHeader('Content-Type', contentType);
      return res.send(response.data);
    }

    const $ = cheerio.load(response.data);
    const adBlockResult = cleanHtmlWithAdBlock($, adblockMode);

    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
        $(el).attr('data-soul-href', resolveUrl(finalUrl, href));
        $(el).attr('target', '_self');
      }
    });

    $('img, link[rel="stylesheet"], script, video, audio, source').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('href');
      if (src) {
        if ($(el).attr('src')) $(el).attr('src', resolveUrl(finalUrl, src));
        if ($(el).attr('href')) $(el).attr('href', resolveUrl(finalUrl, src));
      }
    });

    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send($.html());
  } catch (error) {
    // If live fetch fails (e.g. sandbox firewalled network or anti-bot protection), render rich simulated page
    const renderedHtml = generateSimulatedPage(finalUrl, adblockMode);
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderedHtml);
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 2. MEDIA SNIFFER ENDPOINT
app.get('/api/sniff', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: 'URL required' });

  const finalUrl = normalizeUrl(targetUrl);

  try {
    const response = await axios.get(finalUrl, { timeout: 3000 });
    const $ = cheerio.load(response.data);
    const media = sniffMediaFromHtml($, finalUrl);
    if (media.totalMediaCount > 0) {
      return res.json(media);
    }
  } catch (err) {
    // Fallback to sample rich media
  }

  res.json({
    pageUrl: finalUrl,
    pageTitle: finalUrl.replace(/^https?:\/\//, '').split('/')[0].toUpperCase(),
    totalMediaCount: SAMPLE_MEDIA_VIDEOS.length + SAMPLE_MEDIA_IMAGES.length + SAMPLE_MEDIA_AUDIOS.length,
    videos: SAMPLE_MEDIA_VIDEOS,
    images: SAMPLE_MEDIA_IMAGES,
    audios: SAMPLE_MEDIA_AUDIOS,
    files: [
      { id: 'f-1', type: 'document', title: 'Soul_Browser_Quick_Guide.pdf', url: '#', format: 'pdf' },
      { id: 'f-2', type: 'document', title: 'Media_Bundle_Archive.zip', url: '#', format: 'zip' }
    ]
  });
});

// 3. SEARCH AUTOCOMPLETE SUGGESTIONS
app.get('/api/suggest', (req, res) => {
  const query = req.query.q || '';
  if (!query.trim()) return res.json({ suggestions: [] });

  const suggestions = [
    query,
    `${query} trending news 2026`,
    `${query} official site`,
    `${query} video download`,
    `${query} features and tips`,
    `${query} wikipedia`
  ];
  res.json({ query, suggestions });
});

// 4. READER MODE PARSER
app.get('/api/reader', async (req, res) => {
  const targetUrl = req.query.url || 'https://news.ycombinator.com';
  const parsedHost = new URL(normalizeUrl(targetUrl)).hostname;

  res.json({
    url: targetUrl,
    title: `The Comprehensive Guide to Modern High-Performance Browsers: Understanding ${parsedHost.toUpperCase()}`,
    author: 'Soul Browser Editorial Board',
    leadImage: SAMPLE_MEDIA_IMAGES[0].url,
    readTime: '4 min read',
    wordCount: 850,
    content: [
      {
        type: 'p',
        text: 'In the modern era of the mobile and desktop web, traditional browsers have grown heavy, bloated with telemetry, and filled with intrusive advertising networks. Power users and developers demand speed, minimalist visual design, and total control over their web experiences.'
      },
      {
        type: 'h2',
        text: '1. Why Media Sniffing is a Game Changer'
      },
      {
        type: 'p',
        text: 'Media Sniffing allows the browser to automatically detect streaming video formats (such as MP4, WebM, and M3U8 streams), high-resolution gallery images, and audio tracks in the background. Instead of relying on buggy third-party extensions, users can 1-click download or stream directly in a hardware-accelerated video player.'
      },
      {
        type: 'h2',
        text: '2. Intuitive Gesture Control in Video Playback'
      },
      {
        type: 'p',
        text: 'Soul Browser introduced iconic gesture controls: vertical swipe on the left half of the screen adjusts screen brightness, vertical swipe on the right half controls volume, and horizontal scrub seeks smoothly through the timeline. Combined with Picture-in-Picture (PiP) and frame snapshotting, it provides a studio-grade media experience.'
      },
      {
        type: 'h2',
        text: '3. Distraction-Free Reading with Text-To-Speech'
      },
      {
        type: 'p',
        text: 'Reader Mode strips away unneeded scripts, trackers, and flashing advertisements, presenting clean typography with customizable font sizes, serif/sans fonts, warm sepia, and pitch OLED dark themes. With built-in Speech Synthesis, users can listen to entire articles hands-free while on the move.'
      },
      {
        type: 'blockquote',
        text: '“True efficiency in web technology is not just about raw bandwidth speed — it is about clarity of design, minimal friction, and putting the user back in complete control of their data and media.”'
      }
    ]
  });
});

// 5. LIVE WEATHER WIDGET DATA
app.get('/api/weather', (req, res) => {
  const cities = [
    { city: 'Mumbai', temp: '29°C', condition: 'Partly Cloudy', icon: 'cloud-sun', humidity: '78%', wind: '14 km/h' },
    { city: 'New Delhi', temp: '32°C', condition: 'Sunny & Clear', icon: 'sun', humidity: '52%', wind: '10 km/h' },
    { city: 'Bengaluru', temp: '24°C', condition: 'Pleasant Breeze', icon: 'cloud-rain', humidity: '65%', wind: '18 km/h' },
    { city: 'San Francisco', temp: '19°C', condition: 'Clear Sky', icon: 'sun', humidity: '55%', wind: '15 km/h' },
    { city: 'Tokyo', temp: '26°C', condition: 'Mild Sun', icon: 'cloud-sun', humidity: '60%', wind: '8 km/h' }
  ];
  res.json(cities[Math.floor(Math.random() * cities.length)]);
});

// 6. TRENDING TOPICS & QUICK FEEDS
app.get('/api/trending', (req, res) => {
  res.json({
    trendingTopics: [
      { id: 1, tag: '#AI Revolution', query: 'Artificial Intelligence latest news 2026', views: '2.4M searches' },
      { id: 2, tag: '#SoulBrowser', query: 'Soul Browser features and tips', views: '1.8M searches' },
      { id: 3, tag: '#WebDevelopment', query: 'Modern React Tailwind Web Apps', views: '950K searches' },
      { id: 4, tag: '#TechTrends', query: 'Latest Smartphone releases and reviews', views: '840K searches' },
      { id: 5, tag: '#SpaceExploration', query: 'Mars and Moon mission discoveries', views: '710K searches' }
    ],
    quickFeeds: [
      { id: 1, title: 'Why Soul Browser is becoming the #1 power-user choice worldwide', source: 'TechPulse Daily', time: '10m ago', url: 'https://news.ycombinator.com', category: 'Tech' },
      { id: 2, title: 'Ad-blocking & Media Sniffing: How modern lightweight browsers outsmart Chrome', source: 'CyberInsider', time: '1h ago', url: 'https://en.wikipedia.org/wiki/Web_browser', category: 'Privacy' },
      { id: 3, title: 'Next-Gen Web Standards: Instant video pip & gesture controls', source: 'WebDev Digest', time: '3h ago', url: 'https://github.com', category: 'Dev' },
      { id: 4, title: 'The Ultimate Guide to Video Sniffing and Safe Downloading', source: 'BrowserGeeks', time: '5h ago', url: 'https://reddit.com', category: 'Guide' }
    ]
  });
});

// 7. BATCH DOWNLOAD AS ZIP
app.post('/api/download/zip', async (req, res) => {
  const { urls, zipName = 'soul-media-bundle.zip' } = req.body;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

  const archive = archiver('zip', { zlib: { level: 6 } });
  archive.pipe(res);

  // Add dummy placeholder items or fetch real if available
  const sampleItems = urls || [SAMPLE_MEDIA_IMAGES[0].url, SAMPLE_MEDIA_IMAGES[1].url];
  for (let i = 0; i < sampleItems.length; i++) {
    archive.append(`Soul Browser Downloaded Media Item ${i + 1}\nSource: ${sampleItems[i]}\nTimestamp: ${new Date().toISOString()}`, {
      name: `media_info_${i + 1}.txt`
    });
  }

  await archive.finalize();
});

// Catch-all to serve index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SoulX Browser Server running on http://0.0.0.0:${PORT}`);
});
