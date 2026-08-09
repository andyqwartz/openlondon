OL.Bookmarks = {
  STORAGE_KEY: 'openlondon_bookmarks',
  list: [],
  editing: null
};

OL.Bookmarks.load = function() {
  var defaults = JSON.parse(JSON.stringify(OL.CONFIG.bookmarks));
  var raw = localStorage.getItem(OL.Bookmarks.STORAGE_KEY);
  if (raw) {
    try {
      OL.Bookmarks.list = JSON.parse(raw);
      defaults.forEach(function(def) {
        if (!OL.Bookmarks.list.some(function(b) { return b.id === def.id; })) {
          OL.Bookmarks.list.push(def);
        }
      });
      OL.Bookmarks.save();
    } catch (e) {
      OL.Bookmarks.list = defaults;
    }
  } else {
    OL.Bookmarks.list = defaults;
    OL.Bookmarks.save();
  }
};

OL.Bookmarks.save = function() {
  localStorage.setItem(OL.Bookmarks.STORAGE_KEY, JSON.stringify(OL.Bookmarks.list));
};

OL.Bookmarks.add = function() {
  var c = OL.map.getCenter();
  var z = OL.map.getZoom();
  var name = prompt('Place name:', '');
  if (name === null) return;
  if (!name.trim()) name = 'Marker';
  OL.Bookmarks.list.push({
    id: 'loc_' + Date.now(),
    name: name,
    lat: c.lat,
    lng: c.lng,
    zoom: z,
    notes: ''
  });
  OL.Bookmarks.save();
  OL.Bookmarks.render();
};

OL.Bookmarks.remove = function(id) {
  OL.Bookmarks.list = OL.Bookmarks.list.filter(function(b) { return b.id !== id; });
  OL.Bookmarks.save();
  OL.Bookmarks.render();
};

OL.Bookmarks.goTo = function(id) {
  var b = OL.Bookmarks.list.find(function(x) { return x.id === id; });
  if (b) OL.map.flyTo([b.lat, b.lng], b.zoom || 14, { duration: 1 });
};

OL.Bookmarks.editNotes = function(id) {
  var b = OL.Bookmarks.list.find(function(x) { return x.id === id; });
  if (!b) return;
  var row = document.querySelector('[data-id="' + id + '"]');
  if (!row) return;
  var notesEl = row.querySelector('.bm-notes');
  var inputEl = row.querySelector('.bm-notes-input');
  if (!notesEl || !inputEl) return;
  if (OL.Bookmarks.editing === id) {
    b.notes = inputEl.value;
    notesEl.textContent = b.notes || '—';
    notesEl.style.display = '';
    inputEl.style.display = 'none';
    OL.Bookmarks.editing = null;
    OL.Bookmarks.save();
  } else {
    inputEl.value = b.notes || '';
    notesEl.style.display = 'none';
    inputEl.style.display = '';
    inputEl.focus();
    OL.Bookmarks.editing = id;
  }
};

OL.Bookmarks.render = function() {
  var container = document.getElementById('bookmarksList');
  if (!container) return;
  container.innerHTML = '';
  OL.Bookmarks.list.forEach(function(b) {
    var div = document.createElement('div');
    div.className = 'bm-item';
    div.setAttribute('data-id', b.id);
    div.innerHTML =
      '<div class="bm-header">' +
        '<span class="bm-name" title="Edit name">' + OL.esc(b.name) + '</span>' +
        '<span class="bm-coords">' + b.lat.toFixed(4) + ', ' + b.lng.toFixed(4) + '</span>' +
        '<span class="bm-actions">' +
          '<button class="bm-go" title="Go">Go</button>' +
          '<button class="bm-editname" title="Rename">Ren</button>' +
          '<button class="bm-editnotes" title="Edit note">Note</button>' +
          '<button class="bm-del" title="Delete">Del</button>' +
        '</span>' +
      '</div>' +
      '<div class="bm-body">' +
        '<span class="bm-notes">' + OL.esc(b.notes || '—') + '</span>' +
        '<textarea class="bm-notes-input" style="display:none;width:100%">' + OL.esc(b.notes || '') + '</textarea>' +
      '</div>';

    div.querySelector('.bm-go').onclick = function() { OL.Bookmarks.goTo(b.id); };
    div.querySelector('.bm-del').onclick = function() { OL.Bookmarks.remove(b.id); };
    div.querySelector('.bm-editname').onclick = function() {
      var nn = prompt('Rename:', b.name);
      if (nn && nn.trim()) { b.name = nn.trim(); OL.Bookmarks.save(); OL.Bookmarks.render(); }
    };
    div.querySelector('.bm-editnotes').onclick = function() { OL.Bookmarks.editNotes(b.id); };

    container.appendChild(div);
  });
};

OL.Bookmarks.togglePanel = function() {
  OL.UI.togglePanel('bookmarksPanel', 'btn-bookmarks', function() {
    OL.Bookmarks.load();
    OL.Bookmarks.render();
  });
};
