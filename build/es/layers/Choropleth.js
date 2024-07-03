function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import Layer from './Layer';
import { pointLayer, polygonLayer, outlineLayer } from '../utils/layers';
import { labelLayer } from '../utils/labels';
class Choropleth extends Layer {
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
    this.addLayer(polygonLayer({
      id,
      color,
      opacity
    }), {
      isInteractive
    });
    this.addLayer(outlineLayer({
      id,
      opacity
    }));
    this.addLayer(pointLayer({
      id,
      color,
      opacity
    }), {
      isInteractive
    });
    if (label) {
      this.addLayer(labelLayer(_objectSpread(_objectSpread({
        id,
        label
      }, labelStyle), {}, {
        opacity
      })));
    }
  }
}
export default Choropleth;