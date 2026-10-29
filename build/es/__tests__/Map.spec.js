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
jest.mock('../utils/rtlText.js', () => ({
  loadRTLTextPlugin: jest.fn()
}));
describe('DHIS2 Maps-gl Map', () => {
  it('should initialize correctly', () => {
    const map = new Map('el');
    const mapgl = map.getMapGL();
    expect(mapgl).not.toBe(undefined);
    expect(mapgl).toEqual(global.mockMapGL);
    expect(mapgl.on).toHaveBeenCalledTimes(10);
  });
  it('should forward mousemove to the hovered layer and set the cursor when mousemove enabled', () => {
    const map = new Map('el');
    const mockLayer = {
      isInteractive: () => true,
      getInteractiveIds: () => ['layer-1'],
      getFeaturesById: () => [{
        id: 1,
        source: 'abc'
      }],
      hasLayerId: id => id === 'layer-1',
      getIndex: () => 0,
      onMouseMove: jest.fn(),
      fire: jest.fn(),
      handlesMouseEnter: jest.fn(() => false),
      highlight: jest.fn()
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
    const canvas = {
      style: {}
    };
    map.getMapGL().getCanvas = jest.fn(() => canvas);
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
    expect(mockLayer.onMouseMove).toHaveBeenCalled();
    expect(canvas.style.cursor).toBe('pointer');
  });
  it('should not resolve a hovered feature on mousemove when mousemove disabled', () => {
    const map = new Map('el');
    const mockLayer = {
      isInteractive: () => true,
      getInteractiveIds: () => ['layer-1'],
      hasLayerId: id => id === 'layer-1',
      getIndex: () => 0,
      onMouseMove: jest.fn(),
      fire: jest.fn()
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
    map.setMouseMoveEnabled(false);
    map.onMouseMove({
      point: {},
      features: [{
        id: 1,
        source: 'abc'
      }]
    });
    expect(mockLayer.onMouseMove).not.toHaveBeenCalled();
  });
  describe('click events', () => {
    const setUpClickableLayer = (map, layerId, featureId) => {
      const mockLayer = {
        onClick: jest.fn(),
        hasLayerId: id => id === layerId,
        isInteractive: () => true,
        getInteractiveIds: () => [layerId]
      };
      map._layers = [mockLayer];
      jest.spyOn(map, 'getLayers').mockReturnValue([mockLayer]);
      jest.spyOn(map, 'getLayerFromId').mockReturnValue(mockLayer);
      map.getMapGL().project = jest.fn(() => ({
        x: 1,
        y: 2
      }));
      map.getMapGL().queryRenderedFeatures = jest.fn(() => [{
        id: featureId,
        layer: {
          id: layerId
        },
        properties: {
          id: featureId
        }
      }]);
      return mockLayer;
    };
    it('passes ctrlKey/metaKey through to the click event', () => {
      const map = new Map('el');
      const mockLayer = setUpClickableLayer(map, 'layer-1', 1);
      map.onClick({
        lngLat: {
          lng: 1,
          lat: 2
        },
        originalEvent: {
          ctrlKey: true,
          metaKey: false
        }
      });
      expect(mockLayer.onClick).toHaveBeenCalledWith(expect.objectContaining({
        ctrlKey: true,
        metaKey: false
      }));
    });
    it('defaults ctrlKey/metaKey to false when there is no original DOM event', () => {
      const map = new Map('el');
      const mockLayer = setUpClickableLayer(map, 'layer-1', 1);
      map.onClick({
        lngLat: {
          lng: 1,
          lat: 2
        }
      });
      expect(mockLayer.onClick).toHaveBeenCalledWith(expect.objectContaining({
        ctrlKey: false,
        metaKey: false
      }));
    });
  });
  describe('mouseenter/mouseleave', () => {
    const createMockLayer = (layerId, featureId) => ({
      isInteractive: () => true,
      getInteractiveIds: () => [layerId],
      getFeaturesById: () => [{
        id: featureId,
        source: 'abc'
      }],
      hasLayerId: id => id === layerId,
      getIndex: () => 0,
      onMouseMove: jest.fn(),
      fire: jest.fn(),
      handlesMouseEnter: jest.fn(() => false),
      highlight: jest.fn()
    });
    const moveTo = (map, layerId, featureId) => {
      map.getMapGL().queryRenderedFeatures = jest.fn(() => [{
        id: featureId,
        source: 'abc',
        layer: {
          id: layerId
        },
        properties: {
          id: featureId
        }
      }]);
      map.onMouseMove({
        point: {}
      });
    };
    const moveOffFeatures = map => {
      map.getMapGL().queryRenderedFeatures = jest.fn(() => []);
      map.onMouseMove({
        point: {}
      });
    };
    it('fires mouseenter once when hovering onto a feature, not on every tick', () => {
      const map = new Map('el');
      const mockLayer = createMockLayer('layer-1', 1);
      map._layers = [mockLayer];
      jest.spyOn(map, 'getLayers').mockReturnValue([mockLayer]);
      map.setMouseMoveEnabled(true);
      moveTo(map, 'layer-1', 1);
      moveTo(map, 'layer-1', 1);
      expect(mockLayer.fire).toHaveBeenCalledTimes(1);
      expect(mockLayer.fire).toHaveBeenCalledWith('mouseenter', expect.objectContaining({
        feature: expect.anything()
      }));
    });
    it('fires mouseenter for a feature whose id is 0, not treating it as "no feature"', () => {
      const map = new Map('el');
      const mockLayer = createMockLayer('layer-1', 0);
      map._layers = [mockLayer];
      jest.spyOn(map, 'getLayers').mockReturnValue([mockLayer]);
      map.setMouseMoveEnabled(true);
      moveTo(map, 'layer-1', 0);
      expect(mockLayer.fire).toHaveBeenCalledWith('mouseenter', expect.objectContaining({
        feature: expect.anything()
      }));
    });
    it('fires mouseleave on the old target and mouseenter on the new one when the hovered feature changes', () => {
      const map = new Map('el');
      const layerA = createMockLayer('layer-a', 1);
      const layerB = createMockLayer('layer-b', 2);
      map._layers = [layerA, layerB];
      jest.spyOn(map, 'getLayers').mockReturnValue([layerA, layerB]);
      map.setMouseMoveEnabled(true);
      moveTo(map, 'layer-a', 1);
      layerA.fire.mockClear();
      moveTo(map, 'layer-b', 2);
      expect(layerA.fire).toHaveBeenCalledWith('mouseleave');
      expect(layerB.fire).toHaveBeenCalledWith('mouseenter', expect.objectContaining({
        feature: expect.anything()
      }));
    });
    it('fires mouseleave on mouseout and resets tracked hover state', () => {
      const map = new Map('el');
      const mockLayer = createMockLayer('layer-1', 1);
      map._layers = [mockLayer];
      jest.spyOn(map, 'getLayers').mockReturnValue([mockLayer]);
      map.setMouseMoveEnabled(true);
      moveTo(map, 'layer-1', 1);
      mockLayer.fire.mockClear();
      map.onMouseOut({});
      expect(mockLayer.fire).toHaveBeenCalledWith('mouseleave');
      expect(map._hoveredLayer).toBeNull();
      expect(map._hoveredFeatureId).toBeNull();
    });
    describe('hover highlight', () => {
      it('highlights the hovered feature when the layer does not handle mouseenter', () => {
        const map = new Map('el');
        const mockLayer = createMockLayer('layer-1', 1);
        map._layers = [mockLayer];
        jest.spyOn(map, 'getLayers').mockReturnValue([mockLayer]);
        map.setMouseMoveEnabled(true);
        moveTo(map, 'layer-1', 1);
        expect(mockLayer.highlight).toHaveBeenCalledWith(1);
      });
      it('leaves highlighting to the layer when it handles mouseenter', () => {
        const map = new Map('el');
        const mockLayer = createMockLayer('layer-1', 1);
        mockLayer.handlesMouseEnter.mockReturnValue(true);
        map._layers = [mockLayer];
        jest.spyOn(map, 'getLayers').mockReturnValue([mockLayer]);
        map.setMouseMoveEnabled(true);
        moveTo(map, 'layer-1', 1);
        moveOffFeatures(map);
        expect(mockLayer.highlight).not.toHaveBeenCalled();
      });
      it('clears the highlight when the mouse moves off the feature', () => {
        const map = new Map('el');
        const mockLayer = createMockLayer('layer-1', 1);
        map._layers = [mockLayer];
        jest.spyOn(map, 'getLayers').mockReturnValue([mockLayer]);
        map.setMouseMoveEnabled(true);
        moveTo(map, 'layer-1', 1);
        moveOffFeatures(map);
        expect(mockLayer.highlight).toHaveBeenLastCalledWith(null);
      });
      it('moves the highlight to the newly hovered layer', () => {
        const map = new Map('el');
        const layerA = createMockLayer('layer-a', 1);
        const layerB = createMockLayer('layer-b', 2);
        map._layers = [layerA, layerB];
        jest.spyOn(map, 'getLayers').mockReturnValue([layerA, layerB]);
        map.setMouseMoveEnabled(true);
        moveTo(map, 'layer-a', 1);
        moveTo(map, 'layer-b', 2);
        expect(layerA.highlight).toHaveBeenLastCalledWith(null);
        expect(layerB.highlight).toHaveBeenCalledWith(2);
      });
      it('highlights the next feature of the same layer without clearing in between', () => {
        const map = new Map('el');
        const mockLayer = createMockLayer('layer-1', 1);
        map._layers = [mockLayer];
        jest.spyOn(map, 'getLayers').mockReturnValue([mockLayer]);
        map.setMouseMoveEnabled(true);
        moveTo(map, 'layer-1', 1);
        moveTo(map, 'layer-1', 2);
        expect(mockLayer.highlight.mock.calls).toEqual([[1], [2]]);
      });
      it('clears the highlight on mouseout', () => {
        const map = new Map('el');
        const mockLayer = createMockLayer('layer-1', 1);
        map._layers = [mockLayer];
        jest.spyOn(map, 'getLayers').mockReturnValue([mockLayer]);
        map.setMouseMoveEnabled(true);
        moveTo(map, 'layer-1', 1);
        map.onMouseOut({});
        expect(mockLayer.highlight).toHaveBeenLastCalledWith(null);
      });
      it('highlights through a layer group so the id is highlighted in all its sub-layers', () => {
        const map = new Map('el');
        const subLayer = {
          fire: jest.fn(),
          highlight: jest.fn()
        };
        const group = _objectSpread(_objectSpread({}, createMockLayer('sub-1', 1)), {}, {
          getSubLayerFromId: () => subLayer
        });
        map._layers = [group];
        jest.spyOn(map, 'getLayers').mockReturnValue([group]);
        map.setMouseMoveEnabled(true);
        moveTo(map, 'sub-1', 1);
        expect(subLayer.fire).toHaveBeenCalledWith('mouseenter', expect.objectContaining({
          feature: expect.anything()
        }));
        expect(group.highlight).toHaveBeenCalledWith(1);
        expect(subLayer.highlight).not.toHaveBeenCalled();
      });
      it('leaves every sub-layer of a group to the app when it handles mouseenter on one of them, so its hover and selection colors are not overwritten', () => {
        const map = new Map('el');
        const boundarySubLayer = {
          fire: jest.fn(),
          highlight: jest.fn()
        };
        const group = _objectSpread(_objectSpread({}, createMockLayer('boundary-1', 1)), {}, {
          getSubLayerFromId: () => boundarySubLayer
        });
        group.handlesMouseEnter.mockReturnValue(true);
        map._layers = [group];
        jest.spyOn(map, 'getLayers').mockReturnValue([group]);
        map.setMouseMoveEnabled(true);
        moveTo(map, 'boundary-1', 1);
        moveOffFeatures(map);
        expect(boundarySubLayer.fire).toHaveBeenCalledWith('mouseenter', expect.objectContaining({
          feature: expect.anything()
        }));
        expect(group.highlight).not.toHaveBeenCalled();
      });
    });
  });
  it('does not throw when checking the before layer id while the style is loading', () => {
    const map = new Map('el');
    map.setBeforeLayerId('label-layer');
    map._styleIsLoading = true;
    expect(() => map.getBeforeLayerId()).not.toThrow();
    expect(map.getBeforeLayerId()).toBeUndefined();
  });
  it('returns the before layer id once the style is loaded and the layer exists', () => {
    const map = new Map('el');
    map.setBeforeLayerId('label-layer');
    map.getMapGL().getLayer.mockReturnValueOnce({
      id: 'label-layer'
    });
    map.getMapGL().getStyle.mockClear();
    expect(map.getBeforeLayerId()).toBe('label-layer');
    expect(map.getMapGL().getStyle).not.toHaveBeenCalled();
  });
  it('returns no before layer id when the layer is not in the style', () => {
    const map = new Map('el');
    map.setBeforeLayerId('label-layer');
    expect(map.getBeforeLayerId()).toBeUndefined();
  });
});