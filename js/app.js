/* OpenLondon — Bootstrap */

OL.init = function() {
  OL.initMap();
  OL.initBaseSelect();
  OL.Search.init();
  OL.Bookmarks.load();
  OL.Bookmarks.render();
  OL.TOOLS.init();
  OL.URLSync.init();
  OL.Screenshot.init();

  // Charger les données (caméras + trafic discret + refresh sur déplacement)
  OL.Cameras.fetchAll();
  OL.Traffic.fetch();

  // Recharger le transport actif quand on se déplace trop loin
  OL.map.on('moveend', function() {
    OL.Transport.refreshActive();
  });
};

document.addEventListener('DOMContentLoaded', OL.init);