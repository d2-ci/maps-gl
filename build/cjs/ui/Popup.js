"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _maplibreGl = require("maplibre-gl");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
const defaultOptions = {
  maxWidth: 'auto',
  className: 'dhis2-map-popup',
  closeOnClick: false // Enabled with restriction below
};

class Popup extends _maplibreGl.Popup {
  constructor(options) {
    super(_objectSpread(_objectSpread({}, defaultOptions), options));
    // Avoid closing a popup that was just opened
    _defineProperty(this, "onMapClick", evt => {
      if (!this._mapInstance.getEventFeature(evt)) {
        this.remove();
      }
    });
  }
  addTo(map) {
    const mapgl = map.getMapGL();
    super.addTo(mapgl);
    if (!this._mapInstance) {
      mapgl.on('click', this.onMapClick);
      this._mapInstance = map;
    }
  }

  // Remove onClose event if it exists
  clear() {
    if (this._onCloseFunc) {
      this.off('close', this._onCloseFunc);
      this._onCloseFunc = null;
    }
    return this;
  }
  onClose(onClose) {
    if (typeof onClose === 'function') {
      this._onCloseFunc = onClose;
      this.on('close', onClose);
    }
    return this;
  }
}
var _default = Popup;
exports.default = _default;