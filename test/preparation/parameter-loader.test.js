const assert = require('chai').assert;

const { loadToml } = require('../../src/utils');
const { normalLoad } = require('../../src/preparation/parameter-loader');
const Parameter = require('../../src/preparation/parameter');

describe('normalLoad', () => {
  const comb = loadToml('./test/test-toml/parameter-comb.test.toml');
  const notComb = loadToml('./test/test-toml/parameter.test.toml');

  const actuals = normalLoad(notComb);

  describe('pass not combination parameters', () => {
    it('should return an array with only 1 elements', () => {
      assert.isArray(actuals);
      assert.lengthOf(actuals, 1);
    });

    it('should be an expected element in returned array', () => {
      assert.instanceOf(actuals[0], Parameter, 'the element is an instance of parameter');
    });
  });

  describe('pass combination parameters', () => {
    it('should throw an error', () => {
      assert.throws(
        () => { normalLoad(comb); },
        Error,
        'combination (mutiple values in one property) in normal-load.toml is forbidden');
    });
  });
});
