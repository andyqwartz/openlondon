OL.URLSync = {
  _keys: ['b', 'y', 'x', 'z', 'c', 'f', 't']
};

OL.URLSync.init = function() {
  OL.URLSync.restore();
  OL.map.on('moveend', OL.URLSync.update);
  OL.map.on('zoomend', OL.URLSync.update);
};

OL.URLSync.update = function() {
  if (!OL.map) return;
  var c = OL.map.getCenter();
  var params = {
    y: c.lat.toFixed(5),
    x: c.lng.toFixed(5),
    z: OL.map.getZoom(),
    b: OL.baseKey || 'osm',
    c: OL.visibleCameras ? '1' : '',
    f: OL.visibleTraffic ? '1' : '',
    t: OL.visibleTransport ? OL.visibleTransport : ''
  };
  var hash = OL.URLSync._encode(params);
  if (location.hash !== hash) location.hash = hash;
};

OL.URLSync.restore = function() {
  var h = location.hash.replace('#', '');
  if (!h) return;
  var params = OL.URLSync._decode(h);
  if (!params) return;

  if (params.b && OL.BASE_LAYERS[params.b]) {
    OL.baseKey = params.b;
    OL.switchBase(params.b);
  }
  if (params.c === '1') OL.toggleCameras(true);
  if (params.f === '1') OL.toggleTraffic(true);
  if (params.t) {
    params.t.split(',').forEach(function(k) {
      if (OL.TRANSPORT_TYPES[k]) OL.toggleTransport(k, true);
    });
  }
  if (params.y && params.x && params.z) {
    var lat = parseFloat(params.y), lng = parseFloat(params.x), zoom = parseInt(params.z);
    if (!isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
      OL.map.setView([lat, lng], zoom, { animate: false });
    }
  }
};

OL.URLSync._encode = function(params) {
  var parts = [];
  OL.URLSync._keys.forEach(function(k) {
    var v = params[k];
    if (v === '' || v === undefined || v === null) return;
    parts.push(k + '=' + encodeURIComponent(v));
  });
  return parts.join('&');
};

OL.URLSync._decode = function(str) {
  var obj = {};
  str.split('&').forEach(function(pair) {
    var eq = pair.indexOf('=');
    if (eq === -1) return;
    obj[pair.substring(0, eq)] = decodeURIComponent(pair.substring(eq + 1));
  });
  return obj;
};
