const assert = require('chai').assert;

const Config = require('../src/config');

describe('Config', () => {
  const config = new Config('./config.toml');
  const params = config.getParams();

  describe('params.jdkPackagePath', () => {
    it('should return a string', () => {
      assert.isString(params.jdkPackagePath);
    });
  });

  describe('params.jdkPackageFileName', () => {
    it('should return a string', () => {
      assert.isString(params.jdkPackageFileName);
    });
    it('should not have slash in the string', () => {
      assert.notInclude(params.jdkPackageFileName, '/');
    });
  });

  describe('params.jdkDirName', () => {
    it('should return a string', () => {
      assert.isString(params.jdkDirName);
    });
  });

  describe('params.involvedMachines', () => {
    it('should return an array', () => {
      assert.isArray(params.involvedMachines);
    });
    it('should not be empty', () => {
      assert.isNotEmpty(params.involvedMachines);
    });
  });

  describe('params.systemUserName', () => {
    it('should return a string', () => {
      assert.isString(params.systemUserName);
    });
  });

  describe('params.systemRemoteWorkDir', () => {
    it('should return a string', () => {
      assert.isString(params.systemRemoteWorkDir);
    });
  });
});
