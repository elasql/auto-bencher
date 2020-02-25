const fs = require('fs');
const toml = require('toml');

const configPath = '../config.toml';
const configNullPrototype = toml.parse(fs.readFileSync(configPath, 'utf-8'));

// we cannot use prototype function provided from a null object,
// therefore, forcibly convert it to normal object
const config = JSON.parse(JSON.stringify(configNullPrototype));

// string constants
const param = {
    jdk = 'jdk',
    system = 'system',
    dirName = 'dir_name',
    machines = 'machines',
    userName = 'user_name',
    packagePath = 'package_path',
    remoteWorkDir = 'remote_work_dir'
}

/*
    return a string of jdk package path
*/
function getJdkPackagePath(){
    if(!config.hasOwnProperty(param.jdk)){
        throw new Error(`config has no property ${param.jdk}`);
    }
    
    if(!config.jdk.hasOwnProperty(param.packagePath)){
        throw new Error(`config.${param.jdk} has no property ${param.packagePath}`);
    }

    return config[param.jdk][param.packagePath];
}

/*
    return a string of jdk package file name
*/
function getJdkPackageFileName(){
    return getJdkPackagePath.split('/').pop();
}

/*
    return a string of jdk directory name
*/
function getJdkDirName(){
    if(!config.hasOwnProperty(param.jdk)){
        throw new Error(`config has no property ${param.jdk}`);
    }
    
    if(!config.jdk.hasOwnProperty(param.dirName)){
        throw new Error(`config.${param.dirName} has no property ${param.dirName}`);
    }

    return config[param.jdk][param.dirName]
}


/*
    return a list of IP of involved machines
*/
function getInvolvedMachines(){
    if(!config.hasOwnProperty(machines)){
        throw new Error(`config has no property ${machines}`);
    }

    return Object.values(config[machines]).flat();
}

/*
    return a string of system user name
*/
function getSystemUserName(){
    if(!config.hasOwnProperty(system)){
        throw new Error(`config has no property ${system}`);
    }

    if(!config.hasOwnProperty(userName)){
        throw new Error(`config has no property ${userName}`);
    }

    return config[system][userName];
}


/*
    return a string of system remote work directory
*/
function getSystemRemoteWorkDir(){
    if(!config.hasOwnProperty(system)){
        throw new Error(`config has no property ${system}`);
    }

    if(!config.hasOwnProperty(remoteWorkDir)){
        throw new Error(`config has no property ${remoteWorkDir}`);
    }

    return config[system][remoteWorkDir];
}

module.exports = {
    getJdkPackagePath:getJdkPackagePath,
    getJdkPackageFileName: getJdkPackageFileName,
    getJdkDirName:getJdkDirName,
    getInvolvedMachines:getInvolvedMachines,
    getSystemUserName:getSystemUserName,
    getSystemRemoteWorkDir:getSystemRemoteWorkDir,
}