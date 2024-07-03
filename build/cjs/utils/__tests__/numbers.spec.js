"use strict";

var _numbers = require("../numbers");
describe('numbers', () => {
  it('Should round number to x decimals', () => {
    const formatNumber = (0, _numbers.numberPrecision)(3);
    expect(formatNumber(123.342342342)).toBe(123.342);
    expect(formatNumber(123.3456)).toBe(123.346);
    expect(formatNumber(123.39)).toBe(123.39);
  });
  it('Should return decimal precision based on value', () => {
    expect((0, _numbers.getPrecision)(542.312321312)).toBe(0);
    expect((0, _numbers.getPrecision)(78.312321312)).toBe(1);
    expect((0, _numbers.getPrecision)(8.312321312)).toBe(2);
    expect((0, _numbers.getPrecision)(0.312321312)).toBe(3);
  });
  it('Should format number', () => {
    expect((0, _numbers.setPrecision)(542.312321312)).toBe(542);
    expect((0, _numbers.setPrecision)(78.312321312)).toBe(78.3);
    expect((0, _numbers.setPrecision)(8.312321312)).toBe(8.31);
    expect((0, _numbers.setPrecision)(0.312321312)).toBe(0.312);
  });
  it('Should convert km to miles', () => {
    expect((0, _numbers.kmToMiles)(1)).toBe(0.621371192);
  });
});