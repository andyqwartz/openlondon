/* OpenLondon — Configuration globale */

OL.CONFIG = Object.freeze({
  // Vue par défaut : centre de Londres
  defaultView: { lat: 51.5074, lng: -0.1278, zoom: 13 },
  maxZoom: 19,

  // Refresh des données visibles (ms)
  cameraRefreshMs: 300000,       // caméras visibles : 5 min
  trafficRefreshMs: 600000,      // disruptions : 10 min
  cacheCamerasMs: 3600000,       // cache GeoJSON caméras : 1 h

  // Optimisation : ne charger les médias photo/vidéo qu'au-delà de ce zoom
  cameraMediaMinZoom: 13,

  // Signet par défaut (liste vide — remplie en local par l'utilisateur)
  bookmarks: [
    { id: 'london_core', name: 'Londres - Centre', lat: 51.5074, lng: -0.1278, zoom: 13, notes: 'Centre de Londres' },
    { id: 'trafalgar',   name: 'Trafalgar Square', lat: 51.5080, lng: -0.1280, zoom: 16, notes: 'Place centrale' },
    { id: 'kingscross',  name: "King's Cross",     lat: 51.5308, lng: -0.1238, zoom: 15, notes: 'Gare / échangeur' },
    { id: 'heathrow',    name: 'Heathrow Airport',  lat: 51.4700, lng: -0.4543, zoom: 12, notes: 'Aéroport' }
  ]
});