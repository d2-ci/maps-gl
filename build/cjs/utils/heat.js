"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setLayersRadius = exports.setLayersIntensity = void 0;
const setLayersIntensity = (mapgl, id, intensity) => {
  mapgl.getStyle().layers.filter(layer => layer.id.startsWith(id)).forEach(layer => {
    mapgl.setPaintProperty(layer.id, 'heatmap-intensity', intensity);
  });
};
exports.setLayersIntensity = setLayersIntensity;
const makeHeatmapRadius = r => ['interpolate', ['linear'], ['zoom'], 7, 50 * r, 20, 1000 * r];
const setLayersRadius = (mapgl, id, radius) => {
  mapgl.getStyle().layers.filter(layer => layer.id.startsWith(id)).forEach(layer => {
    mapgl.setPaintProperty(layer.id, 'heatmap-radius', makeHeatmapRadius(radius));
  });
};
exports.setLayersRadius = setLayersRadius;