const assert = require('chai').assert;
const { loadToml } = require('../../src/utils');
const { Properties, genPropertiestMap, overrideProperties } = require('../../src/preparation/properties');

describe('Properties', () => {
  const propertiesPath = './test/test-properties/vanilladb.properties';
  const prop = new Properties('org.vanilladb.core.config.file', propertiesPath);

  describe('constructor', () => {
    it('should initialize with corret values and types', () => {
      assert.equal(prop.id, 'org.vanilladb.core.config.file');
      assert.equal(prop.fileName, propertiesPath);
      assert.equal(prop.baseName, 'vanilladb');
    });

    it('should throw an error if pass id in type of number', () => {
      assert.throws(() => new Properties(1, propertiesPath), Error, 'id should be type of string');
    });
  });

  describe('set', () => {
    const key = 'org.vanilladb.core.util.Profiler.DEPTH';
    it('should correctly set the value', () => {
      // before
      assert.equal(prop.properties[key], '4');

      prop.set(key, '6');

      // after
      assert.equal(prop.properties[key], '6');
    });

    it('should throw an error if passing a non-string value', () => {
      const value = 6;
      assert.throws(() => { prop.set(key, value); }, Error, `value ${value} is not in string type`);
    });
  });

  describe('convertObjectToPropertiesText', () => {
    const text = prop.convertObjectToPropertiesText();
    it('should return a string', () => {
      assert.isString(text);
    });

    it('should return an expected value', () => {
      const expected = `org.vanilladb.core.storage.file.Page.BLOCK_SIZE=4096
org.vanilladb.core.storage.file.FileMgr.DB_FILES_DIR=
org.vanilladb.core.storage.file.FileMgr.LOG_FILES_DIR=
org.vanilladb.core.storage.file.io.IoAllocator.USE_O_DIRECT=false
org.vanilladb.core.storage.buffer.BufferMgr.MAX_TIME=10000
org.vanilladb.core.storage.buffer.BufferMgr.EPSILON=50
org.vanilladb.core.storage.buffer.BufferMgr.BUFFER_POOL_SIZE=102400
org.vanilladb.core.storage.log.LogMgr.LOG_FILE=vanilladb.log
org.vanilladb.core.storage.tx.concurrency.LockTable.MAX_TIME=10000
org.vanilladb.core.storage.tx.concurrency.LockTable.EPSILON=50
org.vanilladb.core.server.VanillaDb.DO_CHECKPOINT=false
org.vanilladb.core.storage.tx.recovery.CheckpointTask.TX_COUNT_TO_CHECKPOINT=1000
org.vanilladb.core.storage.tx.recovery.CheckpointTask.MY_METHOD=0
org.vanilladb.core.storage.tx.recovery.CheckpointTask.PERIOD=300000
org.vanilladb.core.storage.tx.TransactionMgr.SERIALIZABLE_CONCUR_MGR=org.elasql.storage.tx.concurrency.ConservativeOrderedCcMgr
org.vanilladb.core.storage.tx.TransactionMgr.REPEATABLE_READ_CONCUR_MGR=org.elasql.storage.tx.concurrency.ConservativeOrderedCcMgr
org.vanilladb.core.storage.tx.TransactionMgr.READ_COMMITTED_CONCUR_MGR=org.elasql.storage.tx.concurrency.ConservativeOrderedCcMgr
org.vanilladb.core.storage.tx.TransactionMgr.RECOVERY_MGR=org.vanilladb.core.storage.tx.recovery.RecoveryMgr
org.vanilladb.core.storage.metadata.TableMgr.MAX_NAME=30
org.vanilladb.core.storage.metadata.ViewMgr.MAX_VIEWDEF=150
org.vanilladb.core.storage.metadata.statistics.StatMgr.REFRESH_THRESHOLD=0
org.vanilladb.core.storage.metadata.statistics.StatMgr.NUM_BUCKETS=20
org.vanilladb.core.storage.metadata.statistics.StatMgr.NUM_PERCENTILES=5
org.vanilladb.core.storage.metadata.statistics.SampledHistogramBuilder.MAX_SAMPLES=1000
org.vanilladb.core.storage.index.hash.HashIndex.NUM_BUCKETS=100
org.vanilladb.core.sql.VarcharType.CHAR_SET=UTF-8
org.vanilladb.core.query.parse.Parser.DEFAULT_INDEX_TYPE=1
org.vanilladb.core.remote.jdbc.RemoteConnectionImpl.DEFAULT_ISOLATION_LEVEL=8
org.vanilladb.core.server.VanillaDb.QUERYPLANNER=org.vanilladb.core.query.planner.opt.HeuristicQueryPlanner
org.vanilladb.core.server.VanillaDb.UPDATEPLANNER=org.vanilladb.core.query.planner.index.IndexUpdatePlanner
org.vanilladb.core.server.VanillaDb.PROFILE_OUTPUT_DIR=
org.vanilladb.core.server.task.TaskMgr.THREAD_POOL_SIZE=1000
org.vanilladb.core.util.Profiler.INTERVAL=3
org.vanilladb.core.util.Profiler.DEPTH=4
org.vanilladb.core.util.Profiler.MAX_PACKAGES=100
org.vanilladb.core.util.Profiler.MAX_METHODS=1000
org.vanilladb.core.util.Profiler.MAX_LINES=1000
`;
      assert.equal(text, expected);
    });
  });
});

const map = genPropertiestMap('./test/test-properties');
describe('genPropertiesMap', () => {
  it('should return an object', () => {
    assert.isObject(map);
  });

  it('should contain instance of Properties', () => {
    Object.keys(map).map(key => {
      assert.instanceOf(map[key], Properties);
    });
  });
});

describe('overrrideProperties', () => {
  const notCombPath = './test/test-toml/benchmark-parameter.test.toml';
  const notComb = loadToml(notCombPath);
  const params = normalLoad(notComb);
  const benchParam = params[0];
  overrideProperties(map, benchParam);
});

// describe('PropertiesFileMap', () => {
//   const id = 'org.vanilladb.core.config.file';
//   const fileName = 'vanilladb.properties';
//   const pfm = new prop.PropertiesFileMap(propertiesDir);

//   describe('constructor', () => {
//     it('should initialize with corret values and types', () => {
//       assert.equal(pfm.propertiesDir, propertiesDir);
//       assert.isObject(pfm.fileNameToPropertiesFileObject);
//     });
//   });

//   describe('genFileNameToPropertiesFileObjectMap', () => {
//     const map = pfm.genFileNameToPropertiesFileObjectMap();
//     it('should return an object', () => {
//       assert.isObject(map);
//     });

//     it('should retrun an expected result', () => {
//       const filePath = path.posix.join(propertiesDir, fileName);
//       const fileNameWithoutExtension = path.posix.basename(fileName, '.properties');
//       assert.hasAllKeys(map, ['elasql', 'elasqlbench', 'logging', 'vanillabench', 'vanilladb', 'vanilladbcomm']);
//       assert.deepEqual(map[fileNameWithoutExtension], new prop.PropertiesFile(id, filePath));
//     });
//   });

//   describe('overrideProperties', () => {
//     const notCombPath = './test/test-toml/benchmark-parameter.test.toml';
//     const notComb = loadToml(notCombPath);
//     const params = bp.normalLoad(notComb);
//     pfm.overrideProperties(params[0]);

//     it('should override correctly', () => {
//       const properties = pfm.fileNameToPropertiesFileObject.vanilladb.properties;
//       assert.equal(properties['org.vanilladb.core.storage.buffer.BufferMgr.BUFFER_POOL_SIZE'], '1024000');
//       assert.equal(properties['org.vanilladb.core.storage.file.io.IoAllocator.USE_O_DIRECT'], 'true');
//     });
//   });

//   describe('setPaths', () => {
//     const prop = { dbDir: 'dbDir', resultDir: 'resultDir' };
//     pfm.setPaths(prop);

//     it('should set path in properties file correctly', () => {
//       const vanilladbProps = pfm.fileNameToPropertiesFileObject.vanilladb.properties;
//       const vanillabenchProps = pfm.fileNameToPropertiesFileObject.vanillabench.properties;
//       assert.equal(vanilladbProps['org.vanilladb.core.storage.file.FileMgr.DB_FILES_DIR'], prop.dbDir);
//       assert.equal(vanillabenchProps['org.vanilladb.bench.StatisticMgr.OUTPUT_DIR'], prop.resultDir);
//     });
//   });
// });
