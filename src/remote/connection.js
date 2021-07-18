const INIT_PORT = 30000;

class Connection {
  // use default port number if user doesn't provide it
  constructor (initPort = INIT_PORT) {
    this.initPort = initPort;
  }

  getConns (ips, totalConn, maxConnPerNode) {
    if (typeof totalConn === 'string' || typeof maxConnPerNode === 'string') {
      throw Error(`totalConn and maxConnPerNode should be type of number`);
    }

    if (!Number.isInteger(totalConn)) {
      throw Error(`totalConn is not a Integer, you pass ${totalConn} to getConns`);
    }

    if (totalConn === 0) {
      throw Error(`totalConn is zero`);
    }

    const nodeNum = ips.length;
    const connPerNode = Math.ceil(totalConn / nodeNum);
    if (connPerNode > maxConnPerNode) {
      throw Error('The number of machines is not enough');
    }

    let id = 0;
    const conns = [];

    // slice will return a new array(shallow copy)
    // connPerNodeArr looks like [1, 2, 3, ... connPerNode]
    const connPerNodeArr = [...Array(connPerNode + 1).keys()].slice(1);

    connPerNodeArr.map(currentConnPerNode => {
      ips.map(ip => {
        if (id >= totalConn) {
          return;
        }
        const port = this.initPort + currentConnPerNode - 1;
        conns.push(Connection.getConn(id, ip, port));
        id += 1;
      });
    });

    return conns;
  }

  static getConn (id, ip, port) {
    if (typeof id !== 'number' || !Number.isInteger(id)) {
      throw Error('id should be an integer number');
    }

    if (typeof ip !== 'string') {
      throw Error('ip should be type of string');
    }

    if (typeof port !== 'number' || !Number.isInteger(port)) {
      throw Error('port should be an integer number');
    }

    return {
      id,
      ip,
      port
    };
  }

  static getView (conns) {
    let view = '';

    conns.map(conn => {
      if (conn.id > 0) {
        view += ', ';
      }
      view += Connection.toString(conn);
    });

    return view;
  }

  // pass Server or Client in
  static toString (conn) {
    return `${conn.id} ${conn.ip} ${conn.port}`;
  }
}

module.exports = Connection;
