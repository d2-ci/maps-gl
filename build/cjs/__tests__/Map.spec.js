"use strict";

var _Map = _interopRequireDefault(require("../Map"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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
    const map = new _Map.default('el');
    const mapgl = map.getMapGL();
    expect(mapgl).not.toBe(undefined);
    expect(mapgl).toEqual(mockMapGL);
    expect(mapgl.on).toHaveBeenCalledTimes(10);
  });
  it('should set layer feature hover state', () => {
    const map = new _Map.default('el');
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