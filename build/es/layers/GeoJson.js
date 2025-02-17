function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { bufferLayer, bufferOutlineLayer } from '../utils/buffers';
import { labelLayer } from '../utils/labels';
import { pointLayer, lineLayer, polygonLayer, outlineLayer, symbolLayer } from '../utils/layers';
import Layer from './Layer';
class GeoJson extends Layer {
  constructor(options) {
    super(options);
    this.setImages();
    this.createSource();
    this.createLayers();
  }
  createLayers() {
    const id = this.getId();
    const {
      style = {},
      buffer,
      bufferStyle,
      label,
      labelStyle
    } = this.options;
    const {
      radius,
      color,
      strokeColor,
      weight: width,
      opacityFactor
    } = style;
    const isInteractive = true;
    if (buffer) {
      this.addLayer(bufferLayer(_objectSpread({
        id
      }, bufferStyle)));
      this.addLayer(bufferOutlineLayer(_objectSpread({
        id
      }, bufferStyle)));
    }
    this.addLayer(polygonLayer({
      id,
      color
    }), {
      isInteractive,
      opacityFactor
    });
    this.addLayer(outlineLayer({
      id,
      color: strokeColor,
      width
    }));
    this.addLayer(lineLayer({
      id,
      color: strokeColor || color,
      width
    }), {
      isInteractive
    });
    this.addLayer(pointLayer({
      id,
      color,
      strokeColor,
      width,
      radius
    }), {
      isInteractive
    });
    this.addLayer(symbolLayer({
      id
    }), {
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
export default GeoJson;