"use strict";

var _comlink = require("comlink");
var _browser = _interopRequireDefault(require("@google/earthengine/build/browser.js"));
var _ee_worker_utils = require("./ee_worker_utils");
var _buffers = require("../utils/buffers");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } // this is a patched version of the ee module
const IMAGE = 'Image';
const IMAGE_COLLECTION = 'ImageCollection';
const FEATURE_COLLECTION = 'FeatureCollection';

// Options are defined here:
// https://developers.google.com/earth-engine/apidocs/ee-featurecollection-draw
const DEFAULT_FEATURE_STYLE = {
  color: '#FFA500',
  strokeWidth: 2,
  pointRadius: 5
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
      this.eeFeatureCollection = _browser.default.FeatureCollection(data.map(feature => _objectSpread(_objectSpread({}, feature), {}, {
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
      format,
      filter,
      periodReducer,
      mosaic,
      band,
      bandReducer,
      maskOperator,
      methods,
      style,
      cloudScore
    } = this.options;
    let eeImage;
    if (format === IMAGE) {
      // Single image
      eeImage = _browser.default.Image(datasetId);
      this.eeScale = (0, _ee_worker_utils.getScale)(eeImage);
    } else {
      // Image collection
      let collection = _browser.default.ImageCollection(datasetId);

      // Scale is lost when creating a mosaic below
      this.eeScale = (0, _ee_worker_utils.getScale)(collection.first());

      // Apply array of filters (e.g. period)
      collection = (0, _ee_worker_utils.applyFilter)(collection, filter);

      // Mask out clouds from satellite images
      if (cloudScore) {
        collection = (0, _ee_worker_utils.applyCloudMask)(collection, cloudScore);
      }
      if (periodReducer) {
        // Apply period reducer (e.g. going from daily to monthly)
        eeImage = collection[periodReducer]();
      } else if (mosaic) {
        // Composite all images inn a collection (e.g. per country)
        eeImage = collection.mosaic();
      } else {
        // There should only be one image after applying the filters
        eeImage = _browser.default.Image(collection.first());
      }
    }

    // Select band (e.g. age group)
    if (band) {
      eeImage = eeImage.select(band);
      if (Array.isArray(band) && bandReducer) {
        // Keep image bands for aggregations
        this.eeImageBands = eeImage;

        // Combine multiple bands (e.g. age groups)
        eeImage = eeImage.reduce(_browser.default.Reducer[bandReducer]());
      }
    }

    // Run methods on image
    eeImage = (0, _ee_worker_utils.applyMethods)(eeImage, methods);

    // Only keep pixels above min value
    if (maskOperator && eeImage[maskOperator]) {
      eeImage = eeImage.updateMask(eeImage[maskOperator](style?.min || 0));
    }
    this.eeImage = eeImage;
    return eeImage;
  }

  // Returns raster tile url for a classified image
  getTileUrl() {
    const {
      datasetId,
      format,
      data,
      filter,
      style
    } = this.options;
    return new Promise((resolve, reject) => {
      switch (format) {
        case FEATURE_COLLECTION:
          let dataset = _browser.default.FeatureCollection(datasetId);
          dataset = (0, _ee_worker_utils.applyFilter)(dataset, filter).draw(_objectSpread(_objectSpread({}, DEFAULT_FEATURE_STYLE), style));
          if (data) {
            dataset = dataset.clipToCollection(this.getFeatureCollection());
          }
          dataset.getMap(null, response => resolve(response.urlFormat));
          break;
        case IMAGE:
        case IMAGE_COLLECTION:
          let {
            eeImage,
            params
          } = (0, _ee_worker_utils.getClassifiedImage)(this.getImage(), this.options);
          if (data) {
            eeImage = eeImage.clipToCollection(this.getFeatureCollection());
          }
          eeImage.visualize(params).getMap(null, response => resolve(response.urlFormat));
          break;
        default:
          reject(new Error('Unknown format'));
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
    const point = _browser.default.Geometry.Point(lng, lat);
    const reducer = _browser.default.Reducer.mean();
    return (0, _ee_worker_utils.getInfo)(eeImage.reduceRegion(reducer, point, 1));
  }

  // Returns available periods for an image collection
  getPeriods(eeId) {
    const imageCollection = _browser.default.ImageCollection(eeId).distinct('system:time_start').sort('system:time_start', false);
    const featureCollection = _browser.default.FeatureCollection(imageCollection).select(['system:time_start', 'system:time_end', 'year'], null, false);
    return (0, _ee_worker_utils.getInfo)(featureCollection);
  }

  // Returns min and max timestamp for an image collection
  getTimeRange(eeId) {
    const collection = _browser.default.ImageCollection(eeId);
    const range = collection.reduceColumns(_browser.default.Reducer.minMax(), ['system:time_start']);
    return (0, _ee_worker_utils.getInfo)(range);
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
      useCentroid,
      style,
      tileScale = DEFAULT_TILE_SCALE
    } = this.options;
    const singleAggregation = !Array.isArray(aggregationType);
    const useHistogram = singleAggregation && (0, _ee_worker_utils.hasClasses)(aggregationType) && Array.isArray(style);
    const image = await this.getImage();
    const scale = this.eeScale;
    const collection = this.getFeatureCollection();
    if (collection) {
      if (format === FEATURE_COLLECTION) {
        const {
          datasetId,
          filter
        } = this.options;
        let dataset = _browser.default.FeatureCollection(datasetId);
        dataset = (0, _ee_worker_utils.applyFilter)(dataset, filter);
        const aggFeatures = collection.map(feature => {
          feature = _browser.default.Feature(feature);
          const count = dataset.filterBounds(feature.geometry()).size();
          return feature.set('count', count);
        }).select(['count'], null, false);
        return (0, _ee_worker_utils.getInfo)(aggFeatures).then(_ee_worker_utils.getFeatureCollectionProperties);
      } else if (useHistogram) {
        // Used for landcover
        const reducer = _browser.default.Reducer.frequencyHistogram();
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
          style
        }));
      } else if (!singleAggregation && aggregationType.length) {
        const reducer = (0, _ee_worker_utils.combineReducers)(aggregationType, useCentroid);
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
  if (_browser.default.data.getAuthToken()) {
    // Already authenticated
    _browser.default.initialize(null, null, resolve, reject);
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
      _browser.default.data.setAuthToken(client_id, tokenType, access_token, expires_in, extraScopes, () => _browser.default.initialize(null, null, resolve, reject), updateAuthLibrary);
      _browser.default.data.setAuthTokenRefresher(async (authArgs, callback) => callback(_objectSpread(_objectSpread({}, await getAuthToken()), {}, {
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