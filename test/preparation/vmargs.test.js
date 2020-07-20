const assert = require('chai').assert;

const { getVmArgs } = require('../../src/preparation/vmargs');
const { genPropertiestMap } = require('../../src/preparation/properties');

describe('vmargs', () => {
  const propMap = genPropertiestMap('./test/test-properties');

  describe('getVmArgs', () => {
    const actual = getVmArgs(propMap, './test/test-properties');

    it('should be the expected result', () => {
      const expected = `-Djava.util.logging.config.file=test/test-properties/logging.properties -Dorg.vanilladb.core.config.file=test/test-properties/vanilladb.properties -Dorg.vanilladb.bench.config.file=test/test-properties/vanillabench.properties -Dorg.vanilladb.comm.config.file=test/test-properties/vanillacomm.properties -Dorg.elasql.bench.config.file=test/test-properties/elasqlbench.properties -Dorg.elasql.config.file=test/test-properties/elasql.properties`;
      assert.equal(actual, expected);
    });
  });
});
