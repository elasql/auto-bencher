const assert = require('chai').assert;

const { loadToml } = require('../src/utils');
const { NormalLoad } = require('../src/benchmark-parameter');

describe('NormalLoad', () => {
  const combPath = './test/test-toml/benchmark-parameter-comb.test.toml';
  const notCombPath = './test/test-toml/benchmark-parameter.test.toml';

  const comb = loadToml(combPath);
  const notComb = loadToml(notCombPath);

  const normalLoad = new NormalLoad();

  describe('load', () => {
    describe('pass not combination parameters', () => {
      const params = normalLoad.load(notComb);

      it('should return an array with only 1 elements', () => {
        assert.isArray(params);
        assert.lengthOf(params, 1);
      });

      it('should not modify the original object', () => {
        assert.deepEqual(notComb, loadToml(notCombPath));
      });
    });

    describe('pass combination parameters', () => {
      const ErrMsg = 'Combination in normal-load.toml is forbidden';

      it('should throw an error', () => {
        assert.throws(
          () => { normalLoad.load(comb); },
          Error,
          ErrMsg);
      });
    });
  });
});
