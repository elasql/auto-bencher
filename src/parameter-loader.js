const { loadToml } = require('./utils');

class ParameterLoader {
  constructor (filePath) {
    this.toml = loadToml(filePath);
  }

  /*
    return 2D array = [ [combination1], [combination2]... ]
    */
  getParams () {
    const tables = this._parseTables();
    const newArr = [];
    const results = [];
    this._findAllCombination(tables, 0, 0, newArr, results);
    return results;
  }

  /*
  return an array

    toml file consists of multiple tables!
    a table consists of mutiple key-value pairs
    each key-value pair may have several values

  example:
---------------------------------
    [table1]
    "t1.key1" = "a b"
    "t1.key2" = "c d"

    [table2]
    "t2.key1" = "e f"
    "t2.key2" = "g h"
---------------------------------

array = [
  [table1, [["t1.key1", "a b"], ["t1.key2", "c d"]]],
  [table2, [["t2.key1", "e f"], ["t2.key2", "g h"]]],
]

  */
  _parseTables () {
    const tables = [];
    for (const table in this.toml) {
      const pairs = [];

      for (const key in this.toml[table]) {
        if (typeof (this.toml[table][key]) !== 'string') {
          throw Error('value should be string, use white space to seperate values');
        }

        pairs.push({
          key,
          value: this.toml[table][key]
        });
      }
      tables.push({
        table,
        pairs
      });
    }
    return tables;
  }

  // TODO: USE functinonal programming to rewrite this function
  // It is too hard to read
  _findAllCombination (tables, tableIdx, pairIdx, current, results) {
    if (tableIdx < tables.length) {
      const { table, pairs } = tables[tableIdx];
      if (pairIdx < pairs.length) {
        const { key, value } = pairs[pairIdx];
        for (const subValue of value.split(' ')) {
          // ... is spread operator, and it will help us to create new array
          const newArr = [...current];
          newArr.push({
            table,
            key,
            value: subValue
          });
          this._findAllCombination(tables, tableIdx, pairIdx + 1, newArr, results);
        }
      } else {
        this._findAllCombination(tables, tableIdx + 1, 0, current, results);
      }
    } else {
      results.push(current);
    }
    return results;
  }
}

module.exports = ParameterLoader;
