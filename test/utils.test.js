const assert = require('chai').assert;
const {
  getYearMonthDateStr,
  getHourMinSecStr
} = require('../src/utils');

describe('utils', () => {
  // month is 0 - 11, not 1 - 12
  // really weird huh?
  const December = 11;
  const date = new Date(2020, December, 18, 9, 30, 30);

  describe('getYearMonthDateStr', () => {
    const expected = '2020-12-18';
    it('should return an expected results', () => {
      const actual = getYearMonthDateStr(date);
      assert.equal(actual, expected);
    });
  });

  describe('getHourMinSecStr', () => {
    const expected = '9-30-30';
    it('should return an expected results', () => {
      const actual = getHourMinSecStr(date);
      assert.equal(actual, expected);
    });
  });
});
