
const Action = {
  loading: 1,
  benchmarking: 2
};
class Connection {
  constructor (initPort) {
    this.initPort = initPort;
  }

  getInfo (id, ip, port) {
    return {
      id,
      ip,
      port
    };
  }

  getConnList (ips, totalConn, maxConnPerIp, INIT_PORT) {
    const conns = [];
    let id = 0;
    let connPerIp = 1;

    // TODO: here

    // slice will return a new array(shallow copy)
    ips.slice(0, totalConn).map(ip => {
      const port = this.initPort + connPerIp - 1;
      conns.push(getInfo(id, ip, port));
    });
  }
}

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


