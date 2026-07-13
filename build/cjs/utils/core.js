"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setTemplate = exports.normalizeIds = exports.getFeaturesString = exports.dropHiddenIds = void 0;
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
const normalizeIds = ids => Array.isArray(ids) ? ids : ids ? [ids] : [];
exports.normalizeIds = normalizeIds;
const dropHiddenIds = (hoverIds, selectedIds, visibleIds) => {
  if (!visibleIds) {
    return null;
  }
  const visible = new Set(visibleIds);
  return {
    hoverIds: hoverIds.filter(id => visible.has(id)),
    selectedIds: selectedIds.filter(id => visible.has(id))
  };
};
exports.dropHiddenIds = dropHiddenIds;