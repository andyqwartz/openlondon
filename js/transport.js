/* OpenLondon — Module Transport (bus, métro, rail, taxis via StopPoint)
 *
 * ANTI-429 : l'API TfL StopPoint/Type est fortement rate-limitée. On :
 *   - cache chaque réseau par cellule (grille ~0.2°) en localStorage,
 *   - NE recharge JAMAIS automatiquement à chaque moveend (source du 429),
 *   - recharge uniquement quand on entre dans une nouvelle cellule, avec un
 *     cooldown global (minSpacing) entre DEUX appels API quelconques.
 */

OL.Transport = {
  groups: {},        // modeKey -> L.layerGroup
  visiblePhys: {},   // modeKey -> bool
  _cacheTTL: 6 * 3600 * 1000,   // 6 h
  _cellDeg: 0.2,
  _lastCell: {},     // modeKey -> "lat,lon" cellule déjà chargée
  _lastRequest: 0,
  _minSpacing: 2000, // 2 s minimum entre appels API TfL
  _pending: {}       // empêche les doublons de requête en vol
};

OL.Transport._cellKey = function(mode) {
  var c = OL.map.getCenter();
  var lat = Math.round(c.lat / OL.Transport._cellDeg);
  var lng = Math.round(c.lng / OL.Transport._cellDeg);
  return lat + ',' + lng;
};

OL.Transport._readCache = function(mode) {
  try {
    var raw = localStorage.getItem('ol_transport_' + mode);
    if (!raw) return null;
    var d = JSON.parse(raw);
    if (!d.ttl || Date.now() - d.ttl > OL.Transport._cacheTTL) return null;
    return d.stops;
  } catch (e) { return null; }
};

OL.Transport._writeCache = function(mode, stops) {
  try {
    localStorage.setItem('ol_transport_' + mode, JSON.stringify({ ttl: Date.now(), stops: stops }));
  } catch (e) { /* quota */ }
};

/**
 * Charge les stopPoints d'un type. Utilise le cache par cellule si présent,
 * sinon effectue UN appel (throttlé) et cache.
 * @param {string} modeKey clé de OL.TRANSPORT_TYPES
 */
OL.Transport.fetch = function(modeKey) {
  var def = OL.TRANSPORT_TYPES[modeKey];
  if (!def || !OL.map) return Promise.resolve();

  var cell = OL.Transport._cellKey(modeKey);
  var cached = OL.Transport._readCache(modeKey);
  if (cached && OL.Transport._lastCell[modeKey] === cell) {
    OL.Transport._render(modeKey, cached);
    return Promise.resolve(cached);
  }
  // Cache disponible mais nouvelle cellule → on l'affiche en attendant le refresh
  if (cached) OL.Transport._render(modeKey, cached);

  // Throttle global anti-429
  var now = Date.now();
  var wait = OL.Transport._lastRequest + OL.Transport._minSpacing - now;
  var url = OL.API.BASE + OL.API.STOPPOINT + encodeURIComponent(def.naptan) +
    '?lat=' + OL.map.getCenter().lat + '&lon=' + OL.map.getCenter().lng + '&radius=10000';

  var doFetch = function() {
    OL.Transport._lastRequest = Date.now();
    return fetch(url)
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function(json) {
        var list = Array.isArray(json) ? json : [];
        OL.Transport._render(modeKey, list);
        OL.Transport._writeCache(modeKey, list);
        OL.Transport._lastCell[modeKey] = OL.Transport._cellKey(modeKey);
        OL.Transport._pending[modeKey] = false;
        return list;
      })
      .catch(function(err) {
        OL.Transport._pending[modeKey] = false;
        console.warn('[Transport]', modeKey, err);
        return [];
      });
  };

  if (OL.Transport._pending[modeKey]) return Promise.resolve();
  OL.Transport._pending[modeKey] = true;
  if (wait > 0) {
    return new Promise(function(res) {
      setTimeout(function() { res(doFetch()); }, wait);
    });
  }
  return doFetch();
};

OL.Transport._render = function(modeKey, stops) {
  var def = OL.TRANSPORT_TYPES[modeKey];
  if (!mapHas(OL.Transport.groups[modeKey])) removeLayerSafe(OL.Transport.groups[modeKey]);
  OL.Transport.groups[modeKey] = null;

  var layer = L.layerGroup();
  stops.forEach(function(s) {
    var latlng = OL.Transport._latlng(s);
    if (!latlng) return;
    var m = L.circleMarker(latlng, {
      radius: 5,
      color: def.color,
      weight: 1.5,
      fillColor: def.color,
      fillOpacity: 0.7
    });
    var modes = (s.modes || []).join(', ');
    m.bindPopup('<strong>' + OL.esc(s.commonName || s.name || '') + '</strong>' +
      '<div class="dis-cat">' + OL.esc(modes) + '</div>');
    m.addTo(layer);
  });

  OL.Transport.groups[modeKey] = layer;
  if (OL.Transport.visiblePhys[modeKey]) layer.addTo(OL.map);
};

function mapHas(layer) { return OL.map && layer && OL.map.hasLayer(layer); }
function removeLayerSafe(layer) { if (mapHas(layer)) OL.map.removeLayer(layer); }

OL.Transport._latlng = function(s) {
  if (typeof s.lat === 'number' && typeof s.lon === 'number') return [s.lat, s.lon];
  if (s.lat && s.lon) return [parseFloat(s.lat), parseFloat(s.lon)];
  return null;
};

OL.Transport.toggle = function(modeKey, show) {
  OL.Transport.visiblePhys[modeKey] = show;
  if (show) {
    OL.Transport.fetch(modeKey);
  } else {
    removeLayerSafe(OL.Transport.groups[modeKey]);
  }
};

/**
 * Recharge les réseaux actifs UNIQUEMENT si on a changé de cellule.
 * Appelé au moveend avec un debounce — très léger, jamais du 4× par pan.
 */
OL.Transport.checkCells = function() {
  Object.keys(OL.Transport.visiblePhys).forEach(function(k) {
    if (!OL.Transport.visiblePhys[k]) return;
    var cell = OL.Transport._cellKey(k);
    if (OL.Transport._lastCell[k] !== cell) {
      OL.Transport.fetch(k);
    }
  });
};