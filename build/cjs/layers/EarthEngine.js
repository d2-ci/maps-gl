"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Layer = _interopRequireDefault(require("./Layer"));
var _earthengine = _interopRequireDefault(require("../earthengine"));
var _earthengine2 = require("../utils/earthengine");
var _geometry = require("../utils/geometry");
var _buffers = require("../utils/buffers");
var _layers = require("../utils/layers");
var _numbers = require("../utils/numbers");
var _core = require("../utils/core");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class EarthEngine extends _Layer.default {
  constructor(_options) {
    super(_objectSpread(_objectSpread({}, _earthengine2.defaultOptions), _options));
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
        legend
      } = this.options;
      const data = await this.worker.getValue(lnglat);
      const value = data[band] || Object.values(data)[0];

      // Used for landcover
      const item = Array.isArray(legend) && legend.find(i => i.id === value);
      return item ? item.name : value;
    });
    // TODO: Move popup handling to the maps app
    _defineProperty(this, "showValue", latlng => this.getValue(latlng).then(value => {
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
          value: typeof value === 'number' ? (0, _numbers.setPrecision)(value) : value
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
      this._workerPromise = new Promise((resolve, reject) => (0, _earthengine.default)(this.options.getAuthToken).then(EarthEngineWorker => {
        new EarthEngineWorker((0, _earthengine2.getWorkerOptions)(this.options)).then(resolve);
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