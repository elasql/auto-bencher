/*
   operate parameter
*/
class ParameterOperator {
  constructor (param) {
    this.param = param;
  }

  addParam (fileName, property, value) {
    const found = false;
  }
}

/*
  toml file consists of multiple tables!
  a table consists of mutiple key-value pairs
  each key-value pair may have several values

  example:
  ---------------------------------
  [table1]
  "t1.k1" = "a b"
  "t1.k2" = "c"

  [table2]
  "t2.k1" = "d"
  "t2.k2" = "e"
  ---------------------------------
*/

/*
  DON'T EXPORT ParamterLoader
  load parameter from the toml file
*/
class ParameterLoader {
  /*
  _parseTables will return an array like the below example

  array = [
    [table1, [["t1.k1", "a b"], ["t1.k2", "c"]]],
    [table2, [["t2.k1", "d"], ["t2.k2", "e"]]],
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
        values: table[key]
      });
    }

    return pairs;
  }

  // TODO: refurbish this function, because it is too fat
  _findAllCombination (tables, tableIdx, pairIdx, current, results) {
    if (tableIdx < tables.length) {
      const { table, pairs } = tables[tableIdx];

      if (pairIdx < pairs.length) {
        const { key, values } = pairs[pairIdx];

        if (typeof (values) !== 'string') {
          throw Error('value should be string type, use white space to seperate values');
        }

        values.split(' ').map(value => {
          const newObj = this._addParam(current, table, key, value);

          this._findAllCombination(tables, tableIdx, pairIdx + 1, newObj, results);
        });
      } else {
        this._findAllCombination(tables, tableIdx + 1, 0, current, results);
      }
    } else {
      results.push(current);
    }
    return results;
  }

  /*
    return a new object
  */
  _addParam (currentObj, table, key, value) {
    const obj = { ...currentObj };

    if (!Object.prototype.hasOwnProperty.call(obj, table)) {
      obj[table] = {};
    }
    obj[table][key] = value;
    return obj;
  }
}

class NormalLoad extends ParameterLoader {
  /*
  return an array

  [
    {
      table1: {
        t1.k1: a,
        t1.k2: b,
      },
      table2: {
        t2.k1: value1,
        key2: value2,
      }
    },
    {
      file1: {
        k
      }
    }
  ]
  */
  load (tomlObject) {
    const tables = this._parseTables(tomlObject);
    const params = this._findAllCombination(tables, 0, 0, [], []);

    if (params.length > 1) {
      throw new Error('Combination (mutiple values in one property) in normal-load.toml is forbidden');
    }

    return params;
  }
}

module.exports = {
  ParameterOperator,
  NormalLoad
};
