"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setTemplate = exports.normalizeIds = exports.getFeaturesString = exports.filterVisibleIds = void 0;
// Replaces {key} with data in a string template
const setTemplate = (text, data) => text.replace(/\{ *([\w_-]+) *\}/g, (_, key) => data[key] ?? '');

// Returns a string representation of an array of features
exports.setTemplate = setTemplate;
const getFeaturesString = features => Array.isArray(features) ? features.sort((a, b) => b.id - a.id).map(({
  id,
  source
}) => `${id}-${source}`).join('-') : '';

// Normalizes a scalar id, array of ids, or null/undefined into an array
exports.getFeaturesString = getFeaturesString;
const normalizeIds = ids => {
  if (Array.isArray(ids)) {
    return ids;
  }
  return ids ? [ids] : [];
};

// null/undefined visibleIds means no restriction
exports.normalizeIds = normalizeIds;
const filterVisibleIds = (ids, visibleIds) => {
  if (!visibleIds) {
    return ids;
  }
  const visible = new Set(visibleIds);
  return ids.filter(id => visible.has(id));
};
exports.filterVisibleIds = filterVisibleIds;