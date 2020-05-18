const fs = require('fs');
const logger = require('../logger');

// local actions won't use SSH

async function checkLocalJdk (jdkPackagePath) {
  logger.info(`checking local jdk - ${jdkPackagePath}`);

  if (!fs.existsSync(jdkPackagePath)) {
    throw new Error(`cannot find the JDK at - ${jdkPackagePath}`);
  }
}

module.exports = {
  checkLocalJdk
};
