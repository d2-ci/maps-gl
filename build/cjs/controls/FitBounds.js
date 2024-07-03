"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("./FitBounds.css");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
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