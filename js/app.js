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

  // Charger les données (caméras 882 + trafic 106)
  OL.Cameras.fetchAll();
  OL.Traffic.fetch();

  // Anti-429 : ne vérifier les cellules transport qu'après un vrai déplacement,
  // avec debounce. Jamais un batch de refetch à chaque pan.
  var cellTimer = null;
  OL.map.on('moveend', function() {
    clearTimeout(cellTimer);
    cellTimer = setTimeout(function() {
      OL.Transport.checkCells();
    }, 1200);
  });
};

document.addEventListener('DOMContentLoaded', OL.init);