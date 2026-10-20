/* PeterGanuRusty site: the theme, the copy buttons, the install tabs, the first-screen replay, the picker of the leaderboard,
   the chooser of the films and the small motion. Every page is complete without this file; it adds. Nothing is sent anywhere. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var $ = function (sel, scope) { return (scope || doc).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || doc).querySelectorAll(sel)); };
  /* js-ready tells the style sheet that this script is running; if it stops before the end, the parts it hides are shown again */
  root.classList.add('js-ready');
  try {

  /* ---------- theme ---------- */
  var KEY = 'pgr-theme';
  function theme() {
    var set = root.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  $$('[data-theme-toggle]').forEach(function (button) {
    var show = function () { button.setAttribute('aria-pressed', theme() === 'light' ? 'true' : 'false'); };
    show();
    button.addEventListener('click', function () {
      var next = theme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* no storage: the choice lasts for this page */ }
      show();
    });
  });

  /* ---------- navigation ---------- */
  var nav = $('#nav');
  if (nav) {
    var edge = function () { nav.classList.toggle('scrolled', window.scrollY > 4); };
    edge();
    window.addEventListener('scroll', edge, { passive: true });
  }

  /* ---------- copy ---------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var area = doc.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;top:-100px;opacity:0';
      doc.body.appendChild(area);
      area.select();
      try { doc.execCommand('copy') ? resolve() : reject(new Error('copy refused')); } catch (e) { reject(e); } finally { doc.body.removeChild(area); }
    });
  }
  $$('[data-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      copyText(button.getAttribute('data-copy')).then(function () {
        button.classList.add('is-done');
        window.setTimeout(function () { button.classList.remove('is-done'); }, 1800);
      }, function () {
        var code = button.parentNode && $('.cmd-code', button.parentNode);
        if (code && window.getSelection) {
          var range = doc.createRange();
          range.selectNodeContents(code);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      });
    });
  });

  /* ---------- a group of choices that shows one panel: install tabs, the leaderboard picker, the films ---------- */
  function choice(group, onPick) {
    var buttons = $$('button[role="radio"]', group);
    function pick(button, focus) {
      buttons.forEach(function (b) {
        var on = b === button;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      if (focus) button.focus();
      onPick(button.getAttribute('data-value'));
    }
    buttons.forEach(function (button, n) {
      button.addEventListener('click', function () { pick(button, false); });
      button.addEventListener('keydown', function (event) {
        var step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
        if (!step) return;
        event.preventDefault();
        pick(buttons[(n + step + buttons.length) % buttons.length], true);
      });
    });
    return { buttons: buttons, pick: pick };
  }

  /* the install box: Windows or macOS and Linux, chosen from the system the visitor is on */
  $$('[data-cmdbox]').forEach(function (box) {
    var lines = $$('.cmd-line', box), notes = $$('.cmd-note', box);
    var show = function (sys) {
      lines.forEach(function (line) { line.hidden = line.getAttribute('data-sys') !== sys; });
      notes.forEach(function (note) { note.hidden = note.getAttribute('data-sys') !== sys; });
    };
    var group = choice($('.seg', box), show);
    var windows = /Win/i.test(navigator.platform || '') || /Windows/i.test(navigator.userAgent || '');
    var start = group.buttons.filter(function (b) { return b.getAttribute('data-value') === (windows ? 'windows' : 'unix'); })[0];
    if (start) group.pick(start, false);
  });

  /* the leaderboard: one table at a time, by model and by question set */
  $$('[data-board]').forEach(function (board) {
    var views = $$('.view', board);
    var state = {};
    var show = function () {
      var key = (state.model || '') + '|' + (state.set || '');
      var shown = null;
      views.forEach(function (view) {
        var on = view.getAttribute('data-view') === key;
        view.hidden = !on;
        if (on) shown = view;
      });
      return shown;
    };
    $$('.seg[data-pick]', board).forEach(function (seg) {
      var name = seg.getAttribute('data-pick');
      var current = $$('button[aria-checked="true"]', seg)[0];
      state[name] = current ? current.getAttribute('data-value') : '';
      choice(seg, function (value) { state[name] = value; show(); });
    });
    show();
  });

  /* the films: one at a time; the others stop */
  $$('[data-films]').forEach(function (box) {
    var films = $$('.film', box);
    var group = $('.seg', box);
    if (!group || films.length < 2) return;
    group.hidden = false;
    choice(group, function (value) {
      films.forEach(function (film) {
        var on = film.getAttribute('data-kind') === value;
        film.hidden = !on;
        var video = $('video', film);
        if (!on && video && !video.paused) video.pause();
      });
    });
  });

  /* ---------- motion ---------- */
  function when(el, fn, margin) {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        seen.unobserve(entry.target);
        fn(entry.target);
      });
    }, { threshold: 0.18, rootMargin: margin || '0px 0px -6% 0px' });
    seen.observe(el);
  }
  root.classList.add('js');
  $$('.rv, .display, .chart').forEach(function (el) { when(el, function () { el.classList.add('in'); }); });

  /* a number counts up once, to the text the page already holds */
  function countUp(el) {
    var final = el.textContent, to = parseFloat(el.getAttribute('data-count')), suffix = el.getAttribute('data-suffix') || '';
    if (reduce || !isFinite(to)) return;
    var start = null, span = 900;
    function frame(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / span), eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(to * eased) + suffix;
      if (t < 1) window.requestAnimationFrame(frame); else el.textContent = final;
    }
    el.textContent = '0' + suffix;
    window.requestAnimationFrame(frame);
  }
  $$('[data-count]').forEach(function (el) { when(el, function () { countUp(el); }); });

  /* the replay of the first screen: the turns land one after another, the tokens count, the saving appears */
  var replay = $('.replay');
  if (replay) {
    var counters = $$('[data-tokens]', replay);
    var turnsAt = $$('[data-turns]', replay);
    var fmt = function (n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : Math.round(n / 1e3) + 'k'; };
    var finish = function () {
      replay.classList.remove('run');
      replay.classList.add('done');
      counters.forEach(function (c) { c.textContent = c.getAttribute('data-final'); });
      turnsAt.forEach(function (t) { t.textContent = t.getAttribute('data-final'); });
    };
    var play = function () {
      if (reduce) { finish(); return; }
      replay.classList.remove('done');
      replay.classList.remove('run');
      void replay.offsetWidth;
      replay.classList.add('run');
      var begin = performance.now();
      counters.forEach(function (c) { c.textContent = '0k'; });
      turnsAt.forEach(function (t) { t.textContent = '0 turns'; });
      var lanes = $$('.lane', replay);
      function tick(now) {
        var elapsed = (now - begin) / 1000, alive = false;
        lanes.forEach(function (lane, n) {
          var blocks = $$('.blk', lane);
          var offset = n === 0 ? 0.3 : 2.7;
          var perTurn = n === 0 ? 0.55 : 0.55;
          var total = parseFloat($('[data-tokens]', lane).getAttribute('data-tokens'));
          var turns = blocks.length, landed = 0;
          for (var i = 0; i < turns; i++) if (elapsed >= offset + i * perTurn + 0.35) landed = i + 1;
          var share = landed / turns;
          var token = $('[data-tokens]', lane), turn = $('[data-turns]', lane);
          token.textContent = fmt(total * share);
          turn.textContent = landed + (landed === 1 ? ' turn' : ' turns');
          if (landed < turns) alive = true;
        });
        if (alive || elapsed < 3.4) window.requestAnimationFrame(tick); else finish();
      }
      window.requestAnimationFrame(tick);
    };
    when(replay, play, '0px');
    var again = $('.replay-btn', replay);
    if (again) again.addEventListener('click', play);
  }
  } catch (error) { root.classList.remove('js'); }
}());
