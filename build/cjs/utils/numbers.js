"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setPrecision = exports.numberPrecision = exports.kmToMiles = exports.getPrecision = void 0;
// Rounds a number to d decimals
const numberPrecision = d => {
  console.log('numberPrecision');
  if (d === undefined) {
    return n => n;
  }
  const m = Math.pow(10, d);
  return n => Math.round(n * m) / m;
};

// Returns number of decimals based on the value
exports.numberPrecision = numberPrecision;
const getPrecision = v => v < 1 ? 3 : v < 10 ? 2 : v < 100 ? 1 : 0;

// Sets number of decimals based on the value
exports.getPrecision = getPrecision;
const setPrecision = value => numberPrecision(getPrecision(Math.abs(value)))(value);
exports.setPrecision = setPrecision;
const kmToMiles = value => value * 0.621371192;
exports.kmToMiles = kmToMiles;