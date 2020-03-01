class ParameterLoader {
  /*
  return 2D array
  */
  loadNormalLoad (tomlObject) {
    const tables = this._parseTables(tomlObject);
    const params = this._findAllCombination(tables, 0, 0, [], []);

    if (params.length > 1) {
      throw new Error('Combination in normal-load.toml is forbidden');
    }

    return params;
  }

  /*
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

return an array like the below example

array = [
  [table1, [["t1.key1", "a b"], ["t1.key2", "c d"]]],
  [table2, [["t2.key1", "e f"], ["t2.key2", "g h"]]],
]

  */
  _parseTables (tomlObject) {
    const tables = [];

    for (const table in tomlObject) {
      const pairs = this._parsePairs(tomlObject[table]);
      tables.push({
        table,
        pairs
      });
    }

    return tables;
  }

  _parsePairs (table) {
    const pairs = [];

    for (const key in table) {
      pairs.push({
        key,
        value: table[key]
      });
    }

    return pairs;
  }

  // TODO: refurbish this function, because it is too fat
  _findAllCombination (tables, tableIdx, pairIdx, current, results) {
    if (tableIdx < tables.length) {
      const { table, pairs } = tables[tableIdx];

      if (pairIdx < pairs.length) {
        const { key, value } = pairs[pairIdx];

        if (typeof (value) !== 'string') {
          throw Error('value should be string type, use white space to seperate values');
        }

        value.split(' ').map(subValue => {
          const newArr = [...current];

          newArr.push({
            table,
            key,
            value: subValue
          });

          this._findAllCombination(tables, tableIdx, pairIdx + 1, newArr, results);
        });
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
