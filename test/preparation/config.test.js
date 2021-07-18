const assert = require('chai').assert;

const { loadToml } = require('../../src/utils');
const Config = require('../../src/preparation/config');

describe('Config', () => {
  const tomlObject = loadToml('./test/test-toml/config.test.toml');
  const config = new Config(tomlObject);

  const {
    sequencerVmHeap,
    serversVmHeap,
    clientsVmHeap,
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
    resultDir,
    sequencer,
    clients,
    servers
  } = config.getParam();

  const noSeqtomlObject = loadToml('./test/test-toml/config-no-sequencer.test.toml');
  const noSeqConfig = new Config(noSeqtomlObject);

  const noSeqStrtomlObject = loadToml('./test/test-toml/config-no-sequencer-string.test.toml');
  const noSeqStrConfig = new Config(noSeqStrtomlObject);

  describe('configParam.dbDir', () => {
    it('should be an expected result', () => {
      const expected = 'auto_test/databases';
      assert.equal(dbDir, expected);
    });
  });

  describe('configParam.serverJarPath', () => {
    it('should be an expected result', () => {
      const expected = 'auto_test/benchmarker/server.jar';
      assert.equal(serverJarPath, expected);
    });
  });

  describe('configParam.clientJarPath', () => {
    it('should be an expected result', () => {
      const expected = 'auto_test/benchmarker/client.jar';
      assert.equal(clientJarPath, expected);
    });
  });

  describe('configParam.javaBin', () => {
    it('should be an expected result', () => {
      const expected = 'auto_test/jdk1.8.0_211/bin/java';
      assert.equal(javaBin, expected);
    });
  });

  describe('configParam.jdkPackagePath', () => {
    it('should be an expected result', () => {
      const expected = 'package/jdk-8u211-linux-x64.tar.gz';
      assert.equal(jdkPackagePath, expected);
    });
  });

  describe('configParam.jdkPackageName', () => {
    it('should be an expected result', () => {
      const expected = 'jdk-8u211-linux-x64.tar.gz';
      assert.equal(jdkPackageName, expected);
    });
  });

  describe('configParam.jdkDir', () => {
    it('should return a string', () => {
      const expected = 'jdk1.8.0_211';
      assert.equal(jdkDir, expected);
    });
  });

  describe('sequencerVmHeap', () => {
    it('should return a string', () => {
      const expected = '-Xmx16g -Xms16g';
      assert.equal(sequencerVmHeap, expected);
    });
  });

  describe('serversVmHeap', () => {
    it('should return a string', () => {
      const expected = '-Xmx6g -Xms6g';
      assert.equal(serversVmHeap, expected);
    });
  });

  describe('clientsVmHeap', () => {
    it('should return a string', () => {
      const expected = '-Xmx4g -Xms4g';
      assert.equal(clientsVmHeap, expected);
    });
  });

  describe('configParam.involvedMachines', () => {
    it('should return an array with 6 elements', () => {
      assert.isArray(involvedMachines);
      assert.lengthOf(involvedMachines, 6);
    });
    it('should be an expected result', () => {
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

  describe('configParam.systemUserName', () => {
    it('should be an expected result', () => {
      const expected = 'db-team';
      assert.equal(systemUserName, expected);
    });
  });

  describe('configParam.systemRemoteWorkDir', () => {
    it('should be an expected result', () => {
      const expected = 'auto_test';
      assert.equal(systemRemoteWorkDir, expected);
    });
  });

  describe('configParam.resultDir', () => {
    it('should be an expected result', () => {
      const expected = 'auto_test/results';
      assert.equal(resultDir, expected);
    });
  });

  describe('configParam.sequencer', () => {
    it('should not return an array', () => {
      assert.isNotArray(sequencer);
    });
    it('should be an expected result', () => {
      const expected = '192.168.1.24';
      assert.equal(sequencer, expected);
    });
    it('should return undefined if it is empty e.g, [""]', () => {
      const expected = undefined;
      assert.equal(noSeqConfig.sequencer, expected);
    });
    it('should return undefined if it is empty e.g. ""', () => {
      const expected = undefined;
      assert.equal(noSeqStrConfig.sequencer, expected);
    });
  });

  describe('configParam.clients', () => {
    it('should return an array', () => {
      assert.isArray(clients);
    });
    it('should be an expected result', () => {
      const expected = [
        '192.168.1.30',
        '192.168.1.31'
      ];
      assert.deepEqual(clients, expected);
    });
  });

  describe('configParam.servers', () => {
    it('should return an array', () => {
      assert.isArray(servers);
    });
    it('should be an expected result', () => {
      const expected = [
        '192.168.1.25',
        '192.168.1.26',
        '192.168.1.27'
      ];
      assert.deepEqual(servers, expected);
    });
  });
});
