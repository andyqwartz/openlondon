/* OpenLondon — Module Transport (bus, métro, rail, taxis via StopPoint)
 *
 * ⛔ ANTI-429 STRICT : TfL rate-limite StopPoint/Type très sévèrement.
 * Règles absolues :
 *   1. Tout appel passe par OL.Net (file sérielle, 4 s d'espacement).
 *   2. Cache localStorage par cellule (~0.2°, TTL 24 h) : on ne re-rate pas
 *      une zone déjà chargée.
 *   3. AUCUN refetch automatique au moveend. On charge UNIQUEMENT à l'activation
 *      (toggle) ou au clic sur "Recharger". Pas de rechargement pendant le pan.
 */

OL.Transport = {
  groups: {},        // modeKey -> L.layerGroup
  visiblePhys: {},   // modeKey -> bool
  _cacheTTL: 24 * 3600 * 1000,  // 24 h
  _cellDeg: 0.2,
  _lastCell: {}      // modeKey -> "lat,lon" cellule déjà chargée
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
 * Charge un réseau. Cache par cellule si présent, sinon UN appel via OL.Net.
 * @param {string} modeKey clé de OL.TRANSPORT_TYPES
 */
OL.Transport.load = function(modeKey) {
  var def = OL.TRANSPORT_TYPES[modeKey];
  if (!def || !OL.map) return;

  var cell = OL.Transport._cellKey(modeKey);

  // 1) Cache de zone déjà chargée → affichage immédiat, zéro appel réseau
  if (OL.Transport._lastCell[modeKey] === cell) {
    var zone = OL.Transport._readCache(modeKey);
    if (zone) { OL.Transport._render(modeKey, zone); return; }
  }

  var url = OL.API.BASE + OL.API.STOPPOINT + encodeURIComponent(def.naptan) +
    '?lat=' + OL.map.getCenter().lat + '&lon=' + OL.map.getCenter().lng + '&radius=10000';

  OL.Net.enqueue('stp_' + modeKey,
    function() {
      return fetch(url).then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
    },
    function(json, err) {
      if (err) {
        // Repli : affiche le cache obsolète s'il existe, sinon rien
        var stale = OL.Transport._readCache(modeKey);
        if (stale) OL.Transport._render(modeKey, stale);
        else OL.Transport._render(modeKey, []);
        return;
      }
      var list = Array.isArray(json) ? json : [];
      OL.Transport._render(modeKey, list);
      OL.Transport._writeCache(modeKey, list);
      OL.Transport._lastCell[modeKey] = OL.Transport._cellKey(modeKey);
    });
};

OL.Transport._render = function(modeKey, stops) {
  var def = OL.TRANSPORT_TYPES[modeKey];
  OL.Transport._remove(modeKey);

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
  if (OL.Transport.visiblePhys[modeKey] && OL.map) layer.addTo(OL.map);
};

OL.Transport._remove = function(modeKey) {
  var g = OL.Transport.groups[modeKey];
  if (g && OL.map && OL.map.hasLayer(g)) OL.map.removeLayer(g);
  OL.Transport.groups[modeKey] = null;
};

OL.Transport._latlng = function(s) {
  if (typeof s.lat === 'number' && typeof s.lon === 'number') return [s.lat, s.lon];
  if (s.lat && s.lon) return [parseFloat(s.lat), parseFloat(s.lon)];
  return null;
};

OL.Transport.toggle = function(modeKey, show) {
  OL.Transport.visiblePhys[modeKey] = show;
  if (show) {
    OL.Transport.load(modeKey);
  } else {
    OL.Transport._remove(modeKey);
  }
};