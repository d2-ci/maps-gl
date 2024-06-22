"use strict";

var _numbers = require("../numbers");
describe('numbers', () => {
  it('numberPrecision should round number to x decimals', () => {
    const formatNumber = (0, _numbers.numberPrecision)(3);
    expect(formatNumber(123.342342342)).toBe(123.342);
    expect(formatNumber(123.3456)).toBe(123.346);
    expect(formatNumber(123.39)).toBe(123.39);
  });
  it('getPrecision should return decimal precision based on value', () => {
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
    expect((0, _numbers.setPrecision)(0.12345, 0)).toBe(0);
    expect((0, _numbers.setPrecision)(0.12345, 1)).toBe(0.1);
    expect((0, _numbers.setPrecision)(0.12345, 2)).toBe(0.12);
    expect((0, _numbers.setPrecision)(0.12345, 3)).toBe(0.123);
    expect((0, _numbers.setPrecision)(0.12345, 4)).toBe(0.1234); // ???
    expect((0, _numbers.setPrecision)(0.12345, 5)).toBe(0.12345);
  });
  it('Should convert km to miles', () => {
    expect((0, _numbers.kmToMiles)(1)).toBe(0.621371192);
  });
  describe('setPrecision', () => {
    it('should set precision when no "precision" value provided', () => {
      expect((0, _numbers.setPrecision)(542.312321312)).toBe(542);
      expect((0, _numbers.setPrecision)(78.312321312)).toBe(78.3);
      expect((0, _numbers.setPrecision)(8.312321312)).toBe(8.31);
      expect((0, _numbers.setPrecision)(0.312321312)).toBe(0.312);
    });
    it('should set the precision of a positive number correctly', () => {
      const result = (0, _numbers.setPrecision)(123.456, 2);
      expect(result).toEqual(123.46);
    });
    it('should set the precision of a negative number correctly', () => {
      const result = (0, _numbers.setPrecision)(-123.456, 2);
      expect(result).toEqual(-123.46);
    });
    it('should handle zero correctly', () => {
      const result = (0, _numbers.setPrecision)(0, 2);
      expect(result).toEqual(0);
    });
  });
});