function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import Map from '../Map.js';
jest.mock('maplibre-gl', () => {
  const actualMapLibreGl = jest.requireActual('maplibre-gl');
  class MockMap {
    constructor() {
      Object.assign(this, global.mockMapGL);
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
    expect(mapgl).toEqual(global.mockMapGL);
    expect(mapgl.on).toHaveBeenCalledTimes(10);
  });
  it('should call setHoverState on mousemove when mousemove enabled', () => {
    const map = new Map('el');
    const setHoverStateSpy = jest.spyOn(map, 'setHoverState');
    const mockLayer = {
      isInteractive: () => true,
      getInteractiveIds: () => ['layer-1'],
      getFeaturesById: () => [{
        id: 1,
        source: 'abc'
      }],
      hasLayerId: id => id === 'layer-1',
      getIndex: () => 0,
      onMouseMove: jest.fn()
    };
    map._layers = [mockLayer];
    jest.spyOn(map, 'getLayers').mockReturnValue([mockLayer]);
    map.getMapGL().queryRenderedFeatures = jest.fn(() => [{
      id: 1,
      source: 'abc',
      layer: {
        id: 'layer-1'
      },
      properties: {
        id: 1
      }
    }]);
    map.setMouseMoveEnabled(true);
    map.onMouseMove({
      point: {},
      features: [{
        id: 1,
        source: 'abc',
        layer: {
          id: 'layer-1'
        },
        properties: {
          id: 1
        }
      }]
    });
    expect(setHoverStateSpy).toHaveBeenCalledWith([{
      id: 1,
      source: 'abc'
    }]);
  });
  it('should not call setHoverState on mousemove when mousemove disabled', () => {
    const map = new Map('el');
    const setHoverStateSpy = jest.spyOn(map, 'setHoverState');
    map.setMouseMoveEnabled(false);
    map.onMouseMove({
      features: [{
        id: 1,
        source: 'abc'
      }]
    });
    expect(setHoverStateSpy).not.toHaveBeenCalled();
  });
});