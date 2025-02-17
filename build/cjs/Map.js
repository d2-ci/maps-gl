"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.MapGL = void 0;
var _maplibreGl = require("maplibre-gl");
require("maplibre-gl/dist/maplibre-gl.css");
var _controlsLocale = _interopRequireDefault(require("./controls/controlsLocale"));
var _controlTypes = _interopRequireDefault(require("./controls/controlTypes"));
var _MultiTouch = _interopRequireDefault(require("./controls/MultiTouch"));
var _Layer = _interopRequireDefault(require("./layers/Layer"));
var _layerTypes = _interopRequireDefault(require("./layers/layerTypes"));
var _Label = _interopRequireDefault(require("./ui/Label"));
var _Popup = _interopRequireDefault(require("./ui/Popup"));
var _core = require("./utils/core");
var _geometry = require("./utils/geometry");
var _images = require("./utils/images");
var _layers = require("./utils/layers");
var _style = require("./utils/style");
var _sync = _interopRequireDefault(require("./utils/sync"));
require("./Map.css");
const _excluded = ["locale", "glyphs"];
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], t.indexOf(o) >= 0 || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (e.indexOf(n) >= 0) continue; t[n] = r[n]; } return t; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const renderedClass = 'dhis2-map-rendered';
const RENDER_TIMEOUT_DURATION = 500;
class MapGL extends _maplibreGl.Evented {
  // Returns true if the layer type is supported
  static hasLayerSupport(type) {
    return !!_layerTypes.default[type];
  }

  // Returns true if the control type is supported
  static hasControlSupport(type) {
    return !!_controlTypes.default[type];
  }
  constructor(el) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    super();
    _defineProperty(this, "onLoad", () => {
      this.fire('ready', this);
    });
    _defineProperty(this, "onClick", evt => {
      const eventObj = this._createClickEvent(evt);
      const {
        feature
      } = eventObj;
      if (feature) {
        const layer = this.getLayerFromId(feature.layer.id);
        if (layer) {
          layer.onClick(eventObj);
        }
      }
      this.fire('click', eventObj);
    });
    _defineProperty(this, "onContextMenu", evt => {
      const eventObj = this._createClickEvent(evt);
      if (eventObj.feature) {
        const layer = this.getLayerFromId(eventObj.feature.layer.id);
        layer.fire('contextmenu', eventObj);
      } else {
        this.fire('contextmenu', eventObj);
      }
    });
    _defineProperty(this, "onMouseMove", evt => {
      const feature = this.getEventFeature(evt);
      let layer;
      if (feature) {
        layer = this.getLayerFromId(feature.layer.id);
        if (layer) {
          layer.onMouseMove(evt, feature);
        }
      } else {
        this.hideLabel();
      }
      this.setHoverState(layer && feature?.properties?.id ? layer.getFeaturesById(feature.properties.id) : null);
      this.getMapGL().getCanvas().style.cursor = feature ? 'pointer' : '';
    });
    // Remove rendered class if rendering is happening
    _defineProperty(this, "onRender", () => {
      this._removeClass(renderedClass);
      this._clearRenderTimeout();
    });
    // Add rendered class if map is idle
    _defineProperty(this, "onIdle", () => {
      if (this.getLayers().some(layer => layer._isLoading)) {
        return;
      }
      this._setRenderTimeout();
    });
    _defineProperty(this, "onMouseOut", () => this.hideLabel());
    _defineProperty(this, "onError", evt => {
      // TODO: Use optional chaining when DHIS2 Maps 2.35 is not supported
      if (evt && evt.error && evt.error.message && console && console.error) {
        const {
          message
        } = evt.error;
        console.error(message === 'Failed to fetch' ? 'Failed to fetch map data, are you offline?' : message);
      }
    });
    const {
        locale,
        glyphs
      } = options,
      opts = _objectWithoutProperties(options, _excluded);
    const mapgl = new _maplibreGl.Map(_objectSpread({
      container: el,
      style: (0, _style.mapStyle)({
        glyphs
      }),
      maxZoom: 18,
      preserveDrawingBuffer: true,
      // TODO: requred for map download, but reduced performance
      attributionControl: false,
      locale: _controlsLocale.default,
      transformRequest: _images.transformRequest
    }, opts));
    this._mapgl = mapgl;
    this._glyphs = glyphs;
    this._renderTimeout = null;

    // Translate strings
    if (locale) {
      Object.keys(mapgl._locale).forEach(id => {
        const str = mapgl._locale[id];
        if (locale[str]) {
          mapgl._locale[id] = locale[str];
        }
      });
    }
    mapgl.on('render', this.onRender);
    mapgl.on('idle', this.onIdle);
    mapgl.on('load', this.onLoad);
    mapgl.on('click', this.onClick);
    mapgl.on('contextmenu', this.onContextMenu);
    mapgl.on('mousemove', this.onMouseMove);
    mapgl.on('mouseout', this.onMouseOut);
    mapgl.on('error', this.onError);
    /* Data and dataloading events are an indication that
     * the map is not done yet */
    mapgl.on('data', this._clearRenderTimeout);
    mapgl.on('dataloading', this._clearRenderTimeout);
    this._layers = [];
    this._controls = {};
    if (options.attributionControl !== false) {
      this.addControl({
        type: 'attribution'
      });
    }
  }
  fitBounds(bounds, fitBoundsOptions) {
    if (bounds) {
      this._mapgl.fitBounds(bounds, fitBoundsOptions || {
        padding: 10,
        duration: 0
      });
    }
  }
  fitWorld() {
    this.fitBounds([[-180, -90], [180, 90]]);
  }
  setView(lnglat, zoom) {
    this._mapgl.setCenter(lnglat);
    this._mapgl.setZoom(zoom);
  }
  getContainer() {
    return this._mapgl.getContainer();
  }
  getMapGL() {
    return this._mapgl;
  }
  async addLayer(layer) {
    this._layers.push(layer);
    if (!layer.isOnMap()) {
      await layer.addTo(this);
      this.fire('layeradd', this._layers);

      // Layer is removed while being created
      if (!this.hasLayer(layer)) {
        this.removeLayer(layer);
      }
    }
    this.orderOverlays();
  }
  async removeLayer(layer) {
    this._layers = this._layers.filter(l => l !== layer);
    await layer.removeFrom(this);
    this.fire('layerremove', this._layers);
  }

  // Reorder overlays on the map
  orderOverlays() {
    const layers = this.getLayers();
    const beforeId = this.getBeforeLayerId();
    for (let i = _layers.OVERLAY_START_POSITION; i < layers.length; i++) {
      const layer = layers[i];
      if (layer.isOnMap()) {
        layer.move(beforeId);
      }
    }
    this.fire('layersort');
  }
  remove() {
    const mapgl = this._mapgl;
    mapgl.off('render', this.onRender);
    mapgl.off('idle', this.onIdle);
    mapgl.off('load', this.onLoad);
    mapgl.off('click', this.onClick);
    mapgl.off('contextmenu', this.onContextMenu);
    mapgl.off('mousemove', this.onMouseMove);
    mapgl.off('mouseout', this.onMouseOut);
    mapgl.off('error', this.onError);
    mapgl.off('data', this._clearRenderTimeout);
    mapgl.off('dataloading', this._clearRenderTimeout);
    mapgl.remove();
    this._mapgl = null;
  }
  hasLayer(layer) {
    return !!this._layers.find(l => l === layer);
  }
  addControl(config) {
    const {
      type
    } = config;
    if (_controlTypes.default[type]) {
      const control = new _controlTypes.default[type](config);
      if (control.addTo) {
        control.addTo(this);
      } else {
        this._mapgl.addControl(control);
      }
      this._controls[type] = control;
    }
  }
  removeControl(control) {
    this._mapgl.removeControl(control);
  }
  createLayer(config) {
    if (_layerTypes.default[config.type]) {
      return new _layerTypes.default[config.type](config);
    } else {
      console.log('Unknown layer type', config.type);
      return new _Layer.default();
    }
  }
  resize() {
    this._mapgl.resize();
  }

  // Synchronize this map with other maps with the same id
  sync(id) {
    _sync.default.add(id, this._mapgl);
  }

  // Remove synchronize of this map
  unsync(id) {
    _sync.default.remove(id, this._mapgl);
  }
  // Set hover state for features
  setHoverState(features) {
    // Only set hover state when features are changed
    if ((0, _core.getFeaturesString)(features) !== (0, _core.getFeaturesString)(this._hoverFeatures)) {
      if (this._hoverFeatures) {
        // Clear state for existing hover features
        this._hoverFeatures.forEach(feature => this.setFeatureState(feature, {
          hover: false
        }));
        this._hoverFeatures = null;
      }
      if (Array.isArray(features)) {
        this._hoverFeatures = features;
        features.forEach(feature => this.setFeatureState(feature, {
          hover: true
        }));
      }
    }
  }

  // Helper function to set feature state for source
  setFeatureState() {
    let feature = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const mapgl = this.getMapGL();
    const {
      source
    } = feature;
    if (source && mapgl.getSource(source)) {
      mapgl.setFeatureState(feature, state);
    }
  }
  // Returns the map zoom level
  getZoom() {
    return this.getMapGL().getZoom();
  }

  // TODO: throttle?
  getEventFeature(evt) {
    const layers = this.getLayers().filter(l => l.isInteractive()).map(l => l.getInteractiveIds()).reduce((out, ids) => [...out, ...ids], []);
    let feature;
    if (layers.length) {
      feature = this._mapgl.queryRenderedFeatures(evt.point, {
        layers: layers
      })[0]; // [0] returns topmost
    }
    return feature;
  }
  getLayerFromId(id) {
    return this._layers.find(layer => layer.hasLayerId(id));
  }
  getLayerAtIndex(index) {
    return this._layers[index];
  }
  getLayers() {
    this._layers.sort((a, b) => a.getIndex() - b.getIndex());
    return this._layers;
  }

  // Returns combined bounds for all vector layers
  getLayersBounds() {
    return (0, _geometry.getBoundsFromLayers)(this.getLayers());
  }

  // Returns the dom element of the control
  getControlContainer(type) {
    const control = this._controls[type];
    if (control) {
      return control._controlContainer || control._container;
    }
    return document.createElement('div'); // TODO
  }

  // Set before layer id for vector style basemap for labels on top
  setBeforeLayerId(beforeId) {
    this._beforeId = beforeId;
  }

  // Returns before layer id if exists among layers
  getBeforeLayerId() {
    return this._beforeId && this.getMapGL().getStyle().layers.find(layer => layer.id === this._beforeId) ? this._beforeId : undefined;
  }
  styleIsLoaded() {
    return !this._styleIsLoading;
  }
  openPopup(content, lnglat, onClose) {
    if (!this._popup) {
      this._popup = new _Popup.default();
    }

    // Remove previous attached onClose event before setting new content
    this._popup.clear();
    this._popup.setLngLat(lnglat).setDOMContent(content).addTo(this);

    // (Re)set onClose event
    this._popup.onClose(onClose);
  }
  closePopup() {
    if (this._popup) {
      this._popup.remove();
    }
  }
  showLabel(content, lnglat) {
    if (!this._label) {
      this._label = new _Label.default();
    }
    this._label.setText(content).setLngLat(lnglat);
    if (!this._label.isOpen()) {
      this._label.addTo(this._mapgl);
    }
  }
  hideLabel() {
    if (this._label) {
      this._label.remove();
    }
  }
  toggleScrollZoom(isEnabled) {
    this.getMapGL().scrollZoom[isEnabled ? 'enable' : 'disable']();
  }

  // Added to allow dashboards to be scrolled on touch devices
  // Map can be panned with two fingers instead of one
  toggleMultiTouch(isEnabled) {
    const mapgl = this.getMapGL();
    if (!this._multiTouch) {
      this._multiTouch = new _MultiTouch.default();
    }
    const hasControl = mapgl.hasControl(this._multiTouch);
    if (isEnabled && !hasControl) {
      mapgl.addControl(this._multiTouch);
    } else if (!isEnabled && hasControl) {
      mapgl.removeControl(this._multiTouch);
    }
  }

  // Only called within the API
  _updateAttributions() {
    if (this._controls.attribution) {
      this._controls.attribution._updateAttributions();
    }
  }
  _createClickEvent(evt) {
    const {
      lngLat
    } = evt;
    const type = 'click';
    const coordinates = [lngLat.lng, lngLat.lat];
    const {
      x,
      y
    } = this.getMapGL().project(lngLat);
    const position = [x, y];
    const feature = this.getEventFeature(evt);
    return {
      type,
      coordinates,
      position,
      feature
    };
  }
  _setRenderTimeout() {
    // Ensure pending timeout is cleared before setting a new one
    this._clearRenderTimeout();
    // Make sure the map stay rendered for at least 500ms
    this._renderTimeout = setTimeout(() => {
      this._addClass(renderedClass);
      this._renderTimeout = null;
    }, RENDER_TIMEOUT_DURATION);
  }
  _clearRenderTimeout() {
    if (this._renderTimeout) {
      clearTimeout(this._renderTimeout);
      this._renderTimeout = null;
    }
  }

  // Add class to map container
  _addClass(className) {
    if (this._mapgl) {
      const {
        classList
      } = this._mapgl._container;
      if (!classList.contains(className)) {
        classList.add(className);
      }
    }
  }

  // Remove class from map container
  _removeClass(className) {
    if (this._mapgl) {
      const {
        classList
      } = this._mapgl._container;
      if (classList.contains(className)) {
        classList.remove(className);
      }
    }
  }
}
exports.MapGL = MapGL;
var _default = exports.default = MapGL;