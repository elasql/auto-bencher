const assert = require('chai').assert;

const ShellCmd = require('../src/shell-cmd');

describe('ShellCmd', () => {
  const userName = 'db-team';
  const ip = '140.114.87.87';
  const shellCmd = new ShellCmd(userName, ip);

  const workDir = 'workDir';
  const jdkDir = 'jdkDir';
  const jdkPackageName = 'jdkPackageName';
  const javaBin = 'workDir/jdkDir/bin/java';

  describe('getMkdir', () => {
    const dir = 'dir';

    it('should return a correct command', () => {
      const cmd = ShellCmd.getMkdir(workDir, dir);
      const expected = `mkdir -p ${workDir}/${dir}`;
      assert.equal(cmd, expected);
    });
  });

  describe('getJavaVersion', () => {
    it('should return a correct command', () => {
      const cmd = ShellCmd.getJavaVersion(workDir, jdkDir);
      const expected = `${workDir}/${jdkDir}/bin/java -version`;
      assert.equal(cmd, expected);
    });
  });

  describe('getTar', () => {
    it('should return a correct command', () => {
      const cmd = ShellCmd.getTar(workDir, jdkPackageName);
      const expected = `tar -C ${workDir} -zxf ${workDir}/${jdkPackageName}`;
      assert.equal(cmd, expected);
    });
  });

  describe('getRm', () => {
    it('should return a correct command without -r', () => {
      const cmd = ShellCmd.getRm(false, workDir, jdkPackageName);
      const expected = `rm ${workDir}/${jdkPackageName}`;
      assert.equal(cmd, expected);
    });
    it('should return a correct command with -r', () => {
      const cmd = ShellCmd.getRm(true, workDir, jdkPackageName);
      const expected = `rm -rf ${workDir}/${jdkPackageName}`;
      assert.equal(cmd, expected);
    });
    it('should return a correct command with only passing directory parameter', () => {
      const cmd = ShellCmd.getRm(true, workDir);
      const expected = `rm -rf ${workDir}`;
      assert.equal(cmd, expected);
    });
  });

  describe('getCp', () => {
    const src = 'src';
    const dest = 'dest';

    it('should return a correct command without -r', () => {
      const cmd = ShellCmd.getCp(false, src, dest);
      const expected = `cp ${src} ${dest}`;
      assert.equal(cmd, expected);
    });

    it('should return a correct command with -r', () => {
      const cmd = ShellCmd.getCp(true, src, dest);
      const expected = `cp -r ${src} ${dest}`;
      assert.equal(cmd, expected);
    });
  });

  describe('getRunJar', () => {
    const vmArgs = '-vmarg1 -vmarg2';
    const jarPath = 'jarPath';
    const progArgs = '-progArg1 -progArg2';
    const logPath = 'logPath';

    it('should return a correct command', () => {
      const cmd = ShellCmd.getRunJar(
        javaBin, vmArgs, jarPath, progArgs, logPath);
      const expected = `${javaBin} ${vmArgs} -jar ${jarPath} ${progArgs} > ${logPath} 2>&1 &`;
      assert.equal(cmd, expected);
    });
  });

  describe('getGrep', () => {
    it('should return a correct command', () => {
      const keyword = 'keyword';
      const logPath = 'logPath';
      const cmd = ShellCmd.getGrep(keyword, logPath);
      const expected = `grep \\"${keyword}\\" ${logPath}`;
      assert.equal(cmd, expected);
    });
  });

  describe('getGrepCsv', () => {
    it('should return a correct command', () => {
      const resultDir = 'resultDir';
      const id = 'id';
      const cmd = ShellCmd.getGrepCsv(resultDir, id);
      const expected = `ls ${resultDir} | grep \\"${id}[.]csv\\"`;
      assert.equal(cmd, expected);
    });
  });

  describe('getGrepTotal', () => {
    it('should return a correct command', () => {
      const resultDir = 'resultDir';
      const id = 'id';
      const cmd = ShellCmd.getGrepTotal(resultDir, id);
      const expected = `grep \\"TOTAL\\" ${resultDir}/*-${id}.txt`;
      assert.equal(cmd, expected);
    });
  });

  describe('getLs', () => {
    it('should return a correct command', () => {
      const dir = 'dir';
      const cmd = ShellCmd.getLs(dir);
      const expected = `ls ${dir}`;
      assert.equal(cmd, expected);
    });
  });

  describe('getKillBenchmarker', () => {
    it('should return a correct command', () => {
      const cmd = ShellCmd.getKillBenchmarker();
      const expected = `pkill -f benchmarker`;
      assert.equal(cmd, expected);
    });
  });

  describe('getScp', () => {
    const localPath = 'localPath';
    const remotePath = 'remotePath';

    it('should return a correct command without -r', () => {
      const cmd = shellCmd.getScp(false, localPath, remotePath);
      const expected = `scp ${localPath} ${userName}@${ip}:${remotePath}`;
      assert.equal(cmd, expected);
    });

    it('should return a correct command with -r', () => {
      const cmd = shellCmd.getScp(true, localPath, remotePath);
      const expected = `scp -r ${localPath} ${userName}@${ip}:${remotePath}`;
      assert.equal(cmd, expected);
    });
  });

  describe('getSsh', () => {
    it('should return a correct command', () => {
      const cmd = shellCmd.getSsh('ls -al');
      const expected = `ssh ${userName}@${ip} "ls -al"`;
      assert.equal(cmd, expected);
    });
  });
});
