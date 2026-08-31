function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Popup as PopupGL } from 'maplibre-gl';
const defaultOptions = {
  maxWidth: 'auto',
  className: 'dhis2-map-popup',
  closeOnClick: false // Enabled with restriction below
};
class Popup extends PopupGL {
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
export default Popup;