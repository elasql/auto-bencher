const assert = require('chai').assert;

const { loadToml } = require('../src/utils');
const ParameterLoader = require('../src/parameter-loader');

describe('ParameterLoader', () => {
  const combPath = './test/test-toml/parameter-loader-comb.test.toml';
  const notCombPath = './test/test-toml/parameter-loader.test.toml';

  const comb = loadToml(combPath);
  const notComb = loadToml(notCombPath);

  const parameterLoader = new ParameterLoader();

  describe('loadNormalLoad', () => {
    describe('pass not combination parameters', () => {
      const params = parameterLoader.loadNormalLoad(notComb);

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
          () => { parameterLoader.loadNormalLoad(comb); },
          Error,
          ErrMsg);
      });
    });
  });
});
