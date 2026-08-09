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

  OL.Cameras.fetchAll();
  OL.Traffic.fetch();
};

document.addEventListener('DOMContentLoaded', OL.init);
