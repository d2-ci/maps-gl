"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.symbolLayer = exports.polygonLayer = exports.pointLayer = exports.outlineLayer = exports.lineLayer = exports.clusterLayer = exports.clusterCountLayer = exports.OVERLAY_START_POSITION = exports.BASEMAP_POSITION = void 0;
var _expressions = require("./expressions.js");
var _filters = require("./filters.js");
var _style = require("./style.js");
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
      'circle-color': (0, _expressions.colorExpr)(color || _style.noDataColor),
      'circle-radius': (0, _expressions.radiusExpr)(radius || _style.circleRadius),
      'circle-opacity': opacity ?? _style.circleOpacity,
      'circle-stroke-width': (0, _expressions.widthExpr)(width),
      'circle-stroke-color': strokeColor || _style.circleStrokeColor,
      'circle-stroke-opacity': opacity ?? _style.circleOpacity
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
      'line-color': color || _style.lineStrokeColor,
      'line-width': (0, _expressions.widthExpr)(width),
      'line-opacity': opacity ?? _style.lineOpacity
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
      'fill-color': (0, _expressions.colorExpr)(color || _style.noDataColor),
      'fill-opacity': opacity ?? _style.fillOpacity
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
      'line-color': color || _style.lineStrokeColor,
      'line-width': (0, _expressions.widthExpr)(width),
      'line-opacity': opacity ?? _style.lineOpacity
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
      'icon-opacity': opacity ?? _style.iconOpacity
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
      'circle-opacity': opacity ?? _style.circleOpacity,
      'circle-stroke-color': strokeColor,
      'circle-stroke-width': _style.strokeWidth,
      'circle-stroke-opacity': opacity ?? _style.circleOpacity
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
      'text-font': _style.textFont,
      'text-size': _style.textSize,
      'text-allow-overlap': true
    },
    paint: {
      'text-color': color || _style.textColor,
      'text-opacity': opacity ?? _style.textOpacity
    }
  };
};
exports.clusterCountLayer = clusterCountLayer;