const command = require('../command');
const con_com = require('./con-com');
module.exports = {
    //Parameter: Parameter,
    Client: Client
};
function Client(config, connection_info, vm_args){
    this.config = config;
    this.connection_info = connection_info;
    this.vm_args = vm_args;

    this.result_path = config.system.remote_work_dir + "/results";
    this.id = connection_info.id;
    this.ip = connection_info.ip;
    this.jar_path = config.system.remote_work_dir + "/benchmarker/client.jar";
    this.log_path = config.system.remote_work_dir + "/client-" + connection_info.id + ".log"
    this.remote_java_bin = config.system.remote_work_dir + "/" + config.jdk.dir_name + "/bin/java";

    this.send_bench_dir = async function(){
        await command.asyncScpTo(true, this.config.system.user_name, this.connection_info.ip, "benchmarker",
            this.config.system.remote_work_dir);
    }

    this.clean_previous_results = async function(){
        cmd = "rm -r " + this.result_path;
        bool = await command.asyncSSh(this.config.system.user_name, this.connection_info.ip, cmd);
        if(!bool)
            await console.log("No previous results are found on " + this.connection_info.ip);
    }

    this.start = async function(action){
        await console.log("Starting client " + this.id + "...");
        // [client id] [action]
        prog_args = this.id + ' ' + action;
        cmd = `'${this.remote_java_bin} ${this.vm_args} -jar ${this.jar_path} ${prog_args} > ${this.log_path} 2>&1 &'`;
        await command.asyncSSh(this.config.system.user_name, this.connection_info.ip, cmd);
        await console.log("Client " + this.id + " is running.");
    }

    this.check_for_finished = async function(action){
        keyword = '';
        if(action == con_com.Action.loading)
            keyword = "loading procedure finished.";
        else if(action == con_com.Action.Benchmarking)
            keyword = "benchmark process finished.";

        await this.check_for_error();
        return await this.grep_log(keyword);
    }
    this.check_for_error = async function(){
        if (await this.grep_log("Exception"))
            throw new Error('Server ' + this.id + ' error: ' + output);

        if(await this.grep_log("error"))
            throw new Error('Server ' + this.id + ' error: ' + output);

        if(await this.grep_log("SEVERE"))
            throw new Error('Server ' + this.id + ' error: ' + output);
    }

    this.grep_log = async function(keyword){
        cmd = 'grep \\\'' + keyword + '\\\' ' + this.log_path;
        // console.log(cmd);
        bool = await command.asyncSSh(this.config.system.user_name, this.connection_info.ip, cmd);
        return bool;
    }

}