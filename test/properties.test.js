const assert = require('chai').assert;

const prop = require('../src/properties');

const propertiesPath = './test/test-properties/test.properties';

describe('PropertiesFile', () => {
  describe('constructor', () => {
    const pf = new prop.PropertiesFile(1, propertiesPath);
    it('should initialize with corret values and types', () => {
      assert.isNumber(pf.id);
      assert.isString(pf.fileName);
      assert.isObject(pf.properties);

      assert.equal(pf.id, 1);
      assert.equal(pf.fileName, 'test');
    });
  });

  describe('set', () => {
    const pf = new prop.PropertiesFile(1, propertiesPath);
    const key = 'org.vanilladb.core.util.Profiler.DEPTH';
    it('should correctly set the value', () => {
      // before
      assert.equal(pf.properties[key], '4');

      pf.set(key, '6');

      // after
      assert.equal(pf.properties[key], '6');
    });

    it('should throw an error if passing a non-string value', () => {
      const value = 6;
      assert.throws(() => { pf.set(key, value); }, Error, `value ${value} is not in string type`);
    });
  });

  describe('getValidFilePath', () => {
    const outputDir = 'outpurDir';
    const pf = new prop.PropertiesFile(1, propertiesPath);
    const filePath = pf.getValidFilePath(outputDir);
    it('should return a valid file path', () => {
      const expected = outputDir + '/test.properties';
      assert.equal(filePath, expected);
    });
  });
});
