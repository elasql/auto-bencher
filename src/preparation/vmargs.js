const path = require('path');

function getVmArgs (propertiesMap, propertiesDir) {
  let vmArgs = '';

  Object.values(propertiesMap).map(prop => {
    vmArgs += '-D' + prop.id + '=' + path.posix.join(propertiesDir, prop.baseName + '.properties ');
  });

  // remove the last white space
  return vmArgs.slice(0, vmArgs.length - 1);
}

module.exports = {
  getVmArgs
};
