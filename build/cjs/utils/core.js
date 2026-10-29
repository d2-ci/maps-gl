"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setTemplate = exports.normalizeIds = exports.isSameIds = exports.getFeaturesString = exports.filterVisibleIds = void 0;
// Replaces {key} with data in a string template
const setTemplate = (text, data) => text.replace(/\{ *([\w_-]+) *\}/g, (_, key) => data[key] ?? '');

// Returns a string representation of an array of features
exports.setTemplate = setTemplate;
const getFeaturesString = features => Array.isArray(features) ? features.sort((a, b) => b.id - a.id).map(({
  id,
  source
}) => `${id}-${source}`).join('-') : '';
exports.getFeaturesString = getFeaturesString;
const normalizeIds = ids => {
  if (Array.isArray(ids)) {
    return ids;
  }
  return ids === undefined || ids === null ? [] : [ids];
};

// null and undefined both mean no ids
exports.normalizeIds = normalizeIds;
const isSameIds = (ids, otherIds) => {
  if (!ids || !otherIds) {
    return !ids && !otherIds;
  }
  return ids.length === otherIds.length && ids.every((id, index) => id === otherIds[index]);
};

// null/undefined visibleIdSet means no restriction
exports.isSameIds = isSameIds;
const filterVisibleIds = (ids, visibleIdSet) => visibleIdSet ? ids.filter(id => visibleIdSet.has(id)) : ids;
exports.filterVisibleIds = filterVisibleIds;