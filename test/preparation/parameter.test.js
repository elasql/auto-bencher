const assert = require('chai').assert;
const Parameter = require('../../src/preparation/parameter');

describe('Parameter', () => {
  const obj = {
    auto_bencher: {
      jar_dir:'test',
      server_count: '3'
    },
    vanilladb: {
      'org.vanilladb.core.storage.file.io.IoAllocator.USE_O_DIRECT': 'true'
    }
  }
  const p = new Parameter(obj);

  describe('getStrValue', () => {
    const actual = p.getStrValue('auto_bencher', 'server_count');

    it('should return string value', () => {
      assert.isString(actual);
    });

    it('should be the expected result', () => {
      assert.equal(actual, '3');
    });
  });
});