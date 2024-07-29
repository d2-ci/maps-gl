"use strict";

var _labels = require("../labels");
var _style = _interopRequireDefault(require("../style"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const id = 'abc';
const opacity = 0.5;
describe('labels', () => {
  it('Should set opacity for for label layer', () => {
    expect((0, _labels.labelLayer)({
      id,
      opacity
    }).paint['text-opacity']).toBe(opacity);
  });
  it('Should set default opacity for label layer', () => {
    expect((0, _labels.labelLayer)({
      id
    }).paint['text-opacity']).toBe(_style.default.opacity);
  });
});