const assert = require('chai').assert;
const Parameter = require('../../src/preparation/parameter');

describe('Parameter', () => {
  const obj = {
    auto_bencher: {
      jar_dir: 'test',
      server_count: '3'
    },
    vanilladb: {
      'org.vanilladb.core.storage.file.io.IoAllocator.USE_O_DIRECT': 'true'
    }
  };
  const p = new Parameter(obj);

  describe('getProperties', () => {
    const expected = [
      'jar_dir',
      'server_count',
      'org.vanilladb.core.storage.file.io.IoAllocator.USE_O_DIRECT'
    ];

    it('should return expected result', () => {
      const actual = p.getProperties();
      assert.deepEqual(expected, actual);
    });
  });

  describe('getPropertiesValues', () => {
    const expected = [
      'test',
      '3',
      'true'
    ];

    it('should return expected result', () => {
      const actual = p.getPropertiesValues();
      assert.deepEqual(expected, actual);
    });
  });

  describe('getStrValue', () => {
    const actual = p.getStrValue('auto_bencher', 'server_count');

    it('should return string value', () => {
      assert.isString(actual);
    });

    it('should be the expected result', () => {
      assert.equal(actual, '3');
    });

    it(`should throw an error if there is no matched table`, () => {
      assert.throws(() => { p.getStrValue('123', '456'); }, Error, `table 123 doesn't exist`);
    });

    it(`should throw an error if there is no matched property`, () => {
      assert.throws(() => { p.getStrValue('auto_bencher', '456'); }, Error, `property 456 doesn't exist in table auto_bencher`);
    });
  });

  describe('getNumValue', () => {
    const actual = p.getNumValue('auto_bencher', 'server_count');

    it('should return a num value', () => {
      assert.isNumber(actual);
    });

    it('should be the expected result', () => {
      assert.equal(actual, 3);
    });
  });

  describe('getBoolValue', () => {
    const actual = p.getBoolValue('vanilladb', 'org.vanilladb.core.storage.file.io.IoAllocator.USE_O_DIRECT');

    it('should return a boolean value', () => {
      assert.isBoolean(actual);
    });

    it('should be the expected result', () => {
      assert.equal(actual, true);
    });
  });
});
