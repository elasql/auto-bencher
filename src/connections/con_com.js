const INIT_PORT = 35000;
const Action = {
    loading : 1,
    Benchmarking : 2
};
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


