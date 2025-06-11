"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Layer = _interopRequireDefault(require("./Layer"));
var _layers = require("../utils/layers");
var _labels = require("../utils/labels");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Choropleth extends _Layer.default {
  constructor(options) {
    super(options);
    this.createSource();
    this.createLayers();
  }
  createLayers() {
    const id = this.getId();
    const {
      color,
      opacity,
      label,
      labelStyle
    } = this.options;
    const isInteractive = true;
    this.addLayer((0, _layers.polygonLayer)({
      id,
      color,
      opacity
    }), {
      isInteractive
    });
    this.addLayer((0, _layers.outlineLayer)({
      id,
      opacity
    }));
    this.addLayer((0, _layers.pointLayer)({
      id,
      color,
      opacity
    }), {
      isInteractive
    });
    if (label) {
      this.addLayer((0, _labels.labelLayer)(_objectSpread(_objectSpread({
        id,
        label
      }, labelStyle), {}, {
        opacity
      })));
    }
  }
}
var _default = exports.default = Choropleth;