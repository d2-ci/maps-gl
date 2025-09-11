"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _maplibreGl = require("maplibre-gl");
var _Attribution = _interopRequireDefault(require("./Attribution.js"));
var _FitBounds = _interopRequireDefault(require("./FitBounds.js"));
var _Fullscreen = _interopRequireDefault(require("./Fullscreen.js"));
var _Measure = _interopRequireDefault(require("./Measure.js"));
var _Navigation = _interopRequireDefault(require("./Navigation.js"));
var _Search = _interopRequireDefault(require("./Search.js"));
require("./Controls.css");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var _default = exports.default = {
  zoom: _Navigation.default,
  attribution: _Attribution.default,
  scale: _maplibreGl.ScaleControl,
  fullscreen: _Fullscreen.default,
  search: _Search.default,
  measure: _Measure.default,
  fitBounds: _FitBounds.default
};