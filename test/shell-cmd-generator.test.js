const assert = require('chai').assert;

const ShellCmdGenerator = require('../src/shell-cmd-generator');

describe('ShellCmdGenerator', () => {
  const cmdGen = new ShellCmdGenerator('db-team', '140.114.87.87');

  describe('getScpCmd', () => {
    it('should be correct without -r', () => {
      const cmd = cmdGen.getScpCmd(false, 'localPath', 'remotePath');
      const ans = 'scp localPath db-team@140.114.87.87:remotePath';
      assert.equal(cmd, ans);
    });

    it('should be correct with -r', () => {
      const cmd = cmdGen.getScpCmd(true, 'localPath', 'remotePath');
      const ans = 'scp -r localPath db-team@140.114.87.87:remotePath';
      assert.equal(cmd, ans);
    });
  });

  describe('getSshCmd', () => {
    it('should be correct', () => {
      const cmd = cmdGen.getSshCmd('ls -al');
      const ans = 'ssh db-team@140.114.87.87 ls -al';
      assert.equal(cmd, ans);
    });
  });

  describe('getCpCmd', () => {
    it('should be correct without -r', () => {
      const cmd = cmdGen.getCpCmd(false, 'src', 'dest');
      const ans = 'cp src dest';
      assert.equal(cmd, ans);
    });

    it('should be correct with -r', () => {
      const cmd = cmdGen.getCpCmd(true, 'src', 'dest');
      const ans = 'cp -r src dest';
      assert.equal(cmd, ans);
    });
  });

});
