function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import Layer from './Layer';
import getEarthEngineWorker from '../earthengine';
import { defaultOptions, getWorkerOptions } from '../utils/earthengine';
import { isPoint, featureCollection } from '../utils/geometry';
import { getBufferGeometry } from '../utils/buffers';
import { polygonLayer, outlineLayer, pointLayer } from '../utils/layers';
import { setPrecision } from '../utils/numbers';
import { setTemplate } from '../utils/core';
class EarthEngine extends Layer {
  constructor(_options) {
    super(_objectSpread(_objectSpread({}, defaultOptions), _options));
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
        content = setTemplate(options.nullPopup, options);
      } else {
        content = setTemplate(options.popup, _objectSpread(_objectSpread({}, options), {}, {
          value: typeof value === 'number' ? setPrecision(value) : value
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
      this._workerPromise = new Promise((resolve, reject) => getEarthEngineWorker(this.options.getAuthToken).then(EarthEngineWorker => {
        new EarthEngineWorker(getWorkerOptions(this.options)).then(resolve);
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
        data: featureCollection(this.getFilteredFeatures())
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
      this.addLayer(polygonLayer({
        id,
        source,
        opacity: 0.9
      }), {
        isInteractive
      });
      this.addLayer(outlineLayer({
        id,
        source
      }));
      this.addLayer(pointLayer({
        id,
        source: `${id}-points`,
        radius: 2,
        color: '#333'
      }));
    }
  }
  setFeatures(data = []) {
    // Set layer source for org unit point (facilities)
    this.setSource(`${this.getId()}-points`, {
      type: 'geojson',
      data: featureCollection(data.filter(isPoint))
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
      geometry: getBufferGeometry(feature, buffer / 1000)
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
      source.setData(featureCollection(this.getFilteredFeatures()));
    }
  }
}
export default EarthEngine;