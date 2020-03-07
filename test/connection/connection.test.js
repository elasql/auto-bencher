const assert = require('chai').assert;
const { Connection } = require('../../src/connection/connection');

describe('Connection', () => {
  const connection = new Connection();

  describe('GetConnList', () => {
    const ips = [
      '192.168.1.1',
      '192.168.1.2',
      '192.168.1.3'
    ];

    describe('Normal cases', () => {
      const totalConn = 5;
      const maxConnPerNode = 2;
      const conns = connection.getConnList(ips, totalConn, maxConnPerNode);

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
      const ErrMsg = 'The number of machines is not enough';

      it('should not throw error', () => {
        assert.doesNotThrow(() => { connection.getConnList(ips, 3, 1); }, Error, ErrMsg);
      });

      it('should throw error', () => {
        assert.throws(() => { connection.getConnList(ips, 4, 1); }, Error, ErrMsg);
      });
    });
  });

  describe('getConn', () => {
    const ip = '192.168.87.87';
    const port = '4444';
    const info = Connection.getConn(1, ip, port);
    it('should be an expected result', () => {
      const expected = {
        id: 1,
        ip: ip,
        port: port
      };
      assert.deepEqual(info, expected);
    });
  });

  describe('getView', () => {
    const port = '4444';
    const conns = [
      Connection.getConn(0, '192.168.87.87', port),
      Connection.getConn(1, '192.168.87.88', port)
    ];
    const result = Connection.getView(conns);

    it('should be an expected result', () => {
      const expected = '0 192.168.87.87 4444, 1 192.168.87.88 4444';
      assert.equal(result, expected);
    });
  });
});
