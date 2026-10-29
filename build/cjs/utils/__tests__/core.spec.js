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
  describe('isSameIds', () => {
    it('Should match the same ids in the same order', () => {
      expect((0, _core.isSameIds)(['a', 'b'], ['a', 'b'])).toBe(true);
      expect((0, _core.isSameIds)(['a', 'b'], ['b', 'a'])).toBe(false);
      expect((0, _core.isSameIds)(['a'], ['a', 'b'])).toBe(false);
    });
    it('Should treat null and undefined alike, and apart from an empty list', () => {
      expect((0, _core.isSameIds)(null, undefined)).toBe(true);
      expect((0, _core.isSameIds)(null, [])).toBe(false);
    });
  });
  describe('filterVisibleIds', () => {
    it('Should restrict ids to those also present in visibleIdSet', () => {
      expect((0, _core.filterVisibleIds)(['a', 'b', 'c'], new Set(['b']))).toEqual(['b']);
    });
    it('Should return ids unchanged when visibleIdSet is null/undefined, meaning no restriction', () => {
      expect((0, _core.filterVisibleIds)(['a', 'b'], null)).toEqual(['a', 'b']);
      expect((0, _core.filterVisibleIds)(['a', 'b'], undefined)).toEqual(['a', 'b']);
    });
    it('Should not mutate either input', () => {
      const ids = ['a', 'b'];
      const visibleIdSet = new Set(['b']);
      (0, _core.filterVisibleIds)(ids, visibleIdSet);
      expect(ids).toEqual(['a', 'b']);
      expect([...visibleIdSet]).toEqual(['b']);
    });
  });
});