const fs = require('fs');
const logger = require('../logger');
const Cmd = require('../ssh/cmd');
const { exec } = require('../ssh/ssh-executor');

// local actions won't use SSH

async function checkLocalJdk (jdkPackagePath) {
  logger.info(`checking local jdk - ${jdkPackagePath}`);

  if (!fs.existsSync(jdkPackagePath)) {
    throw new Error(`cannot find the JDK at - ${jdkPackagePath}`);
  }
}

async function ls (path) {
  const ls = Cmd.ls(path);
  await exec(ls);
}

async function cp (src, dest) {
  const cp = Cmd.cp(false, src, dest);
  await exec(cp);
}

module.exports = {
  checkLocalJdk,
  ls,
  cp
};
