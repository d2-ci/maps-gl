"use strict";

var _labels = require("../labels");
var _style = _interopRequireDefault(require("../style"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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