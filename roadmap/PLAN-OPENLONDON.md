# PLAN OPENLONDON — Viewer caméras & trafic Londres

**Version:** 1.0 | **Date:** 2026-08-09 | **Statut:** Validé (recon faite)
**Nom définitif:** OpenLondon · **Déploiement:** GitHub Pages

---

## 1. Vision
Viewer **London mobility** 100% client-side (statique, sans build, sans clé) qui réunit :
1. **Caméras de trafic TfL** (882) en temps réel (image + vidéo).
2. **Trafic / disruptions** (106 événements).
3. **Arrêts bus & stations/rail** (API StopPoint, types Naptan).
4. **Relief LiDAR** Londres (Environment Agency) en fond ou overlay.
5. Carte de base London (OSM + variantes).

Architecture dérivée du viewer LiDAR éprouvé (SERENDIPPO-LIDAR-VIEWER), **débarrassée des fonctionnalités legacy** et **adaptée** au contexte caméras/trafic.

---

## 2. PRINCIPE CLEAN : fonctionnalités legacy RETIRÉES
Le code actuel (`index.html`, `js/`) est encore le **shell LiDAR**. On retire tout ce qui n'a pas de sens pour un viewer caméras :

| Legacy | Décision | Raison |
|---|---|---|
| Split-view SBS "Gauche/Droite" + sliders opacité (`sbs.js`, `sbs-divider`, `sbs-handle`, `sbs-opL/R`) | ❌ RETIRER | Monoview : 1 carte, pas de comparaison côte-à-côte |
| TrackManager GPX / onglet Tracks (`showTracks`, upload .gpx) | ❌ RETIRER | Hors scope mobilité live |
| Recherche géo FR (api-adresse + IGN) | ❌ RETIRER | Recherche Londres (voir §7) |
| Coordonnées + **Altitude** dans la barre de statut | ➖ Adapter | Garder Coords + Zoom ; (altitude d'une caméra peu pertinente) |
| Overlays transparents IGN (hydro, cadastre...) | ❌ RETIRER | Remplacés par couches Londres |
| WMS/WMTS européens (constants.js : IGN, ES, IT, EU...) | ❌ RETIRER | Remplacés par fonds London + LiDAR GB |
| Bouton "Nuit" | ❌ RETIRER | Fond noir suffisant |
| Mesure de distance (`measure.js`) | ❌ RETIRER | Non prioritaire mobilité |

**CONSERVÉS (réutilisés de l'écosystème éprouvé) :**
- **Leaflet 1.9.4** + vanilla JS, statique, sans build.
- Namespace global, `config.js`, `map.js` (init Leaflet), `bookmarks.js` (lieux), `overlay` handling simple, `urlSync.js` (état partageable), `screenshot.js` (export PNG), toolbar déclarative, responsive mobile.

---

## 3. Architecture des modules (js/)
```
js/
├── namespace.js      → window.OL = {}   (renommé de LV → OL)
├── config.js         → OL.CONFIG : center Londres [51.507,-0.127], zoom 11, refresh
├── constants.js      → OL.API (endpoints TfL), OL.S3, OL.MODES (18), OL.CAM_TYPES
├── map.js            → OL.initMap() : Leaflet, fond OSM + LiDAR GB
├── cameras.js        → [NOUVEAU] fetch 882 caméras, clusters, lazy-load image/vidéo
├── traffic.js        → [NOUVEAU] disruptions/trafic (Road/All/Disruption)
├── transport.js      → [NOUVEAU] bus & rail (StopPoint API, types Naptan)
├── search.js         → [RÉÉCRIT] recherche London (TfL StopPoint/Search + Nominatim UK)
├── bookmarks.js      → CONSERVÉ (réécrit LV→OL, sans onglet Tracks)
├── urlSync.js        → CONSERVÉ (LV→OL)
├── screenshot.js     → CONSERVÉ (LV→OL)
├── overlays.js       → [ADAPTÉ] couches overlay London (LiDAR, caméras sur fond)
├── layers.js         → [NOUVEAU] OL.LAYERS : registre fonds/overlays London
├── tools.js          → CONSERVÉ (toolbar, LV→OL, sans legacy)
├── app.js            → OL.init() : bootstrap (sans SBS, sans TrackManager)
```
`index.html` → refondu : 1 carte, toolbar (caméras, trafic, transport, bookmarks, reset, export), panneau caméra sélectionnée, recherche London, footer coords/zoom, responsive mobile.

`css/style.css` → adapté : thème sombre London, panneau caméra, clusters, sans styles SBS/tracks.

---

## 4. Couches (fond + overlays)
**Bases (switchable)**
- OSM (standard) · Esri World Imagery (photo) · Fond sombre London (CartoDB dark) · **Relief LiDAR GB** (Environment Agency WMS).

**Overlays (activable par checkbox)**
- 🎥 **Caméras TfL** (882) — clusters + popup image/vidéo.
- 🚧 **Disruptions / trafic** — markers colorés par severity.
- 🚌 **Bus stops** (NaptanPublicBusCoachTram) — et/ou stations/rail filtrables par mode.
- ➖ Légende + attribution TfL / © OSM / © Environment Agency.

---

## 5. Module Caméras (cœur)
1. `GET Place/Type/JamCam` → 882 objets.
2. Clusters `Leaflet.markercluster` par zoom.
3. **Lazy-load** : image/vidéo chargées seulement pour les caméras visibles (IntersectionObserver ou affichage à l'activation).
4. Popup caméra : nom, orientation (view), image `.jpg`, lien/bouton vidéo `.mp4`, disponibilité.
5. Polling léger : re-fetch caméras visibles toutes les N minutes (configurable).
6. Filtre : "dispo uniquement", recherche par nom.

## 6. Module Trafic (disruptions)
1. `GET Road/All/Disruption` → 106 événements.
2. Markers sur chaque `point` (parsé de la string "lat,lon").
3. Color par `severity` (Minor/Moderate/Severe/Closure).
4. Popup : severity, category, subCategory, comments.
5. Refresh périodique + bascule on/off.

## 7. Module Transport (bus & rail)
1. `GET StopPoint/Type/{type}` (NaptanPublicBusCoachTram, NaptanMetroStation, NaptanRailStation...) selon mode choisi.
2. ou `StopPoint/Search?query=&types=...` pour la recherche.
3. Regroupement par mode (18 modes dispo).
4. Bascule par mode dans le panneau transport.

## 8. Recherche London
- `StopPoint/Search` (TfL) pour stations/lieux TfL.
- **Nominatim OSM** (limit=1, polygon_geojson=0, viewbox=London) pour adresses/quartiers — fonctionne client-side sans clé, évite les CORS blocqués.
- Zoomer sur résultat + éventuellement ouvrir caméras/stations à proximité.

---

## 9. Performances
- Clusters caméras + lazy-load médias (jamais 882 images en même temps).
- Un seul `Observable`/timer de refresh pour les données visibles.
- Caching localStorage du GeoJSON caméras (fraîcheur ~1h).

---

## 10. Risques restants (à lever en phase dev)
- **CORS** : valider api.tfl.gov.uk + S3 + Environment Agency depuis navigateur (paralysant si bloqué) → test immédiat en début d'implémentation.
- **Rate-limit TfL** : header max calls ; garder un cache.
- **Payload** 882 caméras : mesurer taille réelle ; optimiser si >1-2 Mo.
- London Datastore (403) : exploré en phase 2, non bloquant.

---

## 11. Livrables & étapes (ordre)
1. **Phase 0 (fait)** : recon + memory bank + plan.
2. **Phase 1 — CLEAN** : git init fait ; purge du code legacy (SBS, tracks, search FR, WMS EU), refonte `index.html` + `constants.js` en London.
3. **Phase 2 — Cœur caméras** : fetch 882 + clusters + lazy-load médias + popup + refresh.
4. **Phase 3 — Couches** : fonds (OSM/Imagery/Sombre/LiDAR) + overlays (caméras/trafic/bus/rail).
5. **Phase 4 — Trafic & Transport** : disruptions + StopPoint bus/rail.
6. **Phase 5 — UI & polish** : panneau caméra, recherche London, bookmarks, screenshot, responsive, dark theme.
7. **Phase 6 — Test & déploiement** : serveur local (python3 -m http.server), tests navigateur, GitHub Pages.

## 12. Git & mémoire (préférences Andy)
- Commits **progressifs et fréquents** dès la phase 1 (pas de batch final).
- `memory-bank/`, `research/`, `competitors/`, `sources/` **jamais commités** (.gitignore) — analyse en local.
- Ne jamais mentionner daevorn dans ce repo public.
- Recap avant chaque grosse étape.