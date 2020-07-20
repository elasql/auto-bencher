const assert = require('chai').assert;
const {
  getYearMonthDateStr,
  getHourMinSecStr
} = require('../src/utils');

describe('utils', () => {
  // month is 0 - 11, not 1 - 12
  // really weird huh?
  const December = 11;
  const date = new Date(2020, December, 9, 9, 5, 5);

  describe('getYearMonthDateStr', () => {
    const expected = '2020-12-09';
    it('should return an expected results', () => {
      const actual = getYearMonthDateStr(date);
      assert.equal(actual, expected);
    });
  });

  describe('getHourMinSecStr', () => {
    const expected = '09-05-05';
    it('should return an expected results', () => {
      const actual = getHourMinSecStr(date);
      assert.equal(actual, expected);
    });
  });
});
