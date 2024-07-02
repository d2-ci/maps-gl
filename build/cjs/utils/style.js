"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.textSize = exports.textFont = exports.textColor = exports.strokeWidth = exports.strokeColor = exports.radius = exports.opacity = exports.noDataColor = exports.mapStyle = exports.hoverStrokeMultiplier = exports.eventStrokeColor = exports.defaultGlyphs = exports.default = exports.clusterCountColor = void 0;
const textFont = exports.textFont = ['Open Sans Bold'];
const textSize = exports.textSize = 16;
const textColor = exports.textColor = '#FFFFFF';
const radius = exports.radius = 6;
const noDataColor = exports.noDataColor = '#CCCCCC';
const strokeColor = exports.strokeColor = '#333333';
const strokeWidth = exports.strokeWidth = 1;
const hoverStrokeMultiplier = exports.hoverStrokeMultiplier = 3;
const eventStrokeColor = exports.eventStrokeColor = '#333333';
const clusterCountColor = exports.clusterCountColor = '#000000';
const opacity = exports.opacity = 1;
const defaultGlyphs = exports.defaultGlyphs = 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf'; // support: Open
//'https://demotiles.maplibre.org/{fontstack}/{range}.pbf' // support: Noto

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
var _default = exports.default = {
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