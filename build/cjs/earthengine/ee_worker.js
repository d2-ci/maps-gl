"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _buffer = _interopRequireDefault(require("@turf/buffer"));
var _circle = _interopRequireDefault(require("@turf/circle"));
var _comlink = require("comlink");
var _ee_api_js_worker = _interopRequireDefault(require("./ee_api_js_worker.js"));
var _ee_worker_utils = require("./ee_worker_utils.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } // https://github.com/google/earthengine-api/pull/173
const IMAGE = 'Image';
const IMAGE_COLLECTION = 'ImageCollection';
const FEATURE_COLLECTION = 'FeatureCollection';
const BANDSOURCE_METHODSOUTPUT = 'methodsOutput';
const getBufferGeometry = (_ref, buffer) => {
  let {
    geometry
  } = _ref;
  return (geometry.type === 'Point' ? (0, _circle.default)(geometry, buffer) : (0, _buffer.default)(geometry, buffer)).geometry;
};

// Options are defined here:
// https://developers.google.com/earth-engine/apidocs/ee-featurecollection-draw
const DEFAULT_FEATURE_STYLE = {
  color: '#FFA500',
  strokeWidth: 2,
  pointRadius: 5
};
const DEFAULT_TILE_SCALE = 1;
const DEFAULT_SCALE = 1000;
const DEFAULT_UNMASK_VALUE = 0;
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
        geometry: buffer && feature.geometry.type === 'Point' ? getBufferGeometry(feature, buffer / 1000) : feature.geometry
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
      periodReducerType,
      mosaic,
      band,
      bandSource,
      bandReducer,
      methods,
      cloudScore
    } = this.options;
    let eeImage;
    let eeImageBands;
    if (format === IMAGE) {
      // Single image
      eeImage = _ee_api_js_worker.default.Image(datasetId);
      this.eeScale = (0, _ee_worker_utils.getScale)(eeImage);
    } else {
      // Image collection
      let collection = _ee_api_js_worker.default.ImageCollection(datasetId);

      // Scale is lost when creating a mosaic below
      this.eeScale = (0, _ee_worker_utils.getScale)(collection.first());

      // Apply period reducer (e.g. going from daily to monthly)
      if (periodReducer) {
        const year = Number.parseInt(filter[0].arguments[1].slice(0, 4));
        const {
          startDate,
          endDate
        } = (0, _ee_worker_utils.getPeriodDates)(periodReducer, year);
        collection = (0, _ee_worker_utils.filterCollectionByDateRange)(collection, startDate, endDate);
        const aggregatorFn = (0, _ee_worker_utils.getAggregatorFn)(periodReducer);
        collection = aggregatorFn({
          collection,
          metadataOnly: false,
          year,
          reducer: periodReducerType,
          periodReducer,
          overrideDate: startDate
        });
      }

      // Apply array of filters (e.g. period)
      collection = (0, _ee_worker_utils.applyFilter)(collection, filter);

      // Mask out clouds from satellite images
      if (cloudScore) {
        collection = (0, _ee_worker_utils.applyCloudMask)(collection, cloudScore);
      }
      if (mosaic) {
        // Composite all images inn a collection (e.g. per country)
        eeImage = collection.mosaic();
      } else {
        // There should only be one image after applying the filters
        eeImage = _ee_api_js_worker.default.Image(collection.first());
      }
    }

    // If readily available, select band now (e.g. age group)
    if (!bandSource) {
      ;
      ({
        eeImage,
        eeImageBands
      } = (0, _ee_worker_utils.selectBand)({
        eeImage,
        band,
        bandReducer
      }));
    }

    // Run methods on image
    eeImage = (0, _ee_worker_utils.applyMethods)(eeImage, methods);

    // If an output of methods, select band now (e.g. relative humidity)
    if (bandSource === BANDSOURCE_METHODSOUTPUT) {
      ;
      ({
        eeImage,
        eeImageBands
      } = (0, _ee_worker_utils.selectBand)({
        eeImage,
        band,
        bandReducer
      }));
    }
    this.eeImage = eeImage;
    this.eeImageBands = eeImageBands;
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
          {
            let dataset = _ee_api_js_worker.default.FeatureCollection(datasetId);
            dataset = (0, _ee_worker_utils.applyFilter)(dataset, filter).draw(_objectSpread(_objectSpread({}, DEFAULT_FEATURE_STYLE), style));
            if (data) {
              dataset = dataset.clipToCollection(this.getFeatureCollection());
            }
            dataset.getMap(null, response => resolve(response.urlFormat));
            break;
          }
        case IMAGE:
        case IMAGE_COLLECTION:
          {
            // eslint-disable-next-line prefer-const
            let {
              eeImage,
              params
            } = (0, _ee_worker_utils.getClassifiedImage)(this.getImage(), this.options);
            if (data) {
              eeImage = eeImage.clipToCollection(this.getFeatureCollection());
            }
            eeImage.visualize(params).getMap(null, response => resolve(response.urlFormat));
            break;
          }
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
    const point = _ee_api_js_worker.default.Geometry.Point(lng, lat);
    const reducer = _ee_api_js_worker.default.Reducer.mean();
    return (0, _ee_worker_utils.getInfo)(eeImage.reduceRegion(reducer, point, 1));
  }

  // Returns available periods for an image collection
  getPeriods(_ref2) {
    let {
      datasetId,
      year,
      datesRange,
      periodReducer
    } = _ref2;
    let collection = _ee_api_js_worker.default.ImageCollection(datasetId);
    let startDate, endDate;
    if (year) {
      ;
      ({
        startDate,
        endDate
      } = (0, _ee_worker_utils.getPeriodDates)(periodReducer, year));
      collection = (0, _ee_worker_utils.filterCollectionByDateRange)(collection, startDate, endDate);
    }
    if (periodReducer) {
      collection = (0, _ee_worker_utils.aggregateTemporal)({
        collection,
        metadataOnly: true,
        year,
        periodReducer,
        overrideDate: startDate
      });
    }
    collection = (0, _ee_worker_utils.filterCollectionByDateRange)(collection, datesRange.startDate, datesRange.endDate);
    const featureCollection = _ee_api_js_worker.default.FeatureCollection(collection).select(['system:time_start', 'system:time_end', 'year', 'month', 'week'], null, false);
    return (0, _ee_worker_utils.getInfo)(featureCollection.distinct('system:time_start').sort('system:time_start', false));
  }

  // Returns min and max timestamp for an image collection
  getTimeRange(datasetId) {
    const collection = _ee_api_js_worker.default.ImageCollection(datasetId);
    const range = collection.reduceColumns(_ee_api_js_worker.default.Reducer.minMax(), ['system:time_start']);
    return (0, _ee_worker_utils.getInfo)(range);
  }

  // Returns info for first and last images in collection
  getCollectionSpan(datasetId) {
    const collection = _ee_api_js_worker.default.ImageCollection(datasetId);
    const first = collection.sort('system:time_start', true).first();
    const last = collection.sort('system:time_start', false).first();
    return (0, _ee_worker_utils.getInfo)(_ee_api_js_worker.default.Dictionary({
      first,
      last
    }));
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
      tileScale = DEFAULT_TILE_SCALE,
      unmaskAggregation
    } = this.options;
    const singleAggregation = !Array.isArray(aggregationType);
    const useHistogram = singleAggregation && (0, _ee_worker_utils.hasClasses)(aggregationType) && Array.isArray(style);
    const collection = this.getFeatureCollection();
    const scale = (0, _ee_worker_utils.getAdjustedScale)(collection, this.eeScale);
    let image = await this.getImage();

    // Used for "constrained" WorldPop layers
    // We need to unmask the image to get the correct population density
    if (unmaskAggregation || typeof unmaskAggregation === 'number') {
      const fillValue = typeof unmaskAggregation === 'number' ? unmaskAggregation : DEFAULT_UNMASK_VALUE;
      image = image.unmask(fillValue);
      if (this.eeImageBands) {
        this.eeImageBands = this.eeImageBands.unmask(fillValue);
      }
    }
    if (collection) {
      if (format === FEATURE_COLLECTION) {
        const {
          datasetId,
          filter
        } = this.options;
        let dataset = _ee_api_js_worker.default.FeatureCollection(datasetId);
        dataset = (0, _ee_worker_utils.applyFilter)(dataset, filter);
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
      } else {
        throw new Error('Aggregation type is not valid');
      }
    } else {
      throw new Error('Missing org unit features');
    }
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
  // eslint-disable-next-line no-undef
  onconnect = evt => (0, _comlink.expose)(EarthEngineWorker, evt.ports[0]);
} else {
  (0, _comlink.expose)(EarthEngineWorker);
}
var _default = exports.default = '';