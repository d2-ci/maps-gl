"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noCluster = exports.isSymbol = exports.isPolygon = exports.isPointNoSymbol = exports.isPoint = exports.isLine = exports.isHover = exports.isClusterPolygon = exports.isClusterPoint = exports.isCluster = void 0;
const getCluster = ['get', 'cluster'];
const getIsPolygon = ['get', 'isPolygon'];
const hasImage = ['has', 'iconUrl'];
const isPoint = exports.isPoint = ['==', ['geometry-type'], 'Point'];
const isPolygon = exports.isPolygon = ['==', ['geometry-type'], 'Polygon'];
const isLine = exports.isLine = ['==', ['geometry-type'], 'LineString'];
const isSymbol = exports.isSymbol = ['all', isPoint, hasImage];
const isPointNoSymbol = exports.isPointNoSymbol = ['all', isPoint, ['==', hasImage, false]];
const isCluster = exports.isCluster = ['==', getCluster, true];
const noCluster = exports.noCluster = ['!=', getCluster, true];
const isClusterPoint = exports.isClusterPoint = ['all', isPoint, noCluster, ['!=', getIsPolygon, true]];
const isClusterPolygon = exports.isClusterPolygon = ['all', noCluster, ['==', getIsPolygon, true]];
const isHover = exports.isHover = ['boolean', ['feature-state', 'hover'], false];