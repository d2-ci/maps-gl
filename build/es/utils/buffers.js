function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import polygonBuffer from '@turf/buffer';
import circle from '@turf/circle';
import { colorExpr } from './expressions';
import { featureCollection } from './geometry';
const defaults = {
  color: '#95c8fb',
  width: 1
};

// Buffer in km
export const getBufferGeometry = ({
  geometry
}, buffer) => (geometry.type === 'Point' ? circle(geometry, buffer) : polygonBuffer(geometry, buffer)).geometry;

// Buffer in km
export const bufferSource = (features, buffer) => ({
  type: 'geojson',
  data: featureCollection(features.map(feature => _objectSpread(_objectSpread({}, feature), {}, {
    geometry: getBufferGeometry(feature, buffer)
  })))
});

// Layer with buffer features
export const bufferLayer = ({
  id,
  color
}) => ({
  id: `${id}-buffer`,
  type: 'fill',
  source: `${id}-buffer`,
  paint: {
    'fill-color': colorExpr(color || defaults.color)
  }
});

// Buffer outline
export const bufferOutlineLayer = ({
  id,
  color,
  width
}) => ({
  id: `${id}-buffer-outline`,
  type: 'line',
  source: `${id}-buffer`,
  paint: {
    'line-color': colorExpr(color || defaults.color),
    'line-width': width || defaults.width
  }
});