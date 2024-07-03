function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import Map from '../Map';
jest.mock('maplibre-gl', () => {
  const actualMapLibreGl = jest.requireActual('maplibre-gl');
  class MockMap {
    constructor() {
      Object.assign(this, mockMapGL);
    }
  }
  return _objectSpread(_objectSpread({}, actualMapLibreGl), {}, {
    Map: MockMap
  });
});
jest.mock('../earthengine/ee_worker_loader', () => ({
  __esModule: true,
  default: jest.fn()
}));
describe('DHIS2 Maps-gl Map', () => {
  it('should initialize correctly', () => {
    const map = new Map('el');
    const mapgl = map.getMapGL();
    expect(mapgl).not.toBe(undefined);
    expect(mapgl).toEqual(mockMapGL);
    expect(mapgl.on).toHaveBeenCalledTimes(10);
  });
  it('should set layer feature hover state', () => {
    const map = new Map('el');
    const mapgl = map.getMapGL();
    const getSourceMock = mapgl.getSource;
    const setFeatureStateSpy = jest.spyOn(map, 'setFeatureState');
    const feature = {
      id: 1,
      source: 'abc'
    };
    mapgl.getSource.mockReturnValue(true);
    expect(map._hoverFeatures).toBe(undefined);
    map.setHoverState([feature]);
    expect(map._hoverFeatures).toStrictEqual([feature]);
    expect(setFeatureStateSpy).toHaveBeenCalled();
    expect(setFeatureStateSpy).lastCalledWith(feature, {
      hover: true
    });
    expect(getSourceMock).toHaveBeenCalled();
    expect(mapgl.setFeatureState).lastCalledWith(feature, {
      hover: true
    });
    map.setHoverState(null);
    expect(map._hoverFeatures).toBe(null);
    expect(setFeatureStateSpy).toHaveBeenCalledTimes(2);
    expect(setFeatureStateSpy).lastCalledWith(feature, {
      hover: false
    });
    expect(getSourceMock).toHaveBeenCalledTimes(2);
    expect(mapgl.setFeatureState).lastCalledWith(feature, {
      hover: false
    });
  });
});