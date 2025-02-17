"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.symbolLayer = exports.polygonLayer = exports.pointLayer = exports.outlineLayer = exports.lineLayer = exports.heatLayer = exports.clusterLayer = exports.clusterCountLayer = exports.OVERLAY_START_POSITION = exports.BASEMAP_POSITION = void 0;
var _filters = require("./filters");
var _expressions = require("./expressions");
var _style = _interopRequireDefault(require("./style"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const BASEMAP_POSITION = exports.BASEMAP_POSITION = 0;
const OVERLAY_START_POSITION = exports.OVERLAY_START_POSITION = 1;

// Layer with point features
const pointLayer = _ref => {
  let {
    id,
    color,
    strokeColor,
    width,
    radius,
    opacity,
    source,
    filter
  } = _ref;
  return {
    id: `${id}-point`,
    type: 'circle',
    source: source || id,
    paint: {
      'circle-color': (0, _expressions.colorExpr)(color || _style.default.noDataColor),
      'circle-radius': (0, _expressions.radiusExpr)(radius || _style.default.radius),
      'circle-opacity': opacity ?? _style.default.opacity,
      'circle-stroke-width': (0, _expressions.widthExpr)(width),
      'circle-stroke-color': strokeColor || _style.default.strokeColor,
      'circle-stroke-opacity': opacity ?? _style.default.opacity
    },
    filter: filter || _filters.isPointNoSymbol
  };
};

// Layer with line features
exports.pointLayer = pointLayer;
const lineLayer = _ref2 => {
  let {
    id,
    color,
    width,
    opacity,
    source,
    filter
  } = _ref2;
  return {
    id: `${id}-line`,
    type: 'line',
    source: source || id,
    paint: {
      'line-color': color || _style.default.strokeColor,
      'line-width': (0, _expressions.widthExpr)(width),
      'line-opacity': opacity ?? _style.default.opacity
    },
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    filter: filter || _filters.isLine
  };
};

// Layer with polygon features
exports.lineLayer = lineLayer;
const polygonLayer = _ref3 => {
  let {
    id,
    color,
    opacity,
    source,
    filter
  } = _ref3;
  return {
    id: `${id}-polygon`,
    type: 'fill',
    source: source || id,
    paint: {
      'fill-color': (0, _expressions.colorExpr)(color || _style.default.noDataColor),
      'fill-opacity': opacity ?? _style.default.opacity
    },
    filter: filter || _filters.isPolygon
  };
};

// Polygon outline and hover state
// https://github.com/mapbox/mapbox-gl-js/issues/3018
exports.polygonLayer = polygonLayer;
const outlineLayer = _ref4 => {
  let {
    id,
    color,
    width,
    opacity,
    source,
    filter
  } = _ref4;
  return {
    id: `${id}-outline`,
    type: 'line',
    source: source || id,
    paint: {
      'line-color': color || _style.default.strokeColor,
      'line-width': (0, _expressions.widthExpr)(width),
      'line-opacity': opacity ?? _style.default.opacity
    },
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    filter: filter || _filters.isPolygon
  };
};
exports.outlineLayer = outlineLayer;
const symbolLayer = _ref5 => {
  let {
    id,
    opacity,
    source,
    filter
  } = _ref5;
  return {
    id: `${id}-symbol`,
    type: 'symbol',
    source: source || id,
    layout: {
      'icon-image': ['get', 'iconUrl'],
      'icon-size': 1,
      'icon-allow-overlap': true
    },
    paint: {
      'icon-opacity': opacity ?? _style.default.opacity
    },
    filter: filter || _filters.isSymbol
  };
};

// Layer with cluster (circles)
exports.symbolLayer = symbolLayer;
const clusterLayer = _ref6 => {
  let {
    id,
    color,
    strokeColor,
    opacity
  } = _ref6;
  return {
    id: `${id}-cluster`,
    type: 'circle',
    source: id,
    filter: _filters.isCluster,
    paint: {
      'circle-color': color,
      'circle-radius': _expressions.clusterRadiusExpr,
      'circle-opacity': opacity ?? _style.default.opacity,
      'circle-stroke-color': strokeColor,
      'circle-stroke-width': _style.default.strokeWidth,
      'circle-stroke-opacity': opacity ?? _style.default.opacity
    }
  };
};

//  Layer with cluster counts (text)
exports.clusterLayer = clusterLayer;
const clusterCountLayer = _ref7 => {
  let {
    id,
    color,
    opacity
  } = _ref7;
  return {
    id: `${id}-count`,
    type: 'symbol',
    source: id,
    filter: _filters.isCluster,
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': _style.default.textFont,
      'text-size': _style.default.textSize,
      'text-allow-overlap': true
    },
    paint: {
      'text-color': color || _style.default.textColor,
      'text-opacity': opacity ?? _style.default.opacity
    }
  };
};

// Layer with heat surface
exports.clusterCountLayer = clusterCountLayer;
const heatLayer = _ref8 => {
  let {
    id,
    source
  } = _ref8;
  return {
    id: `${id}-heat`,
    type: 'heatmap',
    source: source || id,
    paint: {
      // Increase the heatmap weight based on frequency and property magnitude
      'heatmap-weight': 1,
      // Increase the heatmap color weight weight by zoom level
      // heatmap-intensity is a multiplier on top of heatmap-weight
      'heatmap-intensity': 1,
      // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
      // Begin color ramp at 0-stop with a 0-transparency color
      // to create a blur-like effect.
      'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(33,102,172,0)', 0.2, 'rgb(103,169,207)', 0.4, 'rgb(209,229,240)', 0.6, 'rgb(253,219,199)', 0.8, 'rgb(239,138,98)', 1, 'rgb(178,24,43)'],
      // Adjust the heatmap radius by zoom level
      'heatmap-radius': 30,
      // Transition from heatmap to circle layer by zoom level
      'heatmap-opacity': 1
    }
  };
};
exports.heatLayer = heatLayer;