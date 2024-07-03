"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasClasses = exports.getScale = exports.getInfo = exports.getHistogramStatistics = exports.getFeatureCollectionProperties = exports.getClassifiedImage = exports.combineReducers = void 0;
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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

// Combine multiple aggregation types/reducers
// unweighted means that centroids are used for each grid cell
// https://developers.google.com/earth-engine/guides/reducers_intro
// https://developers.google.com/earth-engine/guides/reducers_reduce_region#pixels-in-the-region
exports.getInfo = getInfo;
const combineReducers = ee => types => types.reduce((r, t, i) => i === 0 ? r[t]().unweighted() : r.combine({
  reducer2: ee.Reducer[t]().unweighted(),
  sharedInputs: true
}), ee.Reducer);

// Returns the linear scale in meters of the units of this projection
exports.combineReducers = combineReducers;
const getScale = image => image.select(0).projection().nominalScale();

// Returns visualisation params from legend
exports.getScale = getScale;
const getParamsFromLegend = legend => {
  const keys = legend.map(l => l.id);
  const min = Math.min(...keys);
  const max = Math.max(...keys);
  const palette = legend.map(l => l.color).join(',');
  return {
    min,
    max,
    palette
  };
};

// Returns histogram data (e.g. landcover) in percentage, hectares or acres
const getHistogramStatistics = _ref => {
  let {
    data,
    scale,
    aggregationType,
    legend
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
    obj[id] = legend.reduce((values, _ref3) => {
      let {
        id
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

// Classify image according to legend
exports.getFeatureCollectionProperties = getFeatureCollectionProperties;
const getClassifiedImage = (eeImage, _ref4) => {
  let {
    legend = [],
    params
  } = _ref4;
  if (!params) {
    // Image has classes (e.g. landcover)
    return {
      eeImage,
      params: getParamsFromLegend(legend)
    };
  }
  const min = 0;
  const max = legend.length - 1;
  const {
    palette
  } = params;
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
exports.getClassifiedImage = getClassifiedImage;