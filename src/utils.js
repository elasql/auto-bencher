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
  const year = fixWidth(dateObj.getFullYear());
  const month = fixWidth(dateObj.getMonth() + 1);
  const date = fixWidth(dateObj.getDate());

  return `${year}-${month}-${date}`;
}

function getHourMinSecStr (dateObj) {
  const hours = fixWidth(dateObj.getHours());
  const mins = fixWidth(dateObj.getMinutes());
  const secs = fixWidth(dateObj.getSeconds());

  return `${hours}-${mins}-${secs}`;
}

function fixWidth (number) {
  if (number < 10) {
    return '0' + number.toString();
  }
  return number.toString();
}

module.exports = {
  join,
  loadToml,
  loadSettings,
  getYearMonthDateStr,
  getHourMinSecStr
};
