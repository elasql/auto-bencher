const assert = require('chai').assert;

const { loadToml } = require('../src/utils');
const { NormalLoad } = require('../src/benchmark-parameter');

describe('NormalLoad', () => {
  const combPath = './test/test-toml/benchmark-parameter-comb.test.toml';
  const notCombPath = './test/test-toml/benchmark-parameter.test.toml';

  const comb = loadToml(combPath);
  const notComb = loadToml(notCombPath);

  const normalLoad = new NormalLoad();

  describe('load', () => {
    describe('pass not combination parameters', () => {
      const params = normalLoad.load(notComb);

      it('should return an array with only 1 elements', () => {
        assert.isArray(params);
        assert.lengthOf(params, 1);
      });

      it('should not modify the original object', () => {
        assert.deepEqual(notComb, loadToml(notCombPath));
      });

      it('should be expected result', () => {
        const expected = [
          {
            auto_bencher: {
              jar_dir: 'test',
              max_client_per_machine: '2',
              max_server_per_machine: '1',
              server_client_ratio: '1.0',
              server_count: '3'
            },
            elasql: {
              'org.elasql.remote.groupcomm.client.BatchSpcSender.BATCH_SIZE': '5',
              'org.elasql.server.Elasql.SERVICE_TYPE': '1'
            },
            vanillabench: {
              'org.vanilladb.bench.BenchmarkerParameters.BENCHMARK_INTERVAL': '60000',
              'org.vanilladb.bench.BenchmarkerParameters.BENCH_TYPE': '2',
              'org.vanilladb.bench.BenchmarkerParameters.NUM_RTES': '10',
              'org.vanilladb.bench.BenchmarkerParameters.WARM_UP_INTERVAL': '30000',
              'org.vanilladb.bench.tpcc.TpccConstants.NUM_WAREHOUSES': '3'
            },
            vanilladb: {
              'org.vanilladb.core.storage.buffer.BufferMgr.BUFFER_POOL_SIZE': '1024000',
              'org.vanilladb.core.storage.file.io.IoAllocator.USE_O_DIRECT': 'true'
            }
          }
        ];
        assert.deepEqual(params, expected);
      });
    });

    describe('pass combination parameters', () => {
      const ErrMsg = 'Combination (mutiple values in one property) in normal-load.toml is forbidden';

      it('should throw an error', () => {
        assert.throws(
          () => { normalLoad.load(comb); },
          Error,
          ErrMsg);
      });
    });
  });
});
