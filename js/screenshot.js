OL.Screenshot = {
  _loaded: false
};

OL.Screenshot.init = function() {
  if (typeof html2canvas !== 'undefined') { OL.Screenshot._loaded = true; return; }
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  s.onload = function() { OL.Screenshot._loaded = true; };
  s.onerror = function() { console.warn('[Screenshot] echec chargement html2canvas'); };
  document.head.appendChild(s);
};

OL.Screenshot.capture = function() {
  if (!OL.Screenshot._loaded) {
    alert('Capture en cours de chargement, reessayez.');
    return;
  }
  var container = OL.map.getContainer();
  html2canvas(container, {
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#0e1116',
    scale: 2,
    onclone: function(doc) {

      var imgs = doc.querySelectorAll('.cam-img');
      for (var i = 0; i < imgs.length; i++) {
        imgs[i].remove();
      }

      var all = doc.querySelectorAll('img');
      for (var j = 0; j < all.length; j++) {
        var src = all[j].getAttribute('src') || '';
        if (src.indexOf('jamcams.tfl.gov.uk') !== -1) all[j].remove();
      }
    }
  }).then(function(canvas) {
    canvas.toBlob(function(blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'openlondon.png';
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    });
  }).catch(function(err) {
    console.warn('[Screenshot] failed:', err);
  });
};
