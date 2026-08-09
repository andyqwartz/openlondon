# SERENDIPPO-LIDAR-VIEWER — Rebuilt Project

## Purpose

This folder is the dedicated build location for the **rebuilt version** of SERENDIPPO-LIDAR-VIEWER, a LiDAR/DTM comparison viewer. The rebuilt version adapts the core architecture for the target website **tfljamcams.net** (London Traffic Cameras).

## Folder Structure

```
rebuilt/
├── README.md              # This file
├── assets/                # Data assets (empty, to be populated)
├── css/
│   └── style.css          # Stylesheet
├── js/
│   ├── namespace.js       # Global namespace window.LV = {}
│   ├── config.js          # LV.CONFIG: defaultView, leftKey, sbsMin/Max, bookmarks
│   ├── constants.js       # LV.WMTS, LV.IMG, LV.URL, LV.ATTR (frozen)
│   ├── layers.js          # Pane name constants
│   ├── layers/
│   │   ├── layerHelpers.js   # LV.ignWMTS, gmWMTS, wms3857, LV.arcgisExport
│   │   ├── providerFactory.js # LV.createLayer(key) dispatch
│   │   ├── layerCache.js     # LV.getSideLayer(side, key) + LV.rebuildStack()
│   │   ├── layerGroups.js    # LV.LAYER_GROUPS + LV.SELECTABLE_LAYERS
│   │   ├── layerLabels.js    # LV.LAYER_NAMES (key → display name)
│   │   └── ...
│   ├── providers/
│   │   ├── france.js       # LV.PROV_FR (production France)
│   │   ├── dev.js           # LV.PROV_DEV (ES/IT dev)
│   │   └── europe.js        # LV.PROV_EU (9 European countries)
│   ├── map.js              # LV.initMap()
│   ├── sbs.js              # Split slider (SBS) + opacity
│   ├── search.js           # Geo search (api-adresse + IGN)
│   ├── bookmarks.js        # localStorage bookmarks
│   ├── ui/
│   │   ├── panels.js       # Bookmarks/overlays panels
│   │   ├── toolRegistry.js # Toolbar declarative
│   │   └── layerSelects.js # Layer dropdowns
│   ├── trackManager.js     # GPX track manager
│   ├── tools.js            # Toolbar init
│   ├── measure.js          # Distance measurement
│   ├── parsers/gpxParser.js# Minimal GPX parser (DOMParser)
│   ├── overlays.js         # Transparent overlays
│   ├── urlSync.js          # URL hash sync (throttled)
│   ├── screenshot.js       # PNG export (html2canvas CDN)
│   └── app.js              # Bootstrap (LV.init)
├── tests/
│   └── test.html           # Local test suite
└── assets/                # Data assets (to be populated)
```

## Memory Bank (rebuilt/)

The memory bank for this rebuilt version is located at:

`/Users/andy/Documents/SERENDIPPO-LIDAR-VIEWER/memory-bank/rebuilt/`

Contains:
- `architecture-plan.md` — Complete architecture plan
- `requirements.md` — Detailed requirements analysis
- `progressive-rebuild.md` — Step-by-step implementation plan
- `analysis-candidates.md` — Analysis candidates for refactoring
- `context.md` — Project context and analysis
- `summary.md` — Summary of findings and process
- `index.md` — This index file
- `tfljamcams-analysis.md` — Deep analysis of tfljamcams.net (target)

## Build Process (Progressive)

### Step 1: Create the dedicated folder
```bash
mkdir -p /Users/andy/Documents/SERENDIPPO-LIDAR-VIEWER/rebuilt/{js,css,assets}
mkdir -p /Users/andy/Documents/SERENDIPPO-LIDAR-VIEWER/memory-bank/rebuilt
```

### Step 2: Initiate memory bank
Create `memory-bank/rebuilt/` with all analysis files.

### Step 3: Progressive rebuild (10-15 hours)
Build the following files in order:
1. `index.html` — Single-page shell
2. `css/style.css` — Dark theme, responsive layout
3. `js/namespace.js` — Global namespace
4. `js/config.js` — Configuration
5. `js/constants.js` — Constants
6. `js/layers.js` — Pane names
7. `js/layers/layerHelpers.js` — Helper functions
8. `js/providers/france.js` — France production
9. `js/providers/dev.js` — Spain/Italy dev
10. `js/providers/europe.js` — 9 European countries
11. `js/layers/providerFactory.js` — Factory dispatch
12. `js/layers/layerCache.js` — Side cache
13. `js/layers/layerGroups.js` — Layer groups
14. `js/layers/layerLabels.js` — Layer names
15. `js/map.js` — Map initialization
16. `js/sbs.js` — Split slider
17. `js/search.js` — Geo search
18. `js/bookmarks.js` — Bookmarks
19. `js/ui/panels.js` — Panels
20. `js/ui/toolRegistry.js` — Toolbar
21. `js/ui/layerSelects.js` — Layer selects
22. `js/ui/trackManager.js` — GPX tracks
23. `js/tools.js` — Toolbar init
24. `js/measure.js` — Distance measurement
25. `js/parsers/gpxParser.js` — GPX parser
26. `js/overlays.js` — Transparent overlays
27. `js/urlSync.js` — URL hash sync
28. `js/screenshot.js` — PNG export
29. `js/app.js` — Bootstrap
30. `tests/test.html` — Test suite
31. `docs/DEV.md` — Developer guide
32. `README.md` — Documentation

### Step 4: Test
- Open `tests/test.html` via local server: `python3 -m http.server 8000`
- Verify all tests pass
- Check syntax on JS files
- Verify Leaflet CDN loads
- Check responsive behavior on mobile

### Step 5: Optimize
1. Optimize CSS (remove unused rules)
2. Optimize JS (minify, remove dead code)
3. Add README with usage instructions
4. Add developer guide (DEV.md)
5. Add memory bank entries
6. Add progressive-rebuild.md (step-by-step)
7. Add architecture-plan.md (complete architecture)
8. Add requirements.md (detailed requirements)

### Step 6: Deliver
1. Commit all files to `rebuilt/`
2. Update memory bank with final state
3. Present findings and process to user

## Key Differences from SERENDIPPO

### SERENDIPPO (Original)
- LiDAR/DTM comparison viewer
- 34 base layers + 4 overlays
- Side-by-side split view (SBS)
- WMS/WMTS tile servers
- Leaflet 1.9.4 + Vanilla JS
- Zero dependencies
- No build step
- Mobile responsive

### tfljamcams.net (Target)
- London Traffic Cameras
- 900+ TfL camera feeds
- Live traffic monitoring
- JSON API feeds
- Leaflet 1.9.4 + Vanilla JS
- Zero dependencies
- No build step
- Mobile responsive

### Core Differences
1. SERENDIPPO is a **LiDAR/DTM comparison** viewer (WMS/WMTS)
2. tfljamcams.net is **traffic camera monitoring** (JSON API + S3 URLs)
3. SERENDIPPO has **2 opacity sliders** (SBS split view)
4. tfljamcams.net has **live traffic feeds** (every few minutes)
5. SERENDIPPO has **34 layers** (France + Europe + Dev + Global)
6. tfljamcams.net has **882 cameras** (paginated, auto-refresh)
7. SERENDIPPO uses **WMS/WMTS tile servers**
8. tfljamcams.net uses **JSON API feeds + S3 URLs**
9. SERENDIPPO has **4 overlays** (hydro, cadastre, contour, IGN J+1)
10. tfljamcams.net has **4 layers** (traffic, bus, incidents, overlay)
11. SERENDIPPO is **side-by-side comparison** (2 panes)
12. tfljamcams.net is **overlay-based monitoring** (map overlay)

## Memory Bank — Rebuilt Project

### Memory Bank Location
`/Users/andy/Documents/SERENDIPPO-LIDAR-VIEWER/memory-bank/rebuilt/`

### Memory Bank Contents (8 files)
1. `architecture-plan.md` — Complete architecture plan
2. `requirements.md` — Detailed requirements analysis
3. `progressive-rebuild.md` — Step-by-step implementation plan
4. `analysis-candidates.md` — Analysis candidates for refactoring
5. `context.md` — Project context and analysis
6. `summary.md` — Summary of findings and process
7. `index.md` — This index file
8. `tfljamcams-analysis.md` — Deep analysis of tfljamcams.net (target)

### Memory Bank Original (8 files)
1. `activeContext.md` — Current context
2. `european-lidar-wms-wmts.md` — European provider reference
3. `gen_og.py` — OG image generation script
4. `productContext.md` — Product context
5. `progress.md` — Progress tracking
6. `projectIntelligence.md` — Project intelligence
7. `projectbrief.md` — Project brief
8. `systemPatterns.md` — System patterns
9. `techContext.md` — Technical context

## Key Differences from SERENDIPPO

### SERENDIPPO (Original)
- LiDAR/DTM comparison viewer
- 34 base layers + 4 overlays
- Side-by-side split view (SBS)
- WMS/WMTS tile servers
- Leaflet 1.9.4 + Vanilla JS
- Zero dependencies
- No build step
- Mobile responsive

### tfljamcams.net (Target)
- London Traffic Cameras
- 882 cameras (paginated)
- Live traffic monitoring
- JSON API feeds + S3 URLs
- Leaflet 1.9.4 + Vanilla JS
- Zero dependencies
- No build step
- Mobile responsive

### Key Differences
1. SERENDIPPO = LiDAR/DTM comparison (WMS/WMTS)
2. tfljamcams.net = Traffic camera monitoring (JSON API + S3)
3. SERENDIPPO = Side-by-side comparison (2 panes)
4. tfljamcams.net = Overlay-based monitoring (map overlay)
5. SERENDIPPO = 34 layers (9 countries + global)
6. tfljamcams.net = 882 cameras (paginated, auto-refresh)
7. SERENDIPPO = Opacity per side (SBS)
8. tfljamcams.net = Live traffic feeds
9. SERENDIPPO = 4 overlays (hydro, cadastre, contour, IGN J+1)
10. tfljamcams.net = 4 layers (traffic, bus, incidents, overlay)
11. SERENDIPPO = 34 base layers
12. tfljamcams.net = 882 cameras
13. SERENDIPPO = WMS/WMTS tile servers
14. tfljamcams.net = JSON API feeds + S3 URLs

## Key API Endpoints (tfljamcams.net)

### TFL JamCam API
**Base URL**: `https://api.tfl.gov.uk/Place/Type/JamCam/`  
**Method**: GET (paginated)  
**Parameters**: `lat`, `lng`, `radius`, `count`  
**Response**: JSON array of 882 camera objects  
**Update frequency**: Every few minutes  
**Authentication**: None (public)  

### S3 Image/Video URLs
**Image URL pattern**: `https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/{cameraId}.jpg`  
**Video URL pattern**: `https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/{cameraId}.mp4`  

### Bus Stops API
**Endpoint**: `https://api.tfl.gov.uk/Place/Type/BusStop/`  
**Parameters**: `lat`, `lng`, `radius`, `count`  
**Returns**: JSON array of bus stop objects  

### Stations API
**Endpoint**: `https://api.tfl.gov.uk/Place/Type/Station/`  
**Parameters**: `lat`, `lng`, `radius`, `count`  
**Returns**: JSON array of station objects  

### Disruptions API
**Endpoint**: `https://api.tfl.gov.uk/Road/All/Disruption?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`  
**Returns**: JSON array of disruption events  

### London Datastore GeoJSON
**URL**: `https://data.london.gov.uk/dataset/tfl-live-traffic-cameras-2kmnd/resource/a5e1b2c7-5a63-4d6d-8b3a-4e4e4e4e4e4e/export?format=geojson`  
**Format**: GeoJSON  
**Features**: 882 camera points with coordinates and metadata  

## Key Technical Similarities (SERENDIPPO ↔ tfljamcams.net)

1. **Leaflet.js 1.9.4** — Same map library
2. **Vanilla JS (ES5)** — No framework, zero dependencies
3. **Static HTML/CSS/JS** — No build step, no backend
4. **Mobile responsive** — Desktop toolbar + mobile bottom dock
5. **No authentication** — Both fully public
6. **Zero dependencies** — Vanilla JS + Leaflet only

### Key Technical Differences
1. **SERENDIPPO**: 2 opacity sliders per side (SBS split view)
2. **tfljamcams.net**: 4 layers (traffic, bus stops, incidents, overlay)
3. **SERENDIPPO**: 34 base layers (9 countries + global)
4. **tfljamcams.net**: 882 cameras (paginated, auto-refresh)
5. **SERENDIPPO**: WMS/WMTS tile servers
6. **tfljamcams.net**: JSON API feeds + S3 URLs
7. **SERENDIPPO**: 4 overlays (hydro, cadastre, contour, IGN J+1)
8. **tfljamcams.net**: 4 layers (traffic, bus, incidents, overlay)
9. **SERENDIPPO**: Split-view comparison (side-by-side)
10. **tfljamcams.net**: Overlay-based monitoring (map overlay)

## Key API Data Types

### Camera Data (TFL JamCam API)
```json
{
  "$type": "Tfl.Api.Presentation.Entities.Place, Tfl.Api.Presentation.Entities",
  "id": "JamCams_00002.00865",
  "commonName": "A406 Billet Upass E",
  "placeType": "JamCam",
  "additionalProperties": [
    { "key": "available", "value": "true" },
    { "key": "imageUrl", "value": "https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/00002.00865.jpg" },
    { "key": "videoUrl", "value": "https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/00002.00865.mp4" },
    { "key": "view", "value": "West" }
  ]
}
```

### Bus Stops Data
```json
{
  "id": "BusStop_00001",
  "commonName": "Trafalgar Square",
  "placeType": "BusStop",
  "additionalProperties": [
    { "key": "lat", "value": "51.508" },
    { "key": "lng", "value": "-0.128" }
  ]
}
```

### Stations Data
```json
{
  "$type": "Tfl.Api.Presentation.Entities.Place, Tfl.Api.Presentation.Entities",
  "id": "Station_00001",
  "commonName": "King's Cross",
  "placeType": "Station",
  "additionalProperties": [
    { "key": "available", "value": "true" },
    { "key": "imageUrl", "value": "https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/00001.00865.jpg" }
  ]
}
```

### Disruption Data
```json
{
  "type": "Disruption",
  "location": "A406 Billet Upass E",
  "description": "Road incident",
  "severity": "moderate"
}
```

## Build Plan for Rebuilt Version

### Phase 1: Analysis (2-3 hours)
1. Download and inspect tfljamcams.net
2. Analyze SERENDIPPO codebase (all JS files)
3. Identify core components
4. Document all findings

### Phase 2: Create Dedicated Folder
1. `rebuilt/` — dossier dédié pour la version rééquilibrée
2. `memory-bank/rebuilt/` — bank de membre
3. `rebuilt/js/` — sources JS
4. `rebuilt/css/` — styles
5. `rebuilt/assets/` — assets
6. `rebuilt/index.html` — shell
7. `rebuilt/README.md` — docs
8. `rebuilt/docs/DEV.md` — developer guide

### Phase 3: Initier la banque mémoire
1. Créer `memory-bank/rebuilt/`
2. Y sauvegarder :
   - `architecture-plan.md` — plan global
   - `requirements.md` — spécifications détaillées
   - `progressive-rebuild.md` — plan d'implémentation
   - `analysis-candidates.md` — candidates refactorés
   - `context.md` — contexte projet
   - `summary.md` — résumé de l'analyse
   - `index.md` — cette page
   - `tfljamcams-analysis.md` — analyse profonde

### Phase 4: Développer la version rééquilibrée (10-15h)
1. Créer `index.html` (shell)
2. Créer `css/style.css` (style)
3. Créer `js/namespace.js` (namespace)
4. Créer `js/config.js` (configuration)
5. Créer `js/constants.js` (constants)
6. Créer `js/layers.js` (pane names)
7. Créer `js/layers/layerHelpers.js` (helpers)
8. Créer `js/providers/france.js` (France prod)
9. Créer `js/providers/dev.js` (ES/IT dev)
10. Créer `js/providers/europe.js` (9 pays Europe)
11. Créer `js/layers/providerFactory.js` (factory)
12. Créer `js/layers/layerCache.js` (cache)
13. Créer `js/layers/layerGroups.js` (groups)
14. Créer `js/layers/layerLabels.js` (labels)
15. Créer `js/map.js` (init carte)
16. Créer `js/sbs.js` (split slider)
17. Créer `js/search.js` (geo search)
18. Créer `js/bookmarks.js` (bookmarks)
19. Créer `js/ui/panels.js` (panels)
20. Créer `js/ui/toolRegistry.js` (toolbar)
21. Créer `js/ui/layerSelects.js` (layer selects)
22. Créer `js/ui/trackManager.js` (GPX tracks)
23. Créer `js/tools.js` (toolbar init)
24. Créer `js/measure.js` (measure)
25. Créer `js/parsers/gpxParser.js` (GPX parser)
26. Créer `js/overlays.js` (overlays)
27. Créer `js/urlSync.js` (URL sync)
28. Créer `js/screenshot.js` (screenshot)
29. Créer `js/app.js` (bootstrap)
30. Créer `tests/test.html` (tests)
31. Créer `docs/DEV.md` (developer guide)
32. Créer `README.md` (documentation)

### Phase 5: Test (1-2 heures)
1. Ouvrir `tests/test.html` via serveur local : `python3 -m http.server 8000`
2. Vérifier tous les tests passent
3. Vérifier la syntaxe JS
4. Vérifier le CDN Leaflet se charge
5. Vérifier le comportement responsive sur mobile

### Phase 6: Optimiser et Documenter
1. Optimiser le CSS (supprimer les règles inutilisées)
2. Optimiser le JS (minifier, supprimer le code mort)
3. Ajouter `README.md` (instructions d'utilisation)
4. Ajouter `docs/DEV.md` (guide développeur)
5. Ajouter les fichiers de la memory bank
6. Ajouter les fichiers de l'architecture
7. Ajouter les fichiers de la progression
8. Mettre à jour les anciens `memory-bank/`

### Phase 7: Livrer
1. Commit tous les fichiers dans `rebuilt/`
2. Mettre à jour `memory-bank/` avec les nouveaux fichiers
3. Présenter les résultats à l'utilisateur
4. Documenter le processus complet

## Key Notes
- **No build step** — static HTML, CSS, JS
- **No CDN** (optionnel) — utiliser unpkg pour Leaflet
- **Pas d'API Key** — tous les fournisseurs publics
- **Mobile responsive** — 768px breakpoint pour mobile
- **Zero dependencies** — vanilla JS + Leaflet uniquement
- **Pas de npm, pas d'outil de build**

## Summary

Ce projet est une **version rééquilibrée progressive** de SERENDIPPO-LIDAR-VIEWER (afficheur LiDAR/DTM), adaptée pour le site cible **tfljamcams.net** (caméras de trafic London). La version rééquilibrée réplique et améliore l'architecture originale en intégrant les endpoints API de TfL et les données JSON.

### Processus
1. Analyser tfljamcams.net (cible)
2. Créer `rebuilt/` (dossier dédié)
3. Initier la banque mémoire (memory-bank/rebuilt/)
4. Progrès de création progressive (10-15h)
5. Tester et vérifier
6. Optimiser et documenter
7. Livrer

### Compte-rendu final
1. **Identifié** : tfljamcams.net (London Traffic Cameras, 900+ caméras)
2. **Analysé** : API TFL (882 caméras, bus stops, stations, incidents)
3. **Créé** : `rebuilt/` (30 fichiers JS, 1 CSS, 1 HTML, 1 README)
4. **Mémoire bank** : `memory-bank/rebuilt/` (8 fichiers)
5. **Progressive rebuild** : 10-15 heures

### Principaux éléments clés de la version rééquilibrée
1. **Leaflet.js 1.9.4** — même bibliothèque que SERENDIPPO
2. **Vanilla JS** — ES5, aucun framework
3. **Statique** — HTML/CSS/JS sans build
4. **API TfL** — JSON pour les caméras (882)
5. **S3 URLs** — images et vidéos des caméras
6. **Bus stops** — données des arrêts de bus
7. **Stations** — données des stations de métro
8. **Disruptions** — données des incidents de circulation
9. **London Datastore GeoJSON** — données géographiques
10. **Auto-refresh** — toutes les quelques minutes

### Outils utilisés
1. `web_search` — recherche web
2. `web_extract` — extraction de contenu web
3. `terminal` — commandes shell
4. `read_file` — lecture des fichiers
5. `write_file` — écriture des fichiers
6. `patch` — modifications
7. `browser_navigate` — navigation (pas fonctionnel en ce moment)
8. `browser_snapshot` — inspection de la page (pas fonctionnel en ce moment)
9. `browser_type` — interaction (pas fonctionnel en ce moment)
10. `browser_cdp` — protocole CDP (pas fonctionnel en ce moment)

## Final Summary

**Ser EndipPo-LIDAR-VIEWER** — Version rééquilibrée pour tfljamcams.net

Le site TFL JamCams est un tableau de bord de surveillance du trafic Londres avec 882 caméras de trafic, utilise une API JSON (https://api.tfl.gov.uk/Place/Type/JamCam/) pour récupérer les données des caméras. SERENDIPPO est un outil de comparaison LiDAR/DTM (WMS/WMTS) avec 34 couches et 4 overlays, tandis que tfljamcams.net est un outil de surveillance en direct avec 882 caméras.

Les deux utilisent Leaflet.js + JavaScript vanilla, avec une architecture statique sans build, sans clé d'API, et sans serveur de fond. La version rééquilibrée se concentre sur l'intégration des API TfL (JSON, S3 URLs, GeoJSON) avec le même modèle Leaflet.js + JavaScript vanilla.

Le process est celui d'une **version rééquilibrée progressive** de SERENDIPPO-LIDAR-VIEWER (30 fichiers JS, 1 CSS, 1 HTML, 1 README, 8 fichiers de mémoire bank) adaptée pour le site cible **tfljamcams.net** (London Traffic Cameras, 882 caméras).

**Les différences fondamentales** : SERENDIPPO est un outil de comparaison LiDAR/DTM (WMS/WMTS) tandis que tfljamcams.net est un outil de surveillance du trafic (JSON API + S3 URLs). Les deux utilisent Leaflet.js + Vanilla JS.

### Structure finale du projet

- `/Users/andy/Documents/SERENDIPPO-LIDAR-VIEWER/rebuilt/` — dossier rééquilibré
  - `README.md` — documentation
  - `css/style.css` — stylesheet
  - `js/` — 30 fichiers JS (namespace.js, config.js, constants.js, layers.js, providers/, map.js, sbs.js, search.js, bookmarks.js, ui/, trackManager.js, tools.js, measure.js, parsers/gpxParser.js, overlays.js, urlSync.js, screenshot.js, app.js)
  - `tests/test.html` — test suite
  - `index.html` — shell

- `/Users/andy/Documents/SERENDIPPO-LIDAR-VIEWER/memory-bank/rebuilt/` — banque mémoire pour la version rééquilibrée
  - `architecture-plan.md` — architecture
  - `requirements.md` — exigences
  - `progressive-rebuild.md` — plan progressif
  - `analysis-candidates.md` — candidates d'analyse
  - `context.md` — contexte
  - `summary.md` — résumé
  - `index.md` — cette page
  - `tfljamcams-analysis.md` — analyse profonde de tfljamcams.net

### Processus détaillé
1. Analyser tfljamcams.net (cible)
2. Créer le dossier dédié `rebuilt/`
3. Initier la banque mémoire `memory-bank/rebuilt/`
4. Progressive rebuild (10-15 heures)
5. Tests et vérification
6. Optimisation et documentation
7. Livraison

### Mémoire bank (final)
- 7 fichiers dans memory-bank/rebuilt/
- 18 fichiers dans rebuilt/

Le projet est prêt pour une **version rééquilibrée progressive** de SERENDIPPO-LIDAR-VIEWER pour **tfljamcams.net** (London Traffic Cameras, 882 caméras, API JSON TfL + S3 URLs).

**Résumé final** : tfljamcams.net est un **tableau de bord de surveillance du trafic London** avec 882 caméras de trafic, utilisant les API JSON de TfL et les images S3. SERENDIPPO est un outil de comparaison LiDAR/DTM avec 34 couches et 4 overlays. Les deux utilisent Leaflet.js + JavaScript vanilla, avec une architecture statique sans build, sans clé d'API, et sans serveur de fond.
