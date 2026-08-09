/* OpenLondon — Module Transport (bus, métro, rail, taxis via StopPoint) */

OL.Transport = {
  // modeKey -> { layer, data }
  groups: {},
  visiblePhys: {},   // visible par physionomie (natif)
  pollTimer: null
};

/**
 * Charge les stopPoints d'un type Naptan donné.
 * @param {string} modeKey clé de OL.TRANSPORT_TYPES
 */
OL.Transport.fetch = function(modeKey) {
  var def = OL.TRANSPORT_TYPES[modeKey];
  if (!def) return Promise.resolve();
  var c = OL.map.getCenter();
  var url = OL.API.BASE + OL.API.STOPPOINT + encodeURIComponent(def.naptan) +
    '?lat=' + c.lat + '&lon=' + c.lng + '&radius=5000';

  return fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(json) {
      var list = Array.isArray(json) ? json : [];
      OL.Transport._render(modeKey, list);
      return list;
    })
    .catch(function(err) { console.warn('[Transport]', err); });
};

OL.Transport._render = function(modeKey, stops) {
  var def = OL.TRANSPORT_TYPES[modeKey];
  if (OL.Transport.groups[modeKey]) {
    if (OL.map.hasLayer(OL.Transport.groups[modeKey])) OL.map.removeLayer(OL.Transport.groups[modeKey]);
    OL.Transport.groups[modeKey] = null;
  }

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

OL.Transport._latlng = function(s) {
  if (typeof s.lat === 'number' && typeof s.lon === 'number') return [s.lat, s.lon];
  if (s.lat && s.lon) return [parseFloat(s.lat), parseFloat(s.lon)];
  return null;
};

OL.Transport.toggle = function(modeKey, show) {
  OL.Transport.visiblePhys[modeKey] = show;
  if (!OL.Transport.groups[modeKey]) {
    if (show) OL.Transport.fetch(modeKey);
    return;
  }
  var layer = OL.Transport.groups[modeKey];
  if (show && !OL.map.hasLayer(layer)) layer.addTo(OL.map);
  if (!show && OL.map.hasLayer(layer)) OL.map.removeLayer(layer);
};

/* Recharge toutes les couches transport actives (après déplacement) */
OL.Transport.refreshActive = function() {
  Object.keys(OL.Transport.visiblePhys).forEach(function(k) {
    if (OL.Transport.visiblePhys[k]) OL.Transport.fetch(k);
  });
};