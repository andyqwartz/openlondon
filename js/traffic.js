OL.Traffic = {
  data: [],
  layer: null,
  visible: true,
  pollTimer: null
};

OL.Traffic.SEVERITY = {
  'Minor':    '#f5b301',
  'Moderate': '#e06b2a',
  'Severe':   '#e0433a',
  'Closure':  '#9b1c1c'
};
OL.Traffic.SEVERITY_DEFAULT = '#7a7a8a';

OL.Traffic.fetch = function() {
  var url = OL.API.BASE + OL.API.DISRUPTION;
  return fetch(url)
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(json) {
      if (!Array.isArray(json)) throw new Error('Réponse invalide TfL');
      OL.Traffic.data = json;
      OL.Traffic.render();
      OL.Traffic._schedule();
      return json;
    })
    .catch(function(err) {
      console.warn('[Traffic]', err);
    });
};

OL.Traffic._parsePoint = function(str) {
  if (!str) return null;
  var parts = String(str).split(',');
  if (parts.length < 2) return null;
  var lng = parseFloat(parts[0]);
  var lat = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return [lat, lng];
};

OL.Traffic.render = function() {
  if (OL.Traffic.layer) {
    if (OL.map.hasLayer(OL.Traffic.layer)) OL.map.removeLayer(OL.Traffic.layer);
    OL.Traffic.layer = null;
  }
  OL.Traffic.layer = L.layerGroup();

  OL.Traffic.data.forEach(function(d) {
    var latlng = OL.Traffic._parsePoint(d.point);
    if (!latlng) return;
    var sev = d.severity || 'Unknown';
    var color = OL.Traffic.SEVERITY[sev] || OL.Traffic.SEVERITY_DEFAULT;

    var cat = (d.category || '').toLowerCase();
    var iconName = 'exclamation.png';
    if (OL.isSat()) iconName = 'exclamation-sat.png';
    if (cat.indexOf('work') !== -1) iconName = OL.isSat() ? 'roadworks-sat.png' : 'roadworks.png';
    if (sev === 'Closure') iconName = 'closure-1.png';

    var m = L.marker(latlng, {
      icon: L.icon({
        iconUrl: 'assets/icons/' + iconName,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      }),
      zIndexOffset: 900
    });
    m.bindPopup(
      '<div class="dis-pop"><span class="dis-sev" style="background:' + color + '">' + OL.esc(sev) + '</span>' +
      '<div class="dis-cat">' + OL.esc(d.category || '') + (d.subCategory ? ' · ' + OL.esc(d.subCategory) : '') + '</div>' +
      '<div class="dis-comments">' + OL.esc(d.comments || '') + '</div></div>'
    );
    m.addTo(OL.Traffic.layer);
  });

  OL.Traffic.updateCount();
  if (OL.Traffic.visible) OL.Traffic.layer.addTo(OL.map);
};

OL.Traffic.updateCount = function() {
  var c = document.getElementById('incCount');
  if (c) c.textContent = OL.Traffic.data.length;
};

OL.Traffic._schedule = function() {
  clearInterval(OL.Traffic.pollTimer);
  OL.Traffic.pollTimer = setInterval(function() {
    OL.Traffic.fetch();
  }, OL.CONFIG.trafficRefreshMs);
};

OL.Traffic.toggle = function(show) {
  OL.Traffic.visible = show;
  if (!OL.Traffic.layer) return;
  if (show && !OL.map.hasLayer(OL.Traffic.layer)) OL.Traffic.layer.addTo(OL.map);
  if (!show && OL.map.hasLayer(OL.Traffic.layer)) OL.map.removeLayer(OL.Traffic.layer);
};
