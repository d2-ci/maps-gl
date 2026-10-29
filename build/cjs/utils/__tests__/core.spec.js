"use strict";

var _core = require("../core.js");
describe('core utils', () => {
  it('Should add values to template string', () => {
    expect((0, _core.setTemplate)('{name}: {value} {unit}', {
      name: 'Population',
      value: 123,
      unit: 'per hectare'
    })).toBe('Population: 123 per hectare');
    expect((0, _core.setTemplate)('{name}: {noValue}', {
      name: 'Population',
      noValue: 'no value'
    })).toBe('Population: no value');
  });
  describe('normalizeIds', () => {
    it('Should wrap a single id, including 0, which hover already treats as an id', () => {
      expect((0, _core.normalizeIds)('a')).toEqual(['a']);
      expect((0, _core.normalizeIds)(0)).toEqual([0]);
    });
    it('Should return an array as is, and no ids for null/undefined', () => {
      expect((0, _core.normalizeIds)(['a', 'b'])).toEqual(['a', 'b']);
      expect((0, _core.normalizeIds)(null)).toEqual([]);
      expect((0, _core.normalizeIds)(undefined)).toEqual([]);
    });
  });
  describe('dropHiddenIds', () => {
    it('Should drop hover/selected ids that are no longer visible', () => {
      expect((0, _core.dropHiddenIds)(['a', 'b'], ['b', 'c'], ['b'])).toEqual({
        hoverIds: ['b'],
        selectedIds: ['b']
      });
    });
    it('Should return null when visibleIds is null/undefined, so nothing is dropped', () => {
      expect((0, _core.dropHiddenIds)(['a'], ['b'], null)).toBeNull();
      expect((0, _core.dropHiddenIds)(['a'], ['b'], undefined)).toBeNull();
    });
  });
});