const assert = require('chai').assert;
const Connection = require('../../src/remote/connection');

describe('Connection', () => {
  const connection = new Connection();

  describe('GetConns', () => {
    const ips = [
      '192.168.1.1',
      '192.168.1.2',
      '192.168.1.3'
    ];

    describe('Normal cases', () => {
      const totalConn = 5;
      const maxConnPerNode = 2;
      const conns = connection.getConns(ips, totalConn, maxConnPerNode);

      it(`should return an array with ${totalConn} elements`, () => {
        assert.isArray(conns);
        assert.lengthOf(conns, totalConn);
      });

      it('should be expected array', () => {
        const port = 30000;
        const expected = [
          {
            id: 0,
            ip: ips[0],
            port: port
          },
          {
            id: 1,
            ip: ips[1],
            port: port
          },
          {
            id: 2,
            ip: ips[2],
            port: port
          },
          {
            id: 3,
            ip: ips[0],
            port: port + 1
          },
          {
            id: 4,
            ip: ips[1],
            port: port + 1
          }
        ];
        assert.deepEqual(conns, expected);
      });
    });

    describe('Edge cases', () => {
      it('should not throw error', () => {
        assert.doesNotThrow(() => { connection.getConns(ips, 3, 1); }, Error, 'The number of machines is not enough');
      });

      it('should throw errors', () => {
        assert.throws(() => { connection.getConns(ips, 4, 1); }, Error, 'The number of machines is not enough');
        assert.throws(() => { connection.getConns(ips, 4.1, 1); }, Error, 'totalConn is not a Integer, you pass 4.1 to getConns');
        assert.throws(() => { connection.getConns(ips, '4', 1); }, Error, 'totalConn and maxConnPerNode should be type of number');
        assert.throws(() => { connection.getConns(ips, 4, '1'); }, Error, 'totalConn and maxConnPerNode should be type of number');
        assert.throws(() => { connection.getConns(ips, '4', '1'); }, Error, 'totalConn and maxConnPerNode should be type of number');
      });
    });
  });

  describe('getConn', () => {
    const ip = '192.168.87.87';
    const port = 4444;
    const info = Connection.getConn(1, ip, port);
    it('should be an expected result', () => {
      const expected = {
        id: 1,
        ip: ip,
        port: port
      };
      assert.deepEqual(info, expected);
    });

    it('should throw errors', () => {
      assert.throws(() => { Connection.getConn('1', ip, port); }, Error, 'id should be an integer number');
      assert.throws(() => { Connection.getConn(1.5, ip, port); }, Error, 'id should be an integer number');
      assert.throws(() => { Connection.getConn(1, ip, '4444'); }, Error, 'port should be an integer number');
    });
  });

  describe('getView', () => {
    const port = 4444;
    const conns = [
      Connection.getConn(0, '192.168.87.87', port),
      Connection.getConn(1, '192.168.87.88', port)
    ];
    const actual = Connection.getView(conns);

    it('should be an expected result', () => {
      const expected = '0 192.168.87.87 4444, 1 192.168.87.88 4444';
      assert.equal(actual, expected);
    });
  });

  describe('toString', () => {
    const conn = Connection.getConn(1, '192.168.87.87', 30000);
    const actual = Connection.toString(conn);

    it('should be an expected result', () => {
      assert.equal(actual, '1 192.168.87.87 30000');
    });
  });
});
