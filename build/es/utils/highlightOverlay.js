function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { highlightColorExpr } from './expressions.js';
import { featureCollection } from './geometry.js';

// Only circle/line paint reacts to hover/selected feature-state
// Cloning a fill layer would double-render the same fill
const CLONEABLE_TYPES = ['circle', 'line'];

// Icon layers have no paint property that reacts to feature-state
// Instead we add a colored halo behind a plain clone of the icon
const ICON_HALO_RADIUS = 14;
const ICON_HALO_BLUR = 0.6;
const ICON_HALO_OPACITY = 0.6;
const iconHighlightHalo = layer => ({
  id: `${layer.id}-highlight-halo`,
  type: 'circle',
  // Reuse the base layer's filter
  filter: layer.filter,
  paint: {
    'circle-color': highlightColorExpr('#333333'),
    'circle-radius': ICON_HALO_RADIUS,
    'circle-blur': ICON_HALO_BLUR,
    'circle-opacity': ICON_HALO_OPACITY
  }
});

// Text labels are also `type: 'symbol'` in maplibre-gl but have no icon-image
const isIconLayer = layer => layer.type === 'symbol' && layer.layout?.['icon-image'] !== undefined;
export const getOverlaySourceId = id => `${id}-highlight`;

// Creates a small overlay source + cloned layers, drawn above the base
// layers they came from, only ever holds the currently hover/selected features
export const createHighlightOverlay = (map, {
  id,
  glLayers,
  beforeId
}) => {
  const mapgl = map.getMapGL();
  const sourceId = getOverlaySourceId(id);
  if (!mapgl.getSource(sourceId)) {
    mapgl.addSource(sourceId, {
      type: 'geojson',
      data: featureCollection()
    });
  }
  const addOverlayLayer = overlayLayer => {
    if (!mapgl.getLayer(overlayLayer.id)) {
      mapgl.addLayer(_objectSpread(_objectSpread({}, overlayLayer), {}, {
        source: sourceId
      }), beforeId);
    }
    return overlayLayer.id;
  };
  return glLayers.flatMap(layer => {
    if (isIconLayer(layer)) {
      // Halo first, so the icon clone renders on top of it
      return [addOverlayLayer(iconHighlightHalo(layer)), addOverlayLayer(_objectSpread(_objectSpread({}, layer), {}, {
        id: `${layer.id}-highlight-icon`
      }))];
    }
    if (CLONEABLE_TYPES.includes(layer.type)) {
      return [addOverlayLayer(_objectSpread(_objectSpread({}, layer), {}, {
        id: `${layer.id}-highlight`
      }))];
    }
    return [];
  });
};

// Replaces the overlay's contents with `features` and marks them
// hover+selected so the cloned paint renders the highlighted look
export const updateHighlightOverlay = (map, {
  id,
  features,
  color
}) => {
  const mapgl = map.getMapGL();
  const sourceId = getOverlaySourceId(id);
  const source = mapgl.getSource(sourceId);
  if (!source) {
    return;
  }

  // Re-key to ids local to this source
  const overlayFeatures = features.map((feature, index) => _objectSpread(_objectSpread({}, feature), {}, {
    id: index + 1
  }));
  source.setData(featureCollection(overlayFeatures));
  overlayFeatures.forEach(feature => mapgl.setFeatureState({
    source: sourceId,
    id: feature.id
  }, {
    hover: true,
    selected: true,
    highlightColor: color
  }));
};
export const removeHighlightOverlay = (map, id, overlayLayerIds = []) => {
  const mapgl = map.getMapGL();
  const sourceId = getOverlaySourceId(id);
  if (!mapgl) {
    return;
  }
  overlayLayerIds.forEach(layerId => {
    if (mapgl.getLayer(layerId)) {
      mapgl.removeLayer(layerId);
    }
  });
  if (mapgl.getSource(sourceId)) {
    mapgl.removeSource(sourceId);
  }
};