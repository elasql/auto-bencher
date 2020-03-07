const assert = require('chai').assert;

const { loadToml } = require('../src/utils');
const bp = require('../src/benchmark-parameter');

const combPath = './test/test-toml/benchmark-parameter-comb.test.toml';
const notCombPath = './test/test-toml/benchmark-parameter.test.toml';

const comb = loadToml(combPath);
const notComb = loadToml(notCombPath);
const params = bp.normalLoad(notComb);

describe('normalLoad', () => {
  describe('load', () => {
    describe('pass not combination parameters', () => {
      it('should return an array with only 1 elements', () => {
        assert.isArray(params);
        assert.lengthOf(params, 1);
      });

      it('should not modify the original object', () => {
        assert.deepEqual(notComb, loadToml(notCombPath));
      });

      it('should be an expected result', () => {
        const expected = [
          {
            auto_bencher: {
              jar_dir: 'test',
              max_client_per_machine: '2',
              max_server_per_machine: '1',
              server_client_ratio: '1.0',
              server_count: '3'
            },
            vanilladb: {
              'org.vanilladb.core.storage.buffer.BufferMgr.BUFFER_POOL_SIZE': '1024000',
              'org.vanilladb.core.storage.file.io.IoAllocator.USE_O_DIRECT': 'true'
            }
          }
        ];
        assert.deepEqual(params, expected);
      });

      it('should return in string type', () => {
        assert.isString(params[0].auto_bencher.jar_dir);
        assert.isNotNumber(params[0].auto_bencher.max_server_per_machine);
        assert.isNotNumber(params[0].auto_bencher.server_client_ratio);
        assert.isNotBoolean(params[0].vanilladb['org.vanilladb.core.storage.file.io.IoAllocator.USE_O_DIRECT']);
      });
    });

    describe('pass combination parameters', () => {
      const ErrMsg = 'combination (mutiple values in one property) in normal-load.toml is forbidden';

      it('should throw an error', () => {
        assert.throws(
          () => { bp.normalLoad(comb); },
          Error,
          ErrMsg);
      });
    });
  });

  const autoBencher = 'auto_bencher';
  const vanilladb = 'vanilladb';
  const serverCount = 'server_count';
  const jarDir = 'jar_dir';
  const useDirect = 'org.vanilladb.core.storage.file.io.IoAllocator.USE_O_DIRECT';

  describe('getStrValue', () => {
    it('should return a string value', () => {
      const value = bp.getStrValue(params[0], autoBencher, serverCount);
      assert.isString(value);
    });

    it('should throw an error', () => {
      const badFunc = {
        server_count: () => {}
      };
      const badObject = {
        auto_bencher: badFunc
      };
      const ErrMsg = `cannot get ${autoBencher}.${serverCount} in string type`;
      assert.throws(() => { bp.getStrValue(badObject, autoBencher, serverCount); }, Error, ErrMsg);
    });
  });

  describe('getNumValue', () => {
    it('should return a number value', () => {
      const value = bp.getNumValue(params[0], autoBencher, serverCount);
      assert.isNumber(value);
    });

    it('should throw an error', () => {
      const ErrMsg = `cannot get ${autoBencher}.${jarDir} in number type`;
      assert.throws(() => { bp.getNumValue(params[0], autoBencher, jarDir); }, Error, ErrMsg);
    });
  });

  describe('getBoolValue', () => {
    it('should return a bool value', () => {
      const value = bp.getBoolValue(params[0], vanilladb, useDirect);
      assert.isBoolean(value);
    });

    it('should throw an error', () => {
      const ErrMsg = `cannot get ${autoBencher}.${jarDir} in boolean type`;
      assert.throws(() => { bp.getBoolValue(params[0], autoBencher, jarDir); }, Error, ErrMsg);
    });
  });

  describe('getValue', () => {
    const a = 'a';
    const b = 'b';
    it('should throw an error if passing invalid table name', () => {
      const ErrMsg = `table ${a} doesn't exist`;
      assert.throws(() => { bp.getValue(params[0], a, b); }, Error, ErrMsg);
    });

    it('should throw an error if passing invalid property name', () => {
      const ErrMsg = `property ${b} doesn't exist in table ${a}`;
      assert.throws(() => { bp.getValue(params[0], autoBencher, b); }, Error, ErrMsg);
    });
  });
});
