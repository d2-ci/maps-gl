"use strict";

var _ee_worker_utils = require("../ee_worker_utils.js");
const scale = 1000;
const style = [{
  value: 9,
  name: 'Savannas',
  color: '#d99125'
}, {
  value: 13,
  name: 'Urban and built-up',
  color: '#cc0202'
}];
const data = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    id: 'O6uvpzGd5pu',
    properties: {
      histogram: {
        2: 1,
        4: 2,
        7: 3,
        8: 4,
        10: 5,
        12: 6,
        13: 7,
        14: 8,
        17: 9
      }
    }
  }, {
    type: 'Feature',
    id: 'fdc6uOvgoji',
    properties: {
      histogram: {
        2: 1,
        4: 2,
        5: 3,
        8: 4,
        9: 5,
        10: 6,
        12: 7,
        13: 8,
        14: 9
      }
    }
  }]
};
const sum = 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9; // Sum of histogram values
const toPercent = v => v / sum * 100;
const toHectares = v => Math.round(v * (scale * scale) / 10000);
const toAcres = v => Math.round(v * (scale * scale) / 4046.8564224);
describe('earthengine - getHistogramStatistics', () => {
  it('should return true if unit is class based', () => {
    expect((0, _ee_worker_utils.hasClasses)('percentage')).toBe(true);
    expect((0, _ee_worker_utils.hasClasses)('hectares')).toBe(true);
    expect((0, _ee_worker_utils.hasClasses)('acres')).toBe(true);
    expect((0, _ee_worker_utils.hasClasses)('sum')).toBe(false);
  });
  it('should calculate percentage', () => {
    const aggregationType = 'percentage';
    const ids = data.features.map(f => f.id);
    const result = (0, _ee_worker_utils.getHistogramStatistics)({
      data,
      scale,
      aggregationType,
      style
    });
    const itemA = result['O6uvpzGd5pu'];
    const itemB = result['fdc6uOvgoji'];
    expect(ids).toEqual(Object.keys(result));
    expect(Object.keys(itemA).length).toBe(style.length);
    expect(itemA['9']).toBe(toPercent(0));
    expect(itemA['13']).toBe(toPercent(7));
    expect(itemB['9']).toBe(toPercent(5));
    expect(itemB['13']).toBe(toPercent(8));
  });
  it('should calculate hectares', () => {
    const aggregationType = 'hectares';
    const result = (0, _ee_worker_utils.getHistogramStatistics)({
      data,
      scale,
      aggregationType,
      style
    });
    const itemA = result['O6uvpzGd5pu'];
    const itemB = result['fdc6uOvgoji'];
    expect(itemA['9']).toBe(toHectares(0));
    expect(itemA['13']).toBe(toHectares(7));
    expect(itemB['9']).toBe(toHectares(5));
    expect(itemB['13']).toBe(toHectares(8));
  });
  it('should calculate acres', () => {
    const aggregationType = 'acres';
    const result = (0, _ee_worker_utils.getHistogramStatistics)({
      data,
      scale,
      aggregationType,
      style
    });
    const itemA = result['O6uvpzGd5pu'];
    const itemB = result['fdc6uOvgoji'];
    expect(itemA['9']).toBe(toAcres(0));
    expect(itemA['13']).toBe(toAcres(7));
    expect(itemB['9']).toBe(toAcres(5));
    expect(itemB['13']).toBe(toAcres(8));
  });
});
describe('earthengine - getStartOfEpiYear', () => {
  test('returns the Monday-starting epidemiological week start for typical years', () => {
    const start2022 = (0, _ee_worker_utils.getStartOfEpiYear)(2022);
    expect(start2022.getUTCFullYear()).toBe(2022);
    expect(start2022.getUTCMonth()).toBe(0);
    expect(start2022.getUTCDate()).toBe(3);
    const start2018 = (0, _ee_worker_utils.getStartOfEpiYear)(2018);
    expect(start2018.getUTCFullYear()).toBe(2018);
    expect(start2018.getUTCMonth()).toBe(0);
    expect(start2018.getUTCDate()).toBe(1);
    const start2017 = (0, _ee_worker_utils.getStartOfEpiYear)(2017);
    expect(start2017.getUTCFullYear()).toBe(2017);
    expect(start2017.getUTCMonth()).toBe(0);
    expect(start2017.getUTCDate()).toBe(2);
  });
  test('handles cases where start falls in previous year or next Monday', () => {
    const start2025 = (0, _ee_worker_utils.getStartOfEpiYear)(2025);
    expect(start2025.getUTCFullYear()).toBe(2024);
    expect(start2025.getUTCMonth()).toBe(11);
    expect(start2025.getUTCDate()).toBe(30);
    const start2020 = (0, _ee_worker_utils.getStartOfEpiYear)(2020);
    expect(start2020.getUTCFullYear()).toBe(2019);
    expect(start2020.getUTCMonth()).toBe(11);
    expect(start2020.getUTCDate()).toBe(30);
    const start2019 = (0, _ee_worker_utils.getStartOfEpiYear)(2019);
    expect(start2019.getUTCFullYear()).toBe(2018);
    expect(start2019.getUTCMonth()).toBe(11);
    expect(start2019.getUTCDate()).toBe(31);
  });
});
describe('earthengine - getPeriodDates', () => {
  test('weekly reducer returns JS Date start/end for epi year', () => {
    const {
      startDate,
      endDate
    } = (0, _ee_worker_utils.getPeriodDates)('EE_WEEKLY', 2020);
    expect(startDate instanceof Date).toBe(true);
    expect(endDate instanceof Date).toBe(true);
    const expectedStart = (0, _ee_worker_utils.getStartOfEpiYear)(2020);
    expect(startDate.getTime()).toBe(expectedStart.getTime());
    const nextStart = (0, _ee_worker_utils.getStartOfEpiYear)(2021);
    const expectedEnd = new Date(nextStart.getTime() - 1000);
    expect(endDate.getTime()).toBe(expectedEnd.getTime());
  });
  test('monthly reducer uses ee.Date.fromYMD (mocked) for start/end', () => {
    const {
      startDate,
      endDate
    } = (0, _ee_worker_utils.getPeriodDates)('EE_MONTHLY', 2015);
    expect(startDate instanceof Date).toBe(true);
    expect(endDate instanceof Date).toBe(true);
    expect(startDate.getUTCFullYear()).toBe(2015);
    expect(startDate.getUTCMonth()).toBe(0);
    expect(startDate.getUTCDate()).toBe(1);
    expect(endDate.getUTCFullYear()).toBe(2015);
    expect(endDate.getUTCMonth()).toBe(11);
    expect(endDate.getUTCDate()).toBe(31);
  });
});