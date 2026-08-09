/* OpenLondon — Module Caméras TfL (cœur) */

OL.Cameras = {
  data: [],            // 882 caméras brutes
  group: null,         // MarkerClusterGroup (si markercluster chargé)
  loaded: false,
  pollTimer: null,
  meta: { total: 0, available: 0 }
};

/**
 * Charge la liste complète des caméras TfL.
 * Cache en localStorage (fraîcheur configurable).
 */
OL.Cameras.fetchAll = function() {
  var url = OL.API.BASE + OL.API.JAMCAM;
  // Cache navigable : sert l'état enregistré puis rafraîchit en fond
  var cached = OL.Cameras._readCache();
  if (cached) {
    OL.Cameras._ingest(cached);
  }
  return fetch(url)
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(json) {
      if (!Array.isArray(json)) throw new Error('Réponse invalide TfL');
      OL.Cameras._ingest(json);
      OL.Cameras._writeCache(json);
      return json;
    })
    .catch(function(err) {
      console.warn('[Cameras]', err);
    });
};

OL.Cameras._readCache = function() {
  try {
    var raw = localStorage.getItem('ol_cameras');
    if (!raw) return null;
    var d = JSON.parse(raw);
    if (!d.ttl || Date.now() - d.ttl > OL.CONFIG.cacheCamerasMs) return null;
    return d.list;
  } catch (e) { return null; }
};

OL.Cameras._writeCache = function(list) {
  try {
    localStorage.setItem('ol_cameras', JSON.stringify({ ttl: Date.now(), list: list }));
  } catch (e) { /* quota */ }
};

OL.Cameras._ingest = function(json) {
  OL.Cameras.data = json;
  var avail = 0;
  json.forEach(function(c) {
    if (OL.Cameras._findProp(c, 'available') === 'true') avail++;
  });
  OL.Cameras.meta = { total: json.length, available: avail };
  OL.Cameras.loaded = true;
  var cnt = document.getElementById('camCount');
  if (cnt) cnt.textContent = avail + '/' + json.length;
  OL.Cameras.render();
  OL.Cameras._schedule();
};

/* Helper : lit une propriété dans additionalProperties */
OL.Cameras._findProp = function(cam, key) {
  var ap = cam && cam.additionalProperties;
  if (!Array.isArray(ap)) return null;
  for (var i = 0; i < ap.length; i++) {
    if (ap[i].key === key) return ap[i].value;
  }
  return null;
};

/**
 * Rend les caméras sur la carte (clusters si dispo, sinon marqueurs simples).
 */
OL.Cameras.render = function() {
  // Nettoie l'ancien groupe
  if (OL.Cameras.group) {
    if (OL.map.hasLayer(OL.Cameras.group)) OL.map.removeLayer(OL.Cameras.group);
    OL.Cameras.group = null;
  }

  var useCluster = typeof L.markerClusterGroup === 'function';
  OL.Cameras.group = useCluster
    ? L.markerClusterGroup({ maxClusterRadius: 45, spiderfyOnMaxZoom: true })
    : L.layerGroup();

  var markers = [];
  OL.Cameras.data.forEach(function(cam) {
    if (typeof cam.lat !== 'number' || typeof cam.lon !== 'number') return;
    var available = OL.Cameras._findProp(cam, 'available') === 'true';
    var imageUrl = OL.Cameras._findProp(cam, 'imageUrl');
    var videoUrl = OL.Cameras._findProp(cam, 'videoUrl');
    var view = OL.Cameras._findProp(cam, 'view');
    var id = String(cam.id || '').replace('JamCams_', '');

    var m = L.marker([cam.lat, cam.lon], {
      title: cam.commonName,
      icon: OL.Cameras._icon(available)
    });

    // URLs gardées pour lazy-load à l'ouverture de popup
    m._cam = { name: cam.commonName, id: id, available: available,
               imageUrl: imageUrl, videoUrl: videoUrl, view: view };

    m.bindPopup(OL.Cameras._popupHtml(m._cam));
    markers.push(m);
  });

  OL.Cameras.group.addLayers(markers);
  OL.Cameras.group.addTo(OL.map);
};

OL.Cameras._icon = function(available) {
  var color = available ? '#e0433a' : '#666';
  return L.divIcon({
    className: 'ol-cam-icon' + (available ? '' : ' off'),
    html: '<svg width="18" height="18" viewBox="0 0 24 24"><g fill="' +
      (available ? '#e0433a' : '#666') + '"><rect x="7" y="5" width="10" height="8" rx="2"/><circle cx="12" cy="9" r="2.4" fill="#111"/><rect x="11" y="13" width="2" height="3"/><rect x="9" y="16" width="6" height="2"/></g><circle cx="12" cy="9" r="6" fill="none" stroke="' + color + '" stroke-width="1"/></svg>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

/* Lazy-load : image/vidéo chargées uniquement à l'ouverture de la popup */
OL.Cameras._popupHtml = function(cam) {
  var header = '<strong>' + OL.esc(cam.name) + '</strong>' +
    (cam.view ? ' <span class="cam-view">' + OL.esc(cam.view) + '</span>' : '');
  if (!cam.available || !cam.imageUrl) {
    return '<div class="cam-pop">' + header + '<div class="cam-off">Caméra indisponible</div></div>';
  }
  var img = '<img class="cam-img" loading="lazy" src="' + OL.esc(cam.imageUrl) + '" alt="' + OL.esc(cam.name) + '">';
  var vid = cam.videoUrl
    ? '<a class="cam-vid" href="' + OL.esc(cam.videoUrl) + '" target="_blank" rel="noopener">▶ Voir la vidéo</a>'
    : '';
  return '<div class="cam-pop">' + header + img + vid + '</div>';
};

/* Polling tous les N min pendant que la carte est zoomée */
OL.Cameras._schedule = function() {
  clearInterval(OL.Cameras.pollTimer);
  OL.Cameras.pollTimer = setInterval(function() {
    if (!OL.map) return;
    if (OL.map.getZoom() >= OL.CONFIG.cameraMediaMinZoom) OL.Cameras.fetchAll();
  }, OL.CONFIG.cameraRefreshMs);
};

OL.Cameras.toggle = function(show) {
  if (!OL.Cameras.group) return;
  if (show && !OL.map.hasLayer(OL.Cameras.group)) OL.Cameras.group.addTo(OL.map);
  if (!show && OL.map.hasLayer(OL.Cameras.group)) OL.map.removeLayer(OL.Cameras.group);
};