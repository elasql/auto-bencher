const { loadToml } = require('./utils');

class ParameterLoader {
  constructor (filePath) {
    this.toml = loadToml(filePath);
  }

  /*
    return 2D array = [ [combination1], [combination2]... ]
    */
  getParams () {
    const tables = this._flattenTomlToTables();

    return params;
  }

  /*
  return an array

  example:
---------------------------------
    [table1]
    "t1.key1" = "t1.value1"
    "t1.key2" = "t1.value2"

    [table2]
    "t2.key1" = "t2.value1"
    "t2.key2" = "t2.value2"
---------------------------------

array = [
  [table1, [["t1.key1", "t1.value1"], ["t2.key2", "t2.value2"]]],
  [table2, [["t2.key1", "t2.value1"], ["t2.key2", "t2.value2"]]],
]

  */
  _flattenTomlToTables () {
    // toml file consists of multiple tables!
    // a table consists of mutiple key-value pairs

    const tables = [];
    for (const table in this.toml) {
      const pairs = [];
      for (const key in table) {
        pairs.push([key, table]);
      }
      tables.push([table, pairs]);
    }
    return tables;
  }

  _flattenTablesToLines

  _parseCombination () {

  }

  _recursivelyCombine (tableIdx, lineIdx, current) {

  }
}

module.exports = ParameterLoader;
