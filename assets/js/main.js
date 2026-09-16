/* ================================================================
   SolveCalc — Calculator + Vault System
   ================================================================ */

// ── Calculator state ─────────────────────────────────────────────
let expr          = '';
let lastResult    = null;
let vaultMode     = false;
let vaultCode     = '';
let calcAngleMode = 'DEG';
let calcLastExpr  = '';

const display   = document.getElementById('calc-display');
const exprLine  = document.getElementById('calc-expr');
const toggleBtn = document.getElementById('vault-toggle'); // checkbox

function updateDisplay(val) { display.textContent = val === '' ? '0' : val; }
function updateExpr(val)    { exprLine.textContent = val; }

// ── Calculator functions ──────────────────────────────────────────
function calcDigit(d) {
  if (vaultMode) { enterVaultDigit(d); return; }
  if (lastResult !== null) { expr = d; lastResult = null; }
  else expr += d;
  updateDisplay(expr); updateExpr('');
}

function calcDot() {
  if (vaultMode) return;
  // Only add dot if last number doesn't already have one
  const parts = expr.split(/[+\-×÷]/);
  if (parts[parts.length - 1].includes('.')) return;
  expr += expr === '' ? '0.' : '.';
  updateDisplay(expr); lastResult = null;
}

function calcOp(op) {
  if (vaultMode) return;
  lastResult = null;
  if (expr === '' && op !== '-') return;
  // Replace trailing operator
  if (expr && '+-×÷'.includes(expr.slice(-1))) expr = expr.slice(0, -1);
  expr += op;
  updateDisplay(expr);
}

function calcParen(p) {
  if (vaultMode) return;
  lastResult = null;
  expr += p;
  updateDisplay(expr);
}

// Letters, ^ and ! typed on the keyboard, so expressions like sin(30), sqrt(144), 2^10 and 5! can be entered directly.
function calcType(ch) {
  if (vaultMode) return;
  if (lastResult !== null && ch >= 'a' && ch <= 'z') expr = ch;
  else expr += ch;
  lastResult = null;
  updateDisplay(expr);
  updateExpr('');
}

function calcConst(c) {
  if (vaultMode) return;
  lastResult = null;
  const val = c === 'Math.PI' ? '\u03C0' : 'e';
  expr += val;
  updateDisplay(expr);
}

function calcFn(fn) {
  if (vaultMode) return;
  const raw = expr === '' ? '0' : expr;
  try {
    const num = evalExpr(raw);
    if (isNaN(num)) { flashError(); return; }
    const x = num;
    const result = Function('"use strict"; var x = ' + x + '; return (' + fn + ');')();
    const rounded = roundResult(result);
    updateExpr(raw);
    updateDisplay(String(rounded));
    expr = String(rounded);
    lastResult = rounded;
  } catch(e) { flashError(); }
}

function calcTrig(name) {
  if (vaultMode) return;
  const raw = expr === '' ? '0' : expr;
  try {
    const num = evalExpr(raw);
    if (isNaN(num)) { flashError(); return; }
    const rad = calcAngleMode === 'RAD';
    let result;
    if (name === 'sin')  result = rad ? Math.sin(num)  : Math.sin(num * Math.PI / 180);
    else if (name === 'cos')  result = rad ? Math.cos(num)  : Math.cos(num * Math.PI / 180);
    else if (name === 'tan')  result = rad ? Math.tan(num)  : Math.tan(num * Math.PI / 180);
    else if (name === 'asin') result = rad ? Math.asin(num) : Math.asin(num) * 180 / Math.PI;
    else if (name === 'acos') result = rad ? Math.acos(num) : Math.acos(num) * 180 / Math.PI;
    else if (name === 'atan') result = rad ? Math.atan(num) : Math.atan(num) * 180 / Math.PI;
    else return;
    const rounded = roundResult(result);
    updateExpr(raw);
    updateDisplay(String(rounded));
    expr = String(rounded);
    lastResult = rounded;
  } catch(e) { flashError(); }
}

// Shift toggles DEG/RAD angle mode for the trig buttons above
function calcToggleShift() {
  if (vaultMode) return;
  calcAngleMode = calcAngleMode === 'DEG' ? 'RAD' : 'DEG';
  const btn = document.getElementById('cs-shift-btn');
  if (btn) btn.classList.toggle('active', calcAngleMode === 'RAD');
}

// Alpha recalls the last answer into the current expression (like a physical Ans key)
function calcAlphaAns() {
  if (vaultMode) return;
  if (lastResult === null && calcLastExpr === '') return;
  const ans = lastResult !== null ? String(lastResult) : expr;
  expr += ans;
  lastResult = null;
  updateDisplay(expr);
}

// Replay restores the last full expression (before it was evaluated) for editing
function calcReplay() {
  if (vaultMode) return;
  if (!calcLastExpr) return;
  expr = calcLastExpr;
  lastResult = null;
  updateDisplay(expr);
  updateExpr('');
}

function calcClear() {
  if (vaultMode) { vaultCode = ''; updateDisplay('0'); return; }
  expr = ''; lastResult = null;
  updateDisplay('0'); updateExpr('');
}

function calcBack() {
  if (vaultMode) {
    vaultCode = vaultCode.slice(0, -1);
    updateDisplay(vaultCode || '0');
    return;
  }
  lastResult = null;
  expr = expr.slice(0, -1);
  updateDisplay(expr || '0');
}

function calcEquals() {
  if (vaultMode) return;
  if (!expr) return;
  try {
    const result = evalExpr(expr);
    if (isNaN(result) || !isFinite(result)) { flashError(); return; }
    const rounded = roundResult(result);
    calcLastExpr = expr;
    updateExpr(expr + ' =');
    updateDisplay(String(rounded));
    expr = String(rounded);
    lastResult = rounded;
  } catch(e) { flashError(); }
}

// Parses the expression rather than executing it, so nothing typed from the keyboard ever runs as code.
// Supports + - * / ^ ! % ( ), implicit multiplication (2pi, 3(4)), pi, e, sin cos tan asin acos atan sqrt log ln abs.
function evalExpr(e) {
  const src = String(e).replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi').toLowerCase();
  const toRad = x => (calcAngleMode === 'RAD' ? x : x * Math.PI / 180);
  const fromRad = x => (calcAngleMode === 'RAD' ? x : x * 180 / Math.PI);
  const FNS = {
    sin: x => Math.sin(toRad(x)), cos: x => Math.cos(toRad(x)), tan: x => Math.tan(toRad(x)),
    asin: x => fromRad(Math.asin(x)), acos: x => fromRad(Math.acos(x)), atan: x => fromRad(Math.atan(x)),
    sqrt: Math.sqrt, log: Math.log10, ln: Math.log, abs: Math.abs,
  };
  // Longest names first, so "asin" is not read as "a" + "sin" and "epi" splits into e * pi.
  const NAMES = ['asin', 'acos', 'atan', 'sqrt', 'sin', 'cos', 'tan', 'log', 'abs', 'ln', 'pi', 'e'];
  let i = 0;
  const fail = () => { throw new SyntaxError('Invalid expression'); };
  const skip = () => { while (src[i] === ' ') i++; };
  const isDigit = c => c >= '0' && c <= '9';
  const isLetter = c => c >= 'a' && c <= 'z';
  const factorial = n => {
    if (n < 0 || n > 170 || n !== Math.floor(n)) return NaN;
    let r = 1;
    for (let k = 2; k <= n; k++) r *= k;
    return r;
  };

  function expression() {
    let v = term();
    for (;;) {
      skip();
      if (src[i] === '+') { i++; v += term(); }
      else if (src[i] === '-') { i++; v -= term(); }
      else return v;
    }
  }
  function term() {
    let v = unary();
    for (;;) {
      skip();
      const c = src[i];
      if (c === '*') { i++; v *= unary(); }
      else if (c === '/') { i++; v /= unary(); }
      else if (c === '(' || isDigit(c) || isLetter(c)) v *= unary();
      else return v;
    }
  }
  function unary() {
    skip();
    if (src[i] === '-') { i++; return -unary(); }
    if (src[i] === '+') { i++; return unary(); }
    return power();
  }
  function power() {
    const base = postfix();
    skip();
    if (src[i] === '^') { i++; return Math.pow(base, unary()); }
    return base;
  }
  function postfix() {
    let v = primary();
    for (;;) {
      skip();
      if (src[i] === '!') { i++; v = factorial(v); }
      else if (src[i] === '%') { i++; v /= 100; }
      else return v;
    }
  }
  function primary() {
    skip();
    const c = src[i];
    if (c === '(') {
      i++;
      const v = expression();
      skip();
      if (src[i] !== ')') fail();
      i++;
      return v;
    }
    if (isDigit(c) || c === '.') {
      const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/.exec(src.slice(i));
      if (!m) fail();
      i += m[0].length;
      return parseFloat(m[0]);
    }
    if (isLetter(c)) {
      const name = NAMES.find(n => src.startsWith(n, i));
      if (!name) fail();
      i += name.length;
      if (name === 'pi') return Math.PI;
      if (name === 'e') return Math.E;
      skip();
      if (src[i] !== '(') fail();
      i++;
      const arg = expression();
      skip();
      if (src[i] !== ')') fail();
      i++;
      return FNS[name](arg);
    }
    return fail();
  }

  const v = expression();
  skip();
  if (i < src.length) fail();
  return v;
}

function roundResult(n) {
  if (!isFinite(n)) return n;
  // Round to 10 significant digits to avoid float garbage
  return parseFloat(n.toPrecision(10));
}

function flashError() {
  const old = display.textContent;
  display.textContent = 'Error';
  display.classList.add('shake');
  setTimeout(() => {
    display.classList.remove('shake');
    if (vaultMode) updateDisplay(vaultCode || '0');
    else updateDisplay(expr || '0');
  }, 600);
  expr = ''; lastResult = null;
}

// ── Vault toggle (checkbox) ───────────────────────────────────────
toggleBtn.addEventListener('change', () => {
  vaultMode = toggleBtn.checked;
  vaultCode = '';
  if (!vaultMode) {
    updateDisplay(expr || '0');
  }
});
// Sync state in case the toggle was clicked before this listener was attached
// (can happen when main.js is still downloading while the page is already visible)
if (toggleBtn.checked) vaultMode = true;

function enterVaultDigit(d) {
  if (vaultCode.length >= 4) return;
  vaultCode += d;
  updateDisplay(vaultCode || '0');
  if (vaultCode.length === 4) {
    const capturedCode = vaultCode; // capture by value — avoids stale-ref if reset during the delay
    setTimeout(() => handleVaultCode(capturedCode), 120);
  }
}

function handleVaultCode(code) {
  const dataReady = window.VAULT_DATA && window.VAULT_DATA.length;

  if (code === '0000') {
    exitVaultMode();
    openVaultGrid();
    return;
  }

  if (dataReady) {
    // Fast path — data already cached, respond instantly
    const game = window.VAULT_DATA.find(g => g.code === code);
    if (game) {
      exitVaultMode();
      openVaultPlay(game);
    } else {
      display.classList.add('shake');
      display.textContent = '? ? ? ?';
      setTimeout(() => {
        display.classList.remove('shake');
        vaultCode = '';
        updateDisplay('0');
      }, 700);
    }
    return;
  }

  // Data not loaded yet — show overlay with skeleton immediately so user gets feedback
  exitVaultMode();
  overlay.classList.add('open');
  overlay.classList.remove('vault-in-play');
  overlay.style.display = 'flex';
  gridView.style.display = 'flex';
  playView.style.display = 'none';
  backBtn.style.display = 'none';
  if (sidebarToggleBtn) sidebarToggleBtn.style.display = '';
  searchInput.value = '';
  _renderSkeletonGrid();
  loadVaultData(function() {
    const game = (window.VAULT_DATA || []).find(g => g.code === code);
    if (game) {
      openVaultPlay(game);
    } else {
      closeVault();
    }
  });
}

function exitVaultMode() {
  vaultMode = false;
  vaultCode = '';
  toggleBtn.checked = false;
  updateDisplay(expr || '0');
}

// ── Keyboard support ──────────────────────────────────────────────
let _pointerLockJustReleased = false;
document.addEventListener('pointerlockchange', () => {
  if (!document.pointerLockElement) _pointerLockJustReleased = true;
  setTimeout(() => { _pointerLockJustReleased = false; }, 200);
});
// Games that render their own in-game menu on Escape (GTA III, Vice City -
// both re3-family WASM ports). For these, Escape must reach the game the
// way any other key does; it must never double as "leave the vault" too.
// The browser's own fullscreen-exit-on-Escape can't be prevented from any
// page's JS (it's a native, unavoidable gesture) - the fix is to stop
// chaining "also close the vault" onto that unavoidable exit, and instead
// just drop back to windowed play with focus still on the game, so the
// player's Escape reaches the in-game menu on their very next press instead
// of having silently backed them out of the activity entirely.
const GAME_CODES_WITH_OWN_ESC_MENU = new Set(['4518', '4014']);
// True only while an activity is actually loaded and playing — cleared
// whenever the player backs out to the grid, so a grid-screen Escape never
// gets mistaken for "let the game handle it" just because a game was played
// earlier in this vault session.
function _isActuallyPlaying() {
  const game = _pendingGame || _currentIframeGame;
  return !!(game && overlay.classList.contains('vault-in-play'));
}
function _currentGameHasOwnEscMenu() {
  if (!_isActuallyPlaying()) return false;
  const game = _pendingGame || _currentIframeGame;
  return !!(game && GAME_CODES_WITH_OWN_ESC_MENU.has(String(game.code)));
}
document.addEventListener('keydown', (e) => {
  if (document.getElementById('vault-overlay').classList.contains('open')) {
    if (e.key === 'Escape') {
      if (document.fullscreenElement) {
        if (_currentGameHasOwnEscMenu()) {
          document.exitFullscreen().then(() => _focusFrame(vaultIframe));
          return;
        }
        document.exitFullscreen().then(() => closeVault());
        return;
      }
      // Windowed: only defer to the game's own menu if it's actually playing
      // AND the game iframe itself has focus — if the iframe isn't focused,
      // the keystroke was never delivered into the game, so there's no
      // in-game menu to reach and Escape should close the vault instead.
      if (_currentGameHasOwnEscMenu() && document.activeElement === vaultIframe) return;
      // If iframe had pointer lock, Escape releases it first — don't close vault yet
      if (_pointerLockJustReleased) { _pointerLockJustReleased = false; return; }
      closeVault();
    }
    if ((e.key === 'f' || e.key === 'F') && document.getElementById('vault-overlay').classList.contains('vault-in-play') && fsBtn && fsBtn.style.display !== 'none') { fsBtn.click(); }
    return;
  }
  // Don't hijack typing: the scratch notes and any input/search field must get
  // their own keystrokes instead of driving the calculator.
  const t = e.target;
  if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.isContentEditable)) return;
  if (e.key >= '0' && e.key <= '9') calcDigit(e.key);
  else if (e.key === '.') calcDot();
  else if (e.key === '+') calcOp('+');
  else if (e.key === '-') calcOp('-');
  else if (e.key === '*') calcOp('×');
  else if (e.key === '/') { e.preventDefault(); calcOp('÷'); }
  else if (e.key === 'Enter' || e.key === '=') calcEquals();
  else if (e.key === 'Backspace') calcBack();
  else if (e.key === 'Escape') calcClear();
  else if (e.key === '(') calcParen('(');
  else if (e.key === ')') calcParen(')');
  else if (e.key === '%') calcOp('%');
  else if (e.key === '^' || e.key === '!') calcType(e.key);
  else if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) calcType(e.key.toLowerCase());
});

// ── VAULT OVERLAY ────────────────────────────────────────────────
const overlay      = document.getElementById('vault-overlay');
const gridView     = document.getElementById('vault-grid-view');
const playView     = document.getElementById('vault-play-view');
const vaultGrid    = document.getElementById('vault-grid');
let vaultIframe    = document.getElementById('vault-iframe');
let _currentIframeGame = null;
const playTitle    = document.getElementById('vault-play-title');
const sidebarToggleBtn = document.getElementById('vault-sidebar-toggle');
const searchInput  = document.getElementById('vault-search');
const backBtn      = document.getElementById('vault-back-btn');
const closeBtn     = document.getElementById('vault-close-btn');
const fsBtn        = document.getElementById('vault-fs-btn');
const reloadBtn    = document.getElementById('vault-reload-btn');
const sideCardsL   = document.getElementById('vault-side-cards');
const sideCardsR   = document.getElementById('vault-side-cards-right');

// ── Vault sidebar collapse toggle ────────────────────────────────
(function() {
  var toggleBtn = document.getElementById('vault-sidebar-toggle');
  var sidebar   = document.querySelector('.vault-cat-sidebar');
  if (!toggleBtn || !sidebar) return;
  var SIDEBAR_KEY = 'vault-sidebar-collapsed';

  function applySidebarState(collapsed) {
    if (collapsed) {
      sidebar.classList.add('sidebar-collapsed');
      toggleBtn.setAttribute('title', 'Show sidebar');
    } else {
      sidebar.classList.remove('sidebar-collapsed');
      toggleBtn.setAttribute('title', 'Hide sidebar');
    }
  }

  applySidebarState(localStorage.getItem(SIDEBAR_KEY) !== '0');

  toggleBtn.addEventListener('click', function() {
    var collapsed = sidebar.classList.contains('sidebar-collapsed');
    localStorage.setItem(SIDEBAR_KEY, collapsed ? '0' : '1');
    applySidebarState(!collapsed);
  });
})();

// ── Vault theme toggle ────────────────────────────────────────────
(function() {
  var themeBtn = document.getElementById('vault-theme-btn');
  if (!themeBtn) return;
  var VAULT_THEME_KEY = 'vault-theme';

  function applyVaultTheme(theme) {
    if (theme === 'light') {
      overlay.classList.add('vault-light');
      themeBtn.textContent = 'Dark';
    } else {
      overlay.classList.remove('vault-light');
      themeBtn.textContent = 'Light';
    }
  }

  applyVaultTheme(localStorage.getItem(VAULT_THEME_KEY) || 'light');

  themeBtn.addEventListener('click', function() {
    var newTheme = overlay.classList.contains('vault-light') ? 'dark' : 'light';
    localStorage.setItem(VAULT_THEME_KEY, newTheme);
    applyVaultTheme(newTheme);
  });
})();

function _renderSkeletonGrid() {
  // Calculate how many cards fill the visible grid area
  var sidebar  = window.innerWidth > 900 ? 200 : 0;
  var gridW    = Math.max(300, window.innerWidth - sidebar);
  var cardW    = window.innerWidth <= 480 ? (gridW / 3) : (window.innerWidth <= 768 ? 130 : 150);
  var cols     = Math.max(3, Math.floor(gridW / cardW));
  var rowH     = window.innerWidth <= 768 ? (gridW / 3) : 128;
  var rows     = Math.max(3, Math.ceil((window.innerHeight - 50) / rowH));
  var count    = cols * rows;
  vaultGrid.innerHTML = Array(count).fill(0).map(function() {
    return '<div class="v-card v-card-skeleton"><div class="v-thumb"></div></div>';
  }).join('');
}

function openVaultGrid() {
  overlay.classList.add('open');
  overlay.classList.remove('vault-in-play');
  overlay.style.display = 'flex';
  overlay.removeAttribute('aria-hidden');
  gridView.style.display = 'flex';
  playView.style.display = 'none';
  backBtn.style.display = 'none';
  if (sidebarToggleBtn) sidebarToggleBtn.style.display = '';
  searchInput.value = '';
  if (window.VAULT_DATA && window.VAULT_DATA.length) {
    renderGridOrRows(getItems());
  } else {
    _renderSkeletonGrid();
    loadVaultData(function() { renderGridOrRows(getItems()); });
  }
}

var _vaultLoading = false;
var _vaultQueue = [];
// Static build: games.json carries each game's URL, so this returns it straight
// away. On solvecalc.net the same function asks the server for one URL at a
// time; GitHub Pages has no server, so the catalogue ships complete instead.
var _launchUrlPromise = null;
function _resolveLaunchUrl(game) {
  if (!game) return Promise.resolve('');
  if (game.iframe) return Promise.resolve(game.iframe);
  return Promise.resolve('');   // no iframe in the catalogue means unplayable
}

function loadVaultData(cb) {
  if (window.VAULT_DATA && window.VAULT_DATA.length) { cb(); return; }
  _vaultQueue.push(cb);
  if (_vaultLoading) return;
  _vaultLoading = true;
  fetch('/games.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      window.VAULT_DATA = [{ code: '0000', name: 'All', iframe: '', thumb: '' }].concat(data);
      _pruneFavs();
      _vaultLoading = false;
      var q = _vaultQueue.splice(0); q.forEach(function(fn) { fn(); });
    })
    .catch(function() {
      _vaultLoading = false;
      var q = _vaultQueue.splice(0); q.forEach(function(fn) { fn(); });
    });
}

let _savedScrollTop = 0;
var _pendingGame = null;
// Background game preload (loads the iframe in parallel with the pre-roll ad).
var _gamePreloadStarted = false;
var _gamePreloadLoaded  = false;
var _gamePreloadUrl;                 // undefined = pending, null = failed, string = ok
var _gameRevealed       = false;
var _gamePreloadStart   = 0;         // timestamp preload began, for honest progress

// ── Pre-game video ad (Google IMA SDK) ───────────────────────────────
// Plays a VAST pre-roll in the game area, then starts the game. The SDK
// draws the whole player itself - skip button, countdown, "Ad 1 of N" pod
// counter, advertiser attribution - so there is no ad UI to build here.
//
// DESIGN RULE: the game must ALWAYS start. Every failure path (no SDK, ad
// blocker, no fill, VAST error, playback error, timeout) calls the callback
// anyway. An ad problem must never leave a visitor stuck on the splash.

// VDO.AI VAST tag - served from targeting.vdo.ai (VDO's own ad server, NOT
// Google Ad Manager). Site approved and video demand enabled by VDO on
// 2026-08-18. Macros are filled in JS per request (IMA does not know VDO's
// macro set):
//   cb  (CACHEBUSTING) - unique per request, else the ad server caches/dedupes
//                        and the 2nd and later games in a session get no ad.
//   gdpr=0, gdpr_consent= - GDPR does not apply (US/Indonesia audience, no CMP).
//   vpmute=0 - play with sound; allowed because a pre-roll only ever starts
//              from the visitor's Start click (a user gesture).
var VAULT_AD_TAG_BASE = 'https://targeting.vdo.ai/core/v-solvecalc-net/vast.xml';

function _buildVaultAdTag() {
  var cb = String(Date.now()) + Math.floor(Math.random() * 1e9);
  return VAULT_AD_TAG_BASE + '?cb=' + cb + '&gdpr=0&gdpr_consent=&vpmute=0';
}

// Load watchdog: if no ad has STARTED playing by now, give up and launch the
// game. Kept short so a no-fill (common, and expected during demand ramp-up)
// never stalls the visitor. Once an ad actually starts it is cleared (see the
// STARTED handler) so a real, paying ad is never cut off mid-play.
var AD_LOAD_TIMEOUT_MS = 4500;

// Frequency cap: show at most ONE video ad per user per this window. After a
// visitor is shown one ad, every game for the next 24h launches instantly with
// no ad request at all - so repeat users never wait on ad loading. Tracked per
// browser in localStorage (no login needed). Set the timestamp only when an ad
// actually STARTS (a real impression), so a no-fill doesn't burn the window.
var PREROLL_MIN_GAP_MS = 24 * 60 * 60 * 1000;   // 24 hours
var PREROLL_LAST_KEY   = 'sc_preroll_last';

var _adsLoader = null, _adsManager = null, _adDisplayContainer = null, _adResizeObserver = null;
var _adDone = null, _adTimer = null;
// Playback-phase guards - armed at STARTED, cleared by _teardownAd.
var _adStartedAt = 0, _adHardCap = null, _adStallPoll = null, _adEscapeTimer = null;

// Absolute ceiling on a single ad break, whatever the creative claims. A VAST
// pre-roll that runs longer than this is malfunctioning, not selling.
var AD_MAX_BREAK_MS = 60 * 1000;
// A playing ad whose remaining time does not move for this long has stalled.
var AD_STALL_MS = 6000;
// When our own escape hatch appears for a creative whose duration we cannot
// read. That is the genuinely dangerous case: no declared length means the
// hard cap has nothing to size itself against, so without this the visitor
// could wait the full AD_MAX_BREAK_MS.
//
// It is NOT a second skip button. IMA draws its own "Skip Ad" on skippable
// creatives at around 5s, and a non-skippable ad is one the advertiser paid
// for in full - putting a bypass beside either would clutter the player and
// cut ad completion. So when the duration IS known this appears only just
// before the hard cap: by then the ad has outrun its own declared length and
// is misbehaving, and the button simply hands the visitor the exit a moment
// before we take it for them.
var AD_ESCAPE_AFTER_MS = 8000;

// Arms the guards that make "the game must ALWAYS start" true DURING playback,
// not just during loading.
//
//  - hard cap    : ad's own duration + slack, bounded by AD_MAX_BREAK_MS. Ends
//                  a creative that never reports finishing.
//  - stall poll  : IMA's getRemainingTime() should tick down while an ad plays.
//                  If it stops moving, the creative is wedged - buffer stall,
//                  decode failure, or an overlay sitting on a dead video.
//  - escape hatch: a visible "Continue to game" button. Some creatives ship
//                  with no skip and no close button at all, so this is the only
//                  thing that guarantees the visitor is never stuck waiting.
function _armAdPlaybackGuards(ev) {
  var declared = 0, skippable = false;
  try {
    var ad = ev && typeof ev.getAd === 'function' ? ev.getAd() : null;
    if (ad && typeof ad.getDuration === 'function') declared = (ad.getDuration() || 0) * 1000;
    // IMA renders its own "Skip Ad" control only for skippable creatives. When
    // one is present the visitor already has a way out and ours would just be
    // a second, competing button.
    if (ad && typeof ad.isSkippable === 'function') skippable = !!ad.isSkippable();
  } catch (e) {}
  // +8s of slack covers buffering pauses inside a healthy ad.
  var cap = declared > 0 ? Math.min(declared + 8000, AD_MAX_BREAK_MS) : AD_MAX_BREAK_MS;
  _adHardCap = setTimeout(function () { if (_adDone) _finishAd(); }, cap);

  var lastRemaining = -1, unchangedFor = 0;
  _adStallPoll = setInterval(function () {
    if (!_adsManager || !_adDone) return;
    var r = -1;
    try { r = _adsManager.getRemainingTime(); } catch (e) { return; }
    // Negative means "unknown" in IMA - not a stall, just no reading yet.
    if (r < 0) return;
    if (lastRemaining >= 0 && Math.abs(r - lastRemaining) < 0.25) {
      unchangedFor += 1000;
      if (unchangedFor >= AD_STALL_MS) _finishAd();
    } else {
      unchangedFor = 0;
    }
    lastRemaining = r;
  }, 1000);

  // Skippable creative: IMA's own skip appears at ~5s, so ours is needed only
  // as a late backstop for an ad that overruns its declared length.
  //
  // NOT skippable (which is what this site's demand actually serves): IMA draws
  // no control at all, so ours is the ONLY exit on screen. Showing it after
  // AD_ESCAPE_AFTER_MS is the difference between a visitor who can leave and one
  // watching a wall with no handle. That trades some ad completion for not
  // trapping people; raise AD_ESCAPE_AFTER_MS to favour completion instead.
  var escapeAt = (skippable && declared > 0)
    ? Math.max(AD_ESCAPE_AFTER_MS, Math.min(declared + 5000, cap - 2000))
    : AD_ESCAPE_AFTER_MS;
  _adEscapeTimer = setTimeout(_showAdEscapeHatch, escapeAt);
}

// Visitor-facing way out, layered above IMA's own player. Deliberately worded
// as "continue" rather than "skip": it does not skip the ad for billing, it
// just stops the visitor being held hostage by a broken creative.
function _showAdEscapeHatch() {
  var container = document.getElementById('vault-ad-container');
  if (!container || !_adDone) return;
  if (document.getElementById('vault-ad-escape')) return;
  var b = document.createElement('button');
  b.id = 'vault-ad-escape';
  b.className = 'vault-ad-escape';
  b.type = 'button';
  b.textContent = 'Continue to activity \u25B8';
  b.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (_adDone) _finishAd();
  });
  container.appendChild(b);
}

// Runs the callback exactly once, no matter which path got us here, and
// always tears the ad down first so a stale AdsManager can't linger.
function _finishAd() {
  if (_adTimer) { clearTimeout(_adTimer); _adTimer = null; }
  var cb = _adDone;
  _adDone = null;                        // null it BEFORE calling, so a late
  _teardownAd();                         // event firing during cb is a no-op
  if (typeof cb === 'function') cb();
}

function _teardownAd() {
  if (_adHardCap)     { clearTimeout(_adHardCap);     _adHardCap = null; }
  if (_adEscapeTimer) { clearTimeout(_adEscapeTimer); _adEscapeTimer = null; }
  if (_adStallPoll)   { clearInterval(_adStallPoll);  _adStallPoll = null; }
  _adStartedAt = 0;
  try { if (_adResizeObserver) { _adResizeObserver.disconnect(); _adResizeObserver = null; } } catch (e) {}
  try { if (_adsManager) { _adsManager.destroy(); _adsManager = null; } } catch (e) {}
  try { if (_adsLoader)  { _adsLoader.destroy();  _adsLoader  = null; } } catch (e) {}
  _adDisplayContainer = null;
  document.body.classList.remove('sc-vault-preroll');   // restore the AdSense anchor
  var c = document.getElementById('vault-ad-container');
  if (c) { c.classList.remove('active'); c.innerHTML = ''; }
  // Side-card navigation calls this via _abortAd() BEFORE the new game's
  // splash/ad flow has started - if the visitor clicked to a new game while
  // the previous one's ad was still loading, the centered spinner (shown by
  // the splash Play button's click handler in index.ejs, tied to the OLD
  // game) never gets its own dismissal, since launch()/_hideSplashAndLaunch()
  // - the only other place that clears it - never runs for an aborted ad.
  // Left alone, that stale spinner sits on top of the new game's splash
  // screen forever, blocking its Play button and making the vault look
  // permanently stuck. Clear it here too so every teardown path - finished,
  // skipped, errored, or abandoned mid-load for a new game - leaves a clean
  // splash behind it.
  var loader = document.getElementById('vault-ad-loader');
  if (loader) loader.classList.remove('active');
}

// Cancel an in-flight ad without launching the game - used when the visitor
// leaves (closes the vault / goes back) mid-ad.
function _abortAd() {
  if (_adTimer) { clearTimeout(_adTimer); _adTimer = null; }
  _adDone = null;
  _teardownAd();
}

// True when NO pre-roll ad will play for this open - because the IMA SDK is
// unavailable, or the once-per-24h frequency cap is still active. Used to decide
// whether the game is safe to preload with sound now (no ad to bleed under) or
// must wait until after the ad finishes.
function _prerollSuppressed() {
  if (!(window.google && window.google.ima)) return true;
  try {
    var last = parseInt(localStorage.getItem(PREROLL_LAST_KEY) || '0', 10);
    return !!(last && (Date.now() - last) < PREROLL_MIN_GAP_MS);
  } catch (e) { return false; }
}

function _playPrerollThen(callback) {
  var container = document.getElementById('vault-ad-container');
  var ima = window.google && window.google.ima;

  // No SDK (blocked, offline, still loading) or no container - skip straight
  // to the game rather than making the visitor wait on something broken.
  if (!ima || !container) { callback(); return; }

  // Frequency cap (already shown an ad within the window) - skip the ad
  // entirely, no request, no wait, and launch the game instantly.
  if (_prerollSuppressed()) { callback(); return; }

  _adDone = callback;

  // If no ad has started within the load window, launch the game. Covers
  // no-fill, silent network stalls, and SDK init hangs. This is cleared the
  // instant a real ad starts (STARTED handler below), so it can only ever
  // shorten the wait before a game - never interrupt a playing ad.
  _adTimer = setTimeout(function () {
    if (_adDone) _finishAd();
  }, AD_LOAD_TIMEOUT_MS);

  try {
    _adDisplayContainer = new ima.AdDisplayContainer(container);
    // Must happen inside the Start click's user-gesture context or mobile
    // browsers will refuse to play the ad's audio/video.
    _adDisplayContainer.initialize();

    _adsLoader = new ima.AdsLoader(_adDisplayContainer);

    _adsLoader.addEventListener(
      ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      function (e) {
        if (!_adDone) return;                       // aborted while loading
        try {
          // AdsRenderingSettings is IMA's own supervision of the creative.
          // loadVideoTimeout makes the SDK give up on a media file that will
          // not load instead of sitting on it - previously an unreachable
          // creative just hung until one of our timers happened to fire.
          var rs = new ima.AdsRenderingSettings();
          rs.loadVideoTimeout = 8000;
          rs.restoreCustomPlaybackStateOnAdBreakComplete = true;
          _adsManager = e.getAdsManager({
            // IMA wants a content element to track; the game iframe is not a
            // <video>, so a minimal stub satisfying the API is enough.
            currentTime: 0, duration: 0
          }, rs);

          // The initial AD_LOAD_TIMEOUT_MS watchdog covers the ad REQUEST
          // (network round trip + VAST parse) - it was started the moment
          // Start was clicked. Buffering and the actual first frame still
          // have to happen after this point, and on a slow connection that
          // ate most of the original window, leaving too little of it for
          // playback to really begin. That gap is what could make the ad
          // container get revealed (old code did this here, before STARTED)
          // and then torn down moments later when the shared timer ran out -
          // visually "the ad played, then immediately stopped/glitched".
          // Give buffering its own separate budget instead of sharing what's
          // left of the request's.
          if (_adTimer) { clearTimeout(_adTimer); _adTimer = null; }
          _adTimer = setTimeout(function () {
            if (_adDone) _finishAd();
          }, AD_LOAD_TIMEOUT_MS);

          var E = ima.AdEvent.Type;
          // Normal completion, and the "resume content" signal IMA sends
          // after the last ad in a pod - either means: start the game.
          _adsManager.addEventListener(E.ALL_ADS_COMPLETED, _finishAd);
          _adsManager.addEventListener(E.CONTENT_RESUME_REQUESTED, _finishAd);
          _adsManager.addEventListener(E.SKIPPED, _finishAd);
          // USER_CLOSE is what an overlay's own close button fires, and what
          // some creatives send instead of COMPLETE. Without it the ad ended
          // as far as the visitor was concerned while the vault waited forever
          // for a signal that never came. COMPLETE is belt-and-braces for
          // creatives that never emit ALL_ADS_COMPLETED.
          _adsManager.addEventListener(E.USER_CLOSE, _finishAd);
          _adsManager.addEventListener(E.COMPLETE, _finishAd);
          // A real ad has begun playing - cancel the buffering watchdog so the
          // full creative plays out and the impression is counted. From here
          // only the completion/skip/error events above end the ad. This is
          // what guarantees a paying ad is never stopped early.
          _adsManager.addEventListener(E.STARTED, function (ev) {
            if (_adTimer) { clearTimeout(_adTimer); _adTimer = null; }
            // Once an ad starts, the load watchdog above is correctly cleared
            // so a paying creative is never cut off. It used to be cleared with
            // NOTHING put in its place, which meant that from this moment on
            // the vault had no way out at all: a creative that never fired a
            // terminal event (broken VAST tracking, a stalled buffer, an
            // overlay closed by its own X) left the visitor on a black screen
            // forever. These two are that missing safety net. Both are sized
            // off the ad's OWN declared duration, so neither can end a healthy
            // ad early - they only fire when the creative has misbehaved.
            _adStartedAt = Date.now();
            _armAdPlaybackGuards(ev);
            // Record the impression time so the frequency cap holds - this user
            // now gets instant, ad-free play for the next PREROLL_MIN_GAP_MS.
            try { localStorage.setItem(PREROLL_LAST_KEY, String(Date.now())); } catch (e) {}
            // Immediate fit, in case the ResizeObserver's first callback (set
            // up below) hasn't fired yet.
            try {
              _adsManager.resize(container.clientWidth || 640, container.clientHeight || 360, ima.ViewMode.NORMAL);
            } catch (e) {}
            // Reveal the ad surface only now that it is actually playing -
            // never at LOADED time, when playback might still be seconds away
            // from really starting (or might time out and get torn down
            // before a single frame renders). sc-vault-preroll hides the
            // AdSense anchor/vignette (forced to max z-index) while the video
            // plays, so it cannot overlap the ad or cover IMA's skip button.
            document.body.classList.add('sc-vault-preroll');
            container.classList.add('active');
          });
          _adsManager.addEventListener(
            ima.AdErrorEvent.Type.AD_ERROR,
            function () { _finishAd(); }
          );

          // container.clientWidth/clientHeight right after AdsManager init is
          // not reliable across browsers - the box can still report a stale/
          // small size for this first read, which is what rendered the player
          // small and top-left with black filling the rest of the box on both
          // desktop and mobile. A double rAF guarantees at least one full
          // layout+paint pass has completed before the first size read.
          // (Ad-surface reveal - sc-vault-preroll / container.active - now
          // happens in the STARTED handler above, not here at LOADED time.)
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              if (!_adsManager) return;               // torn down while waiting
              var w = container.clientWidth || 640, h = container.clientHeight || 360;
              try {
                _adsManager.init(w, h, ima.ViewMode.NORMAL);
                _adsManager.start();
              } catch (err) {
                _finishAd();                           // playback refused
                return;
              }
              // Keep the player fitted to the container's REAL size for the
              // rest of the ad's life - covers window resize, orientation
              // change, and any further layout settling the single reads
              // above could still miss. This is the durable fix; the STARTED
              // handler's manual resize() just gives an earlier fit if this
              // fires late.
              try {
                if (_adResizeObserver) _adResizeObserver.disconnect();
                _adResizeObserver = new ResizeObserver(function () {
                  if (!_adsManager) return;
                  var cw = container.clientWidth, ch = container.clientHeight;
                  if (cw && ch) {
                    try { _adsManager.resize(cw, ch, ima.ViewMode.NORMAL); } catch (e) {}
                  }
                });
                _adResizeObserver.observe(container);
              } catch (e) {}
            });
          });
          return;
        } catch (err) {
          _finishAd();                               // playback refused
        }
      },
      false
    );

    // No fill, malformed VAST, network failure - all land here.
    _adsLoader.addEventListener(
      ima.AdErrorEvent.Type.AD_ERROR,
      function () { _finishAd(); },
      false
    );

    var req = new ima.AdsRequest();
    // cb macro must be unique per request or the ad server dedupes and
    // returns nothing on the second and later games in a session.
    req.adTagUrl = _buildVaultAdTag();
    req.linearAdSlotWidth      = container.clientWidth  || 640;
    req.linearAdSlotHeight     = container.clientHeight || 360;
    // Non-linear (overlay banner) creatives are DELIBERATELY not requested.
    // This is a pre-roll gate in front of a game, not a video the visitor is
    // watching, so an overlay has nowhere sensible to sit - and closing one
    // with its own X fires USER_CLOSE without any content-resume signal, which
    // is what left the vault on a black screen. Linear only: it either plays
    // and ends, or it errors, and both paths resume the game.
    req.nonLinearAdSlotWidth   = 0;
    req.nonLinearAdSlotHeight  = 0;
    _adsLoader.requestAds(req);
  } catch (err) {
    _finishAd();                                     // any SDK-level throw
  }
}

// Keep the ad sized to the frame if the window changes mid-roll.
window.addEventListener('resize', function () {
  if (!_adsManager) return;
  var c = document.getElementById('vault-ad-container');
  if (!c) return;
  try {
    _adsManager.resize(
      c.clientWidth || 640,
      c.clientHeight || 360,
      (window.google && window.google.ima) ? window.google.ima.ViewMode.NORMAL : 0
    );
  } catch (e) {}
});

function _showSplash(game) {
  var splash  = document.getElementById('vault-splash');
  var titleEl = document.getElementById('vault-splash-title');
  var img     = document.getElementById('vault-splash-thumb');
  var playBtn = document.getElementById('vault-splash-play-btn');
  if (!splash) return;
  if (titleEl) titleEl.textContent = game.name;
  if (img)     { img.src = game.thumb || ''; img.alt = game.name; }
  if (playBtn) playBtn.disabled = false;

  // Pick 3 thumbs for blurred background: current + 2 random others
  var bgThumbs = [game.thumb || ''];
  if (window.VAULT_DATA && window.VAULT_DATA.length > 1) {
    var pool = window.VAULT_DATA.filter(function(g) { return g.code !== game.code && g.thumb; });
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    bgThumbs = bgThumbs.concat(pool.slice(0, 2).map(function(g) { return g.thumb; }));
  }
  ['vsb-img-1', 'vsb-img-2', 'vsb-img-3'].forEach(function(id, idx) {
    var el = document.getElementById(id);
    if (el) el.src = bgThumbs[idx] || bgThumbs[0] || '';
  });

  splash.classList.add('active');
  vaultIframe.style.display = 'none';
  if (fsBtn) fsBtn.style.display = 'none';
  if (reloadBtn) reloadBtn.style.display = 'none';   // shown only once the game finishes loading

  _mountSplashAds();
}

// ── Splash screen display ads ────────────────────────────────────────────
// The vault is a single-page overlay: the splash opens again for every game
// without a page load. A static <ins> plus the usual one-time push() would
// therefore fill once and then sit blank for the rest of the session, so a
// fresh <ins> is built per open.
//
// SC_SPLASH_AD_MIN_MS throttles that. Requesting a new ad every time someone
// bounces in and out of games in quick succession looks like refresh abuse,
// which is an AdSense policy problem; below the interval the existing ad is
// simply left on screen.
//
// ── Shared GAM/Ad.Plus display mount ────────────────────────────────────
// One function used for every fixed-position display slot on the site: the
// two splash banners AND the three homepage banners (top / above-calculator
// / mid). They were four separate near-identical blocks before (three
// AdSense ins pushes plus this splash-specific one) - unified because the
// constraints are identical everywhere: pick a size from the CONTAINER's
// measured width (not the viewport - a responsive unit ignores a bounded
// box, which is what produced a 390px-tall slot on phones before), never
// request into a zero-width or hidden container, and never re-request the
// same slot inside a 30s window.
//
// Ad.Plus's display codes are one path per exact size ("Ad.Plus-728x90" etc),
// so the path is built from whichever size the rules below pick - there is no
// single "responsive" unit to fall back to the way AdSense's data-ad-format
// auto/full-width-responsive worked.
var SC_GAM_NETWORK = '/21849154601,23350311221';
var SC_GAM_MIN_MS = 30000;
var _scGamLast = {};
var _scGamSlots = {};

// Rule lists are [minWidth, w, h], sorted by minWidth descending. The first
// rule whose minWidth the container clears wins.
var SC_GAM_RULES_BANNER = [[970, 970, 90], [728, 728, 90], [468, 468, 60], [0, 320, 50]];
// Same banner sizes above 468px, but the mobile fallback is 300x250 rather
// than a 320x50 strip - Ad.Plus's best-performing size, requested on phones
// for the three homepage banner positions (top, hero, mid). The container
// itself keeps its existing full-width CSS on mobile; only the requested
// creative size changes, and it centers in that space via .sc-ad's own
// flex centering.
var SC_GAM_RULES_BANNER_HOME = [[970, 970, 90], [728, 728, 90], [468, 468, 60], [0, 300, 250]];
var SC_GAM_RULES_SPLASH = [[728, 728, 90], [468, 468, 60], [0, 320, 100]];
// Fixed 300x250 regardless of container width - same reasoning as the
// in-content slots in ads-content.js: it is Ad.Plus's stated best-performing
// display size, and there is no reason to trade it for a banner shape on a
// box that is not structurally a banner position.
var SC_GAM_RULES_RECT = [[0, 300, 250]];

function _scPickSize(width, rules) {
  for (var i = 0; i < rules.length; i++) {
    if (width >= rules[i][0]) return [rules[i][1], rules[i][2]];
  }
  return rules[rules.length - 1].slice(1);
}

function scMountGamSlot(containerId, rules) {
  var box = document.getElementById(containerId);
  if (!box) return;
  // Never request into a container that still has no width - the request is
  // wasted and the slot stays blank for the rest of the session. Also skip a
  // container hidden by display:none (offsetWidth is 0 there too, so this is
  // the same check, but the ad-policy reason is distinct: requesting into
  // something the visitor cannot see burns a non-viewable impression and
  // risks a policy flag, same restriction AdSense had.
  if (!box.offsetWidth) return;

  var now = Date.now();
  var existing = _scGamSlots[containerId];
  if (existing && (now - (_scGamLast[containerId] || 0)) < SC_GAM_MIN_MS) return;

  var size = _scPickSize(box.offsetWidth, rules);

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    try {
      if (existing) {
        if (existing.size[0] === size[0] && existing.size[1] === size[1]) {
          // Same size as last time: refresh in place rather than tearing the
          // slot down, which is how GAM expects a repeat impression.
          _scGamLast[containerId] = now;
          googletag.pubads().refresh([existing.slot]);
          return;
        }
        // Container is now a different size bucket (e.g. window resized
        // across a breakpoint) - the old slot's fixed size no longer fits,
        // so it has to be destroyed and redefined rather than refreshed.
        googletag.destroySlots([existing.slot]);
        delete _scGamSlots[containerId];
      }

      _scGamLast[containerId] = now;
      box.innerHTML = '';
      var divId = containerId + '-gam-' + size[0] + 'x' + size[1];
      var div = document.createElement('div');
      div.id = divId;
      div.style.width = size[0] + 'px';
      div.style.height = size[1] + 'px';
      div.style.margin = '0 auto';
      box.appendChild(div);

      var path = SC_GAM_NETWORK + '/Ad.Plus-' + size[0] + 'x' + size[1];
      var slot = googletag.defineSlot(path, [size], divId);
      if (!slot) return;
      slot.addService(googletag.pubads());
      // Single-request mode is set once, page-wide, in header.ejs via
      // googletag.setConfig - not needed per slot.
      googletag.enableServices();
      googletag.display(divId);
      _scGamSlots[containerId] = { slot: slot, size: size };
      // Tags the slot with its wrapping .sc-ad box id. The GPT
      // slotRenderEnded event only carries the slot object, not the DOM
      // container, so this is how the fill-state resolver further down finds
      // its way back to the right box.
      slot.__scContainerId = containerId;
    } catch (e) {
      // An ad failure must never affect the page around it.
    }
  });
}

function scMountGamBanners() {
  // mid/hero are structural full-bleed banner positions (the full-width strip
  // at the top of the About band, and above the calculator) - a rectangle
  // would look like a mistake dropped into them on desktop/tablet. hero
  // specifically matches the horizontal shape AdSense's Auto Ads used to place
  // there; the 300x250 rectangle already lives right below the calculator
  // (sc-gam-belowcalc), so this stays a banner rather than duplicating that
  // size - except on phones, where SC_GAM_RULES_BANNER_HOME requests 300x250
  // instead of a 320x50 strip. NOT sc-gam-footer here: ads-content.js already
  // mounts that sitewide, including the homepage, since it lives in the shared
  // footer partial - mounting it again here would fight that for the same DOM
  // element.
  ['sc-gam-mid', 'sc-gam-hero'].forEach(function (id) {
    scMountGamSlot(id, SC_GAM_RULES_BANNER_HOME);
  });

  // Everything else here is a break BETWEEN two prose sections - the same
  // position the in-content 300x250 slots occupy on tool/article pages via
  // ads-content.js, which does not run on the homepage (main.js is
  // homepage-only). Given the same shape, they get the same size.
  [
    'sc-gam-belowcalc',
    'sc-gam-finance', 'sc-gam-whatis', 'sc-gam-notepad', 'sc-gam-themes',
    'sc-gam-worked', 'sc-gam-toolsrow', 'sc-gam-compare',
    'sc-gam-section3'
  ].forEach(function (id) {
    scMountGamSlot(id, SC_GAM_RULES_RECT);
  });
}

function _mountSplashAds() {
  // Two frames after .active is added, not the same synchronous tick. The
  // splash goes display:none -> flex at that moment, so its children still
  // measure 0 wide until layout settles; mounting immediately measured a
  // zero-width container and silently skipped the slot (which is why one of
  // the two would come back empty). rAF twice guarantees a completed layout
  // pass before mounting.
  var raf = window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); };
  raf(function () { raf(_mountSplashAdsNow); });
}

function _mountSplashAdsNow() {
  scMountGamSlot('vault-splash-ad-top', SC_GAM_RULES_SPLASH);
  scMountGamSlot('vault-splash-ad-bottom', SC_GAM_RULES_SPLASH);
}

document.addEventListener('DOMContentLoaded', scMountGamBanners);
if (document.readyState !== 'loading') scMountGamBanners();

function _hideSplash() {
  var splash = document.getElementById('vault-splash');
  if (!splash) return;
  splash.classList.remove('active');
}

// Some third-party game engines (compiled WASM binaries we don't control the
// source of) navigate the embed frame away to their own site on their own -
// not something we can find/strip in any file we ship, since it's baked into
// the compiled binary itself, not our HTML/JS. That can't be prevented from
// inside the iframe (Location.prototype.href is non-configurable in Chrome),
// so instead we watch from out here: the very first 'load' after we set
// iframe.src is the page we asked for; any load after that without us having
// changed .src ourselves means something inside navigated on its own, and we
// immediately snap the iframe straight back to the game's real URL.
var _iframeWatch = null; // { iframe, url }
function _armIframeEscapeWatch(iframe, url) {
  _iframeWatch = { iframe: iframe, url: url, loads: 0 };
  if (iframe._escapeWatchAttached) return;
  iframe._escapeWatchAttached = true;
  iframe.addEventListener('load', function () {
    if (!_iframeWatch || _iframeWatch.iframe !== iframe) return;
    _iframeWatch.loads++;
    if (_iframeWatch.loads > 1) {
      console.warn('[vault] game frame navigated away unexpectedly - restoring', _iframeWatch.url);
      _iframeWatch.loads = 0; // the reset below fires its own load, back to 1
      iframe.src = _iframeWatch.url;
    }
  });
}
function _disarmIframeWatch() { _iframeWatch = null; }

// Start loading the game iframe in the BACKGROUND (still hidden) the moment
// Play is clicked - in parallel with the pre-roll ad request - so it is already
// downloaded by the time the ad ends or a no-fill resolves. The iframe stays
// display:none until _hideSplashAndLaunch reveals it, so nothing shows behind
// the ad. Idempotent: only the first call kicks off a load.
function _preloadGameFrame() {
  if (_gamePreloadStarted || !_pendingGame || !vaultIframe) return;
  // Only preload early when NO ad will play (cap active / no SDK). The game
  // autoplays sound, so if an ad might play we must NOT run the game behind it
  // (that bled game audio under the ad). In that case we skip preload and let
  // _hideSplashAndLaunch load the game after the ad ends - no overlap, no bleed.
  if (!_prerollSuppressed()) return;
  _gamePreloadStarted = true;
  _gamePreloadStart = (window.performance && performance.now) ? performance.now() : 0;
  var game = _pendingGame;
  var urlP = (game.iframe ? Promise.resolve(game.iframe) : (_launchUrlPromise || _resolveLaunchUrl(game)));
  urlP.then(function(url) {
    if (!url || !vaultIframe) {
      _gamePreloadUrl = null;                        // resolution failed
      if (_gameRevealed) vaultLoaderComplete();      // don't leave the loader hanging
      return;
    }
    _gamePreloadUrl = url;
    // First-party games (served from our R2 bucket via either custom domain) get
    // the origin as referrer so their embed check passes; third-party mirrors get
    // no referrer. Both R2 domains are recognised so the switch to pigmath cannot
    // silently downgrade a game to no-referrer and trip its domain-lock.
    vaultIframe.referrerPolicy = /^https:\/\/learn\.(pigmath\.com|edumain\.net)\//.test(url) ? 'origin' : 'no-referrer';
    vaultIframe.onload = function() {
      _gamePreloadLoaded = true;
      if (_gameRevealed) { vaultLoaderComplete(); _revealReloadBtn(); _focusGame(); }
    };
    _armIframeEscapeWatch(vaultIframe, url);
    vaultIframe.src = url;                            // begins loading, still hidden
  });
}

// Estimate how far the background game load has got, from elapsed preload time
// (an iframe exposes no real byte-level progress). A typical activity finishes
// in ~3s, so map elapsed -> 8..82%. Keeps the bar honest: an instant no-fill
// (no background time) starts low; an ad that played for a few seconds starts
// the bar nearly full because the game really has been loading that whole time.
function _preloadProgressPct() {
  if (!_gamePreloadStart || !(window.performance && performance.now)) return 40;
  var pct = Math.round((performance.now() - _gamePreloadStart) / 3000 * 85);
  return Math.max(8, Math.min(82, pct));
}

// The reload button only appears once the activity is fully loaded and
// playable - never during the splash, the ad, or the loading bar.
function _revealReloadBtn() { if (reloadBtn) reloadBtn.style.display = ''; }

// Auto-focus the game on load so keyboard controls work without a click.
// _focusFrame focuses the iframe AND its window; the retry re-grabs focus in
// case the game's own startup code steals/resets it right after load.
function _focusGame() {
  _focusFrame(vaultIframe);
  setTimeout(function () { _focusFrame(vaultIframe); }, 150);
}

function _hideSplashAndLaunch() {
  _hideSplash();
  var adLoader = document.getElementById('vault-ad-loader');
  if (adLoader) adLoader.classList.remove('active');
  if (!_pendingGame) return;
  var game = _pendingGame;
  _pendingGame = null;
  _currentIframeGame = game;
  _gameRevealed = true;
  vaultIframe.style.display = '';
  if (fsBtn) fsBtn.style.display = '';

  // Drive the loading bar to match the game's ACTUAL state:
  //  - already downloaded -> snap to done, near-instant reveal (no 0% crawl)
  //  - URL failed         -> complete, never blank-launch
  //  - still downloading  -> start the bar where the background load has really
  //                          got to (from elapsed preload time), finish on onload
  if (_gamePreloadStarted) {
    if (_gamePreloadLoaded) {
      vaultLoaderComplete();
      _revealReloadBtn();
      _focusGame();
    } else if (_gamePreloadUrl === null) {
      vaultLoaderComplete();
    } else {
      vaultLoaderStart(_preloadProgressPct());
    }
    return;
  }

  // Fallback: preload was never kicked off - load now, bar from zero (original).
  vaultLoaderStart(0);
  var urlP = (game.iframe ? Promise.resolve(game.iframe) : (_launchUrlPromise || _resolveLaunchUrl(game)));
  urlP.then(function(url) {
    if (!url) { vaultLoaderComplete(); return; }
    vaultIframe.referrerPolicy = /^https:\/\/learn\.(pigmath\.com|edumain\.net)\//.test(url) ? 'origin' : 'no-referrer';
    vaultIframe.onload = function() { vaultLoaderComplete(); _revealReloadBtn(); _focusGame(); };
    _armIframeEscapeWatch(vaultIframe, url);
    vaultIframe.src = url;
  });
}

// Fire-and-forget play counter for the admin panel. keepalive lets it survive
// the navigation when a game takes over the tab, and every failure path is
// swallowed - a analytics call must never interfere with launching a game.
function _trackPlay(code) {
  if (!code || code === '0000') return;
  // Static build: there is no server to record plays on, so this is a no-op.
  // Kept as a function so every existing call site stays valid.
  void code;
}

function openVaultPlay(game, fromGrid) {
  // Switching straight from one game to another (side-card click) while the
  // previous game still has an ad or preload in flight left that state
  // dangling - the new game had to contend with an orphaned _adTimer /
  // _adsLoader / _adDisplayContainer from the one just left, which is what
  // showed up as an extra beat of delay before the new game visibly started
  // loading. Tear it down first, exactly like closeVault() already does.
  if (typeof _abortAd === 'function') _abortAd();
  _trackPlay(game && game.code);
  // resolve the real URL NOW, in parallel with the preroll ad, so it is ready
  // by the time the ad finishes - no added wait for the player.
  _launchUrlPromise = _resolveLaunchUrl(game);
  const mainArea = document.querySelector('.vault-main-area');
  if (mainArea) _savedScrollTop = mainArea.scrollTop;
  overlay.classList.add('open');
  overlay.style.display = 'flex';
  overlay.removeAttribute('aria-hidden');
  overlay.classList.add('vault-in-play');
  gridView.style.display = 'none';
  playView.style.display = 'flex';
  // Publish the frame-header height so the ad + loader overlays start below it
  // (they cover exactly the play area, not the Back/title/Exit row). Read here
  // while the play view is laid out so the value is correct on every screen.
  var _mf = document.querySelector('.vault-main-frame');
  var _hdr = _mf && _mf.querySelector('.vault-frame-header');
  if (_mf && _hdr && _hdr.offsetHeight) _mf.style.setProperty('--vault-header-h', _hdr.offsetHeight + 'px');
  _pushPlayAd();
  const sideL = document.getElementById('vault-sidebar');
  const sideR = document.getElementById('vault-sidebar-right');
  if (sidebarToggleBtn) sidebarToggleBtn.style.display = 'none';
  if (fromGrid) {
    backBtn.style.display = 'inline-flex';
    if (sideL) sideL.style.display = '';
    if (sideR) sideR.style.display = '';
    const others = getItems().filter(g => g.code !== game.code).sort(() => Math.random() - 0.5);
    sideCardsL.innerHTML = others.slice(0, 8).map(g => sideCardHTML(g)).join('');
    sideCardsR.innerHTML = others.slice(8, 16).map(g => sideCardHTML(g)).join('');
  } else {
    backBtn.style.display = 'none';
    if (sideL) sideL.style.display = 'none';
    if (sideR) sideR.style.display = 'none';
  }

  // Replace iframe element (no src yet — loaded after ad completes)
  const oldFrame = document.getElementById('vault-iframe');
  const newFrame = document.createElement('iframe');
  newFrame.id = 'vault-iframe';
  // Autoplay granted so games have sound without a click. The audio-under-ad
  // bleed is prevented a different way: the game is only ever LOADED when no ad
  // is playing (preloaded early only when the pre-roll is suppressed, otherwise
  // loaded after the ad finishes) - see _preloadGameFrame / _prerollSuppressed.
  newFrame.allow = 'autoplay; fullscreen; gamepad; pointer-lock';
  newFrame.style.display = 'none';
  oldFrame.parentNode.replaceChild(newFrame, oldFrame);
  vaultIframe = newFrame;

  // Store game and show splash screen
  _pendingGame = game;
  _gamePreloadStarted = false;
  _gamePreloadLoaded  = false;
  _gamePreloadUrl     = undefined;
  _gameRevealed       = false;
  _gamePreloadStart   = 0;
  _showSplash(game);

  playTitle.textContent = game.name;
  // Sync play-view fav button
  const pfb = document.getElementById('vault-play-fav-btn');
  if (pfb) {
    pfb.dataset.code = game.code;
    const on = _favs.has(game.code);
    pfb.classList.toggle('active', on);
    pfb.querySelector('i').className = on ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  }
}

function _restorePlaySidebars() {
  const sideL = document.getElementById('vault-sidebar');
  const sideR = document.getElementById('vault-sidebar-right');
  if (sideL) sideL.style.display = '';
  if (sideR) sideR.style.display = '';
}

function closeVault() {
  if (typeof _abortAd === 'function') _abortAd();
  if (window.EJS_emulator) {
    try { window.EJS_emulator.pause(); } catch(e) {}
  }
  _restorePlaySidebars();
  _hideSplash();
  _pendingGame = null;
  overlay.classList.remove('open', 'ios-fs');
  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden', 'true');
  _disarmIframeWatch();
  vaultIframe.src = '';
  vaultIframe.style.display = '';
  const exitBtn = document.getElementById('vault-ios-exit-btn');
  if (exitBtn) exitBtn.remove();
  const header = overlay.querySelector('.vault-frame-header');
  if (header) header.style.display = '';
}

// ── Favourites ────────────────────────────────────────────────────
const FAV_KEY = 'sc_game_favs';
let _favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));

function _saveFavs() {
  localStorage.setItem(FAV_KEY, JSON.stringify([..._favs]));
  _updateFavCounts();
}

// Drop favourites pointing at games that no longer exist in the catalog
// (e.g. removed games) so the count badge matches what's actually listable.
function _pruneFavs() {
  if (!window.VAULT_DATA || !window.VAULT_DATA.length) return;
  const validCodes = new Set(window.VAULT_DATA.map(g => g.code));
  let changed = false;
  for (const code of [..._favs]) {
    if (!validCodes.has(code)) { _favs.delete(code); changed = true; }
  }
  if (changed) _saveFavs();
}

function _updateFavCounts() {
  const n = _favs.size;
  const topCount = document.getElementById('vault-fav-count');
  const sideCount = document.getElementById('vault-fav-count-side');
  if (topCount)  { topCount.textContent = n;  topCount.style.display  = n ? 'inline-flex' : 'none'; }
  if (sideCount) { sideCount.textContent = n; sideCount.style.display = n ? 'inline-flex' : 'none'; }
}

function toggleFav(code) {
  if (_favs.has(code)) _favs.delete(code); else _favs.add(code);
  _saveFavs();
  // Update all heart buttons for this game currently in the grid
  document.querySelectorAll(`.v-fav-btn[data-fav="${code}"]`).forEach(btn => {
    btn.classList.toggle('active', _favs.has(code));
    btn.querySelector('i').className = _favs.has(code) ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    btn.classList.remove('pop');
    void btn.offsetWidth; // reflow to restart animation
    btn.classList.add('pop');
  });
  // Sync play-view fav button if it matches
  const pfb = document.getElementById('vault-play-fav-btn');
  if (pfb && pfb.dataset.code === code) {
    pfb.classList.toggle('active', _favs.has(code));
    pfb.querySelector('i').className = _favs.has(code) ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  }
  // If currently viewing favourites, re-render
  const activeLink = document.querySelector('.vault-cat-link.active');
  if (activeLink && activeLink.dataset.cat === '__favs__') renderGridOrRows(getItems());
}

_updateFavCounts();

// Favourites topbar button — toggle favs / all
(function() {
  var btn = document.getElementById('vault-fav-btn');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var favLink = document.getElementById('vault-fav-cat');
    if (!favLink) return;
    var isActive = favLink.classList.contains('active');
    if (isActive) {
      // Toggle back to All
      document.querySelectorAll('.vault-cat-link').forEach(l => l.classList.remove('active'));
      var allLink = document.querySelector('.vault-cat-link[data-cat=""]');
      if (allLink) allLink.classList.add('active');
      btn.classList.remove('active');
      loadVaultData(function() { renderGridOrRows(getItems()); });
    } else {
      document.querySelectorAll('.vault-cat-link').forEach(l => l.classList.remove('active'));
      favLink.classList.add('active');
      btn.classList.add('active');
      loadVaultData(function() { renderGridOrRows(getItems()); });
    }
    overlay.classList.remove('vault-in-play');
    gridView.style.display = 'flex';
    playView.style.display = 'none';
    backBtn.style.display = 'none';
  });
})();

function getItems() {
  const all = (window.VAULT_DATA || []).filter(g => g.code !== '0000');
  const activeLink = document.querySelector('.vault-cat-link.active');
  const cat = activeLink ? activeLink.dataset.cat : '';
  if (cat === '__favs__') return all.filter(g => _favs.has(g.code));
  let items = cat ? all.filter(g => g.category === cat) : all;
  return items;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Infinite-scroll grid ──────────────────────────────────────────
const GRID_PAGE = 40;          // cards per batch
let _gridGames  = [];          // full filtered list
let _gridOffset = 0;           // how many have been rendered
let _gridSentinel = null;      // IntersectionObserver target
let _gridObserver = null;      // the observer
let _imgObserver  = null;      // lazy-image observer (uses scroll container as root)

// Horizontal ad below the play iframe - mounted lazily each time a game
// actually opens, since .vault-overlay is display:none at page load and an
// eager mount while hidden would fetch a 0x0 slot (same bug fixed for the
// homepage calculator ads). Was already wired to push an AdSense unit here,
// but the matching <ins> markup had been removed at some point with the
// trigger left behind - this both restores a real container (sc-gam-playad,
// see index.ejs) and migrates the call off AdSense. No one-shot guard here -
// scMountGamSlot already throttles repeat impressions itself (SC_GAM_MIN_MS),
// so a fixed one-time flag just meant every game after the first one opened
// in a session got no ad at all.
function _pushPlayAd() {
  scMountGamSlot('sc-gam-playad', SC_GAM_RULES_BANNER);
}

function sideCardHTML(g) {
  return `<div class="vault-side-card" data-code="${escHtml(g.code)}">
    <div class="vault-side-thumb" style="background-image:url('${escHtml(g.thumb)}')"></div>
    <div class="vault-side-info"><span class="vault-side-title">${escHtml(g.name)}</span></div>
  </div>`;
}

function _initImgObserver() {
  if (_imgObserver) _imgObserver.disconnect();
  // Use the default (viewport) root instead of .vault-main-area: the vault
  // overlay is a fullscreen fixed modal, and creating the observer against a
  // container root in the same tick it becomes visible can compute against
  // stale/zero geometry - only correcting itself on a later scroll/resize.
  // Viewport-rooted observation sidesteps that entirely.
  _imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        img.src = img.dataset.src;
        _imgObserver.unobserve(img);
      }
    });
  }, { rootMargin: '500px 0px' });
}

// A thumbnail request that fails is usually transient (an R2/Cloudflare edge
// cache miss on a rarely-hit thumbnail, a brief network blip) rather than a
// truly missing file - the earlier behaviour just hid the <img> forever on
// the first error, which is why a stuck thumbnail would only ever fix itself
// on a full page reload (a fresh <img> element = a fresh attempt). Retry a
// couple of times with backoff before actually giving up.
function _retryThumb(img) {
  const tries = parseInt(img.dataset.retries || '0', 10);
  if (tries >= 2) { img.style.display = 'none'; return; }
  img.dataset.retries = String(tries + 1);
  const base = img.dataset.origSrc || img.src;
  img.dataset.origSrc = base;
  setTimeout(() => {
    // Cache-bust from the 2nd attempt on, in case the failure was a cached
    // error response rather than a fresh network issue.
    img.src = tries === 0 ? base : base + (base.indexOf('?') === -1 ? '?' : '&') + 'r=' + Date.now();
  }, 400 * (tries + 1));
}

function _cardHTML(g, idx) {
  const eager = idx < 20;
  const imgAttr = eager
    ? `src="${escHtml(g.thumb)}" fetchpriority="${idx < 8 ? 'high' : 'auto'}"`
    : `data-src="${escHtml(g.thumb)}"`;
  const isFav = _favs.has(g.code);
  return `<div class="v-card" data-code="${escHtml(g.code)}">
    <div class="v-thumb">
      <img ${imgAttr} alt="${escHtml(g.name)}" onload="this.classList.add('loaded');this.parentElement.classList.add('loaded')" onerror="_retryThumb(this)">
      <button class="v-fav-btn${isFav ? ' active' : ''}" data-fav="${escHtml(g.code)}" aria-label="Favourite"><i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i></button>
      <div class="v-card-overlay"><div class="v-play-btn">
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </div></div>
    </div>
    <div class="v-card-info"><h3 class="v-card-name">${escHtml(g.name)}</h3></div>
  </div>`;
}


function _appendBatch() {
  if (_gridOffset >= _gridGames.length) {
    if (_gridSentinel) { _gridSentinel.remove(); _gridSentinel = null; }
    return;
  }
  const startIdx = _gridOffset;
  const batch = _gridGames.slice(_gridOffset, _gridOffset + GRID_PAGE);
  _gridOffset += batch.length;
  const frag = document.createDocumentFragment();
  batch.forEach((g, i) => {
    const div = document.createElement('div');
    div.innerHTML = _cardHTML(g, startIdx + i);
    frag.appendChild(div.firstChild);
  });
  // Remove old sentinel before appending batch
  if (_gridSentinel) _gridSentinel.remove();
  vaultGrid.appendChild(frag);
  // Observe new images for lazy loading
  vaultGrid.querySelectorAll('img[data-src]:not([src])').forEach(img => _imgObserver.observe(img));
  if (_gridOffset < _gridGames.length) _addGridSentinel();
}

function _addGridSentinel() {
  if (_gridSentinel) _gridSentinel.remove();
  _gridSentinel = document.createElement('div');
  _gridSentinel.className = 'vault-grid-sentinel';
  vaultGrid.appendChild(_gridSentinel);
  _gridObserver.observe(_gridSentinel);
}

function _initGridObserver() {
  if (_gridObserver) _gridObserver.disconnect();
  _gridObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        _gridObserver.unobserve(e.target);
        _appendBatch();
      }
    });
  }, { rootMargin: '300px 0px' });
}



// ── Collapsible full-width category rows (shown only on the "All" tab) ──
const CAT_ROW_LABELS = {
  action: 'Action', adventure: 'Adventure', apps: 'Apps', arcade: 'Arcade', casual: 'Casual',
  horror: 'Horror', idle: 'Idle', io: 'IO', platformer: 'Platformer',
  puzzle: 'Puzzle', racing: 'Racing', shooter: 'Shooter', sports: 'Sports',
  strategy: 'Strategy', 'open-world': 'Open World', multiplayer: 'Multiplayer'
};
const CAT_ROW_COLLAPSE_PREFIX = 'vault-cat-row-collapsed-';

function renderCategoryRows(games) {
  _initImgObserver();
  if (_gridObserver) _gridObserver.disconnect();
  _gridSentinel = null;
  vaultGrid.classList.add('vault-grid-rows-mode');
  vaultGrid.innerHTML = '';

  if (!games.length) {
    vaultGrid.innerHTML = '<p class="v-card-empty">No results found.</p>';
    return;
  }

  const groups = new Map();
  games.forEach(g => {
    const key = g.category || 'other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(g);
  });

  const frag = document.createDocumentFragment();
  let idx = 0;

  groups.forEach((list, catKey) => {
    const collapsed = localStorage.getItem(CAT_ROW_COLLAPSE_PREFIX + catKey) === '1';
    const row = document.createElement('div');
    row.className = 'vault-cat-row' + (collapsed ? ' collapsed' : '');
    row.dataset.cat = catKey;
    const label = CAT_ROW_LABELS[catKey] || (catKey.charAt(0).toUpperCase() + catKey.slice(1));
    row.innerHTML = '<button class="vault-cat-row-header" type="button">' +
      '<span class="vault-cat-row-title">' + escHtml(label) + '<span class="vault-cat-row-count">' + list.length + '</span></span>' +
      '<i class="fa-solid fa-chevron-down vault-cat-row-arrow"></i></button>' +
      '<div class="vault-grid"></div>';
    const gridEl = row.querySelector('.vault-grid');
    list.forEach(g => {
      const div = document.createElement('div');
      div.innerHTML = _cardHTML(g, idx++);
      gridEl.appendChild(div.firstChild);
    });
    frag.appendChild(row);
  });

  vaultGrid.appendChild(frag);
  vaultGrid.querySelectorAll('img[data-src]:not([src])').forEach(img => _imgObserver.observe(img));
}

// Picks flat infinite-scroll grid vs. grouped collapsible rows depending on
// whether the user is browsing "All" with no active search.
function renderGridOrRows(games) {
  // Collapsible category rows disabled for now - always use the flat grid.
  // Set this to true to bring rows back (renderCategoryRows is still intact below).
  const ROWS_ENABLED = false;
  if (ROWS_ENABLED) {
    const searchQuery = searchInput ? searchInput.value.trim() : '';
    const activeLink = document.querySelector('.vault-cat-link.active');
    const cat = activeLink ? activeLink.dataset.cat : '';
    if (!searchQuery && !cat) {
      renderCategoryRows(games);
      return;
    }
  }
  renderGrid(games);
}

function renderGrid(games) {
  vaultGrid.classList.remove('vault-grid-rows-mode');
  _initGridObserver();
  _initImgObserver();

  _gridGames = games;

  _gridOffset = 0;
  vaultGrid.innerHTML = '';
  _gridSentinel = null;
  if (!_gridGames.length) {
    vaultGrid.innerHTML = '<p class="v-card-empty">No results found.</p>';
    return;
  }
  _appendBatch();
  // Load a second batch immediately so the full viewport is filled on first render
  if (_gridOffset < _gridGames.length) _appendBatch();
}

// Event delegation for grid clicks
vaultGrid.addEventListener('click', e => {
  // Category row collapse/expand toggle
  const rowHeader = e.target.closest('.vault-cat-row-header');
  if (rowHeader) {
    const row = rowHeader.closest('.vault-cat-row');
    if (row) {
      const nowCollapsed = row.classList.toggle('collapsed');
      if (row.dataset.cat && row.dataset.cat !== '__featured__') {
        localStorage.setItem(CAT_ROW_COLLAPSE_PREFIX + row.dataset.cat, nowCollapsed ? '1' : '0');
      }
    }
    return;
  }
  // Heart toggle
  const favBtn = e.target.closest('.v-fav-btn');
  if (favBtn) { e.stopPropagation(); toggleFav(favBtn.dataset.fav); return; }
  const card = e.target.closest('.v-card');
  if (!card) return;
  const game = (window.VAULT_DATA || []).find(g => g.code === card.dataset.code);
  if (game) openVaultPlay(game, true);
});

// Event delegation for side card clicks
[sideCardsL, sideCardsR].forEach(el => {
  el.addEventListener('click', e => {
    const card = e.target.closest('.vault-side-card');
    if (!card) return;
    const game = (window.VAULT_DATA || []).find(g => g.code === card.dataset.code);
    if (game) openVaultPlay(game, true);
  });
});

// Category sidebar links
document.querySelectorAll('.vault-cat-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.vault-cat-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    renderGridOrRows(getItems());
  });
});

// Vault controls
document.getElementById('vault-frame-back-btn').addEventListener('click', () => backBtn.click());
backBtn.addEventListener('click', () => {
  // Back out mid-roll: stop the ad, don't launch the game behind it.
  if (typeof _abortAd === 'function') _abortAd();
  _hideSplash();
  _pendingGame = null;
  overlay.classList.remove('vault-in-play');
  playView.style.display = 'none';
  gridView.style.display = 'flex';
  backBtn.style.display  = 'none';
  if (sidebarToggleBtn) sidebarToggleBtn.style.display = '';
  _disarmIframeWatch();
  vaultIframe.src = '';
  vaultIframe.style.display = '';
  requestAnimationFrame(() => {
    const mainArea = document.querySelector('.vault-main-area');
    if (mainArea) mainArea.scrollTop = _savedScrollTop;
  });
});

closeBtn.addEventListener('click', closeVault);

// Play-view fav button
(function() {
  const pfb = document.getElementById('vault-play-fav-btn');
  if (!pfb) return;
  pfb.addEventListener('click', function() {
    const code = pfb.dataset.code;
    if (!code) return;
    toggleFav(code);
    pfb.classList.remove('pop');
    void pfb.offsetWidth;
    pfb.classList.add('pop');
  });
})();

var _escHint  = document.getElementById('vault-esc-hint');
var _escClose = document.getElementById('vault-esc-close');
if (_escHint && localStorage.getItem('sc_esc_hint_dismissed') === '1') _escHint.style.display = 'none';
if (_escClose) _escClose.addEventListener('click', function() {
  if (_escHint) _escHint.style.display = 'none';
  localStorage.setItem('sc_esc_hint_dismissed', '1');
});

var _discordBar = document.getElementById('vault-discord-bar');
var _discordBarClose = document.getElementById('vault-discord-bar-close');
if (_discordBar && localStorage.getItem('sc_discord_bar_dismissed') === '1') {
  _discordBar.classList.add('vault-discord-bar-hidden');
}
if (_discordBarClose) _discordBarClose.addEventListener('click', function() {
  if (_discordBar) _discordBar.classList.add('vault-discord-bar-hidden');
  localStorage.setItem('sc_discord_bar_dismissed', '1');
});

const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
               (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));

function _iosFakeFS(overlay) {
  const header = overlay.querySelector('.vault-frame-header');
  let exitBtn = document.getElementById('vault-ios-exit-btn');
  if (overlay.classList.contains('ios-fs')) {
    overlay.classList.remove('ios-fs');
    if (header) header.style.display = '';
    if (exitBtn) exitBtn.remove();
  } else {
    overlay.classList.add('ios-fs');
    if (header) header.style.display = 'none';
    exitBtn = document.createElement('button');
    exitBtn.id = 'vault-ios-exit-btn';
    exitBtn.textContent = '⛶';
    exitBtn.title = 'Exit Fullscreen';
    exitBtn.style.cssText = 'position:fixed;top:max(10px,env(safe-area-inset-top,10px));right:10px;z-index:99999;background:rgba(0,0,0,0.65);color:#fff;border:1px solid rgba(255,255,255,0.25);border-radius:8px;padding:6px 10px;font-size:1rem;cursor:pointer;touch-action:manipulation;';
    exitBtn.addEventListener('click', () => _iosFakeFS(overlay));
    overlay.appendChild(exitBtn);
  }
}

if (fsBtn) fsBtn.addEventListener('click', () => {
  const frame = document.getElementById('vault-iframe');
  if (_isIOS) {
    _iosFakeFS(document.getElementById('vault-overlay'));
  } else if (frame && frame.requestFullscreen) {
    // Focus the iframe afterwards: going fullscreen leaves keyboard focus on
    // this button, so key presses never reach the game until the player clicks.
    frame.requestFullscreen().then(function(){ _focusFrame(frame); }, function(){});
  } else if (frame && frame.webkitRequestFullscreen) {
    frame.webkitRequestFullscreen();
    setTimeout(function(){ _focusFrame(frame); }, 80);
  }
});

// Reload button - restarts the CURRENT activity from scratch, inside the vault:
// aborts any in-flight ad, tears down the running iframe, and reopens the same
// game from its splash screen. Reopening goes through the normal Start flow
// (frequency cap / pre-roll) again.
function _reloadCurrentGame() {
  // _pendingGame is set while on the splash (correct there); _currentIframeGame
  // is the launched game. Prefer pending so reloading from the splash reloads
  // the game being opened, not a previously-played one.
  var game = _pendingGame || _currentIframeGame;
  if (!game) return;
  if (typeof _abortAd === 'function') _abortAd();
  var fromGrid = backBtn ? backBtn.style.display !== 'none' : true;
  openVaultPlay(game, fromGrid);
}
if (reloadBtn) reloadBtn.addEventListener('click', _reloadCurrentGame);

function _focusFrame(frame) {
  if (!frame) return;
  try {
    frame.focus();
    // cross-origin games can't be reached into, but focusing their window works
    if (frame.contentWindow) frame.contentWindow.focus();
  } catch (e) {}
}

// covers Esc-exit and any browser-initiated fullscreen change too
document.addEventListener('fullscreenchange', function () {
  if (document.fullscreenElement) _focusFrame(document.getElementById('vault-iframe'));
});

// Top loader bar for iframe navigation
var _loaderTimer = null;
var _loaderEl = (function() {
  var el = document.createElement('div');
  el.id = 'vault-loader-bar';
  var inner = document.createElement('div');
  inner.id = 'vault-loader-fill';
  el.appendChild(inner);
  // Scoped to the actual gameplay screen, not just the first match - the GBA
  // panel has its own .vault-frame-header too (for its Back/Restart/Fullscreen
  // row), and it sits earlier in the DOM, so a bare selector silently stole
  // the loader bar away from the real play view.
  var header = document.querySelector('#vault-play-view .vault-frame-header');
  if (header) header.appendChild(el);
  return inner;
})();

// GBA loader bar — same thin 3px style as the vault loader
var _gbaLoaderEl = (function() {
  var el = document.createElement('div');
  el.id = 'gba-loader-bar';
  var inner = document.createElement('div');
  inner.id = 'gba-loader-fill';
  el.appendChild(inner);
  var header = document.querySelector('#gba-player-wrap .vault-frame-header');
  if (header) header.appendChild(el);
  return inner;
})();

function vaultLoaderStart(fromPct) {
  if (!_loaderEl) return;
  clearTimeout(_loaderTimer);
  _loaderEl.parentElement.classList.remove('vault-loader-done');
  _loaderEl.style.transition = 'none';
  // Preloaded games have been downloading during the ad, so the bar can start
  // well along instead of at zero - it reflects real progress already made.
  _loaderEl.style.width = (fromPct || 0) + '%';
  _loaderEl.parentElement.style.opacity = '1';
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      _loaderEl.style.transition = 'width 8s cubic-bezier(0.1, 0.5, 0.3, 1)';
      _loaderEl.style.width = '85%';
    });
  });
}

function vaultLoaderComplete() {
  if (!_loaderEl) return;
  clearTimeout(_loaderTimer);
  _loaderEl.style.transition = 'width 0.2s ease';
  _loaderEl.style.width = '100%';
  _loaderTimer = setTimeout(function() {
    _loaderEl.parentElement.style.opacity = '0';
    _loaderEl.style.width = '0%';
  }, 300);
}


// Search
const searchClear = document.getElementById('vault-search-clear');

function updateSearchClear() {
  searchClear.style.display = searchInput.value ? 'block' : 'none';
}

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  updateSearchClear();
  renderGridOrRows(getItems());
  searchInput.focus();
});

let searchTimer;
searchInput.addEventListener('input', () => {
  updateSearchClear();
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    var gbaPanel = document.getElementById('vault-gba-panel');
    if (gbaPanel && gbaPanel.style.display !== 'none') {
      if (window.gbaPopulateShelf) window.gbaPopulateShelf(searchInput.value.trim());
    } else if (playView.style.display === 'none' || playView.style.display === '') {
      renderGrid(filterItems(searchInput.value));
    }
  }, 180);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && playView.style.display === 'flex') {
    overlay.classList.remove('vault-in-play');
    playView.style.display = 'none';
    gridView.style.display = 'flex';
    backBtn.style.display = 'none';
    if (sidebarToggleBtn) sidebarToggleBtn.style.display = '';
    _disarmIframeWatch();
  vaultIframe.src = '';
    renderGrid(filterItems(searchInput.value));
  }
});

function filterItems(q) {
  if (!q) return getItems();
  const lq = q.toLowerCase();
  return getItems().filter(g =>
    g.name.toLowerCase().includes(lq) || g.code.includes(lq)
  );
}

// ── Calculator theme switcher ─────────────────────────────────────
(function() {
  var calcCol = document.getElementById('calc-col');
  if (!calcCol) return;

  // Per-theme state store: { expr, lastResult, display, exprLine }
  var themeStates = {};

  function currentTheme() {
    return calcCol.dataset.calcTheme || 'pastel';
  }

  function saveThemeState(theme) {
    themeStates[theme] = {
      expr: expr,
      lastResult: lastResult,
      displayVal: display.textContent,
      exprVal: exprLine.textContent
    };
  }

  function restoreThemeState(theme) {
    var s = themeStates[theme];
    if (s) {
      expr = s.expr;
      lastResult = s.lastResult;
      updateDisplay(s.displayVal);
      updateExpr(s.exprVal);
    } else {
      expr = ''; lastResult = null;
      updateDisplay('0'); updateExpr('');
    }
  }

  document.querySelectorAll('.calc-theme-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var prev = currentTheme();
      var theme = btn.dataset.theme;
      if (prev === theme) return;
      saveThemeState(prev);
      calcCol.dataset.calcTheme = theme;
      document.querySelectorAll('.calc-theme-btn').forEach(function(b) {
        b.classList.toggle('active', b === btn);
      });
      restoreThemeState(theme);
    });
  });

  // Clear All button
  var clearAllBtn = document.getElementById('calc-clear-all-btn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', function() {
      themeStates = {};
      expr = ''; lastResult = null;
      updateDisplay('0'); updateExpr('');
    });
  }
})();

// Prefetch vault data in the background so it's ready when the user opens the vault
(window.requestIdleCallback || function(fn){ setTimeout(fn, 800); })(function() {
  loadVaultData(function() {});
});

// ── Secret Codes Feature ──────────────────────────────────────────
(function() {
  var codesTab    = document.getElementById('vault-codes-tab');
  var codesPanel  = document.getElementById('vault-codes-panel');
  var codesList   = document.getElementById('codes-list');
  var codesSearch = document.getElementById('codes-search');
  if (!codesTab) return;

  function renderCodesList(filter) {
    var games = (window.VAULT_DATA || []).filter(function(g) { return g.code !== '0000'; });
    if (filter) {
      var lf = filter.toLowerCase();
      games = games.filter(function(g) { return g.name.toLowerCase().includes(lf) || g.code.includes(lf); });
    }
    if (!games.length) {
      codesList.innerHTML = '<div class="codes-empty">No activities found.</div>';
      return;
    }
    codesList.innerHTML = games.map(function(g) {
      return '<div class="codes-row" data-code="' + g.code + '">'
        + '<img class="codes-thumb" src="' + escHtml(g.thumb) + '" alt="" loading="lazy">'
        + '<span class="codes-name">' + escHtml(g.name) + '</span>'
        + '<span class="codes-code">' + g.code + '</span>'
        + '</div>';
    }).join('');
    codesList.querySelectorAll('.codes-row').forEach(function(row) {
      row.addEventListener('click', function() {
        openVaultPlay((window.VAULT_DATA || []).find(function(g) { return g.code === row.dataset.code; }));
      });
    });
  }

  function showCodesPanel() {
    document.getElementById('vault-grid').style.display = 'none';
    codesPanel.style.display = 'flex';
    codesTab.classList.add('active');
    document.querySelectorAll('.vault-cat-link:not(#vault-codes-tab):not(#vault-gba-tab)').forEach(function(l) { l.classList.remove('active'); });
    loadVaultData(function() { renderCodesList(codesSearch.value); });
  }

  function hideCodesPanel() {
    document.getElementById('vault-grid').style.display = '';
    codesPanel.style.display = 'none';
    codesTab.classList.remove('active');
    document.querySelectorAll('.vault-cat-link').forEach(function(l) {
      l.classList.toggle('active', l.dataset.cat === '');
    });
    renderGridOrRows(getItems());
  }

  codesTab.addEventListener('click', function(e) {
    e.preventDefault();
    if (codesPanel.style.display === 'none') showCodesPanel();
    else hideCodesPanel();
  });

  codesSearch.addEventListener('input', function() {
    renderCodesList(codesSearch.value);
  });

  document.querySelectorAll('.vault-cat-link:not(#vault-codes-tab)').forEach(function(link) {
    link.addEventListener('click', function() {
      if (codesPanel.style.display !== 'none') hideCodesPanel();
    });
  });

  document.getElementById('vault-close-btn').addEventListener('click', hideCodesPanel);
})();

// ── GBA Emulator (click-to-play shelf + bring-your-own-ROM) ─────────
(function() {
  var gbaTab    = document.getElementById('vault-gba-tab');
  var gbaPanel  = document.getElementById('vault-gba-panel');
  var uploadWrap = document.getElementById('gba-upload-wrap');
  var uploadBox = document.getElementById('gba-upload-box');
  var dropzone  = document.getElementById('gba-dropzone');
  var playerWrap = document.getElementById('gba-player-wrap');
  if (!gbaTab) return;

  var booted = false;
  var origDropzoneHTML = dropzone ? dropzone.innerHTML : '';

  var gbaHeader = document.querySelector('#vault-gba-panel .codes-header');
  var gbaSideL = document.getElementById('gba-side-cards');
  var gbaSideR = document.getElementById('gba-side-cards-right');

  var GBA_ROMS_CDN = '';   // static build: no ROM proxy, so the GBA tab is hidden
  var GBA_THUMBS_CDN = 'https://learn.edumain.net/img';

  var GBA_SHELF = [
    { title: 'Advance Wars', slug: 'advance-wars-usa-rev-1', thumb: 'advance-wars-usa-rev-1' },
    { title: 'Advance Wars 2', slug: 'advance-wars-2-black-hole-rising-usa', thumb: 'advance-wars-2-black-hole-rising-usa' },
    { title: 'Mario Kart: Super Circuit', slug: 'mario-kart-super-circuit-usa', thumb: 'mario-kart-super-circuit-usa' },
    { title: 'Kirby & The Amazing Mirror', slug: 'kirby-and-the-amazing-mirror-europe', thumb: 'kirby-and-the-amazing-mirror-europe' },
    { title: 'LEGO Star Wars', slug: 'lego-star-wars-the-video-game-usa-europe-en-fr-de-es-it-nl-da', thumb: 'lego-star-wars-the-video-game-usa-europe-en-fr-de-es-it-nl-da' },
    { title: 'Metal Slug Advance', slug: 'metal-slug-advance-usa', thumb: 'metal-slug-advance-usa' },
    { title: 'GTA Advance', slug: 'grand-theft-auto-advance-usa', thumb: 'grand-theft-auto-advance-usa' },
    { title: 'NFS: Most Wanted', slug: 'need-for-speed-most-wanted-usa-europe-en-fr-de-it', thumb: 'need-for-speed-most-wanted-usa-europe-en-fr-de-it' },
    { title: 'Donkey Kong Country 3', slug: 'donkey-kong-country-3-usa', thumb: 'donkey-kong-country-3-usa' },
    { title: 'Harry Potter: CoS', slug: 'harry-potter-and-the-chamber-of-secrets-usa-europe-en-fr-de-es-it-nl-pt-sv-no-da', thumb: 'harry-potter-and-the-chamber-of-secrets-usa-europe-en-fr-de-es-it-nl-pt-sv-no-da' },
    { title: 'Mortal Kombat: TE', slug: 'mortal-kombat-tournament-edition-usa', thumb: 'mortal-kombat-tournament-edition-usa' },
    { title: 'Crash Nitro Kart', slug: 'crash-nitro-kart-usa', thumb: 'crash-nitro-kart-usa' },
    { title: 'Astro Boy: Omega Factor', slug: 'astro-boy-omega-factor-usa-en-ja-fr-de-es-it', thumb: 'astro-boy-omega-factor-usa-en-ja-fr-de-es-it' },
    { title: 'Batman Begins', slug: 'batman-begins-usa-europe-en-fr-de-es-it-nl', thumb: 'batman-begins-usa-europe-en-fr-de-es-it-nl' },
    { title: 'MotoGP', slug: 'motogp-usa-en-fr-de-es-it', thumb: 'motogp-usa-en-fr-de-es-it' },
    { title: 'Harvest Moon: Mineral Town', slug: 'harvest-moon-more-friends-of-mineral-town-usa', thumb: 'harvest-moon-more-friends-of-mineral-town-usa' },
    { title: 'Tekken Advance', slug: 'tekken-advance-usa', thumb: 'tekken-advance-usa' }
  ];

  function gbaShelfCardHTML(g) {
    var src = GBA_THUMBS_CDN + '/' + encodeURIComponent(g.thumb) + '.png';
    return '<div class="vault-side-card" data-slug="' + escHtml(g.slug) + '" data-title="' + escHtml(g.title) + '">' +
      '<div class="vault-side-thumb" style="background-image:url(\'' + src + '\')"></div>' +
      '<div class="vault-side-info"><span class="vault-side-title">' + escHtml(g.title) + '</span></div>' +
      '</div>';
  }

  var _gbaEverBooted = false;

  // Bring-your-own-ROM equivalent of the sessionStorage slug hand-off below:
  // loader.js can't re-execute either, so an upload while a game is already
  // booted also has to go through a reload. A File can't survive that
  // reload via sessionStorage (it's not serialisable and ROMs run multi-MB),
  // so it's stashed in IndexedDB instead and picked back up below.
  var GBA_UPLOAD_DB = 'gba_upload_cache';
  function _gbaSaveUpload(file) {
    return new Promise(function(resolve, reject) {
      if (!window.indexedDB) { reject(new Error('no idb')); return; }
      var req = indexedDB.open(GBA_UPLOAD_DB, 1);
      req.onupgradeneeded = function() { req.result.createObjectStore('files'); };
      req.onsuccess = function() {
        var db = req.result;
        var tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').put({ name: file.name, blob: file }, 'pending');
        tx.oncomplete = function() { db.close(); resolve(); };
        tx.onerror = function() { db.close(); reject(tx.error); };
      };
      req.onerror = function() { reject(req.error); };
    });
  }
  function _gbaLoadPendingUpload() {
    return new Promise(function(resolve) {
      if (!window.indexedDB) { resolve(null); return; }
      var req = indexedDB.open(GBA_UPLOAD_DB, 1);
      req.onupgradeneeded = function() { req.result.createObjectStore('files'); };
      req.onsuccess = function() {
        var db = req.result;
        var tx = db.transaction('files', 'readwrite');
        var store = tx.objectStore('files');
        var getReq = store.get('pending');
        getReq.onsuccess = function() {
          var data = getReq.result;
          store.delete('pending');
          tx.oncomplete = function() {
            db.close();
            resolve(data ? new File([data.blob], data.name) : null);
          };
        };
        getReq.onerror = function() { db.close(); resolve(null); };
      };
      req.onerror = function() { resolve(null); };
    });
  }

  function bootEmulatorFromSlug(slug, title) {
    // loader.js uses top-level `const` — can't re-execute in the same page.
    // Store the target and reload; the auto-boot code below picks it up.
    if (_gbaEverBooted) {
      sessionStorage.setItem('gba_boot', JSON.stringify({ slug: slug, title: title }));
      location.reload();
      return;
    }
    _doGbaBoot(slug, title);
  }

  // Check for auto-boot after reload
  (function() {
    var pending = null;
    try { pending = JSON.parse(sessionStorage.getItem('gba_boot')); } catch(e) {}
    sessionStorage.removeItem('gba_boot');
    if (pending && pending.slug) {
      setTimeout(function() {
        document.documentElement.classList.remove('gba-reloading');
        var overlay = document.getElementById('vault-overlay');
        if (overlay && !overlay.classList.contains('open')) {
          overlay.classList.add('open');
          overlay.setAttribute('aria-hidden', 'false');
        }
        showGbaPanel();
        setTimeout(function() { _doGbaBoot(pending.slug, pending.title); }, 100);
      }, 200);
      return;
    }

    if (!sessionStorage.getItem('gba_boot_upload')) return;
    sessionStorage.removeItem('gba_boot_upload');
    _gbaLoadPendingUpload().then(function(file) {
      document.documentElement.classList.remove('gba-reloading');
      if (!file) return;
      setTimeout(function() {
        var overlay = document.getElementById('vault-overlay');
        if (overlay && !overlay.classList.contains('open')) {
          overlay.classList.add('open');
          overlay.setAttribute('aria-hidden', 'false');
        }
        showGbaPanel();
        setTimeout(function() { bootEmulator(file); }, 100);
      }, 200);
    });
  })();

  function _doGbaBoot(slug, title) {
    var romUrl = GBA_ROMS_CDN + slug;
    var origHTML = dropzone.innerHTML;
    dropzone.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin gba-dropzone-icon"></i>' +
      '<p class="gba-dropzone-title">Loading ' + escHtml(title) + '...</p>' +
      '<p class="gba-dropzone-sub">Fetching ROM from server</p>';
    dropzone.style.pointerEvents = 'none';

    // Show player wrap during download so the thin progress bar is visible
    if (uploadWrap) uploadWrap.style.display = 'none';
    if (gbaHeader) gbaHeader.style.display = 'none';
    playerWrap.style.display = 'flex';
    var titleEl = document.getElementById('gba-play-title');
    if (titleEl) titleEl.textContent = title;

    // Show the thin loader bar in the GBA frame header
    if (_gbaLoaderEl) {
      _gbaLoaderEl.parentElement.style.opacity = '1';
      _gbaLoaderEl.style.transition = 'none';
      _gbaLoaderEl.style.width = '0%';
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          _gbaLoaderEl.style.transition = 'width 0.15s ease';
        });
      });
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', romUrl, true);
    xhr.responseType = 'arraybuffer';
    xhr.onprogress = function(e) {
      if (e.lengthComputable && _gbaLoaderEl) {
        _gbaLoaderEl.style.width = Math.round((e.loaded / e.total) * 100) + '%';
      }
      var sub = dropzone.querySelector('.gba-dropzone-sub');
      if (!sub) return;
      if (e.lengthComputable) {
        var loaded = (e.loaded / 1048576).toFixed(2);
        var total = (e.total / 1048576).toFixed(2);
        sub.textContent = loaded + ' MB / ' + total + ' MB';
      } else {
        var loadedU = (e.loaded / 1048576).toFixed(2);
        sub.textContent = loadedU + ' MB / -- MB';
      }
    };
    xhr.onload = function() {
      if (xhr.status !== 200) return xhr.onerror();
      if (_gbaLoaderEl) {
        _gbaLoaderEl.style.width = '100%';
        setTimeout(function() {
          _gbaLoaderEl.parentElement.style.opacity = '0';
          _gbaLoaderEl.style.width = '0%';
        }, 300);
      }
      var blob = new Blob([xhr.response], { type: 'application/octet-stream' });
      var file = new File([blob], title + '.gba', { type: 'application/octet-stream' });
      bootEmulator(file);
    };
    xhr.onerror = function() {
      if (_gbaLoaderEl) {
        _gbaLoaderEl.parentElement.style.opacity = '0';
        _gbaLoaderEl.style.width = '0%';
      }
      dropzone.innerHTML = origHTML;
      dropzone.style.pointerEvents = '';
      var sub = dropzone.querySelector('.gba-dropzone-sub');
      if (sub) sub.textContent = 'Could not load ' + title + '. Choose a .gba file from your device instead.';
      dropzone.classList.add('gba-dz-pulse');
      setTimeout(function() { dropzone.classList.remove('gba-dz-pulse'); }, 1200);
    };
    xhr.send();
  }

  function populateGbaSideCards(query) {
    if (!gbaSideL || !gbaSideR) return;
    var list = GBA_SHELF;
    if (query) {
      var q = query.toLowerCase();
      list = GBA_SHELF.filter(function(g) { return g.title.toLowerCase().indexOf(q) !== -1; });
    }
    var shuffled = list.slice().sort(function() { return Math.random() - 0.5; });
    gbaSideL.innerHTML = shuffled.slice(0, 8).map(gbaShelfCardHTML).join('');
    gbaSideR.innerHTML = shuffled.slice(8, 16).map(gbaShelfCardHTML).join('');
    [gbaSideL, gbaSideR].forEach(function(col) {
      col.querySelectorAll('.vault-side-card').forEach(function(card) {
        card.addEventListener('click', function() {
          bootEmulatorFromSlug(card.dataset.slug, card.dataset.title);
        });
      });
    });
  }
  window.gbaPopulateShelf = populateGbaSideCards;

  function bootEmulator(file) {
    var url = URL.createObjectURL(file);
    // Replace the entire #game node to kill old emulator's canvas, rAF loop,
    // and any ejs_parent class. EmulatorJS has no destroy() method so DOM
    // replacement is the only reliable cleanup.
    var gameHost = document.getElementById('game');
    if (gameHost) {
      var fresh = gameHost.cloneNode(false);
      gameHost.parentNode.replaceChild(fresh, gameHost);
    }
    if (uploadWrap) uploadWrap.style.display = 'none';
    if (uploadBox) uploadBox.style.display = 'none';
    if (gbaHeader) gbaHeader.style.display = 'none';
    playerWrap.style.display = 'flex';
    var titleName = file.name.replace(/\.gba$/i, '');
    var titleEl = document.getElementById('gba-play-title');
    if (titleEl) titleEl.textContent = titleName;
    window.EJS_player = '#game';
    window.EJS_core = 'gba';
    window.EJS_pathtodata = '/assets/emulatorjs/data/';
    window.EJS_gameUrl = url;
    window.EJS_gameName = titleName;
    window.EJS_startOnLoaded = true;
    // Remove old loader scripts to prevent accumulation
    document.querySelectorAll('script[src*="loader.js"]').forEach(function(s) { s.remove(); });
    var s = document.createElement('script');
    s.src = '/assets/emulatorjs/data/loader.js';
    document.body.appendChild(s);
    booted = true;
    _gbaEverBooted = true;
  }

  function _gbaReloadWithUpload(file) {
    _gbaSaveUpload(file).then(function() {
      sessionStorage.setItem('gba_boot_upload', '1');
      location.reload();
    }).catch(function() { location.reload(); });
  }

  // Delegated on the panel, not the input itself: the Back button and the
  // ROM-fetch-error fallback both reset the dropzone via innerHTML, which
  // creates a brand-new #gba-file-input with no listeners of its own. A
  // listener bound once to the original node stops firing the moment that
  // happens, silently breaking "Choose ROM File" for the rest of the visit -
  // delegation keeps working no matter how many times that node is replaced.
  //
  // Gated on _gbaEverBooted, not `booted`: Back resets `booted` to false so
  // the panel looks fresh, but loader.js's top-level `const`s are still
  // declared in this page's JS realm from the earlier game - calling
  // bootEmulator() directly again throws "Identifier ... has already been
  // declared" and the upload silently fails to start. _gbaEverBooted never
  // resets, so it always routes back through the reload path once anything
  // (shelf game or upload) has booted the emulator this page load - exactly
  // like bootEmulatorFromSlug already does for the shelf games.
  gbaPanel.addEventListener('change', function(e) {
    if (!e.target || e.target.id !== 'gba-file-input') return;
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    if (_gbaEverBooted) { _gbaReloadWithUpload(file); return; }
    bootEmulator(file);
  });

  ['dragover', 'dragleave', 'drop'].forEach(function(evt) {
    dropzone.addEventListener(evt, function(e) { e.preventDefault(); });
  });
  dropzone.addEventListener('dragover', function() { dropzone.classList.add('gba-drag-over'); });
  dropzone.addEventListener('dragleave', function() { dropzone.classList.remove('gba-drag-over'); });
  dropzone.addEventListener('drop', function(e) {
    dropzone.classList.remove('gba-drag-over');
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && /\.gba$/i.test(file.name)) {
      if (_gbaEverBooted) { _gbaReloadWithUpload(file); return; }
      bootEmulator(file);
    }
  });

  function showGbaPanel() {
    document.getElementById('vault-grid').style.display = 'none';
    gbaPanel.style.display = 'flex';
    gbaTab.classList.add('active');
    document.querySelectorAll('.vault-cat-link:not(#vault-gba-tab)').forEach(function(l) { l.classList.remove('active'); });
    var codesPanel = document.getElementById('vault-codes-panel');
    if (codesPanel) codesPanel.style.display = 'none';
    if (!booted) populateGbaSideCards();
  }

  function hideGbaPanel() {
    if (window.EJS_emulator) {
      try { window.EJS_emulator.pause(); } catch(e) {}
    }
    searchInput.value = '';
    updateSearchClear();
    document.getElementById('vault-grid').style.display = '';
    gbaPanel.style.display = 'none';
    gbaTab.classList.remove('active');
    document.querySelectorAll('.vault-cat-link').forEach(function(l) {
      l.classList.toggle('active', l.dataset.cat === '');
    });
    renderGridOrRows(getItems());
  }

  gbaTab.addEventListener('click', function(e) {
    e.preventDefault();
    if (gbaPanel.style.display === 'none') showGbaPanel();
    else hideGbaPanel();
  });

  document.querySelectorAll('.vault-cat-link:not(#vault-gba-tab)').forEach(function(link) {
    link.addEventListener('click', function() {
      if (gbaPanel.style.display !== 'none') hideGbaPanel();
    });
  });

  document.getElementById('vault-close-btn').addEventListener('click', hideGbaPanel);

  var gbaBackBtn = document.getElementById('gba-back-btn');
  if (gbaBackBtn) gbaBackBtn.addEventListener('click', function() {
    if (window.EJS_emulator) {
      try { window.EJS_emulator.pause(); } catch(e) {}
      try { window.EJS_emulator.destroy && window.EJS_emulator.destroy(); } catch(e) {}
      window.EJS_emulator = null;
    }
    var gameHost = document.getElementById('game');
    if (gameHost) gameHost.innerHTML = '';
    booted = false;
    searchInput.value = '';
    updateSearchClear();
    playerWrap.style.display = 'none';
    if (uploadWrap) uploadWrap.style.display = '';
    if (uploadBox) uploadBox.style.display = '';
    if (gbaHeader) gbaHeader.style.display = '';
    if (dropzone) {
      dropzone.innerHTML = origDropzoneHTML;
      dropzone.style.pointerEvents = '';
    }
  });

  var gbaRestartBtn = document.getElementById('gba-restart-btn');
  if (gbaRestartBtn) gbaRestartBtn.addEventListener('click', function() {
    if (window.EJS_emulator && window.EJS_emulator.gameManager) {
      window.EJS_emulator.gameManager.restart();
    } else {
      location.reload();
    }
  });

  var gbaFsBtn = document.getElementById('gba-fs-btn');
  if (gbaFsBtn) gbaFsBtn.addEventListener('click', function() {
    if (window.EJS_emulator) window.EJS_emulator.toggleFullscreen(true);
  });
})();


// ── Scratch notes ────────────────────────────────────────────────
// Ruled-paper notepad under the calculator. Everything stays in this browser:
// the text is kept in localStorage and never sent anywhere.
(function () {
  const area = document.getElementById('notes-area');
  if (!area) return;                       // not on this page
  const KEY = 'sc_notes';
  const $n = (id) => document.getElementById(id);
  const savedEl = $n('notes-saved');

  // Own undo stack: the browser's native one is lost whenever we set .value
  // programmatically (Insert Answer, Clear), which would strand the user.
  let stack = [], at = -1, muted = false;

  function counts() {
    if (typeof syncButtons === 'function') syncButtons();
  }
  function syncButtons() {
    $n('nb-undo').disabled = at <= 0;
    $n('nb-redo').disabled = at >= stack.length - 1;
    // Nothing written yet: printing would emit a blank page and downloading an
    // empty file, so the actions that produce output stay disabled until there
    // is actually something to output.
    const empty = area.value.trim() === '';
    ['nb-print', 'nb-txt', 'nb-copy', 'nb-clear'].forEach((id) => {
      const b = $n(id); if (b) b.disabled = empty;
    });
  }
  let saveTimer;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(KEY, area.value); } catch (e) {}
      if (savedEl) {
        savedEl.textContent = 'Saved';
        setTimeout(() => (savedEl.textContent = ''), 1200);
      }
    }, 400);
  }
  function push() {
    if (muted) return;
    stack = stack.slice(0, at + 1);
    if (stack[at] === area.value) return;
    stack.push(area.value);
    if (stack.length > 120) stack.shift();   // cap memory on long sessions
    at = stack.length - 1;
    syncButtons();
  }
  function setValue(v, keepCursor) {
    const pos = area.selectionStart;
    muted = true;
    area.value = v;
    muted = false;
    if (keepCursor) { try { area.setSelectionRange(pos, pos); } catch (e) {} }
    counts(); save();
  }

  // restore previous note
  try { area.value = localStorage.getItem(KEY) || ''; } catch (e) {}
  stack = [area.value]; at = 0;
  counts(); syncButtons();

  let typeTimer;
  area.addEventListener('input', () => {
    counts(); save();
    clearTimeout(typeTimer);
    typeTimer = setTimeout(push, 350);       // group keystrokes into one undo step
  });

  $n('nb-undo').addEventListener('click', () => {
    if (at > 0) { at--; setValue(stack[at]); syncButtons(); }
  });
  $n('nb-redo').addEventListener('click', () => {
    if (at < stack.length - 1) { at++; setValue(stack[at]); syncButtons(); }
  });

  // drop the calculator's current answer straight into the note
  $n('nb-ans').addEventListener('click', () => {
    const d = document.getElementById('calc-display');
    const val = d ? d.textContent.trim() : '';
    if (!val || val === 'Error') return;
    const p = area.selectionStart, t = area.value;
    const ins = (p > 0 && t[p - 1] && t[p - 1] !== '\n' && t[p - 1] !== ' ') ? ' ' + val : val;
    setValue(t.slice(0, p) + ins + t.slice(area.selectionEnd));
    area.focus();
    try { area.setSelectionRange(p + ins.length, p + ins.length); } catch (e) {}
    push();
  });

  $n('nb-copy').addEventListener('click', async () => {
    if (!area.value) return;
    const btn = $n('nb-copy'), label = btn.querySelector('span');
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(area.value); ok = true;
      }
    } catch (e) { ok = false; }
    if (!ok) {                                  // http/localhost fallback
      try { area.select(); ok = document.execCommand('copy'); area.setSelectionRange(0, 0); } catch (e) {}
    }
    if (label) { const old = label.textContent; label.textContent = ok ? 'Copied!' : 'Press Ctrl+C';
      setTimeout(() => (label.textContent = old), 1300); }
  });

  $n('nb-txt').addEventListener('click', () => {
    const blob = new Blob([area.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const stamp = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    a.href = url; a.download = 'solvecalc-notes-' + stamp + '.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // A textarea only prints the visible portion, so grow it to fit the text for
  // the print pass, then restore whatever height the user had dragged it to.
  let priorHeight = '';
  addEventListener('beforeprint', () => {
    priorHeight = area.style.height;
    area.style.height = 'auto';
    area.style.height = area.scrollHeight + 'px';
  });
  addEventListener('afterprint', () => { area.style.height = priorHeight; });
  $n('nb-print').addEventListener('click', () => window.print());

  // No confirm dialog - clearing is instant. It's pushed onto the undo stack
  // first, so a mis-tap is one Undo away rather than a lost note.
  $n('nb-clear').addEventListener('click', () => {
    if (!area.value) return;
    push();
    setValue('');
    push();
    area.focus();
  });

  // Ctrl/Cmd+Z and Ctrl+Y while the note has focus
  area.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); $n('nb-undo').click(); }
    else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); $n('nb-redo').click(); }
  });
})();

// ── Ad slot state resolver ───────────────────────────────────────────────
// Decides, per slot, whether an ad ACTUALLY RENDERED and tags the wrapper
// .sc-ad-filled or .sc-ad-empty. All the spacing keys off that class - see
// the matching block in style.css.
//
// Driven by GPT's own slotRenderEnded event rather than polling the DOM for a
// rendered height. event.isEmpty is the verdict Google itself reports, so
// there is no risk of reading a placeholder mid-collapse as "filled" - the
// exact AdSense-era bug (no ad on screen AND no gap) the old height-polling
// version of this function existed to avoid, now handled by trusting the ad
// server's own event instead of guessing from measured pixels.
//
// scMountGamSlot() tags slot.__scContainerId right after defineSlot(), which
// is how the event handler below finds its way back to the wrapping .sc-ad
// box - GPT's event only carries the slot object, not the container element.
(function () {
  function paint(box, filled) {
    box.classList.toggle('sc-ad-filled', filled);
    box.classList.toggle('sc-ad-empty', !filled);
    if (!filled) {
      // Our own div, not Google's markup, so there is no forced !important
      // display rule to fight (that was specifically an AdSense ins.adsbygoogle
      // behaviour). Safe to just remove it once the slot has resolved empty.
      var mounted = box.firstElementChild;
      if (mounted) mounted.remove();
    }
  }

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    googletag.pubads().addEventListener('slotRenderEnded', function (event) {
      var containerId = event.slot.__scContainerId;
      if (!containerId) return;   // the sitewide anchor/interstitial slots, not a .sc-ad box
      var box = document.getElementById(containerId);
      if (!box) return;
      paint(box, !event.isEmpty && !!event.size);
    });
  });

  // A box with no ad decision yet defaults to empty spacing rather than
  // reserving room for a creative that may never arrive.
  function scan() {
    Array.prototype.forEach.call(document.querySelectorAll('.sc-ad'), function (box) {
      if (!box.classList.contains('sc-ad-filled') && !box.classList.contains('sc-ad-empty')) {
        box.classList.add('sc-ad-empty');
      }
    });
  }
  scan();

  // The mid-article slots are injected after this file runs (footer.ejs), so
  // watch for them instead of relying on script order.
  try {
    new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();

// Whole header bar toggles, not just the chevron - a bigger click/tap target
// than the 36px icon alone.
(function () {
  var head = document.getElementById('htu-head');
  var wrap = document.getElementById('htu-table-wrap');
  if (!head || !wrap) return;
  function toggle() {
    var open = wrap.hasAttribute('hidden');
    if (open) wrap.removeAttribute('hidden'); else wrap.setAttribute('hidden', '');
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  head.addEventListener('click', toggle);
  // role="button" on a <div> gets no native keyboard activation.
  head.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
})();
