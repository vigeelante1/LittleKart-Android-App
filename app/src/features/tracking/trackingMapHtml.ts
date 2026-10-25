// The tracking page's map (DECISIONS D-70): MapLibre + OpenFreeMap like the address map, with the site's store
// and delivery pins and the store → address line shown until a delivery partner is assigned.
import { MAPLIBRE, MAP_STYLE_URL } from '@/features/address/mapHtml';
import { colors } from '@/theme';

interface Point {
  lat: number;
  lng: number;
}

/** The site's 44 × 56 teardrop pin with a white disc and an icon inside. */
function pinSvg(fill: string, inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56"><path d="M22 2C11.5 2 3 10.5 3 21c0 13.7 16.3 29.8 18.2 31.6a1.2 1.2 0 0 0 1.6 0C24.7 50.8 41 34.7 41 21 41 10.5 32.5 2 22 2Z" fill="${fill}" stroke="${colors.white}" stroke-width="2"/><circle cx="22" cy="21" r="12" fill="${colors.white}" opacity="0.95"/>${inner}</svg>`;
}

const STORE_PIN = pinSvg(
  colors.storePin,
  `<path d="M15.5 20.8 22 15l6.5 5.8v6.7h-3.4v-5h-6.2v5h-3.4z" fill="none" stroke="${colors.storePin}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`,
);
const DELIVERY_PIN = pinSvg(
  colors.deliveryPin,
  `<circle cx="22" cy="16.2" r="3.6" fill="${colors.deliveryPin}"/><path d="M14.5 27.8c1.8-4 4.7-6.2 7.5-6.2s5.7 2.2 7.5 6.2" fill="none" stroke="${colors.deliveryPin}" stroke-width="2.4" stroke-linecap="round"/>`,
);

export function trackingMapHtml(store: Point | null, delivery: Point): string {
  const data = JSON.stringify({ store, delivery, storePin: STORE_PIN, deliveryPin: DELIVERY_PIN });
  return `<!doctype html>
<html><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="${MAPLIBRE}/maplibre-gl.css" />
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: ${colors.mapSurface}; }
  .maplibregl-ctrl-attrib { font-size: 10px; }
  .pin { width: 44px; height: 56px; }
</style>
</head><body>
<div id="map"></div>
<script src="${MAPLIBRE}/maplibre-gl.js"></script>
<script>
  (function () {
    function post(msg) { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg)); }
    if (!window.maplibregl) { post({ type: 'error' }); return; }
    var d = ${data};
    var map = new maplibregl.Map({
      container: 'map',
      style: '${MAP_STYLE_URL}',
      center: [d.delivery.lng, d.delivery.lat],
      zoom: 15,
      attributionControl: { compact: true },
      pitchWithRotate: false,
      dragRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    function pin(svg) {
      var el = document.createElement('div');
      el.className = 'pin';
      el.innerHTML = svg;
      return el;
    }
    map.on('load', function () {
      if (d.store) {
        map.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString',
          coordinates: [[d.store.lng, d.store.lat], [d.delivery.lng, d.delivery.lat]] } } });
        map.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '${colors.routeLine}', 'line-opacity': 0.85, 'line-width': 5 } });
        new maplibregl.Marker({ element: pin(d.storePin), anchor: 'bottom' }).setLngLat([d.store.lng, d.store.lat]).addTo(map);
        var b = new maplibregl.LngLatBounds([d.store.lng, d.store.lat], [d.store.lng, d.store.lat]);
        b.extend([d.delivery.lng, d.delivery.lat]);
        map.fitBounds(b, { padding: 64, duration: 0, maxZoom: 16 });
      }
      new maplibregl.Marker({ element: pin(d.deliveryPin), anchor: 'bottom' }).setLngLat([d.delivery.lng, d.delivery.lat]).addTo(map);
      post({ type: 'ready' });
    });
    map.on('error', function () { post({ type: 'error' }); });
  })();
</script>
</body></html>`;
}
