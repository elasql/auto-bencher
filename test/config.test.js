const assert = require('chai').assert;

const { loadToml } = require('../src/utils');
const Config = require('../src/config');

describe('Config', () => {
  const tomlObject = loadToml('./test/test-toml/config.test.toml');
  const config = new Config(tomlObject);
  const {
    jdkDir,
    jdkPackageName,
    jdkPackagePath,
    involvedMachines,
    systemUserName,
    systemRemoteWorkDir,
    dbDir,
    jarPath
  } = config.getParams();

  describe('params.dbDir', () => {
    it('should be expected result', () => {
      const expected = 'auto_test/databases';
      assert.equal(dbDir, expected);
    });
  });

  describe('params.jarPath', () => {
    it('should be expected result', () => {
      const expected = 'auto_test/benchmarker/server.jar';
      assert.equal(jarPath, expected);
    });
  });

  describe('params.jdkPackagePath', () => {
    it('should be expected result', () => {
      const expected = 'package/jdk-8u211-linux-x64.tar.gz';
      assert.equal(jdkPackagePath, expected);
    });
  });

  describe('params.jdkPackageName', () => {
    it('should be expected result', () => {
      const expected = 'jdk-8u211-linux-x64.tar.gz';
      assert.equal(jdkPackageName, expected);
    });
  });

  describe('params.jdkDir', () => {
    it('should return a string', () => {
      const expected = 'jdk1.8.0_211';
      assert.equal(jdkDir, expected);
    });
  });

  describe('params.involvedMachines', () => {
    it('should return an array with 6 elements', () => {
      assert.isArray(involvedMachines);
      assert.lengthOf(involvedMachines, 6);
    });
  });

  describe('params.systemUserName', () => {
    it('should return a string', () => {
      const expected = 'db-team';
      assert.equal(systemUserName, expected);
    });
  });

  describe('params.systemRemoteWorkDir', () => {
    it('should return a string', () => {
      const expected = 'auto_test';
      assert.equal(systemRemoteWorkDir, expected);
    });
  });
});
