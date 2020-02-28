const assert = require('chai').assert;

const ParameterLoader = require('../src/parameter-loader');

describe('ParameterLoader', () => {
  const parameterLoader = new ParameterLoader('../');

  describe('getParams', () => {
    const params = parameterLoader.getParams();
    it('should return an array with length 10', () => {
      assert.isArray(params);
      assert.lengthOf(params, 10);
    });
  });
});
