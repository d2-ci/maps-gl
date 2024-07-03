"use strict";

var _comlink = require("comlink");
var _ee_api_js_worker = _interopRequireDefault(require("./ee_api_js_worker"));
var _ee_worker_utils = require("./ee_worker_utils");
var _buffers = require("../utils/buffers");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } // https://github.com/google/earthengine-api/pull/173
// import { ee } from '@google/earthengine/build/ee_api_js_debug' // Run "yarn add @google/earthengine"
// Why we need to "hack" the '@google/earthengine bundle:
// https://groups.google.com/g/google-earth-engine-developers/c/nvlbqxrnzDk/m/QuyWxGt9AQAJ

const FEATURE_STYLE = {
  color: 'FFA500',
  strokeWidth: 2
};
const DEFAULT_TILE_SCALE = 1;
class EarthEngineWorker {
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.options = options;
  }

  // Set EE API auth token if needed and run ee.initialize

  //Reset all the class data so that a different
  //set of options can be used
  setOptions(options) {
    this.options = options;
    this.eeFeatureCollection = null;
    this.eeImage = null;
    this.eeImageBands = null;
    this.eeScale = null;
    return this;
  }

  // Translate org unit features to an EE feature collection
  getFeatureCollection() {
    const {
      data,
      buffer
    } = this.options;
    if (Array.isArray(data) && !this.eeFeatureCollection) {
      this.eeFeatureCollection = _ee_api_js_worker.default.FeatureCollection(data.map(feature => _objectSpread(_objectSpread({}, feature), {}, {
        id: feature.properties.id,
        // EE requires id to be string, MapLibre integer
        // Translate points to buffer polygons
        geometry: buffer && feature.geometry.type === 'Point' ? (0, _buffers.getBufferGeometry)(feature, buffer / 1000) : feature.geometry
      })));
    }
    return this.eeFeatureCollection;
  }

  // Returns a single image that can styled as raster tiles
  getImage() {
    if (this.eeImage) {
      return this.eeImage;
    }
    const {
      datasetId,
      filter,
      mosaic,
      band,
      bandReducer,
      mask,
      methods
    } = this.options;
    let eeImage;
    if (!filter) {
      // Single image
      eeImage = _ee_api_js_worker.default.Image(datasetId);
      this.eeScale = (0, _ee_worker_utils.getScale)(eeImage);
    } else {
      // Image collection
      let collection = _ee_api_js_worker.default.ImageCollection(datasetId);

      // Scale is lost when creating a mosaic below
      this.eeScale = (0, _ee_worker_utils.getScale)(collection.first());

      // Apply array of filters (e.g. period)
      filter.forEach(f => {
        collection = collection.filter(_ee_api_js_worker.default.Filter[f.type].apply(this, f.arguments));
      });
      eeImage = mosaic ? collection.mosaic() // Composite all images inn a collection (e.g. per country)
      : _ee_api_js_worker.default.Image(collection.first()); // There should only be one image after applying the filters
    }

    // // Select band (e.g. age group)
    if (band) {
      eeImage = eeImage.select(band);
      if (Array.isArray(band) && bandReducer) {
        // Keep image bands for aggregations
        this.eeImageBands = eeImage;

        // Combine multiple bands (e.g. age groups)
        eeImage = eeImage.reduce(_ee_api_js_worker.default.Reducer[bandReducer]());
      }
    }

    // Mask out 0-values
    if (mask) {
      eeImage = eeImage.updateMask(eeImage.gt(0));
    }

    // Run methods on image
    if (methods) {
      Object.keys(methods).forEach(method => {
        if (eeImage[method]) {
          eeImage = eeImage[method].apply(eeImage, methods[method]);
        }
      });
    }
    this.eeImage = eeImage;
    return eeImage;
  }

  // Returns raster tile url for a classified image
  getTileUrl() {
    const {
      format,
      data
    } = this.options;
    return new Promise(resolve => {
      if (format === 'FeatureCollection') {
        const {
          datasetId
        } = this.options;
        let dataset = _ee_api_js_worker.default.FeatureCollection(datasetId).draw(FEATURE_STYLE);
        if (data) {
          dataset = dataset.clipToCollection(this.getFeatureCollection());
        }
        dataset.getMap(null, response => resolve(response.urlFormat));
      } else {
        let {
          eeImage,
          params
        } = (0, _ee_worker_utils.getClassifiedImage)(this.getImage(), this.options);
        if (data) {
          eeImage = eeImage.clipToCollection(this.getFeatureCollection());
        }
        eeImage.visualize(params).getMap(null, response => resolve(response.urlFormat));
      }
    });
  }

  // Returns the data value  at a position
  async getValue(lnglat) {
    const {
      lng,
      lat
    } = lnglat;
    const eeImage = await this.getImage();
    const point = _ee_api_js_worker.default.Geometry.Point(lng, lat);
    const reducer = _ee_api_js_worker.default.Reducer.mean();
    return (0, _ee_worker_utils.getInfo)(eeImage.reduceRegion(reducer, point, 1));
  }

  // Returns available periods for an image collection
  getPeriods(eeId) {
    const imageCollection = _ee_api_js_worker.default.ImageCollection(eeId).distinct('system:time_start').sort('system:time_start', false);
    const featureCollection = _ee_api_js_worker.default.FeatureCollection(imageCollection).select(['system:time_start', 'system:time_end'], null, false);
    return (0, _ee_worker_utils.getInfo)(featureCollection);
  }

  // Returns aggregated values for org unit features
  async getAggregations(config) {
    if (config) {
      this.setOptions(config);
    }
    const {
      format,
      aggregationType,
      band,
      legend,
      tileScale = DEFAULT_TILE_SCALE
    } = this.options;
    const singleAggregation = !Array.isArray(aggregationType);
    const useHistogram = singleAggregation && (0, _ee_worker_utils.hasClasses)(aggregationType) && legend;
    const image = await this.getImage();
    const scale = this.eeScale;
    const collection = this.getFeatureCollection(); // TODO: Throw error if no feature collection

    if (collection) {
      if (format === 'FeatureCollection') {
        const {
          datasetId
        } = this.options;
        const dataset = _ee_api_js_worker.default.FeatureCollection(datasetId);
        const aggFeatures = collection.map(feature => {
          feature = _ee_api_js_worker.default.Feature(feature);
          const count = dataset.filterBounds(feature.geometry()).size();
          return feature.set('count', count);
        }).select(['count'], null, false);
        return (0, _ee_worker_utils.getInfo)(aggFeatures).then(_ee_worker_utils.getFeatureCollectionProperties);
      } else if (useHistogram) {
        // Used for landcover
        const reducer = _ee_api_js_worker.default.Reducer.frequencyHistogram();
        const scaleValue = await (0, _ee_worker_utils.getInfo)(scale);
        return (0, _ee_worker_utils.getInfo)(image.reduceRegions({
          collection,
          reducer,
          scale,
          tileScale
        }).select(['histogram'], null, false)).then(data => (0, _ee_worker_utils.getHistogramStatistics)({
          data,
          scale: scaleValue,
          aggregationType,
          legend
        }));
      } else if (!singleAggregation && aggregationType.length) {
        const reducer = (0, _ee_worker_utils.combineReducers)(_ee_api_js_worker.default)(aggregationType);
        const props = [...aggregationType];
        let aggFeatures = image.reduceRegions({
          collection,
          reducer,
          scale,
          tileScale
        });
        if (this.eeImageBands) {
          aggFeatures = this.eeImageBands.reduceRegions({
            collection: aggFeatures,
            reducer,
            scale,
            tileScale
          });
          band.forEach(band => aggregationType.forEach(type => props.push(aggregationType.length === 1 ? band : `${band}_${type}`)));
        }
        aggFeatures = aggFeatures.select(props, null, false);
        return (0, _ee_worker_utils.getInfo)(aggFeatures).then(_ee_worker_utils.getFeatureCollectionProperties);
      } else throw new Error('Aggregation type is not valid');
    } else throw new Error('Missing org unit features');
  }
}

// Service Worker not supported in Safari
_defineProperty(EarthEngineWorker, "setAuthToken", getAuthToken => new Promise((resolve, reject) => {
  if (_ee_api_js_worker.default.data.getAuthToken()) {
    // Already authenticated
    _ee_api_js_worker.default.initialize(null, null, resolve, reject);
  } else {
    getAuthToken().then(token => {
      const {
        client_id,
        tokenType = 'Bearer',
        access_token,
        expires_in
      } = token;
      const extraScopes = null;
      const updateAuthLibrary = false;
      _ee_api_js_worker.default.data.setAuthToken(client_id, tokenType, access_token, expires_in, extraScopes, () => _ee_api_js_worker.default.initialize(null, null, resolve, reject), updateAuthLibrary);
      _ee_api_js_worker.default.data.setAuthTokenRefresher(async (authArgs, callback) => callback(_objectSpread(_objectSpread({}, await getAuthToken()), {}, {
        state: authArgs.scope
      })));
    }).catch(reject);
  }
}));
if (typeof onconnect !== 'undefined') {
  onconnect = evt => (0, _comlink.expose)(EarthEngineWorker, evt.ports[0]);
} else {
  (0, _comlink.expose)(EarthEngineWorker);
}