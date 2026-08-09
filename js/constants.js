/* OpenLondon — Constantes : endpoints TfL + fonds cartographiques */

// ── API TfL (publique, sans clé) ──
OL.API = Object.freeze({
  BASE:      'https://api.tfl.gov.uk',
  JAMCAM:    '/Place/Type/JamCam',          // 882 caméras
  DISRUPTION:'/Road/All/Disruption',        // disruptions/trafic
  STOPPOINT: '/StopPoint/Type/',            // {type}?lat&lon&radius
  STOPSEARCH:'/StopPoint/Search',           // ?query=&types=
  MODES:     '/Line/Meta/Modes',            // 18 modes
  STOP_TYPES:'/StopPoint/Meta/StopTypes'    // types Naptan
});

// ── URLs média caméras (S3, ouvert) ──
OL.S3 = Object.freeze({
  MEDIA: 'https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/'
});

// ── Fonds cartographiques ──
OL.TILES = Object.freeze({
  OSM:         { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',      maxZoom: 19, attr: '© OpenStreetMap' },
  OSM_FR:      { url: 'https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',   maxZoom: 20, attr: '© OpenStreetMap France' },
  ESRI:        { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', maxZoom: 19, attr: 'Esri, Maxar, Earthstar' },
  GOOGLE_SAT:  { url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',      maxZoom: 20, attr: '© Google' },
  GOOGLE_HYB:  { url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',      maxZoom: 20, attr: '© Google' },
  CARTO_DARK:  { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', maxZoom: 20, attr: '© OpenStreetMap © CARTO' },
  CARTO_LIGHT: { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', maxZoom: 20, attr: '© OpenStreetMap © CARTO' }
});

// ── Relief LiDAR Grande-Bretagne (Environment Agency) ──
OL.LIDAR_GB = Object.freeze({
  WMS: 'https://environment.data.gov.uk/spatialdata/lidar-composite-digital-terrain-model-dtm-1m/wms',
  LAYERS: 'LIDAR_Composite_DTM_1m',
  maxZoom: 18,
  opacity: 0.6,
  attr: '© Environment Agency — OGL v3.0'
});

// ── Réseaux Transport — utilisent /StopPoint/Mode/{mode} (1 appel par réseau) ──
OL.TRANSPORT_TYPES = Object.freeze({
  tube:       { label: 'Métro (Tube)',   mode: 'tube',          color: '#e0433a', icon: 'metro' },
  rail:       { label: 'Rail national',  mode: 'national-rail', color: '#6a329f', icon: 'rail' },
  dlr:        { label: 'DLR',            mode: 'dlr',           color: '#00a1a1', icon: 'metro' },
  overground: { label: 'Overground',     mode: 'overground',    color: '#e8762c', icon: 'rail' },
  elizabeth:  { label: 'Elizabeth Line', mode: 'elizabeth-line',color: '#8c2d9f', icon: 'rail' },
  tram:       { label: 'Tram',           mode: 'tram',          color: '#66cc33', icon: 'metro' },
  bus:        { label: 'Bus',            mode: 'bus',           color: '#f5b301', icon: 'bus' }
});

// ── Attribution combinée ──
OL.ATTRIBUTION = 'Données mobilité © Transport for London · Fond © OpenStreetMap · Relief © Environment Agency (OGL v3)'