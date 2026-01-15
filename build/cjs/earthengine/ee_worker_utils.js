"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectBand = exports.hasClasses = exports.getStartOfEpiYear = exports.getScale = exports.getPeriodDates = exports.getInfo = exports.getHistogramStatistics = exports.getFeatureCollectionProperties = exports.getClassifiedImage = exports.getAggregatorFn = exports.getAdjustedScale = exports.filterCollectionByDateRange = exports.combineReducers = exports.applyMethods = exports.applyFilter = exports.applyCloudMask = exports.aggregateTemporalWeighted = exports.aggregateTemporal = exports.DEFAULT_SCALE = void 0;
var _ee_api_js_worker = _interopRequireDefault(require("./ee_api_js_worker.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const squareMetersToHectares = value => value / 10000;
const squareMetersToAcres = value => value / 4046.8564224;
const classAggregation = ['percentage', 'hectares', 'acres'];
const DEFAULT_MASK_VALUE = 0;
const EE_WEEKLY = 'EE_WEEKLY';
const EE_WEEKLY_WEIGHTED = 'EE_WEEKLY_WEIGHTED';
const EE_MONTHLY = 'EE_MONTHLY';
const EE_MONTHLY_WEIGHTED = 'EE_MONTHLY_WEIGHTED';
const DEFAULT_SCALE = exports.DEFAULT_SCALE = 1000;
const hasClasses = type => classAggregation.includes(type);

// Get the start date (UTC) of the epidemiological year (Monday start) for a given year
exports.hasClasses = hasClasses;
const getStartOfEpiYear = year => {
  const jan1 = new Date(Date.UTC(year, 0, 1)); // Month is 0-indexed (0 = Jan)
  const dayOfWeek = jan1.getDay(); // Sunday=0, Monday=1, ..., Saturday=6

  const dayOfWeekMondayStart = dayOfWeek === 0 ? 7 : dayOfWeek;
  let startDate;
  if (dayOfWeekMondayStart <= 4) {
    const diff = dayOfWeekMondayStart - 1;
    startDate = new Date(Date.UTC(year, 0, 1 - diff));
  } else {
    const diff = 8 - dayOfWeekMondayStart;
    startDate = new Date(Date.UTC(year, 0, 1 + diff));
  }
  return startDate;
};

// Return JS Date start/end for the given period reducer and year
exports.getStartOfEpiYear = getStartOfEpiYear;
const getPeriodDates = (periodReducer, year) => {
  switch (periodReducer) {
    case EE_WEEKLY:
    case EE_WEEKLY_WEIGHTED:
      {
        const start = getStartOfEpiYear(year);
        const end = new Date(getStartOfEpiYear(year + 1).getTime() - 24 * 60 * 60 * 1000);
        return {
          startDate: start,
          endDate: end
        };
      }
    case EE_MONTHLY:
    case EE_MONTHLY_WEIGHTED:
    default:
      {
        // Return plain JS Date objects for monthly period boundaries so callers
        // can work consistently with native dates (UTC midnight)
        return {
          startDate: new Date(Date.UTC(year, 0, 1)),
          endDate: new Date(Date.UTC(year, 11, 31, 23, 59, 59))
        };
      }
  }
};

// Filter an ImageCollection to images overlapping a JS Date range
exports.getPeriodDates = getPeriodDates;
const filterCollectionByDateRange = (collection, startDate, endDate) => {
  return collection.filter(_ee_api_js_worker.default.Filter.or(_ee_api_js_worker.default.Filter.date(_ee_api_js_worker.default.Date(startDate.getTime()), _ee_api_js_worker.default.Date(endDate.getTime())), _ee_api_js_worker.default.Filter.and(_ee_api_js_worker.default.Filter.lt('system:time_start', endDate.getTime()), _ee_api_js_worker.default.Filter.gt('system:time_end', startDate.getTime()))));
};

// Makes evaluate a promise
exports.filterCollectionByDateRange = filterCollectionByDateRange;
const getInfo = instance => new Promise((resolve, reject) => instance.evaluate((data, error) => {
  if (error) {
    reject(error);
  } else {
    resolve(data);
  }
}));

// Increase sampling density for more accurate and stable statistics,
// especially for coarse-resolution datasets with reduceRegion(s).
// Further adjusts the scale if necessary to avoid failures on small polygons.
exports.getInfo = getInfo;
const getAdjustedScale = (features, eeScale) => {
  const scale = _ee_api_js_worker.default.Number(eeScale ?? DEFAULT_SCALE);
  const cappedScale = _ee_api_js_worker.default.Number(scale).min(DEFAULT_SCALE);
  const featuresWithArea = features.map(f => f.set('area', f.geometry().area()));
  const minArea = _ee_api_js_worker.default.Number(featuresWithArea.reduceColumns({
    reducer: _ee_api_js_worker.default.Reducer.min(),
    selectors: ['area']
  }).get('min'));
  return _ee_api_js_worker.default.Algorithms.If(minArea.lt(cappedScale.pow(2)), minArea.sqrt().divide(2), cappedScale);
};

// Unweighted means that centroids are used for each grid cell
// https://developers.google.com/earth-engine/guides/reducers_reduce_region#pixels-in-the-region
exports.getAdjustedScale = getAdjustedScale;
const createReducer = (eeReducer, type, unweighted) => {
  const reducer = eeReducer[type]();
  return unweighted ? reducer.unweighted() : reducer;
};

// Combine multiple aggregation types/reducers
// https://developers.google.com/earth-engine/guides/reducers_intro
const combineReducers = (types, unweighted) => types.reduce((r, t, i) => i === 0 ? createReducer(r, t, unweighted) : r.combine(createReducer(_ee_api_js_worker.default.Reducer, t, unweighted), '', true), _ee_api_js_worker.default.Reducer);
exports.combineReducers = combineReducers;
const selectBand = ({
  eeImage,
  band,
  bandReducer
}) => {
  if (!band) {
    return {
      eeImage
    };
  }
  let eeImageBands;
  eeImage = eeImage.select(band);
  if (Array.isArray(band) && bandReducer) {
    // Keep image bands for aggregations
    eeImageBands = eeImage;

    // Combine multiple bands (e.g. age groups)
    eeImage = eeImage.reduce(_ee_api_js_worker.default.Reducer[bandReducer]());
  }
  return {
    eeImage,
    eeImageBands
  };
};

// Returns the linear scale in meters of the units of this projection
exports.selectBand = selectBand;
const getScale = image => image.select(0).projection().nominalScale();

// Returns histogram data (e.g. landcover) in percentage, hectares or acres
exports.getScale = getScale;
const getHistogramStatistics = ({
  data,
  scale,
  aggregationType,
  style
}) => data.features.reduce((obj, {
  id,
  properties
}) => {
  const {
    histogram
  } = properties;
  const sum = Object.values(histogram).reduce((a, b) => a + b, 0);
  obj[id] = style.reduce((values, {
    value: id
  }) => {
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

// Reduce a feature collection to an object of properties
exports.getHistogramStatistics = getHistogramStatistics;
const getFeatureCollectionProperties = data => data.features.reduce((obj, f) => _objectSpread(_objectSpread({}, obj), {}, {
  [f.id]: f.properties
}), {});

// Classify image according to style
exports.getFeatureCollectionProperties = getFeatureCollectionProperties;
const getClassifiedImage = (eeImage, {
  legend = [],
  style,
  band,
  maskOperator
}) => {
  // Use mask operator (e.g. mask out values below a certain threshold)
  // Only used for styling, not aggregations
  if (maskOperator && eeImage[maskOperator]) {
    eeImage = eeImage.updateMask(eeImage[maskOperator](style?.min || DEFAULT_MASK_VALUE));
  }

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
  const sortedLegend = legend.slice().sort((a, b) => a.from - b.from);
  const min = 0;
  const max = sortedLegend.length - 1;
  const {
    palette
  } = style;
  let zones;
  for (let i = min, item; i < max; i++) {
    item = sortedLegend[i];
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
const applyFilter = (collection, filter = []) => {
  let filtered = collection;
  filter.forEach(f => {
    if (_ee_api_js_worker.default.Filter[f.type]) {
      filtered = filtered.filter(_ee_api_js_worker.default.Filter[f.type].apply(void 0, f.arguments));
    }
  });
  return filtered;
};

// Resolve variable names to image bands dynamically
exports.applyFilter = applyFilter;
const getExpressionArgumentBands = (image, method) => {
  const vars = {};
  for (const key in method.arguments[1]) {
    const bandName = method.arguments[1][key];
    vars[key] = image.select(bandName);
  }
  return vars;
};

// Apply methods to image cells
const applyMethods = (eeImage, methods = []) => {
  let image = eeImage;
  if (Array.isArray(methods)) {
    for (const m of methods) {
      if (m.name === 'expression' && m.arguments && typeof m.arguments[1] === 'object') {
        image = image.expression(m.arguments[0], getExpressionArgumentBands(image, m));
      } else if (image[m.name]) {
        image = image[m.name].apply(image, m.arguments);
      }
    }
  } else {
    // Backward compatibility for format used before 2.40
    for (const m in methods) {
      if (image[m]) {
        image = image[m].apply(image, methods[m]);
      }
    }
  }
  return image;
};

// Mask out clouds from satellite images
exports.applyMethods = applyMethods;
const applyCloudMask = (collection, cloudScore) => {
  const {
    datasetId,
    band,
    clearThreshold
  } = cloudScore;
  return collection.linkCollection(_ee_api_js_worker.default.ImageCollection(datasetId), [band]).map(img => img.updateMask(img.select(band).gte(clearThreshold)));
};

// Map periodReducer string to period unit used by ee ("month" or "week")
exports.applyCloudMask = applyCloudMask;
const mapPeriodReducerToPeriod = periodReducer => {
  switch (periodReducer) {
    case EE_WEEKLY:
    case EE_WEEKLY_WEIGHTED:
      return 'week';
    case EE_MONTHLY:
    case EE_MONTHLY_WEIGHTED:
    default:
      return 'month';
  }
};

// Compute min/max dates for a collection and align the minDate for monthly periods
const computeMinMaxAndAlign = ({
  collection,
  period,
  overrideDate
}) => {
  const minStartRaw = collection.reduceColumns(_ee_api_js_worker.default.Reducer.min(), ['system:time_start']).get('min');
  const maxStartRaw = collection.reduceColumns(_ee_api_js_worker.default.Reducer.max(), ['system:time_start']).get('max');
  const maxEndRaw = collection.reduceColumns(_ee_api_js_worker.default.Reducer.max(), ['system:time_end']).get('max');
  let minDate = overrideDate ? _ee_api_js_worker.default.Date(overrideDate.getTime()) : _ee_api_js_worker.default.Date(minStartRaw);
  const maxDate = _ee_api_js_worker.default.Date(_ee_api_js_worker.default.Algorithms.If(maxEndRaw, maxEndRaw, maxStartRaw));
  if (period === 'month') {
    minDate = _ee_api_js_worker.default.Date.fromYMD(minDate.get('year'), minDate.get('month'), 1);
  }
  return {
    minDate,
    maxDate
  };
};

// Build steps sequence and band names for a collection given the period and min/max dates
const buildStepsAndBandNames = ({
  minDate,
  maxDate,
  period,
  collection
}) => {
  let nSteps = maxDate.difference(minDate, period);
  nSteps = _ee_api_js_worker.default.Algorithms.If(period === 'month', nSteps.min(_ee_api_js_worker.default.Number(11)), nSteps);
  const steps = _ee_api_js_worker.default.List.sequence(0, _ee_api_js_worker.default.Number(nSteps));
  const bandNames = _ee_api_js_worker.default.Image(collection.first()).bandNames();
  return {
    steps,
    bandNames
  };
};

// Build metadata object for a period (shared by temporal aggregators)
const buildPeriodMetadata = ({
  startDate,
  endDate,
  period,
  tempYear
}) => {
  const metadata = {
    'system:time_start': startDate.millis(),
    'system:time_end': endDate.millis(),
    year: tempYear
  };
  if (period === 'month') {
    metadata.month = startDate.get('month');
    metadata['system:index'] = _ee_api_js_worker.default.String(tempYear.toString()).cat(startDate.format('MM'));
  } else {
    metadata.week = startDate.format('w');
    metadata['system:index'] = _ee_api_js_worker.default.String(tempYear.toString()).cat(_ee_api_js_worker.default.String('W')).cat(startDate.format('w'));
  }
  return metadata;
};

// Generic temporal aggregation function for daily ImageCollections.
// In use when source periods are granular enough to be fully contained
// in target periods, eg. daily.
// Supported periods: 'month' and 'week'
const aggregateTemporal = ({
  collection,
  metadataOnly = false,
  year = null,
  reducer = 'mean',
  periodReducer = EE_MONTHLY,
  overrideDate
}) => {
  const temporalReducer = _ee_api_js_worker.default.Reducer[reducer] ? _ee_api_js_worker.default.Reducer[reducer]() : _ee_api_js_worker.default.Reducer.mean();
  const period = mapPeriodReducerToPeriod(periodReducer);
  const {
    minDate,
    maxDate
  } = computeMinMaxAndAlign({
    collection,
    period,
    overrideDate
  });
  const {
    steps: stepList,
    bandNames
  } = buildStepsAndBandNames({
    minDate,
    maxDate,
    period,
    collection
  });
  const aggregatedImages = _ee_api_js_worker.default.ImageCollection.fromImages(stepList.map(i => {
    const startDate = minDate.advance(_ee_api_js_worker.default.Number(i), period);
    const endDate = startDate.advance(1, period).advance(-1, 'second');
    const tempYear = year || startDate.get('year');
    let image;
    if (metadataOnly) {
      image = _ee_api_js_worker.default.Image(0);
    } else {
      const subCollection = collection.filterDate(startDate, endDate);
      image = subCollection.reduce(temporalReducer).rename(bandNames);
    }
    const metadata = buildPeriodMetadata({
      startDate,
      endDate,
      period,
      tempYear
    });
    return image.set(metadata);
  }));
  return aggregatedImages.sort('system:time_start', false);
};

// Aggregates an ImageCollection (with system:time_start and system:time_end)
// into weighted composites, either monthly or weekly, based on overlap duration.
// In use when source periods are not granular enough to be fully contained
// in target periods, eg. 16-day.
exports.aggregateTemporal = aggregateTemporal;
const aggregateTemporalWeighted = ({
  collection,
  year,
  periodReducer = 'EE_MONTHLY_WEIGHTED',
  overrideDate
}) => {
  const period = mapPeriodReducerToPeriod(periodReducer);
  const {
    minDate,
    maxDate
  } = computeMinMaxAndAlign({
    collection,
    period,
    overrideDate
  });
  const {
    steps,
    bandNames
  } = buildStepsAndBandNames({
    minDate,
    maxDate,
    period,
    collection
  });
  const weightedImages = steps.map(s => {
    const startDate = minDate.advance(_ee_api_js_worker.default.Number(s), period);
    const endDate = startDate.advance(1, period).advance(-1, 'second');

    // Compute overlap duration for each image
    const withOverlap = collection.map(img => {
      const imgStart = _ee_api_js_worker.default.Date(img.get('system:time_start'));
      const imgEnd = _ee_api_js_worker.default.Date(img.get('system:time_end'));
      const overlapStart = _ee_api_js_worker.default.Date(_ee_api_js_worker.default.Algorithms.If(imgStart.millis().gt(startDate.millis()), imgStart, startDate));
      const overlapEnd = _ee_api_js_worker.default.Date(_ee_api_js_worker.default.Algorithms.If(imgEnd.millis().lt(endDate.millis()), imgEnd, endDate));
      const overlapDuration = overlapEnd.difference(overlapStart, 'second');
      return img.updateMask(overlapDuration.gt(0)).set({
        overlapDuration
      });
    });

    // Keep only overlapping images
    const overlapping = withOverlap.filter(_ee_api_js_worker.default.Filter.gt('overlapDuration', 0));

    // Skip periods with no overlapping images
    return _ee_api_js_worker.default.Algorithms.If(overlapping.size().gt(0), (() => {
      // Weighted sum of images
      const weightedSum = _ee_api_js_worker.default.Image(overlapping.map(img => {
        const duration = _ee_api_js_worker.default.Number(img.get('overlapDuration'));
        return img.toFloat().multiply(duration).addBands(_ee_api_js_worker.default.Image.constant(duration).float().rename('duration'));
      }).reduce(_ee_api_js_worker.default.Reducer.sum()));

      // Total duration
      const totalDuration = _ee_api_js_worker.default.Image.constant(overlapping.aggregate_sum('overlapDuration')).float();

      // Weighted mean
      const weightedImage = weightedSum.divide(totalDuration).rename(bandNames.add('duration')).select(bandNames);
      const tempYear = year || startDate.get('year');
      const metadata = buildPeriodMetadata({
        startDate,
        endDate,
        period,
        tempYear
      });
      return weightedImage.set(metadata);
    })(), null);
  });
  return _ee_api_js_worker.default.ImageCollection.fromImages(weightedImages).sort('system:time_start', false);
};
exports.aggregateTemporalWeighted = aggregateTemporalWeighted;
const getAggregatorFn = periodReducer => {
  return [EE_WEEKLY_WEIGHTED, EE_MONTHLY_WEIGHTED].includes(periodReducer) ? aggregateTemporalWeighted : aggregateTemporal;
};
exports.getAggregatorFn = getAggregatorFn;