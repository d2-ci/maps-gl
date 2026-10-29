"use strict";

var _highlightOverlay = require("../../utils/highlightOverlay.js");
var _LayerGroup = _interopRequireDefault(require("../LayerGroup.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /* global mockMap, mockMapGL */
jest.mock('../../utils/highlightOverlay.js');
const createMockSubLayer = (id, featureId) => ({
  id,
  getId: () => id,
  hasLayerId: layerId => layerId === id,
  getLayers: () => [{
    id
  }],
  getFeaturesById: fid => fid === featureId ? [{
    id: featureId,
    source: id
  }] : [],
  addTo: jest.fn(),
  removeFrom: jest.fn(),
  setIndex: jest.fn(),
  setOpacity: jest.fn(),
  setVisibility: jest.fn(),
  isOnMap: () => true,
  isInteractive: () => true,
  getInteractiveIds: () => [id],
  move: jest.fn(),
  onMouseMove: jest.fn(),
  fire: jest.fn(),
  setVisibleIds: jest.fn(),
  handlesMouseEnter: jest.fn(() => false)
});
describe('LayerGroup', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should handle mouseenter as soon as one sub-layer does, e.g. the bubbles of a bubble map but not its boundaries', () => {
    const group = new _LayerGroup.default();
    const boundaries = createMockSubLayer('boundaries', 1);
    const bubbles = createMockSubLayer('bubbles', 1);
    group._layers = [boundaries, bubbles];
    expect(group.handlesMouseEnter()).toBe(false);
    bubbles.handlesMouseEnter.mockReturnValue(true);
    expect(group.handlesMouseEnter()).toBe(true);
  });
  it('should resolve a sub-layer by its GL layer id', () => {
    const group = new _LayerGroup.default();
    const layerA = createMockSubLayer('layer-a', 1);
    const layerB = createMockSubLayer('layer-b', 2);
    group._layers = [layerA, layerB];
    expect(group.getSubLayerFromId('layer-b')).toBe(layerB);
    expect(group.getSubLayerFromId('missing')).toBeUndefined();
  });
  it("should update each sub-layer's own highlight overlay directly, not a second group-level one", () => {
    const group = new _LayerGroup.default();
    const layerA = createMockSubLayer('layer-a', 1);
    const layerB = createMockSubLayer('layer-b', 2);
    group._layers = [layerA, layerB];
    group._map = mockMap;
    group.highlight([1, 2]);
    expect(_highlightOverlay.updateHighlightOverlay).toHaveBeenCalledTimes(2);
    expect(_highlightOverlay.updateHighlightOverlay).toHaveBeenCalledWith(mockMap, {
      id: 'layer-a',
      features: [{
        id: 1,
        source: 'layer-a'
      }],
      color: undefined
    });
    expect(_highlightOverlay.updateHighlightOverlay).toHaveBeenCalledWith(mockMap, {
      id: 'layer-b',
      features: [{
        id: 2,
        source: 'layer-b'
      }],
      color: undefined
    });
    expect(mockMap.setHoverState).not.toHaveBeenCalled();
  });
  it("should clear each sub-layer's overlay for an empty array or null", () => {
    const group = new _LayerGroup.default();
    group._layers = [createMockSubLayer('layer-a', 1)];
    group._map = mockMap;
    group.highlight([]);
    expect(_highlightOverlay.updateHighlightOverlay).toHaveBeenLastCalledWith(mockMap, {
      id: 'layer-a',
      features: [],
      color: undefined
    });
    group.highlight(null);
    expect(_highlightOverlay.updateHighlightOverlay).toHaveBeenLastCalledWith(mockMap, {
      id: 'layer-a',
      features: [],
      color: undefined
    });
  });
  it('should no-op when not yet added to a map', () => {
    const group = new _LayerGroup.default();
    group._layers = [createMockSubLayer('layer-a', 1)];
    expect(() => group.highlight([1])).not.toThrow();
    expect(mockMapGL.setFeatureState).not.toHaveBeenCalled();
    expect(_highlightOverlay.updateHighlightOverlay).not.toHaveBeenCalled();
  });
  it("should update each sub-layer's own overlay with selected ids", () => {
    const group = new _LayerGroup.default();
    const layerA = createMockSubLayer('layer-a', 1);
    const layerB = createMockSubLayer('layer-b', 2);
    group._layers = [layerA, layerB];
    group._map = mockMap;
    group.select([1, 2]);
    expect(_highlightOverlay.updateHighlightOverlay).toHaveBeenCalledTimes(2);
    expect(_highlightOverlay.updateHighlightOverlay).toHaveBeenCalledWith(mockMap, {
      id: 'layer-a',
      features: [{
        id: 1,
        source: 'layer-a'
      }],
      color: undefined
    });
    expect(_highlightOverlay.updateHighlightOverlay).toHaveBeenCalledWith(mockMap, {
      id: 'layer-b',
      features: [{
        id: 2,
        source: 'layer-b'
      }],
      color: undefined
    });
    expect(mockMap.setHoverState).not.toHaveBeenCalled();
  });
  it('should not conflate two sub-layers whose features happen to share the same numeric id', () => {
    // Sub-layers number their features from 1, so ids repeat across sub-layers
    const group = new _LayerGroup.default();
    const layerA = createMockSubLayer('layer-a', 1);
    const layerB = createMockSubLayer('layer-b', 1);
    group._layers = [layerA, layerB];
    group._map = mockMap;
    group.highlight([1]);
    expect(_highlightOverlay.updateHighlightOverlay).toHaveBeenCalledWith(mockMap, {
      id: 'layer-a',
      features: [{
        id: 1,
        source: 'layer-a'
      }],
      color: undefined
    });
    expect(_highlightOverlay.updateHighlightOverlay).toHaveBeenCalledWith(mockMap, {
      id: 'layer-b',
      features: [{
        id: 1,
        source: 'layer-b'
      }],
      color: undefined
    });
  });
  it("should replay a pending highlight into each sub-layer's overlay once addTo() resolves, e.g. after a style reload", async () => {
    const group = new _LayerGroup.default();
    const layerA = createMockSubLayer('layer-a', 1);
    group._layers = [layerA];
    group._map = mockMap;
    group.highlight([1], '#FFC800');
    _highlightOverlay.updateHighlightOverlay.mockClear();

    // Re-adding recreates each sub-layer's overlay
    await group.addTo(mockMap);
    expect(_highlightOverlay.updateHighlightOverlay).toHaveBeenCalledWith(mockMap, {
      id: 'layer-a',
      features: [{
        id: 1,
        source: 'layer-a'
      }],
      color: '#FFC800'
    });
  });
  it('should not pass unchanged visible ids on to its sub-layers', () => {
    const group = new _LayerGroup.default();
    const layerA = createMockSubLayer('layer-a', 1);
    group._layers = [layerA];
    group.setVisibleIds(['a']);
    group.setVisibleIds(['a']);
    expect(layerA.setVisibleIds).toHaveBeenCalledTimes(1);
  });
  it('should pass visible ids set before its first add to the sub-layers it then creates', async () => {
    const subLayer = createMockSubLayer('layer-a', 1);
    const map = _objectSpread(_objectSpread({}, mockMap), {}, {
      createLayer: () => subLayer
    });
    const group = new _LayerGroup.default();
    group.addLayer({
      type: 'boundary'
    });
    group.setVisibleIds(['a']);
    await group.addTo(map);
    expect(subLayer.setVisibleIds).toHaveBeenCalledWith(['a']);
  });
  it('should stop drawing on its map once removed, which may be destroyed by then', () => {
    const group = new _LayerGroup.default();
    group._layers = [createMockSubLayer('layer-a', 1)];
    group._map = mockMap;
    group.removeFrom(mockMap);
    group.highlight([1]);
    expect(group.getMap()).toBeNull();
    expect(_highlightOverlay.updateHighlightOverlay).not.toHaveBeenCalled();
  });
  it('should keep a highlight and selection made while off the map, e.g. during a basemap switch, and draw them once added', async () => {
    const group = new _LayerGroup.default();
    const layerA = createMockSubLayer('layer-a', 1);
    group._layers = [layerA];
    group.highlight([1], '#FFC800');
    group.select([1], '#FFC800');
    expect(_highlightOverlay.updateHighlightOverlay).not.toHaveBeenCalled();
    await group.addTo(mockMap);
    expect(_highlightOverlay.updateHighlightOverlay).toHaveBeenCalledWith(mockMap, {
      id: 'layer-a',
      features: [{
        id: 1,
        source: 'layer-a'
      }],
      color: '#FFC800'
    });
  });
  it("should drop a hovered/selected id from each sub-layer's overlay once setVisibleIds() filters it out", () => {
    const group = new _LayerGroup.default();
    const layerA = createMockSubLayer('layer-a', 1);
    group._layers = [layerA];
    group._map = mockMap;
    group.highlight([1]);
    _highlightOverlay.updateHighlightOverlay.mockClear();
    group.setVisibleIds(['some-other-id']);
    expect(_highlightOverlay.updateHighlightOverlay).toHaveBeenLastCalledWith(mockMap, {
      id: 'layer-a',
      features: [],
      color: undefined
    });
  });
  it("should restore a hovered/selected id to each sub-layer's overlay once setVisibleIds() clears the restriction that had hidden it", () => {
    const group = new _LayerGroup.default();
    const layerA = createMockSubLayer('layer-a', 1);
    group._layers = [layerA];
    group._map = mockMap;
    group.highlight([1]);
    group.setVisibleIds(['some-other-id']);
    _highlightOverlay.updateHighlightOverlay.mockClear();
    group.setVisibleIds(null);
    expect(_highlightOverlay.updateHighlightOverlay).toHaveBeenLastCalledWith(mockMap, {
      id: 'layer-a',
      features: [{
        id: 1,
        source: 'layer-a'
      }],
      color: undefined
    });
  });
  it('should restrict rendered features to the given ids across all sub-layers', () => {
    const group = new _LayerGroup.default();
    const layerA = createMockSubLayer('layer-a', 1);
    const layerB = createMockSubLayer('layer-b', 2);
    group._layers = [layerA, layerB];
    group.setVisibleIds(['O6uvpzGd5pu']);
    expect(layerA.setVisibleIds).toHaveBeenCalledWith(['O6uvpzGd5pu']);
    expect(layerB.setVisibleIds).toHaveBeenCalledWith(['O6uvpzGd5pu']);
  });
  it('should wire its contextmenu listener synchronously, before sub-layers finish loading, so an event during that window is not dropped', () => {
    const group = new _LayerGroup.default();
    const layerA = createMockSubLayer('layer-a', 1);
    // A sub-layer whose own addTo() is still pending (e.g. loading images)
    layerA.addTo = jest.fn(() => new Promise(() => {}));
    group._layers = [layerA];
    group.addTo(mockMap); // not awaited, mirroring Map#addLayer's timing

    group.fire('contextmenu', {
      feature: {
        layer: {
          id: 'layer-a'
        }
      }
    });
    expect(layerA.fire).toHaveBeenCalledWith('contextmenu', expect.objectContaining({
      feature: expect.anything()
    }));
  });
  it('should move each sub-layer (each sub-layer repositions its own overlay itself; the group has none of its own)', () => {
    const group = new _LayerGroup.default();
    const layerA = createMockSubLayer('layer-a', 1);
    const layerB = createMockSubLayer('layer-b', 2);
    group._layers = [layerA, layerB];
    group._map = mockMap;
    group.move();
    expect(layerA.move).toHaveBeenCalled();
    expect(layerB.move).toHaveBeenCalled();
    expect(mockMapGL.moveLayer).not.toHaveBeenCalled();
  });
});