/* OpenLondon — Namespace global unique + helpers */
/**
 * OL est le namespace global de OpenLondon (viewer mobilité Londres).
 * Tous les modules y attachent leurs propriétés.
 * Chargé en premier (après Leaflet, avant config.js).
 */
var OL = window.OL || {};

/** Échappe du HTML (anti-XSS pour les contenus TfL affichés dans les popups). */
OL.esc = function(s) {
  var d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
};

/**
 * ⛔ ANTI-429 — Limiteur de débit global pour les API TfL.
 * TfL rate-limite très sévèrement (surtout StopPoint/Type). On sérialise TOUS
 * les appels réseau dans une file unique : un seul fetch à la fois, espacé de
 * `spacing` ms minimum. Les appelants récupèrent la réponse via callback.
 */
OL.Net = {
  _q: [],             // {do : fn, done : fn}
  _busy: false,
  _last: 0,
  spacing: 4000,      // 4 s minimum entre deux appels TfL (StopPoint très strict)
  queue: { key: {} }, // in-flight guard par clé

  /**
   * Enfile un appel réseau.
   * @param {string} key   clé de déduplication (ex: 'stp_bus') — un seul en vol
   * @param {Function} do  exécute le fetch et retourne une Promise
   * @param {Function} done callback de résultat (résolu)
   */
  enqueue: function(key, doFn, done) {
    var q = OL.Net._q;
    // Si un appel identique est déjà en file, on remplace (dernier gagne)
    var existing = false;
    for (var i = 0; i < q.length; i++) {
      if (q[i].key === key) { q[i].do = doFn; q[i].done = done; existing = true; break; }
    }
    if (!existing) q.push({ key: key, do: doFn, done: done });
    OL.Net._drain();
  },

  _drain: function() {
    if (OL.Net._busy || OL.Net._q.length === 0) return;
    OL.Net._busy = true;
    var item = OL.Net._q.shift();

    var wait = OL.Net._last + OL.Net.spacing - Date.now();
    var run = function() {
      OL.Net._last = Date.now();
      (item.do || function() { return Promise.resolve(); })()
        .then(function(r) {
          if (item.done) item.done(r, null);
        })
        .catch(function(err) {
          if (item.done) item.done(null, err);
        })
        .finally(function() {
          OL.Net._busy = false;
          OL.Net._drain();
        });
    };

    if (wait > 0) {
      setTimeout(run, wait);
    } else {
      run();
    }
  },

  /** Vide la file (utilisé au reset). */
  clear: function() {
    OL.Net._q = [];
    OL.Net._busy = false;
  }
};