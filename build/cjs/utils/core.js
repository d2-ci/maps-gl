"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setTemplate = exports.getFeaturesString = void 0;
// Replaces {key} with data in a string template
const setTemplate = (text, data) => text.replace(/\{ *([\w_-]+) *\}/g, (str, key) => data[key]);

// Returns a string representation of an array of features
exports.setTemplate = setTemplate;
const getFeaturesString = features => Array.isArray(features) ? features.sort((a, b) => b.id - a.id).map(_ref => {
  let {
    id,
    source
  } = _ref;
  return `${id}-${source}`;
}).join('-') : '';
exports.getFeaturesString = getFeaturesString;