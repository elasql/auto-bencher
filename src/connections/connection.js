
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

  static getInfo (id, ip, port) {
    return {
      id,
      ip,
      port
    };
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
    [...Array(connPerNode).keys()].map(currentConnPerNode => {
      ips.map(ip => {
        if (id >= totalConn) {
          return;
        }
        const port = this.initPort + currentConnPerNode - 1;
        conns.push(Connection.getInfo(id, ip, port));
        id += 1;
      });
    });

    return conns;
  }
}

module.exports = Connection;

/*
module.exports = {
    Action: Action,
    ConnectionInfo: ConnectionInfo,
    generate_connection_list: generate_connection_list
};
function ConnectionInfo(id, ip, port, prop){
    this.id = id;
    this.ip = ip;
    this.port = port;
    this.prop = prop;
    this.to_string = function(){
        return this.id + '\\ ' + this.ip + '\\ ' + this.port;
    }
}
function generate_connection_list(ip_list, conn_count, max_conn_per_ip, prop){
    list = [];
    id = 0;
    conn_per_node = 1;
    flag = false;
    while(true){
        for(i in ip_list){
            list.push(new ConnectionInfo(id, ip_list[i], INIT_PORT + conn_per_node - 1, prop));
    
            id += 1;
            if (id >= conn_count) {
                flag = true;
                break;
            }
        }
        if(flag)
            break;
            
        conn_per_node += 1;
        if(conn_per_node > max_conn_per_ip) {
            throw new Error("The number of machines is not enough.");
        }
    }
    return list;
}


*/
