"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadRTLTextPlugin = void 0;
var _maplibreGl = require("maplibre-gl");
// Plugin for Arabic shaping and right-to-left reordering, copied on install
// from @mapbox/mapbox-gl-rtl-text (see scripts/prepare-vendor-files.js)
const RTL_TEXT_PLUGIN_URL = new URL('../vendor/mapbox-gl-rtl-text.js', import.meta.url).href;
let requested = false;
const logError = error => console.error('Failed to set RTL text plugin', error);
const loadRTLTextPlugin = () => {
  if (requested) {
    return;
  }
  requested = true;

  // Only catches setup errors: MapLibre loads the plugin when first needed
  try {
    (0, _maplibreGl.setRTLTextPlugin)(RTL_TEXT_PLUGIN_URL, true).catch(logError);
  } catch (error) {
    logError(error);
  }
};
exports.loadRTLTextPlugin = loadRTLTextPlugin;