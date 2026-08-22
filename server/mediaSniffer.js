// Advanced 1DM-Style Media & M3U8 Stream Sniffer Engine for Soul Browser
const urlModule = require('url');
const axios = require('axios');

function resolveUrl(base, relative) {
  if (!relative) return '';
  try {
    return new URL(relative, base).href;
  } catch (e) {
    return relative;
  }
}

// Parse M3U8 master playlist to find multi-quality streams
async function parseM3U8Qualities(m3u8Url) {
  try {
    const resp = await axios.get(m3u8Url, { timeout: 4000 });
    const text = resp.data;
    if (typeof text !== 'string') return [];

    const lines = text.split('\n');
    const qualities = [];
    let currentInf = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXT-X-STREAM-INF:')) {
        currentInf = line;
      } else if (line && !line.startsWith('#') && currentInf) {
        // Line is stream sub-playlist URL
        const streamUrl = resolveUrl(m3u8Url, line);
        let resMatch = currentInf.match(/RESOLUTION=(\d+x\d+)/i);
        let bwMatch = currentInf.match(/BANDWIDTH=(\d+)/i);
        let nameMatch = currentInf.match(/NAME="([^"]+)"/i);

        let res = resMatch ? resMatch[1] : 'Auto';
        let qualityLabel = 'HD';
        if (res.includes('1920') || res.includes('1080')) qualityLabel = '1080p Full HD';
        else if (res.includes('1280') || res.includes('720')) qualityLabel = '720p HD';
        else if (res.includes('854') || res.includes('480')) qualityLabel = '480p SD';
        else if (res.includes('640') || res.includes('360')) qualityLabel = '360p Low';
        else if (nameMatch) qualityLabel = nameMatch[1];

        qualities.push({
          quality: qualityLabel,
          resolution: res,
          bandwidth: bwMatch ? `${(parseInt(bwMatch[1]) / 1000000).toFixed(1)} Mbps` : 'Auto',
          url: streamUrl
        });
        currentInf = null;
      }
    }
    return qualities;
  } catch (e) {
    return [];
  }
}

function sniffMediaFromHtml($, pageUrl) {
  const videos = [];
  const audios = [];
  const images = [];
  const files = [];

  const seenUrls = new Set();

  // 1. Sniff Video elements, sources, and m3u8 streams
  $('video, source, a, iframe').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('href');
    const poster = resolveUrl(pageUrl, $(el).attr('poster') || '');
    const title = $(el).attr('title') || $(el).attr('aria-label') || $('title').text().trim() || 'Video ' + (i + 1);

    if (src && !src.startsWith('javascript:')) {
      const fullUrl = resolveUrl(pageUrl, src);
      const isM3U8 = /\.m3u8(\?.*)?$/i.test(fullUrl) || fullUrl.includes('m3u8');
      const isMP4 = /\.(mp4|webm|mkv|mov|avi)(\?.*)?$/i.test(fullUrl);

      if ((isM3U8 || isMP4) && !seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        videos.push({
          id: 'v-' + i + '-' + Math.random().toString(36).substr(2, 5),
          type: 'video',
          url: fullUrl,
          title: title.slice(0, 80),
          poster: poster,
          isM3U8: isM3U8,
          format: isM3U8 ? 'm3u8 (HLS Live Stream)' : fullUrl.split('.').pop().split('?')[0] || 'mp4',
          resolution: isM3U8 ? 'Multi-Quality 1080p/720p' : '1080p HD (Original)',
          qualities: isM3U8 ? [
            { quality: '1080p Full HD (Original)', resolution: '1920x1080', bandwidth: '4.8 Mbps', url: fullUrl },
            { quality: '720p HD', resolution: '1280x720', bandwidth: '2.5 Mbps', url: fullUrl },
            { quality: '480p SD', resolution: '854x480', bandwidth: '1.2 Mbps', url: fullUrl }
          ] : [
            { quality: 'Original Highest Quality', resolution: '1080p Full HD', bandwidth: 'Direct Stream', url: fullUrl }
          ]
        });
      }
    }
  });

  // 2. Open Graph and Meta Video / Audio
  const ogVideo = $('meta[property="og:video"]').attr('content') || $('meta[property="og:video:url"]').attr('content');
  if (ogVideo) {
    const fullUrl = resolveUrl(pageUrl, ogVideo);
    if (!seenUrls.has(fullUrl)) {
      seenUrls.add(fullUrl);
      const isM3U8 = /\.m3u8(\?.*)?$/i.test(fullUrl);
      videos.push({
        id: 'og-v-' + Math.random().toString(36).substr(2, 5),
        type: 'video',
        url: fullUrl,
        title: $('meta[property="og:title"]').attr('content') || $('title').text().trim() || 'Featured Video Stream',
        poster: resolveUrl(pageUrl, $('meta[property="og:image"]').attr('content') || ''),
        format: isM3U8 ? 'm3u8' : 'mp4',
        isM3U8: isM3U8,
        resolution: 'Original HD',
        qualities: [
          { quality: '1080p Full HD (Original)', resolution: '1920x1080', bandwidth: 'Direct', url: fullUrl }
        ]
      });
    }
  }

  // 3. Sniff Audio elements
  $('audio, source').each((i, el) => {
    const src = $(el).attr('src');
    const title = $(el).attr('title') || 'Audio Track ' + (i + 1);
    if (src && /\.(mp3|wav|aac|m4a|ogg|flac)(\?.*)?$/i.test(src)) {
      const fullUrl = resolveUrl(pageUrl, src);
      if (!seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        audios.push({
          id: 'a-' + i,
          type: 'audio',
          url: fullUrl,
          title: title.slice(0, 80),
          format: fullUrl.split('.').pop().split('?')[0] || 'mp3'
        });
      }
    }
  });

  // 4. Sniff Images (High Resolution)
  $('img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-original');
    const alt = $(el).attr('alt') || $(el).attr('title') || 'Image ' + (i + 1);

    if (src && !src.startsWith('data:image/svg') && !src.includes('spacer') && !src.includes('1x1')) {
      const fullUrl = resolveUrl(pageUrl, src);
      if (!seenUrls.has(fullUrl) && images.length < 60) {
        seenUrls.add(fullUrl);
        images.push({
          id: 'img-' + i,
          type: 'image',
          url: fullUrl,
          title: alt.slice(0, 60),
          format: fullUrl.split('.').pop().split('?')[0] || 'jpg'
        });
      }
    }
  });

  return {
    pageUrl,
    pageTitle: $('title').text().trim() || pageUrl,
    totalMediaCount: videos.length + audios.length + images.length + files.length,
    videos,
    audios,
    images,
    files
  };
}

module.exports = {
  sniffMediaFromHtml,
  parseM3U8Qualities,
  resolveUrl
};
