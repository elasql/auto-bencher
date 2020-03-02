const assert = require('chai').assert;
const Connection = require('../../src/connections/connection');

describe('Connection', () => {
  const connection = new Connection();

  describe('GetConnList', () => {
    const ips = [
      '192.168.1.1',
      '192.168.1.2',
      '192.168.1.3'
    ];
    const totalConn = 5;
    const maxConnPerNode = 2;
    const conns = connection.getConnList(ips, totalConn, maxConnPerNode);

    it(`should return an array with ${totalConn} elements`, () => {
      assert.isArray(conns);
      assert.lengthOf(conns, totalConn);
    });
  });
});
