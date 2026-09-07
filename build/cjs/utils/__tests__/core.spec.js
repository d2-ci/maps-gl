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
  describe('filterVisibleIds', () => {
    it('Should restrict ids to those also present in visibleIds', () => {
      expect((0, _core.filterVisibleIds)(['a', 'b', 'c'], ['b'])).toEqual(['b']);
    });
    it('Should return ids unchanged when visibleIds is null/undefined, meaning no restriction', () => {
      expect((0, _core.filterVisibleIds)(['a', 'b'], null)).toEqual(['a', 'b']);
      expect((0, _core.filterVisibleIds)(['a', 'b'], undefined)).toEqual(['a', 'b']);
    });
    it('Should not mutate either input array', () => {
      const ids = ['a', 'b'];
      const visibleIds = ['b'];
      (0, _core.filterVisibleIds)(ids, visibleIds);
      expect(ids).toEqual(['a', 'b']);
      expect(visibleIds).toEqual(['b']);
    });
  });
});