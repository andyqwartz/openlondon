# OpenLondon · Caméras & trafic de Londres en temps réel

> Fork amélioré de **tfljamcams.net** — viewer de mobilité londonienne tout-en-un : caméras de trafic TfL, incidents/trafic, transport (Tube, rail, DLR, Overground, Elizabeth Line, Tram, Bus) et relief LiDAR de la Grande-Bretagne.

**100% client-side · sans build · sans compte · sans clé API · déployable sur GitHub Pages**

---

## ✨ Fonctionnalités

| Domaine | Détail |
|---|---|
| **Caméras TfL** | ~882 caméras de trafic temps réel. Clustering par zoom, image `.jpg` + vidéo `.mp4` chargées à la demande (lazy-load), orientation (`view`), statut disponibilité. |
| **Trafic / incidents** | ~106 disruptions (Road/All/Disruption) matérialisées par sévérité (Minor / Moderate / Severe / Closure), avec catégorie et commentaires. |
| **Transport** | Arrêts de tous les réseaux londoniens via `StopPoint/Mode` : **Tube, National Rail, DLR, Overground, Elizabeth Line, Tram, Bus**. Un appel par réseau, mis en cache. |
| **Carte** | Fonds : OSM, OSM France, Photo (Esri), Sombre (CARTO), Lumineux (CARTO), **Relief LiDAR GB** (Environment Agency WMS). |
| **Recherche** | Stations/lieux TfL (`StopPoint/Search`) + adresses/quartiers via Nominatim OSM (borné à Londres). Saisie de coordonnées directe. |
| **Lieux** | Bookmarks persistants (localStorage), notes, renommage. |
| **Partage** | État synchronisé dans l'URL (position, zoom, fond, données actives). |
| **Export** | Capture PNG de la carte (html2canvas). |
| **Géolocalisation** | Bouton position (browser locate). |

---

## 🗂 Structure

```
SERENDIPPO-LONDON/
├── index.html          # Shell de l'application
├── css/style.css       # Thème sombre (gabarit OpenLiDAR)
├── js/
│   ├── namespace.js    # Namespace OL + helpers + OL.Net (limiteur API anti-429)
│   ├── config.js       # Config globale (vue par défaut, bookmarks, refresh)
│   ├── constants.js    # Endpoints TfL, fonds, réseaux transport
│   ├── layers.js       # Registre + bascule des fonds de carte
│   ├── map.js          # Initialisation Leaflet
│   ├── cameras.js      # Caméras TfL (882, clusters, lazy-load, cache)
│   ├── traffic.js      # Disruptions / trafic
│   ├── transport.js    # Réseaux (StopPoint/Mode) — anti-429 strict
│   ├── search.js       # Recherche London (TfL + Nominatim)
│   ├── bookmarks.js    # Lieux mémorisés (localStorage)
│   ├── urlSync.js      # État partagé dans l'URL (hash)
│   ├── screenshot.js   # Export PNG
│   ├── tools.js        # Toolbar + toggles + panneaux
│   └── app.js          # Bootstrap
├── roadmap/            # PLAN-OPENLONDON.md (documentation projet)
└── README.md
```

> Note : `memory-bank/`, `research/`, `competitors/`, `sources/` contiennent les analyses privées du projet. Elles sont **exclues de git** (`.gitignore`) et restent locales.

---

## 🔌 Sources de données (API publiques TfL)

Tout fonctionne sans clé, via l'API ouverte `api.tfl.gov.uk` :

- **Caméras** : `GET /Place/Type/JamCam` → 882 objets
- **Médias** : `https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/{id}.jpg|.mp4`
- **Trafic** : `GET /Road/All/Disruption`
- **Transport** : `GET /StopPoint/Mode/{tube|national-rail|dlr|overground|elizabeth-line|tram|bus}`
- **Recherche TfL** : `GET /StopPoint/Search?query=`
- **Relief** : Environment Agency LiDAR DTM — `environment.data.gov.uk/spatialdata/lidar-composite-digital-terrain-model-dtm-1m/wms`

### ⚠️ Format des endpoints — leçon apprise
`Place/Type/BusStop` et `Place/Type/Station` sont **deprecated** (erreur TfL). Utiliser l'API **StopPoint**.
`StopPoint/Type/?lat/lon/radius` est **massivement rate-limité** (429 très rapide) → pour un viewer de ville, préférer **`StopPoint/Mode/{mode}`** : un seul appel par réseau, sans lat/lon, cacheable.

### ⚠️ CORS (faux positif fréquent)
Quand TfL rate-limite (429/503), la réponse arrive **sans** en-tête `Access-Control-Allow-Origin` → le navigateur affiche une erreur CORS trompeuse. Vérifier le statut réel (429 ≠ vraie erreur CORS). Sur le serveur sain, api.tfl.gov.uk renvoie bien `access-control-allow-origin: *`.

---

## 🚀 Lancer en local

```bash
cd /Users/andy/Documents/SERENDIPPO-LONDON
python3 -m http.server 8123
# puis ouvrir http://localhost:8123
```

Un vrai serveur HTTP est requis (pas d'ouverture directe du fichier) à cause du `fetch` cross-origin vers l'API.

---

## 🛠 Anti-429 (conception)

Pour ne jamais épuiser le quota TfL :
1. **`OL.Net`** (namespace.js) : file d'attente sérielle — un seul appel API à la fois, espacé de 4 s minimum.
2. **Cache localStorage** : chaque réseau transport est chargé une fois puis mis en cache 24 h.
3. **Aucun refetch automatique** au déplacement : le transport ne se charge qu'à l'activation (toggle).

---

## 📦 Déploiement (GitHub Pages)

Le projet est pensé pour être servi en statique sur GitHub Pages (zéro build) :
- S'assurer que `.nojekyll` est présent à la racine.
- Pousser sur le repo, activer Pages (branche `main`, dossier racine).
- L'HTTPS de Pages élimine aussi l'avertissement "insecure connection" sur les blobs.

---

## 🧠 Projet

- **Nom** : OpenLondon (fork autonome de tfljamcams.net, sans réutilisation de son code — le site original est derrière Cloudflare, les données viennent de l'API publique).
- **Contexte** : construit sur l'écosystème éprouvé SERENDIPPO-LIDAR-VIEWER (même gabarit UI, moteur Leaflet). Voir `roadmap/PLAN-OPENLONDON.md`.
- **Droits** : Données mobilité © Transport for London · Fond © OpenStreetMap · Relief © Environment Agency (OGL v3.0).
- **Auteur** : Andy / SERENDIPPO.

---

## 📁 Zone privée (non versionnée)

Les dossiers suivants restent **en local** (`.gitignore`) :
`memory-bank/` (brain du projet), `research/`, `competitors/`, `sources/`.