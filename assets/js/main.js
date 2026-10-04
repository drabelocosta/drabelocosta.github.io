(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var UI = window.SITE_UI || {};

  /* ---------- toast ---------- */
  var toastEl = $('#toast'); var toastT;
  function toast(msg) { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 1800); }

  /* ---------- copy helper ---------- */
  function copyText(text, fallbackEl) {
    function fallback() {
      try { if (fallbackEl) { var r = document.createRange(); r.selectNodeContents(fallbackEl); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); } } catch (e) {}
      toast(UI.select_text || 'Select the text and copy it.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(UI.copied || 'Copied!'); }, fallback);
    } else { fallback(); }
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = $('#menu-btn'), nav = $('#nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () { var open = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }); });
  }

  /* ---------- active nav link ---------- */
  var navLinks = $$('#nav a[href^="#"]');
  var sections = navLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { current = en.target.id; } });
      navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- language toggle keeps the section hash ---------- */
  $$('.lang a').forEach(function (a) { a.addEventListener('click', function () { if (location.hash && location.hash.length > 1) { a.href = a.getAttribute('href').split('#')[0] + location.hash; } }); });

  /* ---------- publications: filters ---------- */
  var pubs = $$('.pub'), yearSel = $('#f-year'), areaSel = $('#f-area'), typeSel = $('#f-type'), search = $('#f-search'), clearBtn = $('#f-clear'), countEl = $('#pub-count'), emptyEl = $('#pub-empty');
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function applyFilters() {
    if (!pubs.length) return;
    var y = yearSel ? yearSel.value : '', a = areaSel ? areaSel.value : '', t = typeSel ? typeSel.value : '', q = norm(search ? search.value.trim() : '');
    var shown = 0, lastYear = null;
    pubs.forEach(function (p) {
      var ok = (!y || p.dataset.year === y) && (!a || (' ' + p.dataset.areas + ' ').indexOf(' ' + a + ' ') >= 0) && (!t || p.dataset.type === t) && (!q || norm(p.dataset.search).indexOf(q) >= 0);
      p.classList.toggle('hidden', !ok);
      if (ok) shown++;
    });
    $$('.year-head').forEach(function (h) {
      var any = pubs.some(function (p) { return !p.classList.contains('hidden') && p.dataset.year === h.dataset.year; });
      h.hidden = !any;
    });
    if (countEl) countEl.textContent = (UI.showing || 'Showing') + ' ' + shown + ' ' + (UI.of || 'of') + ' ' + pubs.length + ' ' + (UI.publications_word || 'publications');
    if (emptyEl) emptyEl.hidden = shown > 0;
    try { localStorage.setItem('pubFilters', JSON.stringify({ y: y, a: a, t: t, q: search ? search.value : '' })); } catch (e) {}
  }
  [yearSel, areaSel, typeSel].forEach(function (el) { if (el) el.addEventListener('change', applyFilters); });
  if (search) search.addEventListener('input', applyFilters);
  if (clearBtn) clearBtn.addEventListener('click', function () { if (yearSel) yearSel.value = ''; if (areaSel) areaSel.value = ''; if (typeSel) typeSel.value = ''; if (search) search.value = ''; applyFilters(); });
  $$('.chip-area[data-area]').forEach(function (c) { c.addEventListener('click', function () { if (areaSel) { areaSel.value = c.dataset.area; applyFilters(); var top = $('#publications').getBoundingClientRect().top + window.scrollY - 80; window.scrollTo({ top: top, behavior: 'smooth' }); } }); });
  try { var saved = JSON.parse(localStorage.getItem('pubFilters') || 'null'); if (saved && pubs.length) { if (yearSel && saved.y) yearSel.value = saved.y; if (areaSel && saved.a) areaSel.value = saved.a; if (typeSel && saved.t) typeSel.value = saved.t; if (search && saved.q) search.value = saved.q; } } catch (e) {}
  applyFilters();

  /* ---------- BibTeX modal ---------- */
  var modal = $('#bib-modal'), bibPre = $('#bib-pre'), bibTitle = $('#bib-title');
  var BIB = window.PUBS_BIB || {};
  function openBib(id) {
    if (!modal || !BIB[id]) return;
    bibPre.textContent = BIB[id].bibtex; if (bibTitle) bibTitle.textContent = (UI.bibtex_title || 'BibTeX') + ' · ' + BIB[id].short;
    if (typeof modal.showModal === 'function') { modal.showModal(); } else { modal.setAttribute('open', ''); }
  }
  $$('[data-bib]').forEach(function (b) { b.addEventListener('click', function () { openBib(b.dataset.bib); }); });
  if (modal) {
    $$('[data-close]', modal).forEach(function (b) { b.addEventListener('click', function () { modal.close ? modal.close() : modal.removeAttribute('open'); }); });
    modal.addEventListener('click', function (e) { if (e.target === modal) { modal.close ? modal.close() : modal.removeAttribute('open'); } });
    var cb = $('#bib-copy'); if (cb) cb.addEventListener('click', function () { copyText(bibPre.textContent, bibPre); });
  }

  /* ---------- generic tabs (supervision, videos) ---------- */
  $$('[data-tabs]').forEach(function (group) {
    var btns = $$('.tab-btn', group); var name = group.dataset.tabs;
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        $$('[data-panel="' + name + '"]').forEach(function (p) { p.classList.toggle('on', p.dataset.key === b.dataset.key); p.hidden = p.dataset.key !== b.dataset.key; });
      });
    });
  });

  /* ---------- show more lists ---------- */
  $$('[data-more]').forEach(function (btn) {
    var list = $(btn.dataset.more); if (!list) return;
    var items = $$(':scope > li, :scope > .vid', list); var limit = parseInt(btn.dataset.limit || '8', 10); var expanded = false;
    function render() { items.forEach(function (li, i) { li.hidden = !expanded && i >= limit; }); btn.textContent = expanded ? (UI.show_less || 'Show less') : ((UI.show_more || 'Show all') + ' (' + items.length + ')'); btn.hidden = items.length <= limit; }
    btn.addEventListener('click', function () { expanded = !expanded; render(); });
    render();
  });

  /* ---------- copy buttons ---------- */
  $$('[data-copy]').forEach(function (b) { b.addEventListener('click', function () { copyText(b.dataset.copy, null); }); });

  /* ---------- details on prose "read more" ---------- */
  $$('[data-expand]').forEach(function (b) { var t = $(b.dataset.expand); if (!t) return; b.addEventListener('click', function () { var open = t.classList.toggle('open'); t.hidden = !open; b.textContent = open ? (UI.read_less || 'Read less') : (UI.read_more || 'Read more'); }); });
})();
