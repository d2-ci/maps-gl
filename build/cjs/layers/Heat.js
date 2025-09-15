"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _heat = require("../utils/heat.js");
var _layers = require("../utils/layers.js");
var _Layer = _interopRequireDefault(require("./Layer.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Heat extends _Layer.default {
  constructor(options) {
    super(options);
    this.createSource();
    this.createLayers();
  }
  createLayers() {
    const id = this.getId();
    const {
      weight,
      intensity,
      color,
      radius,
      opacity
    } = this.options;
    const isInteractive = false;
    this.addLayer((0, _layers.heatLayer)({
      id,
      weight,
      intensity: (0, _heat.makeHeatmapIntensity)(intensity),
      color,
      radius: (0, _heat.makeHeatmapRadius)(radius),
      opacity
    }), {
      isInteractive
    });
  }
  setIntensity(intensity) {
    const mapgl = this.getMapGL();
    if (mapgl) {
      (0, _heat.setLayersIntensity)(mapgl, this.getId(), (0, _heat.makeHeatmapIntensity)(intensity));
    }
    this.options.intensity = (0, _heat.makeHeatmapIntensity)(intensity);
  }
  setRadius(radius) {
    const mapgl = this.getMapGL();
    if (mapgl) {
      (0, _heat.setLayersRadius)(mapgl, this.getId(), (0, _heat.makeHeatmapRadius)(radius));
    }
    this.options.radius = (0, _heat.makeHeatmapRadius)(radius);
  }
}
var _default = exports.default = Heat;