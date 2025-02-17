"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _maplibreGl = require("maplibre-gl");
var _Attribution = _interopRequireDefault(require("./Attribution"));
var _FitBounds = _interopRequireDefault(require("./FitBounds"));
var _Fullscreen = _interopRequireDefault(require("./Fullscreen"));
var _Measure = _interopRequireDefault(require("./Measure"));
var _Navigation = _interopRequireDefault(require("./Navigation"));
var _Search = _interopRequireDefault(require("./Search"));
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