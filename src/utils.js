const fs = require('fs');
const toml = require('toml');
const path = require('path');
const join = path.posix.join;

function loadToml (filePath) {
  return toml.parse(fs.readFileSync(filePath, 'utf-8'));
}

function loadSettings (filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function getYearMonthDateStr (dateObj) {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const date = dateObj.getDate();

  return `${year}-${month}-${date}`;
}

function getHourMinSecStr (dateObj) {
  const hours = dateObj.getHours();
  const mins = dateObj.getMinutes();
  const secs = dateObj.getSeconds();

  return `${hours}-${mins}-${secs}`;
}

module.exports = {
  join,
  loadToml,
  loadSettings,
  getYearMonthDateStr,
  getHourMinSecStr
};
