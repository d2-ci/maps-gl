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

  // MapLibre hides RTL labels if the plugin can't load, so check the file first
  const controller = new AbortController();
  fetch(RTL_TEXT_PLUGIN_URL, {
    signal: controller.signal
  }).then(response => {
    controller.abort();
    const type = response.headers.get('content-type');
    if (!response.ok || !/javascript/.test(type)) {
      throw new Error(`Got ${response.status} ${type}`);
    }
    return (0, _maplibreGl.setRTLTextPlugin)(RTL_TEXT_PLUGIN_URL, true);
  }).catch(logError);
};
exports.loadRTLTextPlugin = loadRTLTextPlugin;