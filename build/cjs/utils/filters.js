"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noCluster = exports.isSymbol = exports.isPolygon = exports.isPointNoSymbol = exports.isPoint = exports.isLine = exports.isHover = exports.isClusterPolygon = exports.isClusterPoint = exports.isCluster = exports.idFilter = void 0;
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

// `match` finds an id in constant time, where `in` scans the whole list per feature
const matchId = ids => ['match', ['get', 'id'], ids, true, false];

// A match list takes only strings or only integers, and no Object.prototype keys
const idFilter = ids => {
  const strings = [];
  const integers = [];
  const others = [];
  new Set(ids).forEach(id => {
    if (typeof id === 'string' && !(id in Object.prototype)) {
      strings.push(id);
    } else if (Number.isSafeInteger(id)) {
      integers.push(id);
    } else {
      others.push(id);
    }
  });

  // An empty ['any'] keeps no feature
  return ['any', ...[strings.length && matchId(strings), integers.length && matchId(integers), others.length && ['in', ['get', 'id'], ['literal', others]]].filter(Boolean)];
};
exports.idFilter = idFilter;
const isHover = exports.isHover = ['boolean', ['feature-state', 'hover'], false];