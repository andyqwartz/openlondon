/* OpenLondon — Toolbar, toggles globaux, panneaux UI, boutons */

OL.UI = {
  MOBILE_MQ: '(max-width: 768px)'
};

OL.UI.togglePanel = function(panelId, btnId, onOpen) {
  var panel = document.getElementById(panelId);
  if (!panel) return;
  var open = panel.classList.toggle('open');
  var btn = document.getElementById(btnId);
  if (btn) btn.classList.toggle('active', open);
  if (open && onOpen) onOpen();
  if (OL.map) OL.map.invalidateSize();
};

OL.UI.closePanel = function(panelId, btnId) {
  var panel = document.getElementById(panelId);
  if (panel) panel.classList.remove('open');
  var btn = document.getElementById(btnId);
  if (btn) btn.classList.remove('active');
};

/* ── États visibles globaux (câblés aussi par URLSync) ── */
OL.visibleCameras = true;
OL.visibleTraffic = false;
OL.visibleTransport = '';   // liste de modes séparés par des virgules
OL.baseKey = 'osm';

OL.toggleCameras = function(show) {
  OL.visibleCameras = !!show;
  var btn = document.getElementById('btn-cameras');
  if (btn) btn.classList.toggle('active', OL.visibleCameras);
  OL.Cameras.toggle(OL.visibleCameras);
  OL.URLSync.update();
};

OL.toggleTraffic = function(show) {
  OL.visibleTraffic = !!show;
  var btn = document.getElementById('btn-traffic');
  if (btn) btn.classList.toggle('active', OL.visibleTraffic);
  if (OL.Traffic.layer && !OL.Traffic.data.length) OL.Traffic.fetch();
  OL.Traffic.toggle(OL.visibleTraffic);
  OL.URLSync.update();
};

OL.toggleTransport = function(modeKey, show) {
  var list = OL.visibleTransport ? OL.visibleTransport.split(',') : [];
  var has = list.indexOf(modeKey) !== -1;
  if (show && !has) list.push(modeKey);
  if (!show && has) list.splice(list.indexOf(modeKey), 1);
  OL.visibleTransport = list.join(',');
  OL.Transport.toggle(modeKey, show);
  OL.URLSync.update();
};

/* ── Boutons toolbar ── */
OL.TOOLS = {};

OL.TOOLS.init = function() {
  function bind(id, fn) {
    var b = document.getElementById(id);
    if (b) b.onclick = fn;
  }

  bind('btn-cameras', function(e) {
    OL.toggleCameras(!OL.visibleCameras); e.preventDefault();
  });
  bind('btn-traffic', function(e) {
    OL.toggleTraffic(!OL.visibleTraffic); e.preventDefault();
  });
  bind('btn-transport', function() {
    OL.UI.togglePanel('transportPanel', 'btn-transport');
  });
  bind('btn-bookmarks', function() {
    OL.Bookmarks.togglePanel();
  });
  bind('btn-geoloc', function() {
    if (!OL.map.locate) return;
    OL.map.locate({ setView: true, maxZoom: 15 });
  });
  bind('btn-reset', function() {
    var v = OL.CONFIG.defaultView;
    OL.map.setView([v.lat, v.lng], v.zoom);
    OL.URLSync.update();
  });
  bind('btn-export', function() {
    OL.Screenshot.capture();
  });

  OL.map.on('locationfound', function(e) {
    if (OL.gpsMkr) OL.map.removeLayer(OL.gpsMkr);
    OL.gpsMkr = L.circleMarker(e.latlng, {
      radius: 8, fillColor: '#58a6ff', color: '#fff', weight: 2, fillOpacity: 0.8
    }).addTo(OL.map).bindPopup('Vous êtes ici').openPopup();
  });

  // Bascule des modes transport dans le panneau
  var tp = document.getElementById('transportPanel');
  if (tp) {
    var list = tp.querySelector('.transport-list');
    if (list) {
      Object.keys(OL.TRANSPORT_TYPES).forEach(function(k) {
        var def = OL.TRANSPORT_TYPES[k];
        var label = document.createElement('label');
        label.className = 'overlay-item';
        label.innerHTML = '<input type="checkbox" class="tp-check" data-mode="' + k + '"> <span class="tp-dot" style="background:' + def.color + '"></span> <span>' + OL.esc(def.label) + '</span>';
        label.querySelector('input').onchange = function() { OL.toggleTransport(k, this.checked); };
        list.appendChild(label);
      });
    }
  }

  // Fermeture panneaux avec Échap
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    OL.UI.closePanel('transportPanel', 'btn-transport');
    OL.UI.closePanel('bookmarksPanel', 'btn-bookmarks');
  });

  // Boutons de fermeture des panneaux
  var tpClose = document.getElementById('tp-close');
  if (tpClose) tpClose.onclick = function() { OL.UI.closePanel('transportPanel', 'btn-transport'); };
  var bmClose = document.getElementById('bm-close');
  if (bmClose) bmClose.onclick = function() { OL.UI.closePanel('bookmarksPanel', 'btn-bookmarks'); };
  var bmAddBtn = document.getElementById('bm-add-btn');
  if (bmAddBtn) bmAddBtn.onclick = function() { OL.Bookmarks.add(); };

  // Fond : boutons radio / select
  OL.initBaseSelect();
  var baseSel = document.getElementById('baseSelect');
  if (baseSel) baseSel.addEventListener('change', function() {
    OL.baseKey = baseSel.value;
    OL.switchBase(baseSel.value);
    OL.URLSync.update();
  });

  window.addEventListener('resize', function() {
    OL.URLSync.update();
    if (OL.map) OL.map.invalidateSize();
  });
  window.matchMedia(OL.UI.MOBILE_MQ).addEventListener('change', function() {
    if (OL.map) OL.map.invalidateSize();
  });
};