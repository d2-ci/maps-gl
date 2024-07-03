"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _maplibreGl = require("maplibre-gl");
require("./Label.css");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
const defaultOptions = {
  closeButton: false,
  closeOnClick: false,
  anchor: 'left',
  offset: [10, 0],
  className: 'dhis2-map-label'
};

// Extends MapLibre GL Popup to create a label used for hover/tooltip
// Extends https://github.com/mapbox/mapbox-gl-js/blob/master/src/ui/popup.js
class Label extends _maplibreGl.Popup {
  constructor(options) {
    super(_objectSpread(_objectSpread({}, defaultOptions), options));
  }

  // Position label to the left/right of the cursor
  _update(cursor) {
    const map = this._map;
    if (map) {
      const pos = this._trackPointer && cursor ? cursor : map.project(this._lngLat);
      const anchor = pos.x < map.getContainer().offsetWidth / 2 ? 'left' : 'right';
      this.options.anchor = anchor;
      this.options.offset[0] = anchor === 'left' ? 10 : -10;
    }
    super._update(cursor);
  }
}
var _default = exports.default = Label;