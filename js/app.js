/* OpenLondon — Bootstrap */

OL.init = function() {
  OL.Transport.purgeOldCache();
  OL.initMap();
  OL.initBaseSelect();
  OL.Search.init();
  OL.Bookmarks.load();
  OL.Bookmarks.render();
  OL.TOOLS.init();
  OL.URLSync.init();
  OL.Screenshot.init();

  // Charger les données (caméras 882 + trafic 106)
  OL.Cameras.fetchAll();
  OL.Traffic.fetch();
};

document.addEventListener('DOMContentLoaded', OL.init);