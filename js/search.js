OL.Search = {
  input: null,
  results: null,
  debounceId: null,
  debounceMs: 250,
  _cache: {}
};

OL.Search.init = function() {
  OL.Search.input = document.getElementById('searchInput');
  OL.Search.results = document.getElementById('searchResults');
  OL.Search.btn = document.getElementById('searchBtn');

  OL.Search.btn.onclick = OL.Search.do;
  OL.Search.input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') OL.Search.do();
  });
  OL.Search.input.addEventListener('input', function() {
    var q = OL.Search.input.value.trim();
    clearTimeout(OL.Search.debounceId);
    if (q.length < 2 || OL.Search.isCoords(q)) { OL.Search.hide(); return; }
    OL.Search.debounceId = setTimeout(function() { OL.Search._search(q); }, OL.Search.debounceMs);
  });
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-wrap')) OL.Search.hide();
  });
};

OL.Search.isCoords = function(q) {
  return /^-?\d+\.?\d*\s*[,;:\s]\s*-?\d+\.?\d*$/.test(q);
};

OL.Search.hide = function() {
  if (OL.Search.results) OL.Search.results.style.display = 'none';
};

OL.Search.do = function() {
  var q = OL.Search.input.value.trim();
  if (q.length < 2) return;
  if (OL.Search.isCoords(q)) { OL.Search._goToCoords(q); return; }
  OL.Search._search(q);
};

OL.Search._search = function(q) {
  var cacheKey = q.toLowerCase();
  if (OL.Search._cache[cacheKey]) {
    OL.Search._results = OL.Search._cache[cacheKey];
    OL.Search._render();
    return;
  }

  var urlTfl = OL.API.BASE + OL.API.STOPSEARCH +
    '?query=' + encodeURIComponent(q) + '&count=5&modes=bus,tube,dlr,overground,elizabeth-line,national-rail';
  var urlOsm = 'https://nominatim.openstreetmap.org/search?format=json&limit=5&viewbox=-0.51%2C51.28%2C0.33%2C51.69&bounded=1&q=' + encodeURIComponent(q);

  var headers = { 'Accept': 'application/json' };
  Promise.allSettled([
    fetch(urlTfl, { headers: headers }).then(function(r) { return r.json(); }),
    fetch(urlOsm, { headers: headers }).then(function(r) { return r.json(); })
  ]).then(function(settled) {
    var results = [];

    var tflVal = settled[0].value;
    if (settled[0].status === 'fulfilled' && tflVal && tflVal.matches) {
      tflVal.matches.forEach(function(m) {
        results.push({
          label: m.name || m.commonName || '',
          type: (m.modes || []).join(', '),
          lat: m.lat,
          lon: m.lon,
          badge: 'TfL'
        });
      });
    }

    var osmVal = settled[1].value;
    if (settled[1].status === 'fulfilled' && Array.isArray(osmVal)) {
      osmVal.forEach(function(f) {
        results.push({
          label: f.display_name || '',
          type: f.type || 'lieu',
          lat: parseFloat(f.lat),
          lon: parseFloat(f.lon),
          badge: 'OSM'
        });
      });
    }
    if (settled[1].status === 'fulfilled' && osmVal && osmVal.error) {

    }

    OL.Search._results = results.slice(0, 12);
    OL.Search._cache[cacheKey] = OL.Search._results;
    OL.Search._render();
  }).catch(function(err) {
    console.warn('[Search]', err);
  });
};

OL.Search._render = function() {
  var self = this;
  this.results.innerHTML = '';
  if (!this._results.length) {
    this.results.innerHTML = '<div class="no-result">No results found</div>';
    this.results.style.display = 'block';
    return;
  }
  this._results.forEach(function(r) {
    var item = document.createElement('div');
    item.innerHTML = '<strong>' + OL.esc(r.label) + '</strong> <span class="city">' + OL.esc(r.badge) + '</span>';
    item.onclick = function() { self._goTo(r); };
    self.results.appendChild(item);
  });
  this.results.style.display = 'block';
};

OL.Search._goTo = function(r) {
  OL.map.flyTo([r.lat, r.lon], 16, { duration: 1.1 });
  OL.Search.input.value = r.label;
  OL.Search.hide();
};

OL.Search._goToCoords = function(q) {
  var mq = q.match(/^(-?\d+\.?\d*)\s*[,;:\s]\s*(-?\d+\.?\d*)$/);
  var lat = parseFloat(mq[1]);
  var lng = parseFloat(mq[2]);
  if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    OL.map.setView([lat, lng], 16);
    OL.Search.hide();
    OL.Search.input.value = lat.toFixed(5) + ', ' + lng.toFixed(5);
  }
};
