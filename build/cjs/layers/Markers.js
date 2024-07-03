"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Layer = _interopRequireDefault(require("./Layer"));
var _layers = require("../utils/layers");
var _buffers = require("../utils/buffers");
var _labels = require("../utils/labels");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Markers extends _Layer.default {
  constructor(options) {
    super(options);
    this.setImages();
    this.createSource();
    this.createLayer();
  }
  createLayer() {
    const id = this.getId();
    const {
      buffer,
      bufferStyle,
      label,
      labelStyle
    } = this.options;
    const isInteractive = true;
    if (buffer) {
      this.addLayer((0, _buffers.bufferLayer)(_objectSpread({
        id
      }, bufferStyle)));
      this.addLayer((0, _buffers.bufferOutlineLayer)(_objectSpread({
        id
      }, bufferStyle)));
    }
    this.addLayer((0, _layers.symbolLayer)({
      id
    }), {
      isInteractive
    });
    if (label) {
      this.addLayer((0, _labels.labelLayer)(_objectSpread({
        id,
        label
      }, labelStyle)));
    }
  }
}
var _default = exports.default = Markers;