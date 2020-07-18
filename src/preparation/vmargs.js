const { join } = require('../utils');

function getVmArgs (propMap, propDir) {
  let vmArgs = '';

  Object.values(propMap).map(prop => {
    vmArgs += '-D' + prop.id + '=' + join(propDir, prop.baseName + '.properties ');
  });

  // remove the last white space
  return vmArgs.slice(0, vmArgs.length - 1);
}

module.exports = {
  getVmArgs
};
