"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.textSize = exports.textOpacity = exports.textFont = exports.textColor = exports.strokeWidth = exports.noDataColor = exports.mapStyle = exports.lineStrokeColor = exports.lineOpacity = exports.labelFontWeight = exports.labelFontStyle = exports.labelFontSize = exports.labelColor = exports.iconOpacity = exports.hoverStrokeMultiplier = exports.fillOpacity = exports.eventStrokeColor = exports.defaultGlyphs = exports.clusterCountColor = exports.circleStrokeColor = exports.circleRadius = exports.circleOpacity = void 0;
const textFont = exports.textFont = ['Open Sans Bold'];
const textSize = exports.textSize = 16;
const textColor = exports.textColor = '#FFFFFF';
const textOpacity = exports.textOpacity = 1;
const labelFontSize = exports.labelFontSize = 12;
const labelColor = exports.labelColor = '#333333';
const labelFontWeight = exports.labelFontWeight = 'normal';
const labelFontStyle = exports.labelFontStyle = 'normal';
const circleRadius = exports.circleRadius = 6;
const circleStrokeColor = exports.circleStrokeColor = '#333333';
const circleOpacity = exports.circleOpacity = 1;
const lineStrokeColor = exports.lineStrokeColor = '#333333';
const lineOpacity = exports.lineOpacity = 1;
const fillOpacity = exports.fillOpacity = 1;
const iconOpacity = exports.iconOpacity = 1;
const noDataColor = exports.noDataColor = '#CCCCCC';
const strokeWidth = exports.strokeWidth = 1;
const hoverStrokeMultiplier = exports.hoverStrokeMultiplier = 3;
const eventStrokeColor = exports.eventStrokeColor = '#333333';
const clusterCountColor = exports.clusterCountColor = '#000000';
const defaultGlyphs = exports.defaultGlyphs = 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf';
const mapStyle = ({
  glyphs = defaultGlyphs
}) => ({
  version: 8,
  sources: {},
  layers: [],
  glyphs
});
exports.mapStyle = mapStyle;