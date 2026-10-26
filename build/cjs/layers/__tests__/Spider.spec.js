"use strict";

var _style = require("../../utils/style.js");
var _Spider = require("../Spider.js");
describe('labelTextStyle', () => {
  it('Should default color, fontSize, fontWeight and fontStyle', () => {
    const style = (0, _Spider.labelTextStyle)();
    expect(style.color).toBe(_style.labelColor);
    expect(style.fontSize).toBe(`${_style.labelFontSize}px`);
    expect(style.fontWeight).toBe(_style.labelFontWeight);
    expect(style.fontStyle).toBe(_style.labelFontStyle);
  });
  it('Should use custom color, fontWeight and fontStyle', () => {
    const style = (0, _Spider.labelTextStyle)({
      color: '#ff0000',
      fontWeight: 'bold',
      fontStyle: 'italic'
    });
    expect(style.color).toBe('#ff0000');
    expect(style.fontWeight).toBe('bold');
    expect(style.fontStyle).toBe('italic');
  });
  it('Should use fontSize as-is instead of appending a unit', () => {
    // fontSize always arrives as a complete CSS value (e.g. "14px"),
    // so this must not re-append "px" (regression: previously produced
    // an invalid "14pxpx", silently rejected by the browser)
    const style = (0, _Spider.labelTextStyle)({
      fontSize: '14px'
    });
    expect(style.fontSize).toBe('14px');
  });
});