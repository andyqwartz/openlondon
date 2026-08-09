OL.Cameras = {
  data: [],
  group: null,
  loaded: false,
  pollTimer: null,
  viewportTimer: null,
  feedType: 'video',
  meta: { total: 0, available: 0, shown: 0 }
};

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
  catch (e) {  }
};

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

OL.Cameras._findProp = function(cam, key) {
  var ap = cam && cam.additionalProperties;
  if (!Array.isArray(ap)) return null;
  for (var i = 0; i < ap.length; i++) if (ap[i].key === key) return ap[i].value;
  return null;
};

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
    if (!lb.contains([cam.lat, cam.lon])) return;
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

  clearTimeout(OL.Cameras.viewportTimer);
  OL.map.once('moveend', function() {
    OL.Cameras.viewportTimer = setTimeout(OL.Cameras.render, 300);
  });
};

OL.Cameras.recheckIcons = function() { OL.Cameras.render(); };

OL.Cameras._schedule = function() {
  clearInterval(OL.Cameras.pollTimer);
  OL.Cameras.pollTimer = setInterval(function() {
    if (!OL.map) return;
    if (OL.map.getZoom() >= OL.CONFIG.cameraMediaMinZoom) OL.Cameras.fetchAll();
  }, OL.CONFIG.cameraRefreshMs);
};

OL.Cameras.setFeedType = function(type) {
  OL.Cameras.feedType = (type === 'video') ? 'video' : 'image';
  var b = document.getElementById('btn-feed');
  if (b) {
    b.innerHTML = (OL.Cameras.feedType === 'video')
      ? OL.Cameras._FEED_ICON.video + '<span>Video</span>'
      : OL.Cameras._FEED_ICON.photo + '<span>Image</span>';
  }
  OL.Cameras.recheckIcons();
};

OL.Cameras._FEED_ICON = {
  photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.5"/><circle cx="8" cy="8" r="1"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><rect x="2" y="6" width="13" height="12" rx="2"/><path d="m15 10 6-3v10l-6-3"/></svg>'
};

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

OL.Cameras._MEDIA_ICON = {
  photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.5"/><circle cx="8" cy="8" r="1"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="2" y="6" width="13" height="12" rx="2"/><path d="m15 10 6-3v10l-6-3"/></svg>'
};
OL.Cameras._EXPAND_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';

OL.Cameras._openZoom = function(btn) {
  var url = btn.getAttribute('data-url');
  var video = btn.getAttribute('data-video') || '';
  var name = btn.getAttribute('data-name') || '';
  var startVideo = btn.getAttribute('data-mode') === 'video' ? 1 : 0;

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.innerHTML = '<div class="lb-stage"><img class="lb-img" alt="">'
    + '<video class="lb-video" autoplay muted loop playsinline controls style="display:none"></video></div>'
    + '<div class="lb-bar">'
    + '<button class="lb-media" type="button" title="Switch photo/video"></button>'
    + '<span class="lb-spacer"></span>'
    + '<button class="lb-zoom out" type="button" title="Zoom out">−</button>'
    + '<button class="lb-zoom reset" type="button" title="Reset">1:1</button>'
    + '<button class="lb-zoom in" type="button" title="Zoom in">+</button>'
    + '<span class="lb-spacer"></span>'
    + '<button class="lb-close" type="button" title="Close">&#x2715;</button>'
    + '</div>';
  document.body.appendChild(box);
  document.body.classList.add('lb-open');

  var stage = box.querySelector('.lb-stage');
  var img = box.querySelector('.lb-img');
  var vid = box.querySelector('.lb-video');
  var mediaBtn = box.querySelector('.lb-media');
  var scale = 1, tx = 0, ty = 0;
  var currentVideo = startVideo;

  function apply() {
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    vid.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
  }
  function setZoom(f) { scale = Math.min(8, Math.max(1, scale * f)); apply(); }
  function showMedia(isVideo) {
    currentVideo = isVideo;
    img.style.display = isVideo ? 'none' : 'block';
    vid.style.display = isVideo ? 'block' : 'none';
    scale = 1; tx = 0; ty = 0; apply();
    mediaBtn.innerHTML = isVideo ? OL.Cameras._MEDIA_ICON.photo : OL.Cameras._MEDIA_ICON.video;
    mediaBtn.title = isVideo ? 'Switch to photo' : 'Switch to video';
  }

  img.onload = function() {
    if (!currentVideo) showMedia(false);
  };
  img.src = url + '?i=' + Date.now();
  if (currentVideo && video) {
    showMedia(true);
    vid.src = video + '?i=' + Date.now();
  } else if (!video && mediaBtn) {
    mediaBtn.style.display = 'none';
    currentVideo = false;
    showMedia(false);
  }

  box.querySelector('.lb-zoom.in').onclick = function() { setZoom(1.4); };
  box.querySelector('.lb-zoom.out').onclick = function() { setZoom(1 / 1.4); };
  box.querySelector('.lb-zoom.reset').onclick = function() { scale = 1; tx = 0; ty = 0; apply(); };
  box.querySelector('.lb-close').onclick = OL.Cameras._closeZoom;

  if (mediaBtn) {
    mediaBtn.onclick = function() { showMedia(!currentVideo); };
  }

  stage.addEventListener('wheel', function(e) {
    e.preventDefault();
    setZoom(e.deltaY < 0 ? 1.15 : 1 / 1.15);
  }, { passive: false });
  var dragging = false, sx = 0, sy = 0, stx = 0, sty = 0;
  stage.addEventListener('mousedown', function(e) {
    if (scale <= 1) return;
    dragging = true; sx = e.clientX; sy = e.clientY; stx = tx; sty = ty;
  });
  window.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    tx = stx + (e.clientX - sx);
    ty = sty + (e.clientY - sy);
    apply();
  });
  window.addEventListener('mouseup', function() { dragging = false; });
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

OL.Cameras._popupHtml = function(cam) {
  var header = '<div class="cam-head">'
    + '<img src="assets/icons/roundel.gif" alt="" class="cam-roundel">'
    + '<div class="cam-title"><strong>' + OL.esc(cam.name) + '</strong>'
    + (cam.view ? '<span class="cam-view">' + OL.esc(cam.view) + '</span>' : '')
    + '</div></div>';

  if (!cam.available || !cam.imageUrl) {
    return '<div class="cam-pop">' + header + '<div class="cam-off">Camera unavailable</div></div>';
  }

  var t = Date.now();
  var zoomBtn = '<button class="cam-zoombtn" data-url="' + OL.esc(cam.imageUrl) + '"'
    + ' data-video="' + (cam.videoUrl ? OL.esc(cam.videoUrl) : '') + '"'
    + ' data-mode="' + (OL.Cameras.feedType === 'video' ? 'video' : 'image') + '"'
    + ' data-name="' + OL.esc(cam.name) + '">'
    + OL.Cameras._EXPAND_ICON + '<span>Enlarge</span></button>';

  if (OL.Cameras.feedType === 'video' && cam.videoUrl) {
    return '<div class="cam-pop cam-video">' + header
      + '<video class="cam-vid" autoplay muted loop playsinline controls preload="metadata" '
      + 'src="' + OL.esc(cam.videoUrl) + '?i=' + t + '"></video>'
      + zoomBtn
      + '</div>';
  }
  return '<div class="cam-pop cam-image">' + header
    + '<img class="cam-img" src="' + OL.esc(cam.imageUrl) + '?i=' + t + '" alt="' + OL.esc(cam.name) + '">'
    + zoomBtn
    + '</div>';
};
