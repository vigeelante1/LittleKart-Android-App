// The map page shown inside a WebView (DECISIONS D-62): MapLibre GL JS with OpenFreeMap tiles, no key, no card.
// The page only reports where the map centre is; the pin, labels and buttons are drawn by the app on top.

import { colors } from '@/theme';

/** Pinned versions (old enough to be stable). */
export const MAPLIBRE = 'https://cdn.jsdelivr.net/npm/maplibre-gl@5.9.0/dist';
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export type MapMessage =
  | { type: 'ready' }
  | { type: 'movestart'; user: boolean }
  | { type: 'moveend'; lat: number; lng: number; user: boolean }
  | { type: 'error'; message: string };

export function mapHtml(lat: number, lng: number, zoom: number): string {
  return `<!doctype html>
<html><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="${MAPLIBRE}/maplibre-gl.css" />
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: ${colors.mapBg}; }
  .maplibregl-ctrl-attrib { font-size: 10px; }
</style>
</head><body>
<div id="map"></div>
<script src="${MAPLIBRE}/maplibre-gl.js"></script>
<script>
  (function () {
    function post(msg) { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg)); }
    if (!window.maplibregl) { post({ type: 'error', message: 'map-script' }); return; }
    var map = new maplibregl.Map({
      container: 'map',
      style: '${MAP_STYLE_URL}',
      center: [${lng}, ${lat}],
      zoom: ${zoom},
      attributionControl: { compact: true },
      pitchWithRotate: false,
      dragRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    map.on('load', function () { post({ type: 'ready' }); });
    map.on('error', function (e) { post({ type: 'error', message: String((e && e.error && e.error.message) || 'map') }); });
    map.on('movestart', function (e) { post({ type: 'movestart', user: !!e.originalEvent }); });
    map.on('moveend', function (e) {
      var c = map.getCenter();
      post({ type: 'moveend', lat: c.lat, lng: c.lng, user: !!e.originalEvent || !!e.fromClick });
    });
    // A tap moves the pin there, as a click does on the site's map.
    map.on('click', function (e) { map.easeTo({ center: e.lngLat }, { fromClick: true }); });
    window.__moveTo = function (lat, lng, zoom) {
      map.easeTo({ center: [lng, lat], zoom: zoom || map.getZoom(), duration: 600 });
    };
  })();
</script>
</body></html>`;
}
