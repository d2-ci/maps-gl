"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.widthExpr = exports.radiusExpr = exports.highlightColorExpr = exports.colorExpr = exports.clusterRadiusExpr = void 0;
var _filters = require("./filters.js");
var _style = require("./style.js");
// Returns color from feature with fallback
const colorExpr = color => ['case', ['has', 'color'], ['get', 'color'], color];

// Returns width (weight) from feature with fallback; boosted on hover/selection
exports.colorExpr = colorExpr;
const widthExpr = (width = _style.strokeWidth) => ['*', ['case', ['has', 'weight'], ['get', 'weight'], width], ['case', ['any', _filters.isHover, _filters.isSelected], _style.hoverStrokeMultiplier, 1]];

// On hover/selection, swaps in the color from feature-state (set by
// Layer#highlight/#select), else returns `fallback`.
exports.widthExpr = widthExpr;
const highlightColorExpr = fallback => ['case', ['any', _filters.isHover, _filters.isSelected], ['coalesce', ['feature-state', 'highlightColor'], fallback], fallback];

// Returns radius from feature with fallback
exports.highlightColorExpr = highlightColorExpr;
const radiusExpr = radius => ['case', ['has', 'radius'], ['get', 'radius'], radius];

// Returns cluster radius
exports.radiusExpr = radiusExpr;
const clusterRadiusExpr = exports.clusterRadiusExpr = ['step', ['get', 'point_count'], 15, 10, 20, 1000, 25, 10000, 30];