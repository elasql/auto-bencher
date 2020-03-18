const assert = require('chai').assert;
const { loadToml } = require('../../src/utils');
const { normalLoad } = require('../../src/preparation/parameter-loader');
const { genPropertiestMap, overrideProperties } = require('../../src/preparation/preparation-actions');
const Properties = require('../../src/preparation/properties');

describe('genPropertiesMap', () => {
  const map = genPropertiestMap('./test/test-properties');
  it('should return an object', () => {
    assert.isObject(map);
  });

  it('should contain instance of Properties', () => {
    Object.keys(map).map(key => {
      assert.instanceOf(map[key], Properties);
    });
  });
});

describe('overrrideProperties', () => {
  const map = genPropertiestMap('./test/test-properties');
  const notComb = loadToml('./test/test-toml/parameter.test.toml');
  const params = normalLoad(notComb);
  const benchParam = params[0];

  it('should override properties correctly', () => {
    overrideProperties(map, benchParam);
    assert.equal(map.vanilladb.properties['org.vanilladb.core.storage.buffer.BufferMgr.BUFFER_POOL_SIZE'], '1024000');
    assert.equal(map.vanilladb.properties['org.vanilladb.core.storage.file.io.IoAllocator.USE_O_DIRECT'], 'true');
  });
});
