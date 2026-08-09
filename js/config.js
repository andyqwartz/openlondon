OL.CONFIG = Object.freeze({

  defaultView: { lat: 51.5074, lng: -0.1278, zoom: 13 },
  maxZoom: 19,

  cameraRefreshMs: 300000,
  trafficRefreshMs: 600000,
  cacheCamerasMs: 3600000,

  cameraMediaMinZoom: 13,

  bookmarks: [
    { id: 'london_core', name: 'London - Centre', lat: 51.5074, lng: -0.1278, zoom: 13, notes: 'Central London' },
    { id: 'trafalgar',   name: 'Trafalgar Square', lat: 51.5080, lng: -0.1280, zoom: 16, notes: 'Central square' },
    { id: 'kingscross',  name: "King's Cross",     lat: 51.5308, lng: -0.1238, zoom: 15, notes: 'Station / interchange' },
    { id: 'heathrow',    name: 'Heathrow Airport',  lat: 51.4700, lng: -0.4543, zoom: 12, notes: 'Airport' }
  ]
});
