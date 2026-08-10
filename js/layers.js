OL.BASE_LAYERS = {
  osm:      { name: 'OSM standard',    tile: 'OSM',        sat: false, map: null },
  osmfr:    { name: 'OSM France',      tile: 'OSM_FR',     sat: false, map: null },
  googlesat:{ name: 'Google Satellite',tile: 'GOOGLE_SAT', sat: true,  map: null },
  googlehyb:{ name: 'Google Hybride',  tile: 'GOOGLE_HYB', sat: true,  map: null },
  openlidar:{ name: 'OpenLiDAR (relief GB)', tile: null,   sat: false, map: null, lidar: true },
  imagery:  { name: 'Photo (Esri)',    tile: 'ESRI',       sat: false, map: null },
  dark:     { name: 'Sombre (CARTO)',  tile: 'CARTO_DARK', sat: false, map: null },
  light:    { name: 'Lumineux (CARTO)',tile: 'CARTO_LIGHT',sat: false, map: null }
};

OL.isSat = function() {
  var def = OL.BASE_LAYERS[OL.baseKey];
  return !!(def && def.sat);
};

OL.switchBase = function(key) {
  var def = OL.BASE_LAYERS[key];
  if (!def) return;

  if (OL.baseLayer) {
    OL.map.removeLayer(OL.baseLayer);
    OL.baseLayer = null;
  }

  if (def.lidar) {
    OL.baseLayer = L.tileLayer.wms(OL.LIDAR_GB.WMS, {
      layers: OL.LIDAR_GB.LAYERS,
      format: 'image/png',
      transparent: true,
      version: '1.3.0',
      crs: L.CRS.EPSG3857,
      maxZoom: OL.LIDAR_GB.maxZoom,
      maxNativeZoom: OL.LIDAR_GB.maxNativeZoom,
      opacity: OL.LIDAR_GB.opacity,
      attribution: OL.LIDAR_GB.attr
    }).addTo(OL.map);
  } else {
    var t = OL.TILES[def.tile];
    OL.baseLayer = L.tileLayer(t.url, {
      maxZoom: t.maxZoom,
      attribution: t.attr
    }).addTo(OL.map);
  }

  if (OL.Cameras.group) OL.Cameras.recheckIcons();
};

OL.initBaseSelect = function() {
  var sel = document.getElementById('baseSelect');
  if (!sel) return;
  sel.innerHTML = '';
  Object.keys(OL.BASE_LAYERS).forEach(function(key) {
    var def = OL.BASE_LAYERS[key];
    var opt = document.createElement('option');
    opt.value = key;
    opt.textContent = def.name;
    sel.appendChild(opt);
  });
  sel.value = OL.baseKey || 'osm';
};
