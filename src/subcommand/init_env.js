const fs = require('fs');
const command = require('../command');
module.exports = {
    execute: function(config, argv){
        console.log("Starts initializing the environment");
        check_local_jdk(config);
        send_jdk_to_all_machine(config);
    }
};

function check_local_jdk(config){
    console.log("Checking local jdk: ", config.jdk.package_path);
    if(!fs.existsSync(config.jdk.package_path))
        throw new Error("cannot find the JDK at: " + config.jdk.package_path);
}
function send_jdk_to_all_machine(config){
    machines = Object.values(config.machines)
    machines = [].concat.apply([], machines);
    machines.forEach(ip => { 
        console.log("Checking node " + ip + "...");
        create_working_dir(config, ip);
        if(!check_java_runtime(config, ip)){
            send_jdk(config,ip);
            unpack_jdk(config,ip);
            remove_jdk_package(config,ip);
        }
        const check = 'Node ' + ip + " checked";
        console.log('\x1b[32m%s\x1b[0m', check);
    });
}
function create_working_dir(config, ip){
    console.log("Creating a working directory on " + ip);
    ["databases", "results"].forEach(dir => { 
        command.ssh(config.system.user_name, ip, 'mkdir -p ' + config.system.remote_work_dir + '/' + dir);
    });
}
function check_java_runtime(config, ip){
    console.log("Checking java runtime on " + ip);
    return command.ssh(config.system.user_name, ip, config.system.remote_work_dir + '/' + config.jdk.dir_name + '/bin/java -version');
}
function send_jdk(config,ip){
    console.log("Sending JDK to " + ip);
    command.scp_to(false, config.system.user_name, ip, config.jdk.package_path, config.system.remote_work_dir);
}
function unpack_jdk(config,ip){
    package_filename = config.jdk.package_path.split("/").pop();
    console.log("Unpacking " + package_filename + " on " + ip);
    command.ssh(config.system.user_name, ip, 'tar -C ' + config.system.remote_work_dir + ' -zxf ' + config.system.remote_work_dir + '/' + package_filename);
}
function remove_jdk_package(config,ip){
    package_filename = config.jdk.package_path.split("/").pop();
    console.log("Removing " + package_filename + " on " + ip);
    command.ssh(config.system.user_name, ip, 'rm ' + config.system.remote_work_dir + '/' + package_filename);
}
