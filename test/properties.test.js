const assert = require('chai').assert;

const prop = require('../src/properties');

const propertiesPath = './test/test-properties/test.properties';

describe('PropertiesFile', () => {
  describe('constructor', () => {
    const pf = new prop.PropertiesFile(1, propertiesPath);
    it('should initialize with corret values and types', () => {
      assert.isNumber(pf.id);
      assert.isString(pf.fileName);
      assert.isObject(pf.properties);

      assert.equal(pf.id, 1);
      assert.equal(pf.fileName, 'test');
    });
  });

  describe('set', () => {
    const pf = new prop.PropertiesFile(1, propertiesPath);
    const key = 'org.vanilladb.core.util.Profiler.DEPTH';
    it('should correctly set the value', () => {
      // before
      assert.equal(pf.properties[key], '4');

      pf.set(key, '6');

      // after
      assert.equal(pf.properties[key], '6');
    });

    it('should throw an error if passing a non-string value', () => {
      const value = 6;
      assert.throws(() => { pf.set(key, value); }, Error, `value ${value} is not in string type`);
    });
  });

  describe('getValidFilePath', () => {
    const outputDir = 'outpurDir';
    const pf = new prop.PropertiesFile(1, propertiesPath);
    const filePath = pf.getValidFilePath(outputDir);
    it('should return a valid file path', () => {
      const expected = outputDir + '/test.properties';
      assert.equal(filePath, expected);
    });
  });

  describe('convertObjectToPropertiesText', () => {
    const pf = new prop.PropertiesFile(1, propertiesPath);
    const text = pf.convertObjectToPropertiesText();
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
