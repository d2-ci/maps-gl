function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { labelLayer } from '../utils/labels';
import Layer from './Layer';
class Boundary extends Layer {
  constructor(options) {
    super(options);
    this.createSource();
    this.createLayers();
  }

  // TODO: Find better way keep style
  setFeatures(data = []) {
    const {
      radius = 6
    } = this.options.style;
    this._features = data.map((f, i) => _objectSpread(_objectSpread({}, f), {}, {
      id: i + 1,
      properties: _objectSpread(_objectSpread({}, f.properties), {}, {
        color: f.properties.style.color,
        width: f.properties.style.weight,
        radius
      })
    }));
  }
  createLayers() {
    const id = this.getId();
    const {
      label,
      labelStyle
    } = this.options;
    const isInteractive = true;

    // Line layer
    this.addLayer({
      id: `${id}-line`,
      type: 'line',
      source: id,
      paint: {
        'line-color': ['get', 'color'],
        'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], ['+', ['get', 'width'], 2], ['get', 'width']]
      },
      filter: ['==', '$type', 'Polygon']
    }, {
      isInteractive
    });

    // Point layer
    this.addLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': 'transparent',
        'circle-radius': ['get', 'radius'],
        'circle-stroke-color': ['get', 'color'],
        'circle-stroke-width': ['case', ['boolean', ['feature-state', 'hover'], false], ['+', ['get', 'width'], 2], ['get', 'width']]
      },
      filter: ['==', '$type', 'Point']
    }, {
      isInteractive
    });
    if (label) {
      this.addLayer(labelLayer(_objectSpread({
        id,
        label
      }, labelStyle)));
    }
  }
}
export default Boundary;