import type mapboxgl from 'mapbox-gl';

export function addSafetyLayer(map: mapboxgl.Map, geojsonData: GeoJSON.FeatureCollection) {
  if (map.getSource('safety-data')) {
    (map.getSource('safety-data') as mapboxgl.GeoJSONSource).setData(geojsonData);
    return;
  }

  map.addSource('safety-data', {
    type: 'geojson',
    data: geojsonData,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map.addLayer({
    id: 'safety-layer',
    type: 'circle',
    source: 'safety-data',
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        10, 4,
        15, 12,
      ],
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'safety_score'],
        0, '#ef4444',
        3, '#f97316',
        5, '#eab308',
        7, '#22c55e',
        10, '#10b981',
      ],
      'circle-opacity': 0.7,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1,
    },
  } as mapboxgl.CircleLayer);
}

export function removeSafetyLayer(map: mapboxgl.Map) {
  if (map.getLayer('safety-layer')) map.removeLayer('safety-layer');
  if (map.getSource('safety-data')) map.removeSource('safety-data');
}

export function addIsochroneLayer(map: mapboxgl.Map, geojsonData: GeoJSON.FeatureCollection) {
  if (map.getSource('isochrone-data')) {
    (map.getSource('isochrone-data') as mapboxgl.GeoJSONSource).setData(geojsonData);
    return;
  }

  map.addSource('isochrone-data', {
    type: 'geojson',
    data: geojsonData,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map.addLayer({
    id: 'isochrone-layer',
    type: 'fill',
    source: 'isochrone-data',
    paint: {
      'fill-color': [
        'match',
        ['get', 'contour'],
        5, '#3b82f6',
        10, '#8b5cf6',
        15, '#ec4899',
        '#6b7280',
      ],
      'fill-opacity': 0.3,
    },
  } as mapboxgl.FillLayer);
}

export function removeIsochroneLayer(map: mapboxgl.Map) {
  if (map.getLayer('isochrone-layer')) map.removeLayer('isochrone-layer');
  if (map.getSource('isochrone-data')) map.removeSource('isochrone-data');
}
