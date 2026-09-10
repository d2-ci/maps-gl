"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadRTLTextPlugin = void 0;
var _maplibreGl = require("maplibre-gl");
// Official Mapbox/MapLibre plugin for Arabic shaping and right-to-left reordering.
const DEFAULT_RTL_TEXT_PLUGIN_URL = 'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js';
let requested = false;
const loadRTLTextPlugin = (url = DEFAULT_RTL_TEXT_PLUGIN_URL) => {
  if (requested) {
    return;
  }
  requested = true;
  try {
    (0, _maplibreGl.setRTLTextPlugin)(url, true);
  } catch (error) {
    console.error('Failed to set RTL text plugin', error);
  }
};
exports.loadRTLTextPlugin = loadRTLTextPlugin;