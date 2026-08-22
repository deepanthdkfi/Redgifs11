// Advanced Media Sniffer Engine for Soul Browser
const urlModule = require('url');

function resolveUrl(base, relative) {
  if (!relative) return '';
  try {
    return new URL(relative, base).href;
  } catch (e) {
    return relative;
  }
}

function sniffMediaFromHtml($, pageUrl) {
  const videos = [];
  const audios = [];
  const images = [];
  const files = [];

  const seenUrls = new Set();

  // 1. Sniff Video elements and sources
  $('video').each((i, el) => {
    const src = $(el).attr('src');
    const poster = resolveUrl(pageUrl, $(el).attr('poster') || '');
    const title = $(el).attr('title') || $(el).attr('aria-label') || $('title').text().trim() || 'Video ' + (i + 1);

    if (src) {
      const fullUrl = resolveUrl(pageUrl, src);
      if (!seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        videos.push({
          id: 'v-' + i + '-' + Math.random().toString(36).substr(2, 5),
          type: 'video',
          url: fullUrl,
          title: title.slice(0, 80),
          poster: poster,
          format: fullUrl.split('.').pop().split('?')[0] || 'mp4',
          resolution: $(el).attr('width') ? `${$(el).attr('width')}x${$(el).attr('height')}` : 'Auto / HD'
        });
      }
    }

    $(el).find('source').each((j, srcEl) => {
      const sourceSrc = $(srcEl).attr('src');
      const type = $(srcEl).attr('type') || 'video/mp4';
      if (sourceSrc) {
        const fullUrl = resolveUrl(pageUrl, sourceSrc);
        if (!seenUrls.has(fullUrl)) {
          seenUrls.add(fullUrl);
          videos.push({
            id: 'vs-' + i + '-' + j + '-' + Math.random().toString(36).substr(2, 5),
            type: 'video',
            url: fullUrl,
            title: (title || 'Video stream ' + (j + 1)).slice(0, 80),
            poster: poster,
            format: type.split('/')[1] || fullUrl.split('.').pop().split('?')[0] || 'mp4',
            resolution: $(srcEl).attr('size') || 'HD'
          });
        }
      }
    });
  });

  // 2. Open Graph and Meta Video / Audio
  const ogVideo = $('meta[property="og:video"]').attr('content') || $('meta[property="og:video:url"]').attr('content');
  if (ogVideo) {
    const fullUrl = resolveUrl(pageUrl, ogVideo);
    if (!seenUrls.has(fullUrl)) {
      seenUrls.add(fullUrl);
      videos.push({
        id: 'og-v-' + Math.random().toString(36).substr(2, 5),
        type: 'video',
        url: fullUrl,
        title: $('meta[property="og:title"]').attr('content') || $('title').text().trim() || 'Featured Video',
        poster: resolveUrl(pageUrl, $('meta[property="og:image"]').attr('content') || ''),
        format: 'mp4',
        resolution: 'Web / HD'
      });
    }
  }

  // Check RedGifs or common video hosting embeds
  $('iframe').each((i, el) => {
    const src = $(el).attr('src') || '';
    if (src.includes('redgifs.com/ifr/') || src.includes('youtube.com/embed/') || src.includes('player.vimeo.com/')) {
      const fullUrl = resolveUrl(pageUrl, src);
      if (!seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        videos.push({
          id: 'embed-' + i,
          type: 'video',
          url: fullUrl,
          title: 'Embedded Stream Player ' + (i + 1),
          poster: '',
          format: 'stream',
          resolution: 'Adaptive'
        });
      }
    }
  });

  // 3. Sniff Audio elements
  $('audio').each((i, el) => {
    const src = $(el).attr('src');
    const title = $(el).attr('title') || 'Audio Track ' + (i + 1);
    if (src) {
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

    $(el).find('source').each((j, srcEl) => {
      const sourceSrc = $(srcEl).attr('src');
      if (sourceSrc) {
        const fullUrl = resolveUrl(pageUrl, sourceSrc);
        if (!seenUrls.has(fullUrl)) {
          seenUrls.add(fullUrl);
          audios.push({
            id: 'as-' + i + '-' + j,
            type: 'audio',
            url: fullUrl,
            title: title + ' (' + (j + 1) + ')',
            format: fullUrl.split('.').pop().split('?')[0] || 'mp3'
          });
        }
      }
    });
  });

  // 4. Sniff Images (Filter icons and tiny pixels)
  $('img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-original');
    const alt = $(el).attr('alt') || $(el).attr('title') || 'Image ' + (i + 1);
    const width = parseInt($(el).attr('width') || '0', 10);
    const height = parseInt($(el).attr('height') || '0', 10);

    if (src && !src.startsWith('data:image/svg') && !src.includes('spacer') && !src.includes('1x1')) {
      const fullUrl = resolveUrl(pageUrl, src);
      if (!seenUrls.has(fullUrl) && images.length < 50) {
        seenUrls.add(fullUrl);
        images.push({
          id: 'img-' + i,
          type: 'image',
          url: fullUrl,
          title: alt.slice(0, 60),
          width: width || 'auto',
          height: height || 'auto',
          format: fullUrl.split('.').pop().split('?')[0] || 'jpg'
        });
      }
    }
  });

  // 5. Sniff Downloadable Links (.pdf, .zip, .apk, .mp4, .mp3, etc.)
  $('a[href]').each((i, el) => {
    const href = $(el).attr('href') || '';
    const extMatch = href.match(/\.(mp4|webm|mkv|mp3|wav|pdf|zip|rar|tar|apk|exe|docx|xlsx)(\?.*)?$/i);
    if (extMatch) {
      const fullUrl = resolveUrl(pageUrl, href);
      if (!seenUrls.has(fullUrl) && files.length < 25) {
        seenUrls.add(fullUrl);
        const ext = extMatch[1].toLowerCase();
        files.push({
          id: 'file-' + i,
          type: ext.match(/mp4|webm|mkv/) ? 'video' : ext.match(/mp3|wav/) ? 'audio' : 'document',
          url: fullUrl,
          title: $(el).text().trim() || href.split('/').pop().split('?')[0] || 'File Download',
          format: ext
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
  resolveUrl
};
