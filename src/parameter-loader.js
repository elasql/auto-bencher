const { loadToml } = require('./utils');

class ParameterLoader {
  constructor (filePath) {
    this.param = loadToml(filePath);
  }
}

module.exports = ParameterLoader;
