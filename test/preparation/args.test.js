const assert = require('chai').assert;
const parser = require('../../src/preparation/argParser');

describe('parser', () => {
  describe('init', () => {
    it('should not throw error in debug mode', () => {
      const args = parser.parseArgs(['-c', 'path', '-D', 'init']);
      assert.equal(args.configPath[0], 'path');
      assert.isTrue(args.debug);
      assert.equal(args.mode, 'init');
    });

    it('should not throw error in normal mode', () => {
      const args = parser.parseArgs(['-c', 'path', 'init']);
      assert.equal(args.configPath[0], 'path');
      assert.isFalse(args.debug);
      assert.equal(args.mode, 'init');
    });
  });

  describe('load', () => {
    it('should not throw error', () => {
      const args = parser.parseArgs([
        '-c', 'path', 'load',
        '-j', 'jarsDir',
        '--parameter', 'paramPath',
        '-d', 'dbName',
        '--properties', 'propDir'
      ]);
      assert.equal(args.configPath[0], 'path');
      assert.isFalse(args.debug);
      assert.equal(args.mode, 'load');
      assert.equal(args.jarsDir[0], 'jarsDir');
      assert.equal(args.paramPath[0], 'paramPath');
      assert.equal(args.dbName[0], 'dbName');
      assert.equal(args.propDir[0], 'propDir');
    });
  });

  describe('benchmark', () => {
    it('should not throw error with -i', () => {
      const args = parser.parseArgs([
        '-c', 'path', 'benchmark',
        '-i',
        '--parameter', 'paramPath',
        '-d', 'dbName'
      ]);
      assert.equal(args.configPath[0], 'path');
      assert.isFalse(args.debug);
      assert.equal(args.mode, 'benchmark');
      assert.isTrue(args.ignore);
      assert.equal(args.paramPath[0], 'paramPath');
      assert.equal(args.dbName[0], 'dbName');
    });

    it('should not throw error without -i', () => {
      const args = parser.parseArgs([
        '-c', 'path', 'benchmark',
        '--parameter', 'paramPath',
        '-d', 'dbName'
      ]);
      assert.equal(args.configPath[0], 'path');
      assert.isFalse(args.debug);
      assert.equal(args.mode, 'benchmark');
      assert.isFalse(args.ignore);
      assert.equal(args.paramPath[0], 'paramPath');
      assert.equal(args.dbName[0], 'dbName');
    });
  });
});
