const fs = require('fs');

const Cmd = require('../ssh/cmd');
const logger = require('../logger');

const { join } = require('../utils');
const { pullFile } = require('../actions/remote-actions');

const PULL_DIR = 'pulls';

async function execute (configParam, args) {
  const {
    involvedMachines,
    systemUserName,
    systemRemoteWorkDir
  } = configParam;

  const ignoreError = args.ignore;
  const seperate = args.seperate;
  const pattern = args.pattern[0];

  const remotePath = join(systemRemoteWorkDir, pattern);

  fs.mkdirSync(PULL_DIR, { recursive: true });

  for (const id in involvedMachines) {
    const ip = involvedMachines[id];
    let localDest = PULL_DIR;
    if (seperate) {
      localDest = join(PULL_DIR, ip);
      fs.mkdirSync(localDest, { recursive: true });
    }

    const cmd = new Cmd(systemUserName, ip);
    try {
      await pullFile(cmd, remotePath, localDest, {
        prefix: 'node',
        id: id,
        ip: ip
      });
    } catch (err) {
      if (!ignoreError) {
        throw Error(err.message);
      }
      logger.info(`pull file error on ${ip} - ignore`.red);
    }
  }
};

module.exports = {
  execute
};
