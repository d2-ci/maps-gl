function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import { Evented } from 'maplibre-gl';
import { getBoundsFromLayers } from '../utils/geometry';
class LayerGroup extends Evented {
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
  setIndex(index = 0) {
    this.options.index = index;
    this._layers.forEach(layer => layer.setIndex(index));
  }
  getIndex() {
    return this.options.index || 0;
  }
  getBounds() {
    return getBoundsFromLayers(this._layers);
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
export default LayerGroup;