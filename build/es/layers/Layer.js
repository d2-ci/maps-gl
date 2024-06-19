function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import { v4 as uuid } from 'uuid';
import bbox from '@turf/bbox';
import { Evented } from 'maplibre-gl';
import { addImages } from '../utils/images';
import { featureCollection } from '../utils/geometry';
import { bufferSource } from '../utils/buffers';
import { labelSource } from '../utils/labels';
import { setLayersOpacity } from '../utils/opacity';
class Layer extends Evented {
  constructor(options = {}) {
    super();
    // "Normalise" event before passing back to app
    _defineProperty(this, "onClick", evt => this.fire('click', evt));
    this._id = uuid();
    this._source = {};
    this._layers = [];
    this._features = [];
    this._isVisible = true;
    this._interactiveIds = [];
    this.options = options;
    if (options.data) {
      this.setFeatures(options.data);
    }
  }
  async addTo(map) {
    const {
      opacity,
      onClick,
      onRightClick
    } = this.options;
    this._map = map;
    const mapgl = map.getMapGL();
    const images = this.getImages();
    const source = this.getSource();
    const layers = this.getLayers();
    const beforeId = map.getBeforeLayerId();
    this.locale = mapgl._getUIString.bind(mapgl);
    if (images) {
      try {
        await addImages(mapgl, images);
      } catch (error) {
        this.onError(error);
      }
    }
    Object.keys(source).forEach(id => {
      if (map.styleIsLoaded() && !mapgl.getSource(id)) {
        mapgl.addSource(id, source[id]);
      }
    });
    layers.forEach(layer => {
      if (map.styleIsLoaded() && !mapgl.getLayer(layer.id)) {
        mapgl.addLayer(layer, beforeId);
      }
    });
    if (!this.isVisible()) {
      this.setVisibility(false);
    }
    if (opacity !== undefined) {
      this.setOpacity(opacity);
    }
    if (onClick) {
      this.on('click', onClick);
    }
    if (onRightClick) {
      this.on('contextmenu', onRightClick);
    }
    this.onAdd();
  }
  removeFrom(map) {
    const mapgl = map.getMapGL();
    const source = this.getSource();
    const layers = this.getLayers();
    const {
      onClick,
      onRightClick
    } = this.options;
    this.onRemove();
    if (mapgl) {
      layers.forEach(layer => {
        if (mapgl.getLayer(layer.id)) {
          mapgl.removeLayer(layer.id);
        }
      });
      Object.keys(source).forEach(id => {
        if (mapgl.getSource(id)) {
          mapgl.removeSource(id);
        }
      });
    }
    if (onClick) {
      this.off('click', onClick);
    }
    if (onRightClick) {
      this.off('contextmenu', onRightClick);
    }
    this._map = null;
  }
  createSource() {
    const id = this.getId();
    const features = this.getFeatures();
    const {
      buffer,
      label,
      labelStyle
    } = this.options;
    this.setSource(id, {
      type: 'geojson',
      data: featureCollection(features)
    });
    if (buffer) {
      this.setSource(`${id}-buffer`, bufferSource(features, buffer / 1000));
    }
    if (label) {
      this.setSource(`${id}-label`, labelSource(features, labelStyle));
    }
  }
  setVisibility(isVisible) {
    if (this.isOnMap()) {
      const mapgl = this.getMapGL();
      const value = isVisible ? 'visible' : 'none';
      const layers = this.getLayers();
      if (mapgl && layers) {
        layers.forEach(layer => mapgl.setLayoutProperty(layer.id, 'visibility', value));
      }
    }
    this._isVisible = isVisible;
  }
  getId() {
    return this._id;
  }
  getMap() {
    return this._map;
  }
  getMapGL() {
    return this._map && this._map.getMapGL();
  }

  // Returns true if one of the layers are added to the map
  isOnMap() {
    const map = this.getMap();
    const mapgl = this.getMapGL();
    return Boolean(map && map.styleIsLoaded() && this._layers.find(l => mapgl.getLayer(l.id)));
  }
  isVisible() {
    return this._isVisible;
  }
  isInteractive() {
    return Boolean(this._interactiveIds.length && this.isOnMap() && this.isVisible());
  }
  setSource(id, source) {
    this._source[id] = source;
  }
  getSource() {
    return this._source;
  }
  getInteractiveIds() {
    return this.isInteractive() ? this._interactiveIds : [];
  }
  addLayer(layer, layerOptions = {}) {
    const {
      isInteractive,
      opacityFactor
    } = layerOptions;
    this._layers.push(layer);
    if (isInteractive) {
      this._interactiveIds.push(layer.id);
    }
    if (opacityFactor) {
      this._opacityFactor = opacityFactor;
    }
  }
  getLayers() {
    return this._layers;
  }
  hasLayerId(id) {
    return this.getLayers().some(layer => layer.id === id);
  }
  move() {
    const mapgl = this.getMapGL();
    const beforeId = this._map.getBeforeLayerId();
    this.getLayers().forEach(layer => {
      mapgl.moveLayer(layer.id, beforeId);
    });
  }
  getFeatures() {
    return this._features;
  }

  // Returns all features having a string or numeric id
  getFeaturesById(id) {
    const features = typeof id === 'string' ? this._features.filter(f => f.properties.id === id) : this._features.filter(f => f.id === id);
    return features.map(f => _objectSpread(_objectSpread({}, f), {}, {
      source: this.getId()
    }));
  }

  // Adds integer id for each feature (required by Feature State)
  setFeatures(data = []) {
    this._features = data.map((f, i) => _objectSpread(_objectSpread({}, f), {}, {
      id: i + 1
    }));
  }
  getImages() {
    return this._images;
  }
  getType() {
    return this.options.type;
  }
  setImages(images) {
    this._images = images || [...new Set(this.getFeatures().filter(f => f.properties.iconUrl).map(f => f.properties.iconUrl))];
  }
  setIndex(index = 0) {
    this.options.index = index;
    const map = this.getMap();
    if (map) {
      map.orderOverlays();
    }
  }
  getIndex() {
    return this.options.index || 0;
  }
  setOpacity(opacity) {
    const mapgl = this.getMapGL();
    const opacityFactor = this._opacityFactor !== undefined ? this._opacityFactor : 1;
    if (mapgl) {
      setLayersOpacity(mapgl, this.getId(), opacity * opacityFactor);
    }
    this.options.opacity = opacity;
  }
  getBounds() {
    const features = this.getFeatures();
    if (features.length) {
      const [x1, y1, x2, y2] = bbox(featureCollection(features));
      return [[x1, y1], [x2, y2]];
    }
  }
  isMaxZoom() {
    const mapgl = this.getMapGL();
    return mapgl.getZoom() === mapgl.getMaxZoom();
  }

  // Highlight a layer feature
  highlight(id) {
    const map = this.getMap();
    if (map) {
      map.setHoverState(id ? this.getFeaturesById(id) : null);
    }
  }

  // Override if needed in subclass
  filter() {}

  // Override if needed in subclass
  onAdd() {}

  // Override if needed in subclass
  onRemove() {}
  onLoad() {
    this.fire('load');
    if (this.options.onLoad) {
      this.options.onLoad();
    }
  }
  // "Normalise" event before passing back to app
  onRightClick(evt) {}
  onMouseMove(evt, feature) {
    const {
      label,
      hoverLabel
    } = this.options;
    if (hoverLabel || label) {
      const {
        properties
      } = feature;
      const content = (hoverLabel || label).replace(/\{ *([\w_-]+) *\}/g, (str, key) => properties[key] || (key === 'value' ? this.locale('HoverLabel.NoData') : ''));
      this._map.showLabel(content, evt.lngLat);
    } else {
      this._map.hideLabel();
    }
  }

  // Pass layer error to calling app if handler exists
  onError(error) {
    const {
      onError
    } = this.options;
    if (onError) {
      onError(error);
    } else {
      console.error(error);
    }
  }
}
export default Layer;