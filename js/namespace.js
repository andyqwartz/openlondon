var OL = window.OL || {};

OL.esc = function(s) {
  var d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
};

OL.Net = {
  _q: [],
  _busy: false,
  _last: 0,
  spacing: 4000,
  queue: { key: {} },

  enqueue: function(key, doFn, done) {
    var q = OL.Net._q;

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

  clear: function() {
    OL.Net._q = [];
    OL.Net._busy = false;
  }
};
