/* OpenLondon — Registre des fonds de carte + gestion du switch */

OL.BASE_LAYERS = {
  osm:        { name: 'OSM standard',      tile: 'OSM',        map: null },
  osmfr:      { name: 'OSM France',        tile: 'OSM_FR',     map: null },
  imagery:    { name: 'Photo (Esri)',      tile: 'ESRI',       map: null },
  dark:       { name: 'Sombre (CARTO)',    tile: 'CARTO_DARK', map: null },
  light:      { name: 'Lumineux (CARTO)',  tile: 'CARTO_LIGHT',map: null },
  lidar:      { name: 'Relief LiDAR GB',   tile: null,         map: null, lidar: true }
};

/**
 * Bascule le fond de carte.
 * @param {string} key une clé de OL.BASE_LAYERS
 */
OL.switchBase = function(key) {
  var def = OL.BASE_LAYERS[key];
  if (!def) return;

  // Retire l'ancien fond
  if (OL.baseLayer) {
    OL.map.removeLayer(OL.baseLayer);
    OL.baseLayer = null;
  }

  if (def.lidar) {
    // Relief LiDAR WMS (pas de tuiles)
    OL.baseLayer = L.tileLayer.wms(OL.LIDAR_GB.WMS, {
      layers: OL.LIDAR_GB.LAYERS,
      format: 'image/png',
      transparent: false,
      maxZoom: OL.LIDAR_GB.maxZoom,
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
};

/* Bascule la liste des fonds dans le select #baseSelect */
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
  sel.value = 'osm';
  sel.onchange = function() { OL.switchBase(sel.value); };
};