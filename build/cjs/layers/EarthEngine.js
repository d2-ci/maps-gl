"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _index = _interopRequireDefault(require("../earthengine/index.js"));
var _buffers = require("../utils/buffers.js");
var _core = require("../utils/core.js");
var _earthengine = require("../utils/earthengine.js");
var _geometry = require("../utils/geometry.js");
var _layers = require("../utils/layers.js");
var _numbers = require("../utils/numbers.js");
var _Layer = _interopRequireDefault(require("./Layer.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class EarthEngine extends _Layer.default {
  constructor(_options) {
    super(_objectSpread(_objectSpread({}, _earthengine.defaultOptions), _options));
    _defineProperty(this, "addTo", map => new Promise((resolve, reject) => {
      this._map = map;
      if (map.styleIsLoaded()) {
        this._isLoading = true;
        this.getWorkerInstance().then(async worker => {
          this.worker = worker;
          if (!this._tileUrl) {
            this._tileUrl = await worker.getTileUrl();
          }

          // Don't continue if layer is terminated (deleted or edited)
          if (!this._terminated) {
            this.createSource();
            this.createLayers();
            super.addTo(map);
            this.onLoad();
            this._isLoading = false;
            const {
              preload,
              data
            } = this.options;

            // Get aggregations if not plugin (preload=false) and org units
            // are passed (data not undefined)
            if (preload && data) {
              this.getAggregations();
            }
          }
          resolve();
        }).catch(error => {
          this._isLoading = false;
          reject(error);
        });
      } else {
        resolve();
      }
    }));
    // Returns value at at position
    _defineProperty(this, "getValue", async lnglat => {
      const {
        band,
        style
      } = this.options;
      const data = await this.worker.getValue(lnglat);
      const value = data[band] || Object.values(data)[0];

      // Used for landcover
      const item = Array.isArray(style) && style.find(i => i.value === value);
      return item ? item.name : value;
    });
    // TODO: Move popup handling to the maps app
    _defineProperty(this, "showValue", (latlng, precision) => this.getValue(latlng).then(value => {
      const {
        lng,
        lat
      } = latlng;
      const options = this.options;
      let content;
      if (value === null) {
        content = (0, _core.setTemplate)(options.nullPopup, options);
      } else {
        content = (0, _core.setTemplate)(options.popup, _objectSpread(_objectSpread({}, options), {}, {
          value: typeof value === 'number' ? (0, _numbers.setPrecision)(value, precision) : value
        }));
      }
      this._map.openPopup(document.createTextNode(content), [lng, lat]);
    }));
    // Returns a promise that resolves to aggregation values
    _defineProperty(this, "getAggregations", () => {
      if (!this._aggregationsPromise) {
        this._aggregationsPromise = this.worker.getAggregations();
      }
      return this._aggregationsPromise;
    });
  }
  removeFrom(map, isStyleChange) {
    this._terminated = !isStyleChange;
    super.removeFrom(map);
  }

  // Returns promise resolving a new worker instance
  getWorkerInstance() {
    if (!this._workerPromise) {
      this._workerPromise = new Promise((resolve, reject) => (0, _index.default)(this.options.getAuthToken).then(EarthEngineWorker => {
        new EarthEngineWorker((0, _earthengine.getWorkerOptions)(this.options)).then(resolve);
      }).catch(reject));
    }
    return this._workerPromise;
  }

  // Create layer source for raster tiles and org unit features
  createSource() {
    const id = this.getId();
    this.setSource(`${id}-raster`, {
      type: 'raster',
      tileSize: 256,
      tiles: [this._tileUrl]
    });
    if (this.options.data) {
      this.setSource(id, {
        type: 'geojson',
        data: (0, _geometry.featureCollection)(this.getFilteredFeatures())
      });
    }
  }

  // Create layers for raster tiles and org unit features
  createLayers() {
    const id = this.getId();
    const source = id;
    const isInteractive = true;
    this.addLayer({
      id: `${id}-raster`,
      type: 'raster',
      source: `${id}-raster`
    });
    if (this.options.data) {
      this.addLayer((0, _layers.polygonLayer)({
        id,
        source,
        opacity: 0.9
      }), {
        isInteractive
      });
      this.addLayer((0, _layers.outlineLayer)({
        id,
        source
      }));
      this.addLayer((0, _layers.pointLayer)({
        id,
        source: `${id}-points`,
        radius: 2,
        color: '#333'
      }));
    }
  }
  setFeatures() {
    let data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    // Set layer source for org unit point (facilities)
    this.setSource(`${this.getId()}-points`, {
      type: 'geojson',
      data: (0, _geometry.featureCollection)(data.filter(_geometry.isPoint))
    });

    // Create buffer around org unit points
    super.setFeatures(data.map(this.createBuffer.bind(this)));
  }

  // Transform point feature to buffer polygon
  createBuffer(feature) {
    const {
      buffer
    } = this.options;
    return buffer && feature.geometry.type === 'Point' ? _objectSpread(_objectSpread({}, feature), {}, {
      geometry: (0, _buffers.getBufferGeometry)(feature, buffer / 1000)
    }) : feature;
  }
  // Set the layer opacity
  setOpacity(opacity) {
    super.setOpacity(opacity);
    const id = this.getId();
    const layerId = `${id}-polygon`;
    const mapgl = this.getMapGL();
    if (mapgl && mapgl.getLayer(layerId)) {
      // Clickable polygon layer should always be transparent
      mapgl.setPaintProperty(layerId, 'fill-opacity', 0);
    }
  }

  // Returns filtered features based on string ids
  getFilteredFeatures() {
    const features = this.getFeatures();
    const ids = this._filteredFeatureIds;
    return Array.isArray(ids) ? features.filter(f => ids.includes(f.properties.id)) : features;
  }

  // Filter the org units features shown
  filter(ids) {
    this._filteredFeatureIds = ids;
    const source = this.getMapGL().getSource(this.getId());
    if (source) {
      source.setData((0, _geometry.featureCollection)(this.getFilteredFeatures()));
    }
  }
}
var _default = exports.default = EarthEngine;