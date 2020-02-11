const fs = require("fs");
const HashMap = require('hashmap');
const java_properties = require('java-properties');
function PropertiesFile(){
    // this.id = null;
    // this.filename = null;
    // this.properties = null;
    this.from_file = function(id, path){
        var properties = java_properties.of(path);
        filename = path.split("/").pop();
        this.id = id;
        this.filename = filename;
        this.properties = properties;

        // values.getKeys().forEach(key => {
        //     console.log(key, values.get(key));
        //     properties.set(key, values.get(key))
        // })
    }
    this.set = function(property, value){
        if(property in this.properties['objs'])
            this.properties['objs'][property] = value;
        else
            console.log("Cannot find property: " +  property + " in " + this.filename);
    }
    this.output_to_file = function(dir_path){
        file_path = dir_path + '/' +this.filename;
        stream = fs.createWriteStream(file_path);
        //stream.on('error', console.error);
        this.properties.getKeys().forEach(key => {
            stream.write(key + '=' + this.properties['objs'][key] + '\n'); 
        });
        stream.end();
    }
}
function PropertiesFileMap(){
    // this.files = null;
    this.from_dir = function(input_dir){
        settings_file = input_dir + "/settings.json";
        json_str = fs.readFileSync(settings_file);
        settings = JSON.parse(json_str);
        var files = new HashMap();
        settings.forEach(setting => {
            path = input_dir + '/' + setting.filename;
            file = new PropertiesFile();
            file.from_file(setting.id, path);
            files.set(file.filename, file);
        })
        this.files = files;
    }
    this.set = function(filename, property, value){
        filename = filename + '.properties';
        if(this.files.has(filename))
            this.files.get(filename).set(property, value);
        else
            console.log("Cannot find properties file: " + filename + ".properties for " + property);
    }
    this.output_to_dir = function(dir_path){
        if(!fs.existsSync(dir_path))
            fs.mkdirSync(dir_path);
        this.files.values().forEach(file => {
            file.output_to_file(dir_path);
        })
    }
    this.get_vm_args = function(prop_dir_path){
        vm_args = '';
        this.files.values().forEach(file => {
            vm_args += "-D" + file.id + "=" + prop_dir_path + "/" +file.filename + " ";
        })
        return vm_args.substring(0, vm_args.length - 1);
    }
}
module.exports = {
    PropertiesFileMap: PropertiesFileMap
}