OL.UI = { MOBILE_MQ: '(max-width: 768px)' };

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
  var p = document.getElementById(panelId);
  if (p) p.classList.remove('open');
  var b = document.getElementById(btnId);
  if (b) b.classList.remove('active');
};

OL.UI.closeAllPanels = function() {
  OL.UI.closePanel('transportPanel', 'btn-transport');
  OL.UI.closePanel('bookmarksPanel', 'btn-bookmarks');
  OL.UI.closePanel('infoPanel', 'btn-info');
};

OL.visibleCameras = true;
OL.visibleTraffic = false;
OL.visibleTransport = '';
OL.baseKey = 'osm';

OL.toggleCameras = function(show) {
  OL.visibleCameras = !!show;
  var b = document.getElementById('btn-cameras');
  if (b) b.classList.toggle('active', OL.visibleCameras);
  OL.Cameras.toggle(OL.visibleCameras);
  OL.URLSync.update();
};

OL.toggleTraffic = function(show) {
  OL.visibleTraffic = !!show;
  var b = document.getElementById('btn-incidents');
  if (b) b.classList.toggle('active', OL.visibleTraffic);
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
  OL.Transport.updateCount();
  OL.URLSync.update();
};

OL.night = false;
OL.toggleNight = function() {
  OL.night = !OL.night;
  var b = document.getElementById('btn-night');
  if (b) b.classList.toggle('active', OL.night);
  document.body.classList.toggle('night', OL.night);
};

OL.TOOLS = {};

OL.TOOLS.init = function() {
  function bind(id, fn) { var b = document.getElementById(id); if (b) b.onclick = fn; }

  bind('btn-cameras', function(e) { e.preventDefault(); OL.toggleCameras(!OL.visibleCameras); });
  bind('btn-incidents', function(e) { e.preventDefault(); OL.toggleTraffic(!OL.visibleTraffic); });
  bind('btn-transport', function(e) { e.preventDefault(); OL.UI.togglePanel('transportPanel', 'btn-transport', OL.Transport.updateCount); });
  bind('btn-feed', function(e) {
    e.preventDefault();
    OL.Cameras.setFeedType(OL.Cameras.feedType === 'video' ? 'image' : 'video');
  });
  bind('btn-info', function(e) {
    e.preventDefault();
    OL.UI.togglePanel('infoPanel', 'btn-info');
  });
  bind('btn-bookmarks', function() { OL.Bookmarks.togglePanel(); });
  bind('btn-export', function() { OL.Screenshot.capture(); });
  bind('btn-reset', function() {
    var v = OL.CONFIG.defaultView;
    OL.map.setView([v.lat, v.lng], v.zoom);
    OL.URLSync.update();
  });
  bind('btn-night', function(e) {
    e.preventDefault();
    OL.toggleNight();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') OL.UI.closeAllPanels();
  });
  ['tp-close', 'bm-close', 'info-close'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.onclick = function() { OL.UI.closeAllPanels(); };
  });
  var bmAdd = document.getElementById('bm-add-btn');
  if (bmAdd) bmAdd.onclick = function() { OL.Bookmarks.add(); };

  OL.map.on('click', function() { OL.UI.closeAllPanels(); });

  var tp = document.getElementById('transportPanel');
  if (tp) {
    var list = tp.querySelector('.transport-list');
    if (list) {
      Object.keys(OL.TRANSPORT_TYPES).forEach(function(k) {
        if (k === 'bus') return;
        var def = OL.TRANSPORT_TYPES[k];
        var label = document.createElement('label');
        label.className = 'overlay-item';
        label.innerHTML = '<input type="checkbox" class="tp-check" data-mode="' + k + '">'
          + '<span class="tp-dot" style="background:' + def.color + '"></span>'
          + '<span>' + OL.esc(def.label) + '</span>';
        label.querySelector('input').onchange = function() { OL.toggleTransport(k, this.checked); };
        list.appendChild(label);
      });
    }
    var busBtn = document.getElementById('busRouteBtn');
    var busInput = document.getElementById('busRouteInput');
    if (busBtn && busInput) {
      function goBus() {
        var r = busInput.value.trim();
        if (!r) return;
        OL.toggleTransport('bus', true);
        OL.URLSync.update();
      }
      busBtn.onclick = goBus;
      busInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') goBus(); });
    }
  }

  OL.initBaseSelect();
  var baseSel = document.getElementById('baseSelect');
  if (baseSel) baseSel.addEventListener('change', function() {
    OL.baseKey = baseSel.value;
    OL.switchBase(baseSel.value);
    OL.URLSync.update();
  });

  window.addEventListener('resize', function() {
    if (OL.map) OL.map.invalidateSize();
  });
  window.matchMedia(OL.UI.MOBILE_MQ).addEventListener('change', function() {
    if (OL.map) OL.map.invalidateSize();
  });

  OL.Cameras.bindPopupActions();
};
