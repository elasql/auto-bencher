const assert = require('chai').assert;

const ShellCmdGenerator = require('../src/shell-cmd-generator');

describe('ShellCmdGenerator', () => {
  const cmdGen = new ShellCmdGenerator('db-team', '140.114.87.87');

  describe('getScp', () => {
    it('should return a correct command  without -r', () => {
      const cmd = cmdGen.getScp(false, 'localPath', 'remotePath');
      const ans = 'scp localPath db-team@140.114.87.87:remotePath';
      assert.equal(cmd, ans);
    });

    it('should return a correct command  with -r', () => {
      const cmd = cmdGen.getScp(true, 'localPath', 'remotePath');
      const ans = 'scp -r localPath db-team@140.114.87.87:remotePath';
      assert.equal(cmd, ans);
    });
  });

  describe('getMkdir', () => {
    it('should return a correct command ', () => {
      const cmd = ShellCmdGenerator.getMkdir('workDir', 'dir');
      const ans = 'mkdir -p workDir/dir';
      assert.equal(cmd, ans);
    });
  });

  describe('getJavaVersion', () => {
    it('should return a correct command ', () => {
      const cmd = ShellCmdGenerator.getJavaVersion('workDir', 'jdkDir');
      const ans = 'workDir/jdkDir/bin/java -version';
      assert.equal(cmd, ans);
    });
  });

  describe('getTar', () => {
    it('should return a correct command ', () => {
      const cmd = ShellCmdGenerator.getTar('workDir', 'jdkPackageName');
      const ans = 'tar -C workDir -zxf workDir/jdkPackageName';
      assert.equal(cmd, ans);
    });
  });

  describe('getRm', () => {
    it('should return a correct command ', () => {
      const cmd = ShellCmdGenerator.getRm('workDir', 'jdkPackageName');
      const ans = 'rm workDir/jdkPackageName';
      assert.equal(cmd, ans);
    });
  });

  describe('getSsh', () => {
    it('should return a correct command ', () => {
      const cmd = cmdGen.getSsh('ls -al');
      const ans = 'ssh db-team@140.114.87.87 ls -al';
      assert.equal(cmd, ans);
    });
  });

  describe('getCp', () => {
    it('should return a correct command without -r', () => {
      const cmd = cmdGen.getCp(false, 'src', 'dest');
      const ans = 'cp src dest';
      assert.equal(cmd, ans);
    });

    it('should return a correct command with -r', () => {
      const cmd = cmdGen.getCp(true, 'src', 'dest');
      const ans = 'cp -r src dest';
      assert.equal(cmd, ans);
    });
  });
});
