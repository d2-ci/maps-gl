"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.textSize = exports.textFont = exports.textColor = exports.strokeWidth = exports.strokeColor = exports.radius = exports.opacity = exports.noDataColor = exports.mapStyle = exports.hoverStrokeMultiplier = exports.eventStrokeColor = exports.defaultGlyphs = exports.default = exports.clusterCountColor = void 0;
const textFont = ['Open Sans Bold'];
exports.textFont = textFont;
const textSize = 16;
exports.textSize = textSize;
const textColor = '#FFFFFF';
exports.textColor = textColor;
const radius = 6;
exports.radius = radius;
const noDataColor = '#CCCCCC';
exports.noDataColor = noDataColor;
const strokeColor = '#333333';
exports.strokeColor = strokeColor;
const strokeWidth = 1;
exports.strokeWidth = strokeWidth;
const hoverStrokeMultiplier = 3;
exports.hoverStrokeMultiplier = hoverStrokeMultiplier;
const eventStrokeColor = '#333333';
exports.eventStrokeColor = eventStrokeColor;
const clusterCountColor = '#000000';
exports.clusterCountColor = clusterCountColor;
const opacity = 1;
exports.opacity = opacity;
const defaultGlyphs = 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf';
exports.defaultGlyphs = defaultGlyphs;
const mapStyle = _ref => {
  let {
    glyphs = defaultGlyphs
  } = _ref;
  return {
    version: 8,
    sources: {},
    layers: [],
    glyphs
  };
};
exports.mapStyle = mapStyle;
var _default = {
  textFont,
  textSize,
  textColor,
  opacity,
  radius,
  noDataColor,
  strokeColor,
  strokeWidth,
  hoverStrokeMultiplier,
  eventStrokeColor,
  clusterCountColor
};
exports.default = _default;