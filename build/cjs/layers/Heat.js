"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Layer = _interopRequireDefault(require("./Layer"));
var _layers = require("../utils/layers");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Heat extends _Layer.default {
  constructor(options) {
    super(options);
    this.createSource();
    this.createLayers();
  }
  createLayers() {
    const id = this.getId();
    const isInteractive = false;
    this.addLayer((0, _layers.heatLayer)({
      id
    }), {
      isInteractive
    });
  }
}
var _default = exports.default = Heat;