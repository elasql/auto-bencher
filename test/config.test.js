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
    serverJarPath,
    clientJarPath,
    javaBin,
    resultPath
  } = config.getParams();

  describe('params.dbDir', () => {
    it('should be expected result', () => {
      const expected = 'auto_test/databases';
      assert.equal(dbDir, expected);
    });
  });

  describe('params.serverJarPath', () => {
    it('should be expected result', () => {
      const expected = 'auto_test/benchmarker/server.jar';
      assert.equal(serverJarPath, expected);
    });
  });

  describe('params.clientJarPath', () => {
    it('should be expected result', () => {
      const expected = 'auto_test/benchmarker/client.jar';
      assert.equal(clientJarPath, expected);
    });
  });

  describe('params.javaBin', () => {
    it('should be expected result', () => {
      const expected = 'auto_test/jdk1.8.0_211/bin/java';
      assert.equal(javaBin, expected);
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
    it('should be expected result', () => {
      const expected = [
        '192.168.1.24',
        '192.168.1.25',
        '192.168.1.26',
        '192.168.1.27',
        '192.168.1.30',
        '192.168.1.31'
      ];
      assert.deepEqual(involvedMachines, expected);
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

  describe('params.resultPath', () => {
    it('should return a string', () => {
      const expected = 'auto_test/results';
      assert.equal(resultPath, expected);
    });
  });
});
