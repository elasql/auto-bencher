const assert = require('chai').assert;

const prop = require('../src/properties');

const propertiesPath = './test/test-properties/test.properties';

describe('PropertiesFile', () => {
  const pf = new prop.PropertiesFile(1, propertiesPath);

  describe('constructor', () => {
    it('should initialize with corret values and types', () => {
      assert.isNumber(pf.id);
      assert.isString(pf.fileName);
      assert.isObject(pf.properties);

      assert.equal(pf.id, 1);
      assert.equal(pf.fileName, 'test');

    });
  });
});
