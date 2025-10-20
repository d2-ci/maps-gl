"use strict";

var _ee_api_js_worker = _interopRequireDefault(require("../ee_api_js_worker.js"));
var _ee_worker_utils = require("../ee_worker_utils.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
jest.mock('../ee_api_js_worker.js');
describe('EE-dependent functions (mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('filterCollectionByDateRange calls ee.Filter.date and collection.filter', () => {
    const mockCollection = {
      filter: jest.fn()
    };
    const start = new Date('2020-01-01');
    const end = new Date('2020-12-31');
    (0, _ee_worker_utils.filterCollectionByDateRange)(mockCollection, start, end);
    expect(_ee_api_js_worker.default.Filter.date).toHaveBeenCalled();
    expect(mockCollection.filter).toHaveBeenCalled();
    expect(_ee_api_js_worker.default.Filter.or).toHaveBeenCalled();
  });
  test('combineReducers calls ee.Reducer.combine correctly', () => {
    (0, _ee_worker_utils.combineReducers)(['mean', 'sum'], false);
    expect(_ee_api_js_worker.default.Reducer.mean).toHaveBeenCalled();
    expect(_ee_api_js_worker.default.Reducer.sum).toHaveBeenCalled();
    expect(_ee_api_js_worker.default.Reducer.combine).toHaveBeenCalled();
  });
  test('getScale returns nominalScale value', () => {
    const image = _ee_api_js_worker.default.Image();
    const scale = (0, _ee_worker_utils.getScale)(image);
    expect(scale).toBe(30);
  });
  test('getClassifiedImage (array style) calls remap with correct structure', () => {
    const image = _ee_api_js_worker.default.Image();
    const style = [{
      value: 1,
      color: '#FF0000'
    }, {
      value: 2,
      color: '#00FF00'
    }];
    const result = (0, _ee_worker_utils.getClassifiedImage)(image, {
      style,
      band: 'B1'
    });
    expect(result.eeImage.remap).toBeDefined();
    expect(result.params.min).toBe(0);
    expect(result.params.max).toBe(1);
  });
  test('applyFilter calls ee.Filter and collection.filter', () => {
    const mockCollection = {
      filter: jest.fn()
    };
    const filters = [{
      type: 'date',
      arguments: ['2020-01-01', '2020-12-31']
    }];
    (0, _ee_worker_utils.applyFilter)(mockCollection, filters);
    expect(_ee_api_js_worker.default.Filter.date).toHaveBeenCalled();
    expect(mockCollection.filter).toHaveBeenCalled();
  });
  test('applyMethods applies image methods in sequence', () => {
    const image = {
      foo: jest.fn(() => image),
      bar: jest.fn(() => image)
    };
    const methods = [{
      name: 'foo',
      arguments: [1, 2]
    }, {
      name: 'bar',
      arguments: [3]
    }];
    const result = (0, _ee_worker_utils.applyMethods)(image, methods);
    expect(result).toBe(image);
    expect(image.foo).toHaveBeenCalledWith(1, 2);
    expect(image.bar).toHaveBeenCalledWith(3);
  });
  test('applyCloudMask links and maps correctly', () => {
    const collection = {
      linkCollection: jest.fn(() => ({
        map: jest.fn(() => 'masked')
      }))
    };
    const cloudScore = {
      datasetId: 'dataset',
      band: 'B1',
      clearThreshold: 20
    };
    const result = (0, _ee_worker_utils.applyCloudMask)(collection, cloudScore);
    expect(collection.linkCollection).toHaveBeenCalled();
    expect(result).toBe('masked');
  });
  test('aggregateTemporal returns an ImageCollection and calls necessary helpers', () => {
    const collection = _ee_api_js_worker.default.ImageCollection();
    const result = (0, _ee_worker_utils.aggregateTemporal)({
      collection,
      metadataOnly: true,
      year: 2020,
      reducer: 'mean'
    });

    // fromImages should have been called to build the aggregated collection
    expect(_ee_api_js_worker.default.ImageCollection.fromImages).toHaveBeenCalled();

    // Result should be an ImageCollection-like object (mock exposes sort)
    expect(result.sort).toBeDefined();

    // Inspect the images passed to fromImages: ensure they have metadata set
    const callArg = _ee_api_js_worker.default.ImageCollection.fromImages.mock.calls[0][0];
    // callArg is expected to be an array-like mapping (mock uses native array)
    if (Array.isArray(callArg)) {
      callArg.forEach(img => {
        expect(img._meta).toBeDefined();
        expect(img._meta).toHaveProperty('system:time_start');
        expect(img._meta).toHaveProperty('system:time_end');
        expect(img._meta).toHaveProperty('year');
      });
    }
  });
  test('aggregateTemporalWeighted monthly returns ImageCollection and includes month metadata', () => {
    const collection = _ee_api_js_worker.default.ImageCollection();
    const result = (0, _ee_worker_utils.aggregateTemporalWeighted)({
      collection,
      year: 2020,
      periodReducer: 'EE_MONTHLY_WEIGHTED'
    });

    // fromImages should have been called to build the weighted collection
    expect(_ee_api_js_worker.default.ImageCollection.fromImages).toHaveBeenCalled();

    // Result should be an ImageCollection-like object (mock exposes sort)
    expect(result.sort).toBeDefined();

    // Inspect the images passed to fromImages: ensure they have metadata set
    const callArg = _ee_api_js_worker.default.ImageCollection.fromImages.mock.calls[0][0];
    if (Array.isArray(callArg)) {
      callArg.forEach(img => {
        expect(img._meta).toBeDefined();
        expect(img._meta).toHaveProperty('system:time_start');
        expect(img._meta).toHaveProperty('system:time_end');
        expect(img._meta).toHaveProperty('year');
        // For monthly weighted, month should be present
        expect(img._meta).toHaveProperty('month');
      });
    }
  });
  test('aggregateTemporalWeighted weekly returns ImageCollection and includes week metadata', () => {
    const collection = _ee_api_js_worker.default.ImageCollection();
    const result = (0, _ee_worker_utils.aggregateTemporalWeighted)({
      collection,
      year: 2020,
      periodReducer: 'EE_WEEKLY_WEIGHTED'
    });

    // fromImages should have been called to build the weighted collection
    expect(_ee_api_js_worker.default.ImageCollection.fromImages).toHaveBeenCalled();

    // Result should be an ImageCollection-like object (mock exposes sort)
    expect(result.sort).toBeDefined();

    // Inspect the images passed to fromImages: ensure they have metadata set and include week
    const callArg = _ee_api_js_worker.default.ImageCollection.fromImages.mock.calls[0][0];
    if (Array.isArray(callArg)) {
      callArg.forEach(img => {
        expect(img._meta).toBeDefined();
        expect(img._meta).toHaveProperty('system:time_start');
        expect(img._meta).toHaveProperty('system:time_end');
        expect(img._meta).toHaveProperty('year');
        // Weekly aggregation should include a week property
        expect(img._meta).toHaveProperty('week');
      });
    }
  });
  test('getAggregatorFn returns correct aggregator function', () => {
    const fnWeighted = (0, _ee_worker_utils.getAggregatorFn)('EE_MONTHLY_WEIGHTED');
    const fnNormal = (0, _ee_worker_utils.getAggregatorFn)('EE_MONTHLY');
    expect(fnWeighted).toBe(_ee_worker_utils.aggregateTemporalWeighted);
    expect(fnNormal).toBe(_ee_worker_utils.aggregateTemporal);
  });
});