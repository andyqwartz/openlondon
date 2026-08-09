OL.Transport = {
  groups: {},
  visiblePhys: {},
  _cacheTTL: 24 * 3600 * 1000,
  _loading: {}
};

OL.Transport._readCache = function(mode) {
  try {
    var raw = localStorage.getItem('ol_transport_' + mode);
    if (!raw) return null;
    var d = JSON.parse(raw);
    if (Date.now() - d.ttl > OL.Transport._cacheTTL) return null;
    return d.stops;
  } catch (e) { return null; }
};

OL.Transport._writeCache = function(mode, stops) {
  try {
    localStorage.setItem('ol_transport_' + mode, JSON.stringify({ ttl: Date.now(), stops: stops }));
  } catch (e) {  }
};

OL.Transport.purgeOldCache = function() {
  try {
    var old = ['ol_transport_metro', 'ol_transport_taxi', 'ol_transport_bus',
               'ol_transport_rail', 'ol_transport_dlr', 'ol_transport_overground',
               'ol_transport_elizabeth', 'ol_transport_tram'];
    old.forEach(function(k) { localStorage.removeItem(k); });
  } catch (e) {  }
};

OL.Transport.load = function(modeKey) {
  var def = OL.TRANSPORT_TYPES[modeKey];
  if (!def || !OL.map) return;

  var cached = OL.Transport._readCache(modeKey);
  if (cached) { OL.Transport._render(modeKey, cached); return; }

  if (OL.Transport._loading[modeKey]) return;

  var url = OL.API.BASE + '/StopPoint/Mode/' + encodeURIComponent(def.mode);
  OL.Transport._loading[modeKey] = true;

  OL.Net.enqueue('stp_' + modeKey,
    function() {
      return fetch(url).then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
    },
    function(json, err) {
      OL.Transport._loading[modeKey] = false;
      if (err) {
        var stale = OL.Transport._readCache(modeKey);
        OL.Transport._render(modeKey, stale || []);
        return;
      }
      var list = Array.isArray(json) ? json : [];
      OL.Transport._render(modeKey, list);
      OL.Transport._writeCache(modeKey, list);
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

OL.Transport.updateCount = function() {
  var n = 0;
  Object.keys(OL.Transport.visiblePhys).forEach(function(k) { if (OL.Transport.visiblePhys[k]) n++; });
  var c = document.getElementById('transportCount');
  if (c) c.textContent = n;
};
