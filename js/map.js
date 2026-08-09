OL.initMap = function() {
  var cfg = OL.CONFIG;
  var map = OL.map = L.map('map', {
    fullscreenControl: true,
    fullscreenControlOptions: { position: 'topleft' },
    maxZoom: cfg.maxZoom,
    zoomControl: true
  }).setView([cfg.defaultView.lat, cfg.defaultView.lng], cfg.defaultView.zoom);

  map.createPane('overlaysPane');
  map.getPane('overlaysPane').style.zIndex = 400;
  map.getPane('overlaysPane').style.pointerEvents = 'none';

  OL.baseLayer = L.tileLayer(OL.TILES.OSM.url, {
    maxZoom: OL.TILES.OSM.maxZoom,
    attribution: OL.TILES.OSM.attr
  }).addTo(map);

  map.on('mousemove', function(e) {
    document.getElementById('coordDisplay').textContent = OL.formatCoord(e.latlng);
  });
  map.on('zoomend', function() {
    document.getElementById('zoomDisplay').textContent = map.getZoom();
  });

  L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(map);
  OL.mountScaleControl();

  document.getElementById('zoomDisplay').textContent = map.getZoom();

  return map;
};

OL.formatCoord = function(latlng) {
  return latlng.lat.toFixed(5) + ', ' + latlng.lng.toFixed(5);
};

OL.mountScaleControl = function() {
  var scale = document.querySelector('.leaflet-control-scale');
  var slot = document.getElementById('scaleSlot');
  if (!scale || !slot) return;
  scale.style.position = 'static';
  scale.style.margin = '0';
  slot.appendChild(scale);
};
