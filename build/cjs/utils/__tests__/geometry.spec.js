"use strict";

var _geometry = require("../geometry");
const point = {
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [125.6, 10.1]
  }
};
const polygon = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]]
  }
};
describe('geometry', () => {
  it('Should return true if a feature has point geometry', () => {
    expect((0, _geometry.isPoint)(point)).toBe(true);
    expect((0, _geometry.isPoint)(polygon)).toBe(false);
  });
});