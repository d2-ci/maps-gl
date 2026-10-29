"use strict";

var _filters = require("../filters.js");
describe('idFilter', () => {
  it('matches string ids with a match expression', () => {
    expect((0, _filters.idFilter)(['a', 'b'])).toEqual(['any', ['match', ['get', 'id'], ['a', 'b'], true, false]]);
  });
  it('drops duplicate ids, since match labels must be unique', () => {
    expect((0, _filters.idFilter)(['a', 'a', 'b'])).toEqual(['any', ['match', ['get', 'id'], ['a', 'b'], true, false]]);
  });
  it('matches strings and integers in separate lists, since a match list takes one type', () => {
    expect((0, _filters.idFilter)(['a', 1, 'b', 2])).toEqual(['any', ['match', ['get', 'id'], ['a', 'b'], true, false], ['match', ['get', 'id'], [1, 2], true, false]]);
  });
  it('falls back to in for ids a match list rejects', () => {
    expect((0, _filters.idFilter)(['a', 'constructor', 1.5])).toEqual(['any', ['match', ['get', 'id'], ['a'], true, false], ['in', ['get', 'id'], ['literal', ['constructor', 1.5]]]]);
  });
  it('keeps no feature for an empty list', () => {
    expect((0, _filters.idFilter)([])).toEqual(['any']);
  });
});