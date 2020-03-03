
const Action = {
  loading: 1,
  benchmarking: 2
};

const INIT_PORT = 30000;

class Connection {
  // use default port number if user doesn't provide it
  constructor (initPort = INIT_PORT) {
    this.initPort = initPort;
  }

  getConnList (ips, totalConn, maxConnPerNode) {
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
        conns.push(this._getInfo(id, ip, port));
        id += 1;
      });
    });

    return conns;
  }

  _getInfo (id, ip, port) {
    return {
      id,
      ip,
      port
    };
  }
}

module.exports = {
  Connection: Connection
};
