"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setLayersRadius = exports.setLayersOpacity = exports.setLayersIntensity = exports.makeHeatmapRadius = exports.makeHeatmapIntensity = void 0;
const setLayersOpacity = (mapgl, id, heatOpacity) => {
  mapgl.getStyle().layers.filter(layer => layer.id.startsWith(id)).forEach(layer => {
    mapgl.setPaintProperty(layer.id, 'heatmap-opacity', heatOpacity);
  });
};
exports.setLayersOpacity = setLayersOpacity;
const makeHeatmapIntensity = function () {
  let i = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.5;
  return Math.pow(i, 2) * 2;
};
exports.makeHeatmapIntensity = makeHeatmapIntensity;
const setLayersIntensity = (mapgl, id, heatIntensity) => {
  mapgl.getStyle().layers.filter(layer => layer.id.startsWith(id)).forEach(layer => {
    mapgl.setPaintProperty(layer.id, 'heatmap-intensity', heatIntensity);
  });
};
exports.setLayersIntensity = setLayersIntensity;
const makeHeatmapRadius = function () {
  let r = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.5;
  return ['interpolate', ['linear'], ['zoom'], 7, 50 * r, 20, 1000 * r];
};
exports.makeHeatmapRadius = makeHeatmapRadius;
const setLayersRadius = (mapgl, id, heatRadius) => {
  mapgl.getStyle().layers.filter(layer => layer.id.startsWith(id)).forEach(layer => {
    mapgl.setPaintProperty(layer.id, 'heatmap-radius', heatRadius);
  });
};
exports.setLayersRadius = setLayersRadius;