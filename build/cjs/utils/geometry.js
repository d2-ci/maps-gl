"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPoint = exports.getBoundsFromLayers = exports.featureCollection = void 0;
var _maplibreGl = require("maplibre-gl");
const isPoint = feature => feature.geometry.type === 'Point';
exports.isPoint = isPoint;
const getBoundsFromLayers = (layers = []) => {
  const bounds = layers.reduce((b, l) => {
    if (l.getBounds) {
      const layerBounds = l.getBounds();
      if (layerBounds) {
        return b.extend(layerBounds);
      }
    }
    return b;
  }, new _maplibreGl.LngLatBounds());
  return bounds.isEmpty() ? null : bounds.toArray();
};
exports.getBoundsFromLayers = getBoundsFromLayers;
const featureCollection = (features = []) => ({
  type: 'FeatureCollection',
  features
});
exports.featureCollection = featureCollection;