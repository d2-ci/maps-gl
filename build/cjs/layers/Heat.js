"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
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
      intensity,
      color,
      radius,
      opacity
    }), {
      isInteractive
    });
  }
}
var _default = exports.default = Heat;