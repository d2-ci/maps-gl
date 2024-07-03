"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("./FitBounds.css");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class FitBoundsControl {
  constructor(options) {
    _defineProperty(this, "onClick", () => {
      const bounds = this._map.getLayersBounds();
      if (bounds) {
        this._map.fitBounds(bounds);
      }
    });
    _defineProperty(this, "onLayerChange", () => {
      if (this._container) {
        this._container.style.display = this._map.getLayersBounds() ? 'block' : 'none';
      }
    });
    this.options = options;
  }
  getDefaultPosition() {
    return 'top-right';
  }
  addTo(map) {
    this._map = map;
    map.getMapGL().addControl(this);
    map.on('layeradd', this.onLayerChange);
    map.on('layerremove', this.onLayerChange);
  }
  onAdd() {
    const mapgl = this._map.getMapGL();
    const label = mapgl._getUIString('FitBoundsControl.ZoomToContent');
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    const button = document.createElement('div');
    button.className = 'dhis2-map-ctrl-fitbounds';
    button.type = 'button';
    button.title = label;
    button.setAttribute('aria-label', label);
    container.appendChild(button);
    container.addEventListener('click', this.onClick);
    this._container = container;
    return container;
  }
  onRemove() {
    this._map.on('layeradd', this.onLayerChange);
    this._map.on('layerremove', this.onLayerChange);
    this._container.removeEventListener('click', this.onClick);
    this._container.parentNode.removeChild(this._container);
    delete this._container;
    delete this._button;
    delete this._map;
    delete this._mapgl;
  }
}
var _default = exports.default = FitBoundsControl;