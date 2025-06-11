"use strict";

var _core = require("../core");
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
});