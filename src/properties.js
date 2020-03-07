const fs = require('fs');
const path = require('path');
const javaProperties = require('java-properties');

class PropertiesFile {
  constructor (id, propertiesPath) {
    this.id = id;
    this.properties = { ...javaProperties.of(propertiesPath).objs };
    this.fileName = path.basename(propertiesPath, '.properties');
  }

  set (property, value) {
    if (!Object.prototype.hasOwnProperty.call(this.properties, property)) {
      throw Error(`cannot find the property: ${property} in ${this.fileName}.properties`);
    }
    if (typeof value !== 'string') {
      throw Error(`value ${value} is not in string type`);
    }
    this.properties[property] = value;
  }

  outputToFile (outputDir) {
    const filePath = path.posix.join(outputDir, this.fileName + '.properties');
    fs.writeFileSync(filePath, this.convertObjectToPropertiesText());
  }

  convertObjectToPropertiesText () {
    let text = '';

    Object.keys(this.properties).map(key => {
      text += key + '=' + this.properties[key] + '\n';
    });

    return text;
  }
}

class PropertiesFileMap {
  constructor (propertiesDir) {
    this.propertiesDir = propertiesDir;
    this.fileNameToPropertiesFileObject = this.genFileNameToPropertiesFileObjectMap();
  }

  genFileNameToPropertiesFileObjectMap () {
    const map = {};
    const settings = this.loadSettingsToObject();
    settings.map(setting => {
      const filePath = path.posix.join(this.propertiesDir, setting.filename);
      const pf = new PropertiesFile(setting.id, filePath);
      map[setting.filename] = pf;
    });
    return map;
  }

  loadSettingsToObject () {
    const settingsPath = path.posix.join(this.propertiesDir, 'settings.json');
    const settings = fs.readFileSync(settingsPath);
    return JSON.parse(settings);
  }

  set (fileName, property, value) {
    if (!Object.prototype.hasOwnProperty.call(this.fileNameToPropertiesFileObject, fileName)) {
      throw Error(`cannot find properties file: ${fileName}`);
    }
    this.fileNameToPropertiesFileObject[fileName].set(property, value);
  }

  outputDir (dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    Object.values(this.fileNameToPropertiesFileObject).map(pf => {
      pf.outputDir(dirPath);
    });
  }

  getVmArgs (propertiesDir) {
    let vmArgs = '';

    Object.values(this.fileNameToPropertiesFileObject).map(pf => {
      vmArgs += '-D ' + pf.id + '=' + path.posix.join(propertiesDir, pf.fileName + '.properties ');
    });

    // remove the last ' '
    return vmArgs.slice(0, vmArgs.length - 1);
  }
}

module.exports = {
  PropertiesFile,
  PropertiesFileMap
};

// const fs = require('fs');
// const HashMap = require('hashmap');
// const java_properties = require('java-properties');
// function PropertiesFile () {
//   // this.id = null;
//   // this.filename = null;
//   // this.properties = null;
//   this.from_file = function (id, path) {
//     var properties = java_properties.of(path);
//     filename = path.split('/').pop();
//     this.id = id;
//     this.filename = filename;
//     this.properties = properties;

//     // values.getKeys().forEach(key => {
//     //     console.log(key, values.get(key));
//     //     properties.set(key, values.get(key))
//     // })
//   };
//   this.set = function (property, value) {
//     if (property in this.properties.objs) { this.properties.objs[property] = value; } else { console.log('Cannot find property: ' + property + ' in ' + this.filename); }
//   };
//   this.output_to_file = function (dir_path) {
//     file_path = dir_path + '/' + this.filename;
//     stream = fs.createWriteStream(file_path);
//     // stream.on('error', console.error);
//     this.properties.getKeys().forEach(key => {
//       stream.write(key + '=' + this.properties.objs[key] + '\n');
//     });
//     stream.end();
//   };
// }
// function PropertiesFileMap () {
//   // this.files = null;
//   this.from_dir = function (input_dir) {
//     settings_file = input_dir + '/settings.json';
//     json_str = fs.readFileSync(settings_file);
//     settings = JSON.parse(json_str);
//     var files = new HashMap();
//     settings.forEach(setting => {
//       path = input_dir + '/' + setting.filename;
//       file = new PropertiesFile();
//       file.from_file(setting.id, path);
//       files.set(file.filename, file);
//     });
//     this.files = files;
//   };
//   this.set = function (filename, property, value) {
//     filename = filename + '.properties';
//     if (this.files.has(filename)) { this.files.get(filename).set(property, value); } else { console.log('Cannot find properties file: ' + filename + '.properties for ' + property); }
//   };
//   this.output_to_dir = function (dir_path) {
//     if (!fs.existsSync(dir_path)) { fs.mkdirSync(dir_path); }
//     this.files.values().forEach(file => {
//       file.output_to_file(dir_path);
//     });
//   };
//   this.get_vm_args = function (prop_dir_path) {
//     vm_args = '';
//     this.files.values().forEach(file => {
//       vm_args += '-D' + file.id + '=' + prop_dir_path + '/' + file.filename + ' ';
//     });
//     return vm_args.substring(0, vm_args.length - 1);
//   };
// }
// module.exports = {
//   PropertiesFileMap: PropertiesFileMap
// };
