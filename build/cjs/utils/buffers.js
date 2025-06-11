"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBufferGeometry = exports.bufferSource = exports.bufferOutlineLayer = exports.bufferLayer = void 0;
var _circle = _interopRequireDefault(require("@turf/circle"));
var _buffer = _interopRequireDefault(require("@turf/buffer"));
var _geometry = require("./geometry");
var _expressions = require("./expressions");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const defaults = {
  color: '#95c8fb',
  width: 1
};

// Buffer in km
const getBufferGeometry = (_ref, buffer) => {
  let {
    geometry
  } = _ref;
  return (geometry.type === 'Point' ? (0, _circle.default)(geometry, buffer) : (0, _buffer.default)(geometry, buffer)).geometry;
};

// Buffer in km
exports.getBufferGeometry = getBufferGeometry;
const bufferSource = (features, buffer) => ({
  type: 'geojson',
  data: (0, _geometry.featureCollection)(features.map(feature => _objectSpread(_objectSpread({}, feature), {}, {
    geometry: getBufferGeometry(feature, buffer)
  })))
});

// Layer with buffer features
exports.bufferSource = bufferSource;
const bufferLayer = _ref2 => {
  let {
    id,
    color
  } = _ref2;
  return {
    id: `${id}-buffer`,
    type: 'fill',
    source: `${id}-buffer`,
    paint: {
      'fill-color': (0, _expressions.colorExpr)(color || defaults.color)
    }
  };
};

// Buffer outline
exports.bufferLayer = bufferLayer;
const bufferOutlineLayer = _ref3 => {
  let {
    id,
    color,
    width
  } = _ref3;
  return {
    id: `${id}-buffer-outline`,
    type: 'line',
    source: `${id}-buffer`,
    paint: {
      'line-color': (0, _expressions.colorExpr)(color || defaults.color),
      'line-width': width || defaults.width
    }
  };
};
exports.bufferOutlineLayer = bufferOutlineLayer;