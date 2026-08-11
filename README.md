# OpenLondon

Live London mobility viewer on one map: **traffic cameras, incidents/traffic and transport** (Tube, National Rail, DLR, Overground, Elizabeth line, Tram, Bus) with Great-Britain LiDAR relief.

**100% client-side · no build · no account · no API key**

➡ **Live:** https://andyqwartz.github.io/openlondon/

---

## Features

- **Cameras** — ~882 live TfL traffic cameras, clustered by zoom, image & video lazy-loaded on demand
- **Traffic & incidents** — ~106 disruptions, color-coded by severity
- **Transport** — all London networks via `StopPoint/Mode`, one call per network, cached 24 h
- **Map** — OSM, satellite (Esri), CARTO dark & light, **LiDAR relief** (Environment Agency)
- **Search** — TfL stations + OSM Nominatim (London-bounded), direct coordinates
- **Saved places** — persistent bookmarks (localStorage), notes, rename
- **Share & export** — full state in the URL, PNG capture

## Data (public TfL Open Data, no key)

| Resource | Endpoint |
|---|---|
| Cameras | `GET /Place/Type/JamCam` |
| Incidents | `GET /Road/All/Disruption` |
| Transport | `GET /StopPoint/Mode/{mode}` |
| Search | `GET /StopPoint/Search?query=` |
| Relief | Environment Agency LiDAR DTM WMS |

## Run locally

```bash
python3 -m http.server 8123   # then open http://localhost:8123
```

An HTTP server is required (the app `fetch`es the TfL API).

## Stack

Leaflet + vanilla JS, no build step, dark UI, static — deploys straight to GitHub Pages (`.nojekyll` at root).

---

Map data © OpenStreetMap / Esri · Relief © Environment Agency (OGL v3.0) · Mobility data © Transport for London (Open Data).

Built on the SERENDIPPO viewer ecosystem. © SERENDIPPO · Andy
