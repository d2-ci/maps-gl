"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noCluster = exports.isSymbol = exports.isPolygon = exports.isPointNoSymbol = exports.isPoint = exports.isLine = exports.isHover = exports.isClusterPolygon = exports.isClusterPoint = exports.isCluster = void 0;
const getCluster = ['get', 'cluster'];
const getIsPolygon = ['get', 'isPolygon'];
const hasImage = ['has', 'iconUrl'];
const isPoint = ['==', ['geometry-type'], 'Point'];
exports.isPoint = isPoint;
const isPolygon = ['==', ['geometry-type'], 'Polygon'];
exports.isPolygon = isPolygon;
const isLine = ['==', ['geometry-type'], 'LineString'];
exports.isLine = isLine;
const isSymbol = ['all', isPoint, hasImage];
exports.isSymbol = isSymbol;
const isPointNoSymbol = ['all', isPoint, ['==', hasImage, false]];
exports.isPointNoSymbol = isPointNoSymbol;
const isCluster = ['==', getCluster, true];
exports.isCluster = isCluster;
const noCluster = ['!=', getCluster, true];
exports.noCluster = noCluster;
const isClusterPoint = ['all', isPoint, noCluster, ['!=', getIsPolygon, true]];
exports.isClusterPoint = isClusterPoint;
const isClusterPolygon = ['all', noCluster, ['==', getIsPolygon, true]];
exports.isClusterPolygon = isClusterPolygon;
const isHover = ['boolean', ['feature-state', 'hover'], false];
exports.isHover = isHover;