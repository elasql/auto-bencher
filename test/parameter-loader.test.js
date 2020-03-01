const assert = require('chai').assert;

const ParameterLoader = require('../src/parameter-loader');

describe('ParameterLoader', () => {
  const parameterLoader = new ParameterLoader('./test/test-toml/normal-load.test.toml');

  describe('getParams', () => {
    const params = parameterLoader.getParams();
    it('should return an array with 10 elements', () => {
      assert.isArray(params);
      assert.lengthOf(params, 10);
    });
  });
});
