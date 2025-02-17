"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.widthExpr = exports.radiusExpr = exports.colorExpr = exports.clusterRadiusExpr = void 0;
var _filters = require("./filters");
var _style = require("./style");
// Returns color from feature with fallback
const colorExpr = color => ['case', ['has', 'color'], ['get', 'color'], color];

// Returns width (weight) from feature with fallback and hover support
exports.colorExpr = colorExpr;
const widthExpr = function () {
  let width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _style.strokeWidth;
  return ['*', ['case', ['has', 'weight'], ['get', 'weight'], width], ['case', _filters.isHover, _style.hoverStrokeMultiplier, 1]];
};

// Returns radius from feature with fallback
exports.widthExpr = widthExpr;
const radiusExpr = radius => ['case', ['has', 'radius'], ['get', 'radius'], radius];

// Returns cluster radius
exports.radiusExpr = radiusExpr;
const clusterRadiusExpr = exports.clusterRadiusExpr = ['step', ['get', 'point_count'], 15, 10, 20, 1000, 25, 10000, 30];