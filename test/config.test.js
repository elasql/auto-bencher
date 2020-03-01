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
    systemRemoteWorkDir
  } = config.getParams();

  describe('params.jdkPackagePath', () => {
    it('should return a string', () => {
      assert.isString(jdkPackagePath);
    });
  });

  describe('params.jdkPackageName', () => {
    it('should return a string', () => {
      assert.isString(jdkPackageName);
    });
    it('should not have slash in the string', () => {
      assert.notInclude(jdkPackageName, '/');
    });
  });

  describe('params.jdkDir', () => {
    it('should return a string', () => {
      assert.isString(jdkDir);
    });
  });

  describe('params.involvedMachines', () => {
    it('should return an array', () => {
      assert.isArray(involvedMachines);
    });
    it('should not be empty', () => {
      assert.isNotEmpty(involvedMachines);
    });
  });

  describe('params.systemUserName', () => {
    it('should return a string', () => {
      assert.isString(systemUserName);
    });
  });

  describe('params.systemRemoteWorkDir', () => {
    it('should return a string', () => {
      assert.isString(systemRemoteWorkDir);
    });
  });
});
