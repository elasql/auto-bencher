const assert = require('chai').assert;

const Cmd = require('../../../src/cmd/cmd-generator');

describe('Cmd', () => {
  const userName = 'db-team';
  const ip = '140.114.87.87';
  const cmd = new Cmd(userName, ip);

  const workDir = 'workDir';
  const jdkDir = 'jdkDir';
  const jdkPackageName = 'jdkPackageName';
  const javaBin = 'workDir/jdkDir/bin/java';

  describe('mkdir', () => {
    const dir = 'dir';

    it('should return a correct command', () => {
      const mkdir = Cmd.mkdir(workDir, dir);
      const expected = `mkdir -p ${workDir}/${dir}`;
      assert.equal(mkdir, expected);
    });
  });

  describe('javaVersion', () => {
    it('should return a correct command', () => {
      const javaVersion = Cmd.javaVersion(workDir, jdkDir);
      const expected = `${workDir}/${jdkDir}/bin/java -version`;
      assert.equal(javaVersion, expected);
    });
  });

  describe('tar', () => {
    it('should return a correct command', () => {
      const tar = Cmd.tar(workDir, jdkPackageName);
      const expected = `tar -C ${workDir} -zxf ${workDir}/${jdkPackageName}`;
      assert.equal(tar, expected);
    });
  });

  describe('rm', () => {
    it('should return a correct command without -r', () => {
      const rm = Cmd.rm(false, workDir, jdkPackageName);
      const expected = `rm ${workDir}/${jdkPackageName}`;
      assert.equal(rm, expected);
    });
    it('should return a correct command with -r', () => {
      const rm = Cmd.rm(true, workDir, jdkPackageName);
      const expected = `rm -rf ${workDir}/${jdkPackageName}`;
      assert.equal(rm, expected);
    });
    it('should return a correct command with only passing directory parameter', () => {
      const rm = Cmd.rm(true, workDir);
      const expected = `rm -rf ${workDir}`;
      assert.equal(rm, expected);
    });
  });

  describe('cp', () => {
    const src = 'src';
    const dest = 'dest';

    it('should return a correct command without -r', () => {
      const cp = Cmd.cp(false, src, dest);
      const expected = `cp ${src} ${dest}`;
      assert.equal(cp, expected);
    });

    it('should return a correct command with -r', () => {
      const cp = Cmd.cp(true, src, dest);
      const expected = `cp -r ${src} ${dest}`;
      assert.equal(cp, expected);
    });
  });

  describe('runJar', () => {
    const vmArgs = '-vmarg1 -vmarg2';
    const jarPath = 'jarPath';
    const progArgs = '-progArg1 -progArg2';
    const logPath = 'logPath';

    it('should return a correct command', () => {
      const run = Cmd.runJar(
        javaBin, vmArgs, jarPath, progArgs, logPath);
      const expected = `${javaBin} ${vmArgs} -jar ${jarPath} ${progArgs} > ${logPath} 2>&1 &`;
      assert.equal(run, expected);
    });
  });

  describe('grep', () => {
    it('should return a correct command', () => {
      const keyword = 'keyword';
      const logPath = 'logPath';
      const grep = Cmd.grep(keyword, logPath);
      const expected = `grep \\"${keyword}\\" ${logPath}`;
      assert.equal(grep, expected);
    });
  });

  describe('grepCsv', () => {
    it('should return a correct command', () => {
      const resultDir = 'resultDir';
      const id = 'id';
      const grep = Cmd.grepCsv(resultDir, id);
      const expected = `ls ${resultDir} | grep \\"${id}[.]csv\\"`;
      assert.equal(grep, expected);
    });
  });

  describe('grepTotal', () => {
    it('should return a correct command', () => {
      const resultDir = 'resultDir';
      const id = 'id';
      const grep = Cmd.grepTotal(resultDir, id);
      const expected = `grep \\"TOTAL\\" ${resultDir}/*-${id}.txt`;
      assert.equal(grep, expected);
    });
  });

  describe('ls', () => {
    it('should return a correct command', () => {
      const dir = 'dir';
      const ls = Cmd.ls(dir);
      const expected = `ls ${dir}`;
      assert.equal(ls, expected);
    });
  });

  describe('killBenchmarker', () => {
    it('should return a correct command', () => {
      const kill = Cmd.killBenchmarker();
      const expected = `pkill -f benchmarker`;
      assert.equal(kill, expected);
    });
  });

  describe('scp', () => {
    const localPath = 'localPath';
    const remotePath = 'remotePath';

    it('should return a correct command without -r', () => {
      const scp = cmd.scp(false, localPath, remotePath);
      const expected = `scp ${localPath} ${userName}@${ip}:${remotePath}`;
      assert.equal(scp, expected);
    });

    it('should return a correct command with -r', () => {
      const scp = cmd.scp(true, localPath, remotePath);
      const expected = `scp -r ${localPath} ${userName}@${ip}:${remotePath}`;
      assert.equal(scp, expected);
    });
  });

  describe('ssh', () => {
    it('should return a correct command', () => {
      const ssh = cmd.ssh('ls -al');
      const expected = `ssh ${userName}@${ip} "ls -al"`;
      assert.equal(ssh, expected);
    });
  });
});
