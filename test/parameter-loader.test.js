const assert = require('chai').assert;

const { loadToml } = require('../src/utils');
const ParameterLoader = require('../src/parameter-loader');

describe('ParameterLoader', () => {
  const comb = loadToml('./test/test-toml/parameter-loader-comb.test.toml');
  const notComb = loadToml('./test/test-toml/parameter-loader.test.toml');
  const parameterLoader = new ParameterLoader();

  describe('loadNormalLoad', () => {
    describe('pass not combination parameters', () => {
      const params = parameterLoader.loadNormalLoad(notComb);

      it('should return an array with only 1 elements', () => {
        assert.isArray(params);
        assert.lengthOf(params, 1);
      });
    });

    describe('pass combination parameters', () => {
      it('should throw an error', () => {
        assert.throws(
          () => { parameterLoader.loadNormalLoad(comb); },
          Error,
          'Combination in normal-load.toml is forbidden');
      });
    });
  });
});
