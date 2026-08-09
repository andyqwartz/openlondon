/* OpenLondon — Module Caméras TfL (cœur) */

OL.Cameras = {
  data: [],            // 882 caméras brutes
  group: null,         // MarkerClusterGroup
  loaded: false,
  pollTimer: null,
  viewportTimer: null,
  feedType: 'image',   // 'image' | 'video' (toggle global)
  meta: { total: 0, available: 0, shown: 0 }
};

/* ── Fetch + cache ── */
OL.Cameras.fetchAll = function() {
  var url = OL.API.BASE + OL.API.JAMCAM;
  var cached = OL.Cameras._readCache();
  if (cached) OL.Cameras._ingest(cached);
  return fetch(url)
    .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function(json) {
      if (!Array.isArray(json)) throw new Error('Réponse invalide TfL');
      OL.Cameras._ingest(json);
      OL.Cameras._writeCache(json);
      return json;
    })
    .catch(function(err) { console.warn('[Cameras]', err); });
};

OL.Cameras._readCache = function() {
  try {
    var raw = localStorage.getItem('ol_cameras');
    if (!raw) return null;
    var d = JSON.parse(raw);
    return (d && d.ttl && Date.now() - d.ttl <= OL.CONFIG.cacheCamerasMs) ? d.list : null;
  } catch (e) { return null; }
};

OL.Cameras._writeCache = function(list) {
  try { localStorage.setItem('ol_cameras', JSON.stringify({ ttl: Date.now(), list: list })); }
  catch (e) { /* quota */ }
};

/* ── Ingest + compteurs ── */
OL.Cameras._ingest = function(json) {
  OL.Cameras.data = json;
  var avail = 0;
  json.forEach(function(c) { if (OL.Cameras._findProp(c, 'available') === 'true') avail++; });
  OL.Cameras.meta = { total: json.length, available: avail, shown: 0 };
  OL.Cameras.loaded = true;
  OL.Cameras.updateCounts();
  OL.Cameras.render();
  OL.Cameras._schedule();
};

OL.Cameras.updateCounts = function() {
  var c = document.getElementById('camCount');
  if (c) c.textContent = OL.Cameras.meta.available + '/' + OL.Cameras.meta.total;
};

/* Helper : lit une propriété dans additionalProperties */
OL.Cameras._findProp = function(cam, key) {
  var ap = cam && cam.additionalProperties;
  if (!Array.isArray(ap)) return null;
  for (var i = 0; i < ap.length; i++) if (ap[i].key === key) return ap[i].value;
  return null;
};

/* ── Icônes (cctv-1.png normal / cctv-sat.png satellite, comme l'original) ── */
OL.Cameras._icon = function(available) {
  var sat = OL.isSat();
  var iconUrl = sat ? 'assets/icons/cctv-sat.png' : 'assets/icons/cctv-1.png';
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -36],
    className: 'ol-cam-marker' + (available ? '' : ' off')
  });
};

/* ── Rendu viewport-only ── */
OL.Cameras.render = function() {
  if (!OL.map) return;
  var lb = OL.map.getBounds().pad(0.5);

  if (OL.Cameras.group) {
    if (OL.map.hasLayer(OL.Cameras.group)) OL.map.removeLayer(OL.Cameras.group);
    OL.Cameras.group = null;
  }
  var useCluster = typeof L.markerClusterGroup === 'function';
  OL.Cameras.group = useCluster
    ? L.markerClusterGroup({ maxClusterRadius: 45, spiderfyOnMaxZoom: true })
    : L.layerGroup();

  var markers = [], shown = 0;
  OL.Cameras.data.forEach(function(cam) {
    if (typeof cam.lat !== 'number' || typeof cam.lon !== 'number') return;
    if (!lb.contains([cam.lat, cam.lon])) return;   // viewport-only
    shown++;

    var available = OL.Cameras._findProp(cam, 'available') === 'true';
    var m = L.marker([cam.lat, cam.lon], {
      title: cam.commonName,
      zIndexOffset: available ? 0 : -500,
      icon: OL.Cameras._icon(available)
    });
    m._cam = {
      name: cam.commonName,
      id: String(cam.id || '').replace('JamCams_', ''),
      available: available,
      imageUrl: OL.Cameras._findProp(cam, 'imageUrl'),
      videoUrl: OL.Cameras._findProp(cam, 'videoUrl'),
      view: OL.Cameras._findProp(cam, 'view')
    };
    m.bindPopup(OL.Cameras._popupHtml(m._cam));
    markers.push(m);
  });

  OL.Cameras.meta.shown = shown;
  OL.Cameras.group.addLayers(markers);
  if (OL.visibleCameras) OL.Cameras.group.addTo(OL.map);

  // Re-render au deplacer (debounce)
  clearTimeout(OL.Cameras.viewportTimer);
  OL.map.once('moveend', function() {
    OL.Cameras.viewportTimer = setTimeout(OL.Cameras.render, 300);
  });
};

/* Re-render si fond satellite (icônes différentes) */
OL.Cameras.recheckIcons = function() { OL.Cameras.render(); };

/* ── Polling fraîcheur (image/vidéo récentes) ── */
OL.Cameras._schedule = function() {
  clearInterval(OL.Cameras.pollTimer);
  OL.Cameras.pollTimer = setInterval(function() {
    if (!OL.map) return;
    if (OL.map.getZoom() >= OL.CONFIG.cameraMediaMinZoom) OL.Cameras.fetchAll();
  }, OL.CONFIG.cameraRefreshMs);
};

/* ── Toggle global image / vidéo ── */
OL.Cameras.setFeedType = function(type) {
  OL.Cameras.feedType = (type === 'video') ? 'video' : 'image';
  var b = document.getElementById('btn-feed');
  if (b) b.textContent = (OL.Cameras.feedType === 'video') ? '▶ Vidéo' : '🖼 Image';
  OL.Cameras.recheckIcons();
};

/* ── Délégation : boutons zoom "⤢" dans les popups ── */
OL.Cameras.bindPopupActions = function() {
  document.addEventListener('click', function(e) {
    var zb = e.target.closest && e.target.closest('.cam-zoombtn');
    if (zb) { OL.Cameras._openZoom(zb); return; }
    var lc = e.target.closest && e.target.closest('.lightbox');
    if (lc && lc === e.target) OL.Cameras._closeZoom();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') OL.Cameras._closeZoom();
  });
};

OL.Cameras._openZoom = function(btn) {
  var url = btn.getAttribute('data-url');
  var name = btn.getAttribute('data-name') || '';
  var img = new Image();
  img.onload = function() {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = '<figure><img src="' + OL.esc(url) + '?i=' + Date.now() + '" alt="' + OL.esc(name) + '">'
      + '<figcaption>' + OL.esc(name) + '</figcaption></figure>'
      + '<button class="lb-close" title="Fermer">&#x2715;</button>';
    box.querySelector('.lb-close').onclick = OL.Cameras._closeZoom;
    document.body.appendChild(box);
    document.body.classList.add('lb-open');
  };
  img.onerror = function() { alert('Image indisponible.'); };
  img.src = url;
};

OL.Cameras._closeZoom = function() {
  var box = document.querySelector('.lightbox');
  if (box) box.remove();
  document.body.classList.remove('lb-open');
};

OL.Cameras.toggle = function(show) {
  if (!OL.Cameras.group) return;
  var has = OL.map.hasLayer(OL.Cameras.group);
  if (show && !has) OL.Cameras.group.addTo(OL.map);
  if (!show && has) OL.map.removeLayer(OL.Cameras.group);
};

/* ── Popup pro : image OU vidéo, zoom, cache-busting ── */
OL.Cameras._popupHtml = function(cam) {
  var header = '<div class="cam-head">'
    + '<img src="assets/icons/roundel.gif" alt="" class="cam-roundel">'
    + '<div class="cam-title"><strong>' + OL.esc(cam.name) + '</strong>'
    + (cam.view ? '<span class="cam-view">' + OL.esc(cam.view) + '</span>' : '')
    + '</div></div>';

  if (!cam.available || !cam.imageUrl) {
    return '<div class="cam-pop">' + header + '<div class="cam-off">Caméra indisponible</div></div>';
  }

  // cache-busting anti-cache : force l'image fraîche à chaque ouverture
  var t = Date.now();
  if (OL.Cameras.feedType === 'video' && cam.videoUrl) {
    return '<div class="cam-pop cam-video">' + header
      + '<video class="cam-vid" autoplay muted loop playsinline controls preload="metadata" '
      + 'src="' + OL.esc(cam.videoUrl) + '?i=' + t + '"></video>'
      + '<button class="cam-zoombtn" data-url="' + OL.esc(cam.imageUrl) + '" data-name="' + OL.esc(cam.name) + '">⤢ Voir image</button>'
      + '</div>';
  }
  return '<div class="cam-pop cam-image">' + header
    + '<img class="cam-img" src="' + OL.esc(cam.imageUrl) + '?i=' + t + '" alt="' + OL.esc(cam.name) + '">'
    + '<button class="cam-zoombtn" data-url="' + OL.esc(cam.imageUrl) + '" data-name="' + OL.esc(cam.name) + '">⤢ Agrandir</button>'
    + '</div>';
};