"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasClasses = exports.getScale = exports.getInfo = exports.getHistogramStatistics = exports.getFeatureCollectionProperties = exports.getClassifiedImage = exports.combineReducers = exports.applyMethods = exports.applyFilter = exports.applyCloudMask = void 0;
var _browser = _interopRequireDefault(require("@google/earthengine/build/browser.js"));
var _this = void 0;
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// this is a patched version of the ee module

const squareMetersToHectares = value => value / 10000;
const squareMetersToAcres = value => value / 4046.8564224;
const classAggregation = ['percentage', 'hectares', 'acres'];
const hasClasses = type => classAggregation.includes(type);

// Makes evaluate a promise
exports.hasClasses = hasClasses;
const getInfo = instance => new Promise((resolve, reject) => instance.evaluate((data, error) => {
  if (error) {
    reject(error);
  } else {
    resolve(data);
  }
}));

// unweighted means that centroids are used for each grid cell
// https://developers.google.com/earth-engine/guides/reducers_reduce_region#pixels-in-the-region
exports.getInfo = getInfo;
const createReducer = (eeReducer, type, unweighted) => {
  const reducer = eeReducer[type]();
  return unweighted ? reducer.unweighted() : reducer;
};

// Combine multiple aggregation types/reducers
// https://developers.google.com/earth-engine/guides/reducers_intro
const combineReducers = (types, unweighted) => types.reduce((r, t, i) => i === 0 ? createReducer(r, t, unweighted) : r.combine(createReducer(_browser.default.Reducer, t, unweighted), '', true), _browser.default.Reducer);

// Returns the linear scale in meters of the units of this projection
exports.combineReducers = combineReducers;
const getScale = image => image.select(0).projection().nominalScale();

// Returns histogram data (e.g. landcover) in percentage, hectares or acres
exports.getScale = getScale;
const getHistogramStatistics = _ref => {
  let {
    data,
    scale,
    aggregationType,
    style
  } = _ref;
  return data.features.reduce((obj, _ref2) => {
    let {
      id,
      properties
    } = _ref2;
    const {
      histogram
    } = properties;
    const sum = Object.values(histogram).reduce((a, b) => a + b, 0);
    obj[id] = style.reduce((values, _ref3) => {
      let {
        value: id
      } = _ref3;
      const count = histogram[id] || 0;
      const sqMeters = count * (scale * scale);
      let value;
      switch (aggregationType) {
        case 'hectares':
          value = Math.round(squareMetersToHectares(sqMeters));
          break;
        case 'acres':
          value = Math.round(squareMetersToAcres(sqMeters));
          break;
        default:
          value = count / sum * 100;
        // percentage
      }

      values[id] = value;
      return values;
    }, {});
    return obj;
  }, {});
};

// Reduce a feature collection to an object of properties
exports.getHistogramStatistics = getHistogramStatistics;
const getFeatureCollectionProperties = data => data.features.reduce((obj, f) => _objectSpread(_objectSpread({}, obj), {}, {
  [f.id]: f.properties
}), {});

// Classify image according to style
exports.getFeatureCollectionProperties = getFeatureCollectionProperties;
const getClassifiedImage = (eeImage, _ref4) => {
  let {
    legend = [],
    style,
    band
  } = _ref4;
  // Image has classes (e.g. landcover)
  if (Array.isArray(style)) {
    return {
      eeImage: eeImage.remap({
        from: style.map(s => s.value),
        to: [...Array(style.length).keys()],
        bandName: band
      }),
      params: {
        min: 0,
        max: style.length - 1,
        palette: style.map(l => l.color).join(',')
      }
    };
  } else if (style.bands) {
    // Satellite image
    return {
      eeImage,
      params: style
    };
  }
  const min = 0;
  const max = legend.length - 1;
  const {
    palette
  } = style;
  let zones;
  for (let i = min, item; i < max; i++) {
    item = legend[i];
    if (!zones) {
      zones = eeImage.gt(item.to);
    } else {
      zones = zones.add(eeImage.gt(item.to));
    }
  }
  return {
    eeImage: zones,
    params: {
      min,
      max,
      palette
    }
  };
};

// Apply filter to image collection
exports.getClassifiedImage = getClassifiedImage;
const applyFilter = function (collection) {
  let filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  let filtered = collection;
  filter.forEach(f => {
    if (_browser.default.Filter[f.type]) {
      filtered = filtered.filter(_browser.default.Filter[f.type].apply(_this, f.arguments));
    }
  });
  return filtered;
};

// Apply methods to image cells
exports.applyFilter = applyFilter;
const applyMethods = function (eeImage) {
  let methods = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  let image = eeImage;
  if (Array.isArray(methods)) {
    methods.forEach(m => {
      if (image[m.name]) {
        image = image[m.name].apply(image, m.arguments);
      }
    });
  } else {
    // Backward compatibility for format used before 2.40
    Object.keys(methods).forEach(m => {
      if (image[m]) {
        image = image[m].apply(image, methods[m]);
      }
    });
  }
  return image;
};

// Mask out clouds from satellite images
exports.applyMethods = applyMethods;
const applyCloudMask = (collection, cloudScore) => {
  const {
    datasetId,
    band,
    clearTreshold
  } = cloudScore;
  return collection.linkCollection(_browser.default.ImageCollection(datasetId), [band]).map(img => img.updateMask(img.select(band).gte(clearTreshold)));
};
exports.applyCloudMask = applyCloudMask;