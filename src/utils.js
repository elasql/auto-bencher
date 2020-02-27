const fs = require('fs');
const toml = require('toml');

function loadToml (filePath) {
  return toml.parse(fs.readFileSync(filePath, 'utf-8'));
}

module.exports = {
  loadToml: loadToml
};
