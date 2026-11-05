// Adsterra display ads for the GitHub Pages build.
// Banners load in a same-origin frame (/assets/ad-frame.html) so every unit gets its
// own atOptions, are requested only after window load and only when near the viewport
// (keeps the tab spinner and page speed clean), and are removed again if nothing renders.
(function () {
  'use strict';
  var KEYS = {
    '728x90':  'dd00822f23057cfa25666294c29c0f08',
    '468x60':  'fc504d99815889a0b9fc336ca2a91486',
    '320x50':  '2bcaaf26053891d4c9b477c0b56fb36a',
    '300x250': 'f020ba2ae27813e8196786433d858428',
    '160x600': '41561dae710815e79ec31942fc32f652',
    '160x300': '6dd2e1a39548758b95f9782755a454d2'
  };
  var NATIVE = '43f99fb8dbcdb37037dd2810a803933f';
  var LADDERS = {
    horizontal: [[728, 90], [468, 60], [320, 50]],
    rect: [[300, 250]]
  };
  if (/[?&]noads=1/.test(location.search)) return;

  function pick(kind, width) {
    var l = LADDERS[kind] || LADDERS.horizontal;
    for (var i = 0; i < l.length; i++) if (l[i][0] <= width) return l[i];
    return null;
  }

  function mount(box) {
    if (box.dataset.mounted) return;
    var width = box.clientWidth || (box.parentElement ? box.parentElement.clientWidth : 0);
    var size = pick(box.getAttribute('data-ad'), width);
    box.dataset.mounted = '1';
    if (!size) { box.remove(); return; }
    box.style.minHeight = size[1] + 'px';
    var f = document.createElement('iframe');
    f.src = '/assets/ad-frame.html?k=' + KEYS[size[0] + 'x' + size[1]] + '&w=' + size[0] + '&h=' + size[1];
    f.title = 'Advertisement';
    f.setAttribute('scrolling', 'no');
    f.setAttribute('frameborder', '0');
    f.width = size[0]; f.height = size[1];
    f.style.cssText = 'display:block;border:0;overflow:hidden;margin:0 auto;width:' + size[0] + 'px;height:' + size[1] + 'px';
    box.appendChild(f);
    [3000, 6000, 12000].forEach(function (ms, i, arr) {
      setTimeout(function () {
        if (box.classList.contains('ad-filled') || !box.parentNode) return;
        var ok = false;
        try {
          var kids = f.contentDocument.body.children;
          for (var k = 0; k < kids.length; k++) {
            if (kids[k].tagName !== 'SCRIPT' && kids[k].getBoundingClientRect().height > 10) { ok = true; break; }
          }
        } catch (e) {}
        if (ok) box.classList.add('ad-filled');
        else if (i === arr.length - 1) box.remove();
      }, ms);
    });
  }

  function slot(kind) {
    var d = document.createElement('div');
    d.className = 'ad-slot';
    d.setAttribute('data-ad', kind);
    d.setAttribute('aria-label', 'Advertisement');
    return d;
  }

  function place() {
    var main = document.querySelector('main');
    if (!main) return [];
    var made = [];
    function before(el, kind) { if (el && el.parentNode) { var s = slot(kind); el.parentNode.insertBefore(s, el); made.push(s); } }
    var inVault = function (el) { return el.closest && el.closest('#vault-overlay'); };
    var secs = Array.prototype.filter.call(main.querySelectorAll('section'), function (s) { return !inVault(s); });
    var heads = Array.prototype.filter.call(main.querySelectorAll('h2'), function (h) { return !inVault(h); });
    var home = document.body.classList.contains('page-home') || !!document.querySelector('section.hero');
    if (home) {
      // after the hero/calculator, then before every second content section
      if (secs[1]) before(secs[1], 'horizontal');
      if (secs[3]) before(secs[3], 'rect');
      if (secs[6]) before(secs[6], 'horizontal');
    } else {
      if (heads[1]) before(heads[1], 'horizontal');
      if (heads[3]) before(heads[3], 'rect');
      if (heads[5]) before(heads[5], 'horizontal');
    }
    // one above the footer on every page
    var foot = document.querySelector('footer');
    if (foot) before(foot, 'horizontal');
    return made;
  }

  function nativeBanner() {
    var header = document.querySelector('header');
    if (!header || !header.parentNode) return;
    var wrap = document.createElement('div');
    wrap.className = 'ad-native-wrap';
    wrap.setAttribute('aria-label', 'Sponsored');
    var c = document.createElement('div');
    c.id = 'container-' + NATIVE;
    wrap.appendChild(c);
    header.parentNode.insertBefore(wrap, header.nextSibling);
    var s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.src = 'https://bauval.org/21/' + NATIVE;
    document.body.appendChild(s);
  }

  function init() {
    nativeBanner();
    var boxes = place();
    if (!('IntersectionObserver' in window)) { boxes.forEach(mount); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); mount(e.target); } });
    }, { rootMargin: '350px 0px' });
    boxes.forEach(function (b) { io.observe(b); });
  }

  if (document.readyState === 'complete') setTimeout(init, 0);
  else window.addEventListener('load', function () { setTimeout(init, 0); }, { once: true });
})();
