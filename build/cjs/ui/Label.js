"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _maplibreGl = require("maplibre-gl");
require("./Label.css");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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