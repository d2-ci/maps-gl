"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _maplibreGl = require("maplibre-gl");
var _geometry = require("../utils/geometry");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class LayerGroup extends _maplibreGl.Evented {
  constructor(options) {
    super();
    _defineProperty(this, "onClick", evt => {
      const {
        feature
      } = evt;
      if (feature) {
        const {
          id
        } = feature.layer;
        const layer = this._layers.find(l => l.hasLayerId(id));
        if (layer) {
          layer.fire('click', evt);
        }
      }
    });
    _defineProperty(this, "onContextMenu", evt => {
      const {
        feature
      } = evt;
      if (feature) {
        const {
          id
        } = feature.layer;
        const layer = this._layers.find(l => l.hasLayerId(id));
        if (layer) {
          layer.fire('contextmenu', evt);
        }
      }
    });
    _defineProperty(this, "onMouseMove", (evt, feature) => {
      if (feature) {
        const {
          id
        } = feature.layer;
        const layer = this._layers.find(l => l.hasLayerId(id));
        if (layer) {
          layer.onMouseMove(evt, feature);
        }
      }
    });
    this.options = options || {};
    this._layers = [];
    this._layerConfigs = [];
    this._isVisible = true;
  }
  createLayer() {
    this._layerConfigs.forEach(config => this._layers.push(this._map.createLayer(config)));
    if (this.options.opacity) {
      this.setOpacity(this.options.opacity);
    }
  }
  addTo(map) {
    this._map = map;
    if (!this._layers.length) {
      this.createLayer();
    }
    this._layers.forEach(layer => layer.addTo(map));
    this.on('contextmenu', this.onContextMenu);
  }
  removeFrom(map) {
    this._layers.forEach(layer => layer.removeFrom(map));
    this.off('contextmenu', this.onContextMenu);
  }
  addLayer(config) {
    this._layerConfigs.push(config);
  }
  isOnMap() {
    return this._layers.some(layer => layer.isOnMap());
  }
  isInteractive() {
    return this._layers.some(layer => layer.isInteractive());
  }
  setIndex() {
    let index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    this.options.index = index;
    this._layers.forEach(layer => layer.setIndex(index));
  }
  getIndex() {
    return this.options.index || 0;
  }
  getBounds() {
    return (0, _geometry.getBoundsFromLayers)(this._layers);
  }
  getInteractiveIds() {
    return [].concat(...this._layers.map(layer => layer.getInteractiveIds()));
  }
  getFeaturesById(id) {
    return this._layers.map(layer => layer.getFeaturesById(id)).flat();
  }
  setOpacity(opacity) {
    this._layers.forEach(layer => layer.setOpacity(opacity));
  }
  setVisibility(isVisible) {
    this._layers.forEach(layer => layer.setVisibility(isVisible));
    this._isVisible = isVisible;
  }
  isVisible() {
    return this._isVisible;
  }
  move() {
    this._layers.forEach(layer => layer.move());
  }
  hasLayerId(id) {
    return this._layers.some(layer => layer.getLayers().some(layer => layer.id === id));
  }
}
var _default = exports.default = LayerGroup;