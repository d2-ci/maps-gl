"use strict";

var _layers = require("../layers");
var _style = _interopRequireDefault(require("../style"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const id = 'abc';
const color = '#000000';
const opacity = 0.5;
describe('layers', () => {
  it('Should set opacity for different layer types', () => {
    expect((0, _layers.pointLayer)({
      id,
      color,
      opacity
    }).paint['circle-opacity']).toBe(opacity);
    expect((0, _layers.lineLayer)({
      id,
      opacity
    }).paint['line-opacity']).toBe(opacity);
    expect((0, _layers.polygonLayer)({
      id,
      color,
      opacity
    }).paint['fill-opacity']).toBe(opacity);
    expect((0, _layers.outlineLayer)({
      id,
      opacity
    }).paint['line-opacity']).toBe(opacity);
    expect((0, _layers.symbolLayer)({
      id,
      opacity
    }).paint['icon-opacity']).toBe(opacity);
    expect((0, _layers.clusterLayer)({
      id,
      opacity
    }).paint['circle-opacity']).toBe(opacity);
    expect((0, _layers.clusterCountLayer)({
      id,
      opacity
    }).paint['text-opacity']).toBe(opacity);
  });
  it('Should set default opacity for different layer types', () => {
    expect((0, _layers.pointLayer)({
      id,
      color
    }).paint['circle-opacity']).toBe(_style.default.opacity);
    expect((0, _layers.lineLayer)({
      id
    }).paint['line-opacity']).toBe(_style.default.opacity);
    expect((0, _layers.polygonLayer)({
      id,
      color
    }).paint['fill-opacity']).toBe(_style.default.opacity);
    expect((0, _layers.outlineLayer)({
      id
    }).paint['line-opacity']).toBe(_style.default.opacity);
    expect((0, _layers.symbolLayer)({
      id
    }).paint['icon-opacity']).toBe(_style.default.opacity);
    expect((0, _layers.clusterLayer)({
      id
    }).paint['circle-opacity']).toBe(_style.default.opacity);
    expect((0, _layers.clusterCountLayer)({
      id
    }).paint['text-opacity']).toBe(_style.default.opacity);
  });
});