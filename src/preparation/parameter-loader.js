const Parameter = require('./parameter');

// return a list with one parameter only
function normalLoad (tomlObject) {
  const params = multiLoad(tomlObject);

  if (params.length > 1) {
    throw new Error('combination (mutiple values in one property) in normal-load.toml is forbidden');
  }

  return params;
}

function multiLoad (tomlObject) {
  const tables = parseTables(tomlObject);
  return findAllCombination(tables, 0, 0, [], []);
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
  _parseTables will return an array like the below example

  array = [
    [table1, [["t1.k1", "a b"], ["t1.k2", "c"]]],
    [table2, [["t2.k1", "d"], ["t2.k2", "e"]]],
  ]
    */
function parseTables (tomlObject) {
  const tables = [];

  for (const table in tomlObject) {
    const pairs = parsePairs(tomlObject[table]);
    tables.push({
      table,
      pairs
    });
  }

  return tables;
}

function parsePairs (table) {
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
function findAllCombination (tables, tableIdx, pairIdx, current, results) {
  if (tableIdx < tables.length) {
    const { table, pairs } = tables[tableIdx];

    if (pairIdx < pairs.length) {
      const { key, values } = pairs[pairIdx];

      if (typeof (values) !== 'string') {
        throw Error('value should be string type, use white space to seperate values');
      }

      values.split(' ').map(value => {
        const newObj = addParam(current, table, key, value);

        findAllCombination(tables, tableIdx, pairIdx + 1, newObj, results);
      });
    } else {
      findAllCombination(tables, tableIdx + 1, 0, current, results);
    }
  } else {
    results.push(new Parameter(current));
  }
  return results;
}
/*
    return a new object
  */
function addParam (currentObj, table, key, value) {
  const obj = { ...currentObj };

  if (!Object.prototype.hasOwnProperty.call(obj, table)) {
    obj[table] = {};
  }
  obj[table][key] = value;
  return obj;
}

module.exports = {
  normalLoad
};
