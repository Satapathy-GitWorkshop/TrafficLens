/**
 * TrafficLens Universal Tracker v1.0.0
 * Works on any website: React, Vue, Angular, WordPress, PHP, plain HTML, etc.
 * 
 * Usage:
 * <script>
 *   (function(t,r,a,f,i,c,l,e,n,s){
 *     t.TrafficLens=t.TrafficLens||{};
 *     t.TrafficLens.siteKey=i;
 *     t.TrafficLens.apiUrl=a;
 *     var sc=r.createElement('script');
 *     sc.src=f;sc.async=true;
 *     r.head.appendChild(sc);
 *   })(window,document,'https://your-api.com','https://your-cdn.com/tracker.js','YOUR_SITE_KEY');
 * </script>
 */

(function(window, document) {
  'use strict';

  var TL = window.TrafficLens || {};
  var siteKey = TL.siteKey;
  var apiUrl = (TL.apiUrl || 'http://localhost:8080') + '/api/ingest/event';

  if (!siteKey) {
    console.warn('[TrafficLens] No siteKey provided');
    return;
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + value + '; expires=' + expires + '; path=/; SameSite=Lax';
  }

  function getUtmParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign')
    };
  }

  function getVisitorId() {
    var vid = getCookie('_tl_vid');
    if (!vid) {
      vid = generateId();
      setCookie('_tl_vid', vid, 365);
    }
    return vid;
  }

  function getSessionId() {
    var sid = sessionStorage.getItem('_tl_sid');
    if (!sid) {
      sid = generateId();
      sessionStorage.setItem('_tl_sid', sid);
    }
    return sid;
  }

  function getReferrer() {
    try {
      var ref = document.referrer;
      if (!ref) return '';
      var url = new URL(ref);
      return url.hostname;
    } catch (e) {
      return document.referrer || '';
    }
  }

  // ─── Core Send Function ───────────────────────────────────────────────────

  function send(eventType, extra) {
    var utms = getUtmParams();
    var payload = Object.assign({
      siteKey: siteKey,
      eventType: eventType,
      url: window.location.href,
      referrer: getReferrer(),
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      utmSource: utms.utmSource,
      utmMedium: utms.utmMedium,
      utmCampaign: utms.utmCampaign,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }, extra || {});

    // Use sendBeacon when available for reliability (especially on page unload)
    var json = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      var blob = new Blob([json], { type: 'application/json' });
      navigator.sendBeacon(apiUrl, blob);
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', apiUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(json);
    }
  }

  // ─── Page View Tracking ───────────────────────────────────────────────────

  var pageStartTime = Date.now();

  function trackPageView() {
    pageStartTime = Date.now();
    send('pageview');
  }

  // Track initial page load
  trackPageView();

  // ─── SPA / Single Page App Support ───────────────────────────────────────
  // Intercept history pushState and replaceState for React, Vue, Angular, etc.

  var originalPushState = history.pushState;
  var originalReplaceState = history.replaceState;

  history.pushState = function() {
    originalPushState.apply(this, arguments);
    setTimeout(trackPageView, 0);
  };

  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
  };

  window.addEventListener('popstate', function() {
    setTimeout(trackPageView, 0);
  });

  // ─── Session Duration ─────────────────────────────────────────────────────

  window.addEventListener('beforeunload', function() {
    var duration = Math.round((Date.now() - pageStartTime) / 1000);
    send('session_end', { durationSeconds: duration });
  });

  // ─── Scroll Depth Tracking ────────────────────────────────────────────────

  var maxScroll = 0;
  var scrollTimer;

  function onScroll() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      var pct = Math.round((scrollTop / docHeight) * 100);
      if (pct > maxScroll) {
        maxScroll = pct;
        // Send at milestones: 25%, 50%, 75%, 90%
        if ([25, 50, 75, 90].indexOf(pct) !== -1) {
          send('scroll', { scrollDepth: pct });
        }
      }
    }, 200);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ─── Click Tracking ───────────────────────────────────────────────────────

  document.addEventListener('click', function(e) {
    var target = e.target;
    // Track outbound link clicks
    while (target && target.tagName !== 'A') target = target.parentElement;
    if (target && target.href) {
      try {
        var linkUrl = new URL(target.href);
        var isOutbound = linkUrl.hostname !== window.location.hostname;
        if (isOutbound) {
          send('click', {
            customEventName: 'outbound_click',
            customEventData: { href: target.href, text: target.textContent }
          });
        }
      } catch (err) {}
    }
  }, true);

  // ─── Custom Event API ─────────────────────────────────────────────────────

  /**
   * TrafficLens.track('event_name', { key: 'value' })
   * Works from any framework - React, Vue, plain JS
   */
  TL.track = function(eventName, data) {
    send('custom', {
      customEventName: eventName,
      customEventData: data || {}
    });
  };

  /**
   * TrafficLens.identify('user_id') - track logged in users
   */
  TL.identify = function(userId) {
    setCookie('_tl_uid', userId, 365);
  };

  window.TrafficLens = TL;

  // ─── Visibility Change (tab switch) ──────────────────────────────────────

  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      var duration = Math.round((Date.now() - pageStartTime) / 1000);
      send('visibility_hidden', { durationSeconds: duration });
    } else {
      pageStartTime = Date.now();
    }
  });

})(window, document);
