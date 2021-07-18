const assert = require('chai').assert;

const { getVmArgs } = require('../../src/preparation/vmargs');
const { genPropertiestMap } = require('../../src/preparation/properties');

describe('vmargs', () => {
  const propMap = genPropertiestMap('./default-properties');

  describe('getVmArgs', () => {
    const actual = getVmArgs(propMap, './default-properties');

    it('should be the expected result', () => {
      const expected = `-Djava.util.logging.config.file=default-properties/logging.properties -Dorg.vanilladb.core.config.file=default-properties/vanilladb.properties -Dorg.vanilladb.bench.config.file=default-properties/vanillabench.properties -Dorg.vanilladb.comm.config.file=default-properties/vanillacomm.properties -Dorg.elasql.bench.config.file=default-properties/elasqlbench.properties -Dorg.elasql.config.file=default-properties/elasql.properties`;
      assert.equal(actual, expected);
    });
  });
});
