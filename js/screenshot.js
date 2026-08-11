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

OL.Screenshot._captureScreen = function() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    console.warn('[Screenshot] Screen capture not supported');
    return;
  }
  navigator.mediaDevices.getDisplayMedia({ video: true, preferCurrentTab: true })
    .then(function(stream) {
      var track = stream.getVideoTracks()[0];
      var video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      video.onloadeddata = function() {
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            var s = (track && track.getSettings) ? track.getSettings() : {};
            var w = s.width || video.videoWidth || 1280;
            var h = s.height || video.videoHeight || 720;
            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(video, 0, 0, w, h);
            stream.getTracks().forEach(function(t) { t.stop(); });
            canvas.toBlob(function(blob) {
              if (!blob) return;
              var url = URL.createObjectURL(blob);
              var c = OL.map.getCenter();
              var a = document.createElement('a');
              a.href = url;
              a.download = 'OpenLondon_' + (OL.baseKey || 'osm') + '_' +
                c.lat.toFixed(4) + '_' + c.lng.toFixed(4) + '_cam.png';
              document.body.appendChild(a);
              a.click();
              setTimeout(function() {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 100);
            });
          });
        });
      };
      video.onerror = function() {
        stream.getTracks().forEach(function(t) { t.stop(); });
      };
      video.play();
    })
    .catch(function(err) {
      console.warn('[Screenshot] screen capture cancelled/failed:', (err && err.name) || err);
    });
};

OL.Screenshot.capture = function() {
  if (!OL.Screenshot._loaded) {
    alert('Capture in progress, please retry.');
    return;
  }
  // Popup caméra ouverte → capture d'écran de l'onglet (inclut l'image/vidéo caméra)
  if (document.querySelector('.leaflet-popup-content .cam-pop')) {
    OL.Screenshot._captureScreen();
    return;
  }
  var container = OL.map.getContainer();
  var zoom = container.querySelector('.leaflet-control-zoom');
  var zoomDisplay = zoom ? zoom.style.display : '';
  if (zoom) zoom.style.display = 'none';

  function restore() {
    if (zoom) zoom.style.display = zoomDisplay;
  }

  html2canvas(container, {
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#0e1116',
    scale: 2,
    onclone: function(doc) {
      var z = doc.querySelector('.leaflet-control-zoom');
      if (z) z.style.display = 'none';

      var all = doc.querySelectorAll('img');
      for (var j = 0; j < all.length; j++) {
        var src = all[j].getAttribute('src') || '';
        if (src.indexOf('jamcams.tfl.gov.uk') !== -1) all[j].remove();
      }
    }
  }).then(function(canvas) {
    restore();
    canvas.toBlob(function(blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var c = OL.map.getCenter();
      var a = document.createElement('a');
      a.href = url;
      a.download = 'OpenLondon_' + (OL.baseKey || 'osm') + '_' + c.lat.toFixed(4) + '_' + c.lng.toFixed(4) + '.png';
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    });
  }).catch(function(err) {
    restore();
    console.warn('[Screenshot] failed:', err);
  });
};
