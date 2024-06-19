"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBufferGeometry = exports.bufferSource = exports.bufferOutlineLayer = exports.bufferLayer = void 0;
var _circle = _interopRequireDefault(require("@turf/circle"));
var _buffer = _interopRequireDefault(require("@turf/buffer"));
var _geometry = require("./geometry");
var _expressions = require("./expressions");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
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