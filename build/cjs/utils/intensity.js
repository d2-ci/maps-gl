"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setLayersIntensity = void 0;
const setLayersIntensity = (mapgl, id, intensity) => {
  mapgl.getStyle().layers.filter(layer => layer.id.startsWith(id)).forEach(layer => {
    mapgl.setPaintProperty(layer.id, 'heatmap-intensity', intensity);
  });
};
exports.setLayersIntensity = setLayersIntensity;