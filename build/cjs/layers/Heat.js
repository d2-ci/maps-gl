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
      heatWeight,
      heatIntensity,
      heatColor,
      heatRadius,
      opacity
    } = this.options;
    const isInteractive = false;
    const transformedIntensity = (0, _heat.makeHeatmapIntensity)(heatIntensity);
    const transformedRadius = (0, _heat.makeHeatmapRadius)(heatRadius);
    this.addLayer((0, _layers.heatLayer)({
      id,
      heatWeight,
      heatIntensity: transformedIntensity,
      heatColor,
      heatRadius: transformedRadius,
      opacity
    }), {
      isInteractive
    });
  }
  setOpacity(opacity) {
    const mapgl = this.getMapGL();
    if (mapgl) {
      (0, _heat.setLayersOpacity)(mapgl, this.getId(), opacity);
    }
    this.options.opacity = opacity;
  }
  setIntensity(heatIntensity) {
    const mapgl = this.getMapGL();
    const transformedIntensity = (0, _heat.makeHeatmapIntensity)(heatIntensity);
    if (mapgl) {
      (0, _heat.setLayersIntensity)(mapgl, this.getId(), transformedIntensity);
    }
    this.options.heatIntensity = transformedIntensity;
  }
  setRadius(heatRadius) {
    const mapgl = this.getMapGL();
    const transformedRadius = (0, _heat.makeHeatmapRadius)(heatRadius);
    if (mapgl) {
      (0, _heat.setLayersRadius)(mapgl, this.getId(), transformedRadius);
    }
    this.options.heatRadius = heatRadius;
  }
}
var _default = exports.default = Heat;