const command = require('../command');
module.exports = {
    //Parameter: Parameter,
    Server: Server
};
function Server(config, connection_info, db_name, vm_args, is_sequencer){
    if(is_sequencer){
        proc_name = 'sequencer';
        db_name =  db_name + '-seq';
        log_path = config.system.remote_work_dir + "/server-seq.log"
    } else{
        proc_name = 'server ' + connection_info.id;
        db_name =  db_name+ '-' + connection_info.id;
        log_path = config.system.remote_work_dir + "/server-" + connection_info.id + ".log";
    }
        
    this.config = config;
    this.connection_info = connection_info;
    this.proc_name = proc_name;
    this.db_name = db_name;
    this.vm_args = vm_args;
    this.is_sequencer = is_sequencer;

    this.db_path = config.system.remote_work_dir + '/databases/' + db_name;
    this.backup_db_path = config.system.remote_work_dir + '/databases/' + db_name + '-backup';
    this.jar_path = config.system.remote_work_dir + '/benchmarker/server.jar';
    this.log_path = log_path;
    this.id = connection_info.id;
    this.ip = connection_info.ip;
    this.remote_java_bin = config.system.remote_work_dir + "/" + config.jdk.dir_name + "/bin/java";

    this.send_bench_dir = async function(){
        await console.log("Sending benchmarker to " + this.proc_name + "...");
        await command.asyncScpTo(true, this.config.system.user_name, this.connection_info.ip, "benchmarker", this.config.system.remote_work_dir);
    }
    this.delete_db_dir = async function(){
        cmd  = "rm -rf " + this.db_path;
        bool = await command.asyncSSh(this.config.system.user_name, this.connection_info.ip, cmd);
        if(!bool)
            await console.log("No previous database is found on " + this.connection_info.ip);
    }
    this.delete_backup_db_dir = async function(){
        await console.log("Deleting backup dir on " + this.proc_name + "...");
        cmd = "rm -rf " + this.backup_db_path;
        bool = await command.asyncSSh(this.config.system.user_name, this.connection_info.ip, cmd);
        if(!bool)
            await console.log("No backup database is found on " + this.connection_info.ip);
    }
    this.backup_db = async function(){
        if(await this.is_sequencer){
            return;
        }
        await console.log("Backing the db of " + this.proc_name + "...");

        let cmd = "cp -r " + this.db_path + ' ' + this.backup_db_path;
        await command.asyncSSh(this.config.system.user_name, this.connection_info.ip, cmd);
    }
    this.reset_db_dir = async function(){
        if(await this.is_sequencer){
            return await this.delete_db_dir();
        }
        await console.log("Resetting the db of " + this.proc_name + "...");

        await this.delete_db_dir();
        // copy the backup for replacement
        cmd = "cp -r " + this.backup_db_path + ' ' + this.db_path;
        await command.asyncSSh(this.config.system.user_name, this.connection_info.ip, cmd);
    }
    this.start = async function(){
        await console.log("Starting " + this.proc_name + "...");
        // [db name] [server id] ([is sequencer])
        if(await this.is_sequencer)
            prog_args = this.db_name + ' ' + this.connection_info.id + ' ' + '1';
        else
            prog_args = this.db_name + ' ' + this.connection_info.id;

        cmd = `'${this.remote_java_bin} ${this.vm_args} -jar ${this.jar_path} ${prog_args} > ${this.log_path} 2>&1 &'`;
        out = await command.asyncSSh(this.config.system.user_name, this.connection_info.ip, cmd);
        // await console.log(out);
    }
    this.check_for_ready = async function(){
        await this.check_for_error();

        return await this.grep_log("ElaSQL server ready");

    }
    this.check_for_error = async function(){
        if (output = await this.grep_log("Exception"))
            throw new Error('Server ' + this.id + ' error: ' + output);

        if(output = await this.grep_log("error"))
            throw new Error('Server ' + this.id + ' error: ' + output);

        if(output = await this.grep_log("SEVERE"))
            throw new Error('Server ' + this.id + ' error: ' + output);
    }
    this.grep_log = async function(keyword){
        cmd = 'grep \\\'' + keyword + '\\\' ' + this.log_path;
        // console.log(cmd);
        bool = await command.asyncSSh(this.config.system.user_name, this.connection_info.ip, cmd);
        return bool;
    }


}