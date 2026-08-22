// AdBlock & Tracker Protection Engine for Soul Browser

const AD_DOMAINS = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'adnxs.com',
  'taboola.com',
  'outbrain.com',
  'popads.net',
  'popcash.net',
  'adroll.com',
  'criteo.com',
  'rubiconproject.com',
  'scorecardresearch.com',
  'quantserve.com',
  'amazon-adsystem.com',
  'moatads.com',
  'adcolony.com',
  'applovin.com',
  'unityads.unity3d.com',
  'vungle.com',
  'inmobi.com',
  'admob.com',
  'facebook.net/en_US/fbevents.js',
  'connect.facebook.net',
  'hotjar.com',
  'clarity.ms',
  'smartlook.com'
];

const AD_SELECTORS = [
  'script[src*="pagead2.googlesyndication.com"]',
  'script[src*="doubleclick.net"]',
  'script[src*="adservice.google"]',
  'script[src*="adnxs.com"]',
  'script[src*="taboola.com"]',
  'script[src*="outbrain.com"]',
  'ins.adsbygoogle',
  'div[id^="google_ads_"]',
  'div[id^="div-gpt-ad"]',
  'div[class*="ad-container"]',
  'div[class*="ad-banner"]',
  'div[class*="ad_wrapper"]',
  'div[class*="advertisement"]',
  'div[class*="sponsored-post"]',
  'div[id*="taboola-"]',
  'div[id*="outbrain_"]',
  'aside[class*="ad-"]',
  '.adsbox',
  '.ad-placement',
  '#ad-unit'
];

function isAdUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return AD_DOMAINS.some(domain => lower.includes(domain));
}

function cleanHtmlWithAdBlock($, mode = 'standard') {
  let blockedCount = 0;

  if (mode === 'off') {
    return { count: 0 };
  }

  // Remove ad scripts
  $('script').each((i, el) => {
    const src = $(el).attr('src') || '';
    const content = $(el).html() || '';
    if (isAdUrl(src) || content.includes('adsbygoogle') || content.includes('googletag.display') || content.includes('taboola')) {
      $(el).remove();
      blockedCount++;
    }
  });

  // Remove ad iframes
  $('iframe').each((i, el) => {
    const src = $(el).attr('src') || '';
    if (isAdUrl(src) || src.includes('ads') || src.includes('banner')) {
      $(el).remove();
      blockedCount++;
    }
  });

  // Remove ad elements by selectors
  AD_SELECTORS.forEach(selector => {
    try {
      const els = $(selector);
      if (els.length > 0) {
        blockedCount += els.length;
        els.remove();
      }
    } catch (e) {
      // ignore selector syntax errors
    }
  });

  // Strict mode removes more potential trackers and promotional popups
  if (mode === 'strict') {
    $('div[class*="promo"], div[id*="promo"], div[class*="newsletter-popup"], div[class*="cookie-banner"]').each((i, el) => {
      $(el).remove();
      blockedCount++;
    });
  }

  return { count: blockedCount };
}

module.exports = {
  isAdUrl,
  cleanHtmlWithAdBlock,
  AD_DOMAINS
};
