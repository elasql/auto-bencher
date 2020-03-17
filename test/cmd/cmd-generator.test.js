const assert = require('chai').assert;

const Cmd = require('../../src/cmd/cmd-generator');

describe('Cmd', () => {
  const cmd = new Cmd('db-team', '140.114.87.87');

  describe('mkdir', () => {
    it('should return a correct command', () => {
      const actual = Cmd.mkdir('workDir', 'dir');
      const expected = 'mkdir -p workDir/dir';
      assert.equal(actual, expected);
    });
  });

  describe('javaVersion', () => {
    it('should return a correct command', () => {
      const actual = Cmd.javaVersion('workDir', 'jdkDir');
      const expected = 'workDir/jdkDir/bin/java -version';
      assert.equal(actual, expected);
    });
  });

  describe('tar', () => {
    it('should return a correct command', () => {
      const actual = Cmd.tar('workDir', 'jdkPackageName');
      const expected = 'tar -C workDir -zxf workDir/jdkPackageName';
      assert.equal(actual, expected);
    });
  });

  describe('rm', () => {
    it('should return a correct command without -r', () => {
      const actual = Cmd.rm(false, 'workDir', 'jdkPackageName');
      const expected = 'rm workDir/jdkPackageName';
      assert.equal(actual, expected);
    });
    it('should return a correct command with -r', () => {
      const actual = Cmd.rm(true, 'workDir', 'jdkPackageName');
      const expected = 'rm -rf workDir/jdkPackageName';
      assert.equal(actual, expected);
    });
    it('should return a correct command with only passing directory parameter', () => {
      const actual = Cmd.rm(true, 'workDir');
      const expected = 'rm -rf workDir';
      assert.equal(actual, expected);
    });
  });

  describe('cp', () => {
    it('should return a correct command without -r', () => {
      const actual = Cmd.cp(false, 'src', 'dest');
      const expected = 'cp src dest';
      assert.equal(actual, expected);
    });

    it('should return a correct command with -r', () => {
      const actual = Cmd.cp(true, 'src', 'dest');
      const expected = 'cp -r src dest';
      assert.equal(actual, expected);
    });
  });

  describe('runJar', () => {
    it('should return a correct command', () => {
      const actual = Cmd.runJar(
        'workDir/jdkDir/bin/java', '-vmarg1 -vmarg2', 'jarPath', '-progArg1 -progArg2', 'logPath');
      const expected = 'workDir/jdkDir/bin/java -vmarg1 -vmarg2 -jar jarPath -progArg1 -progArg2 > logPath 2>&1 &';
      assert.equal(actual, expected);
    });
  });

  describe('grep', () => {
    it('should return a correct command', () => {
      const actual = Cmd.grep('keyword', 'logPath');
      const expected = 'grep \\"keyword\\" logPath';
      assert.equal(actual, expected);
    });
  });

  describe('grepCsv', () => {
    it('should return a correct command', () => {
      const actual = Cmd.grepCsv('resultDir', 'id');
      const expected = 'ls resultDir | grep \\"id[.]csv\\"';
      assert.equal(actual, expected);
    });
  });

  describe('grepTotal', () => {
    it('should return a correct command', () => {
      const grep = Cmd.grepTotal('resultDir', 'id');
      const expected = 'grep \\"TOTAL\\" resultDir/*-id.txt';
      assert.equal(grep, expected);
    });
  });

  describe('ls', () => {
    it('should return a correct command', () => {
      const actual = Cmd.ls('dir');
      const expected = 'ls dir';
      assert.equal(actual, expected);
    });
  });

  describe('killBenchmarker', () => {
    it('should return a correct command', () => {
      const actual = Cmd.killBenchmarker();
      const expected = 'pkill -f benchmarker';
      assert.equal(actual, expected);
    });
  });

  describe('scp', () => {
    it('should return a correct command without -r', () => {
      const actual = cmd.scp(false, 'localPath', 'remotePath');
      const expected = 'scp localPath db-team@140.114.87.87:remotePath';
      assert.equal(actual, expected);
    });

    it('should return a correct command with -r', () => {
      const actual = cmd.scp(true, 'localPath', 'remotePath');
      const expected = 'scp -r localPath db-team@140.114.87.87:remotePath';
      assert.equal(actual, expected);
    });
  });

  describe('ssh', () => {
    it('should return a correct command', () => {
      const actual = cmd.ssh('ls -al');
      const expected = 'ssh db-team@140.114.87.87 "ls -al"';
      assert.equal(actual, expected);
    });
  });
});
