const process = require('process');
const fs = require('fs');
const toml = require('toml');
const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));

const init_env = require('./subcommand/init_env');
const load = require('./subcommand/load');
function main(argv){
    switch(argv[2]){
        case 'init_env':
            init_env.execute(config, argv);
            console.log('initial environment done!!');
            break;
        case 'load':
            load.execute(config, argv);
            console.log('load done!!');
            break;
        default:
            console.log('No this command');
    }
}
main(process.argv);