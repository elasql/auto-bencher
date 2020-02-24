const fs = require('fs');
const toml = require('toml');
const deepcopy = require('deepcopy');
// var HashMap = require('hashmap');
module.exports = {
    //Parameter: Parameter,
    ParameterList: ParameterList
};
function Parameter(){
    this.params = [];

    this.add_param = function(filename, property, value){
        var found = false;
        for(key in this.params){
            [param_file, param_lines] = this.params[key];
            if(param_file == filename){
                param_lines.push([property, value]);
                found = true;
                break;
            }
        }
        if(!found){
            param_lines = [[property, value]];
            this.params.push([filename, param_lines])
        }
    }
    this.print = function(){
        // console.log(this.params);
        for(key in this.params){
            console.log(this.params[key]);
        }
    }
    this.get_autobencher_param = function(key){
        for(i in this.params){
            [param_file, param_lines] = this.params[i];
            if(param_file == "auto_bencher") {
                for(j in param_lines){
                    [prop, value] = param_lines[j];
                    if(prop == key){
                        return value;
                    }
                }
            }
        }
        throw new Error("Cannot find parameter "+ key + " for the auto-bencher");
    }
    this.override_properties = function(PropertiesFileMap){
        for(i in this.params){
            [param_file, param_lines] = this.params[i];
            if(param_file == 'auto_bencher')
                continue;
            for(j in param_lines){
                [prop, value] = param_lines[j];
                PropertiesFileMap.set(param_file, prop, value);
            }
        }
    }
}

function ParameterList(file_path){
    const parameter = toml.parse(fs.readFileSync(file_path, 'utf-8'));
    var param_lists = [];
    Object.keys(parameter).forEach(filename => {
        toml_table = parameter[filename];
        param = Object.keys(toml_table).map(function(key){
            return [(key), toml_table[key]];
        });
        param_lists.push([filename, param]);
    });
    this.param_lists = param_lists;

    this.print = function () {
        this.param_lists.forEach(function(value, key){
            console.log(key,':',value);
        });
    }
    this.toVec = function () {
        var results = [];
        this.iterate_parameters(0, 0, new Parameter(), results);
        return results;
    }
    this.iterate_parameters = function (file_id, line_id, current, results) {
        if(file_id < this.param_lists.length){
            const [filename, param_lines] = this.param_lists[file_id];
            // console.log(filename, param_lines);
            if(line_id < param_lines.length){
                const [prop, value_list] = param_lines[line_id];
                // console.log(prop, value_list);
                value_list.split(" ").forEach(value => {
                    // console.log(value);
                    new_param = deepcopy(current);
                    new_param.add_param(filename, prop, value);
                    this.iterate_parameters(file_id, line_id + 1, new_param, results);
                })
            } else{
                this.iterate_parameters(file_id + 1, 0, current, results);
            }
        } else{
            results.push(current);
        }
    }
}

