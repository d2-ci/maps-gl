"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _bbox = _interopRequireDefault(require("@turf/bbox"));
var _maplibreGl = require("maplibre-gl");
var _uuid = require("uuid");
var _buffers = require("../utils/buffers.js");
var _core = require("../utils/core.js");
var _geometry = require("../utils/geometry.js");
var _highlightOverlay = require("../utils/highlightOverlay.js");
var _images = require("../utils/images.js");
var _labels = require("../utils/labels.js");
var _opacity = require("../utils/opacity.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const buildVisibleIdsFilter = (ids, baseFilter) => {
  if (!ids) {
    return baseFilter ?? null;
  }
  const idsFilter = ['in', ['get', 'id'], ['literal', ids]];
  return baseFilter ? ['all', baseFilter, idsFilter] : idsFilter;
};
class Layer extends _maplibreGl.Evented {
  constructor(options = {}) {
    super();
    // "Normalise" event before passing back to app
    _defineProperty(this, "onClick", evt => this.fire('click', evt));
    this._id = (0, _uuid.v4)();
    this._source = {};
    this._layers = [];
    this._features = [];
    this._isVisible = true;
    this._interactiveIds = [];
    this._visibleIdsFilterExemptIds = new Set();
    this._overlayLayerIds = [];
    this._hoverIds = [];
    this._selectedIds = [];
    this._highlightColor = undefined;
    this._featuresIndexSource = null;
    this._featuresById = null;
    this.options = options;
    if (options.data) {
      this.setFeatures(options.data);
    }
  }
  async addTo(map) {
    const {
      opacity,
      onClick,
      onRightClick,
      onMouseEnter,
      onMouseLeave
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
        await (0, _images.addImages)(mapgl, images);
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
    if (map.styleIsLoaded()) {
      this._overlayLayerIds = (0, _highlightOverlay.createHighlightOverlay)(map, {
        id: this.getId(),
        glLayers: layers,
        beforeId
      });

      // Replays a highlight/selection recorded before the overlay existed
      if (this._hoverIds.length || this._selectedIds.length) {
        this._syncOverlay();
      }
    }
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
    if (onMouseEnter) {
      this.on('mouseenter', onMouseEnter);
    }
    if (onMouseLeave) {
      this.on('mouseleave', onMouseLeave);
    }
    this.onAdd();
  }
  removeFrom(map) {
    const mapgl = map.getMapGL();
    const source = this.getSource();
    const layers = this.getLayers();
    const {
      onClick,
      onRightClick,
      onMouseEnter,
      onMouseLeave
    } = this.options;
    this.onRemove();
    if (mapgl) {
      (0, _opacity.clearLayerOpacityCache)(mapgl, this.getId());
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
      (0, _highlightOverlay.removeHighlightOverlay)(map, this.getId(), this._overlayLayerIds);
      this._overlayLayerIds = [];
    }
    if (onClick) {
      this.off('click', onClick);
    }
    if (onRightClick) {
      this.off('contextmenu', onRightClick);
    }
    if (onMouseEnter) {
      this.off('mouseenter', onMouseEnter);
    }
    if (onMouseLeave) {
      this.off('mouseleave', onMouseLeave);
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
      data: (0, _geometry.featureCollection)(features)
    });
    if (buffer) {
      this.setSource(`${id}-buffer`, (0, _buffers.bufferSource)(features, buffer / 1000));
    }
    if (label) {
      this.setSource(`${id}-label`, (0, _labels.labelSource)(features, labelStyle));
    }
  }
  setVisibility(isVisible) {
    if (this.isOnMap()) {
      const mapgl = this.getMapGL();
      const value = isVisible ? 'visible' : 'none';
      const layers = this.getLayers();
      if (mapgl && layers) {
        layers.forEach(layer => mapgl.setLayoutProperty(layer.id, 'visibility', value));

        // Hide the overlay's cloned layers too
        this._overlayLayerIds.forEach(layerId => mapgl.setLayoutProperty(layerId, 'visibility', value));
      }

      // isInteractive() depends on isVisible(), so a visibility change
      // outside addLayer/removeLayer must invalidate the cache too
      this.getMap()?.invalidateInteractiveLayerIds?.();
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
      opacityFactor,
      excludeFromVisibleIdsFilter
    } = layerOptions;
    this._layers.push(layer);
    if (isInteractive) {
      this._interactiveIds.push(layer.id);
    }
    if (opacityFactor) {
      this._opacityFactor = opacityFactor;
    }

    // e.g. EarthEngine's own mask layer, whose data is deliberately the
    // complement of setVisibleIds' own notion of "visible" - applying
    // that filter on top would zero it out, since none of its features
    // would ever match an allow-list of the *visible* ids.
    if (excludeFromVisibleIdsFilter) {
      this._visibleIdsFilterExemptIds.add(layer.id);
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

    // The highlight overlay must stay drawn above these base layers
    // Having just moved the base layers, move the overlay too
    this._overlayLayerIds.forEach(layerId => {
      mapgl.moveLayer(layerId, beforeId);
    });
  }
  getFeatures() {
    return this._features;
  }

  // Returns all features having a string or numeric id
  getFeaturesById(id) {
    if (this._featuresIndexSource !== this._features) {
      this._featuresIndexSource = this._features;
      this._featuresById = new Map();
      this._features.forEach(f => {
        this._featuresById.set(f.properties.id, f); // string uid
        this._featuresById.set(f.id, f); // numeric id (unique, required by Feature State)
      });
    }
    const feature = this._featuresById.get(id);
    return feature ? [_objectSpread(_objectSpread({}, feature), {}, {
      source: this.getId()
    })] : [];
  }

  // Adds integer id for each feature (required by Feature State)
  setFeatures(data = []) {
    // MapLibre properties must be primitives; objects/arrays are not supported
    const sanitizeProps = (props = {}) => Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined && typeof v !== 'function').map(([k, v]) => {
      if (v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        return [k, v];
      }
      try {
        return [k, JSON.stringify(v)];
      } catch {
        return [k, String(v)];
      }
    }));
    this._features = data.map((f, i) => _objectSpread(_objectSpread({}, f), {}, {
      id: i + 1,
      properties: sanitizeProps(f.properties)
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
      (0, _opacity.setLayersOpacity)(mapgl, this.getId(), opacity * opacityFactor);
    }
    this.options.opacity = opacity;
  }
  getBounds() {
    const features = this.getFeatures();
    if (features.length) {
      const [x1, y1, x2, y2] = (0, _bbox.default)((0, _geometry.featureCollection)(features));
      return [[x1, y1], [x2, y2]];
    }
  }
  isMaxZoom() {
    const mapgl = this.getMapGL();
    return mapgl.getZoom() >= mapgl.getMaxZoom();
  }

  // Hover and selection share one highlight color (last caller wins)

  highlight(ids, color) {
    const map = this.getMap();
    if (!map) {
      return;
    }
    this._hoverIds = (0, _core.normalizeIds)(ids);
    this._highlightColor = color;
    this._syncOverlay();
  }
  select(ids, color) {
    const map = this.getMap();
    if (!map) {
      return;
    }
    this._selectedIds = (0, _core.normalizeIds)(ids);
    this._highlightColor = color;
    this._syncOverlay();
  }

  // `ids` of null/undefined restores each layer's own filter unchanged
  setVisibleIds(ids) {
    const mapgl = this.getMapGL();
    if (!mapgl) {
      return;
    }
    this.getLayers().forEach(({
      id,
      filter: baseFilter
    }) => {
      if (this._visibleIdsFilterExemptIds.has(id)) {
        return;
      }
      mapgl.setFilter(id, buildVisibleIdsFilter(ids, baseFilter));
    });
    const dropped = (0, _core.dropHiddenIds)(this._hoverIds, this._selectedIds, ids);
    if (dropped) {
      this._hoverIds = dropped.hoverIds;
      this._selectedIds = dropped.selectedIds;
      this._syncOverlay();
    }
  }

  // Syncs the highlight overlay with the union of hovered/selected ids
  _syncOverlay() {
    const map = this.getMap();
    if (!map) {
      return;
    }
    const ids = [...new Set([...this._hoverIds, ...this._selectedIds])];
    const features = ids.flatMap(id => this.getFeaturesById(id));
    (0, _highlightOverlay.updateHighlightOverlay)(map, {
      id: this.getId(),
      features,
      color: this._highlightColor
    });
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
  onRightClick() {}
  onMouseMove(evt, feature) {
    const {
      label,
      hoverLabel
    } = this.options;
    if (hoverLabel || label) {
      const {
        properties
      } = feature;
      if (properties.cluster) {
        this._map.hideLabel();
        return;
      }
      const content = (hoverLabel || label).replace(/\{ *([\w_-]+) *\}/g, (str, key) => properties[key] ?? (key === 'value' ? this.locale('Label.NoData') : ''));
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
var _default = exports.default = Layer;