const _ = require('lodash');
class Parameter {
  constructor (paramObject) {
    // this.param = { ...paramObject };
    this.param = _.cloneDeep(paramObject);
  }

  getProperties () {
    const properties = [];
    for (const outer in this.param) {
      for (const inner in this.param[outer]) {
        properties.push(inner);
      }
    }
    return properties;
  }

  getPropertiesValues () {
    const values = [];
    for (const outer in this.param) {
      for (const inner in this.param[outer]) {
        values.push(this.param[outer][inner]);
      }
    }
    return values;
  }

  getStrValue (table, prop) {
    let value = this._getValue(table, prop);

    if (typeof value !== 'string') {
      value = JSON.stringify(value);
      if (typeof value !== 'string') {
        throw Error(`cannot get ${table}.${prop} in string type`);
      }
    };

    return value;
  }

  getNumValue (table, prop) {
    let value = this._getValue(table, prop);

    if (typeof value !== 'number') {
      value *= 1;
      if (isNaN(value)) {
        throw Error(`cannot get ${table}.${prop} in number type`);
      }
    }

    return value;
  }

  getBoolValue (table, prop) {
    const value = this._getValue(table, prop);
    const lowerValue = value.toLowerCase();

    if (lowerValue !== 'false' && lowerValue !== 'true') {
      throw Error(`cannot get ${table}.${prop} in boolean type`);
    }

    return value === 'true';
  }

  _getValue (table, prop) {
    if (!Object.prototype.hasOwnProperty.call(this.param, table)) {
      throw Error(`table ${table} doesn't exist`);
    }
    if (!Object.prototype.hasOwnProperty.call(this.param[table], prop)) {
      throw Error(`property ${prop} doesn't exist in table ${table}`);
    }

    return this.param[table][prop];
  }
}

module.exports = Parameter;
