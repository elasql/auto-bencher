const assert = require('chai').assert;
const { loadToml } = require('../../src/utils');
const { normalLoad } = require('../../src/preparation/parameter-loader');
const { generateConnectionList } = require('../../src/remote/connection-list');
const { Action } = require('../../src/actions/remote-actions');
const Config = require('../../src/preparation/config');

describe('generateConnectionList', () => {
  const tomlObject = loadToml('./test/test-toml/config.test.toml');
  const config = new Config(tomlObject);
  const configParam = config.getParam();

  const notComb = loadToml('./test/test-toml/parameter.test.toml');
  const benchParams = normalLoad(notComb);

  describe('loading', () => {
    const actual = generateConnectionList(configParam, benchParams[0], Action.loading);
    it('seqConn should be an expected result', () => {
      const expected = {
        id: 3,
        ip: '192.168.1.24',
        port: 30000
      };
      assert.deepEqual(actual.seqConn, expected);
    });

    it('serverConns should be 3', () => {
      assert.lengthOf(actual.serverConns, 3);
    });

    it('clientConns should be 1', () => {
      assert.lengthOf(actual.clientConns, 1);
    });
  });

  describe('benchmarking', () => {
    const actual = generateConnectionList(configParam, benchParams[0], Action.benchmarking);
    it('seqConn should be an expected result', () => {
      const expected = {
        id: 3,
        ip: '192.168.1.24',
        port: 30000
      };
      assert.deepEqual(actual.seqConn, expected);
    });

    it('serverConns should be 3', () => {
      assert.lengthOf(actual.serverConns, 3);
    });

    it('clientConns should be 3', () => {
      assert.lengthOf(actual.clientConns, 3);
    });
  });
});
