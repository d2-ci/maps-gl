"use strict";

var _filters = require("../../utils/filters.js");
var _Boundary = _interopRequireDefault(require("../Boundary.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const feature = (style = {}) => ({
  type: 'Feature',
  properties: {
    style
  },
  geometry: {
    type: 'Point',
    coordinates: [0, 0]
  }
});
describe('Boundary#createLayers', () => {
  it('filters by geometry type with expressions, which setVisibleIds can combine with its id filter', () => {
    const boundary = new _Boundary.default({
      data: [feature()],
      style: {}
    });
    const [line, point] = boundary.getLayers();
    expect(line.filter).toEqual(_filters.isPolygon);
    expect(point.filter).toEqual(_filters.isPoint);
  });
});