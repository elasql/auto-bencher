const parameter = require('../parameters');
const sub_com = require('./sub_com');
const con_com = require('../connections/con_com');

module.exports = {
    execute: function(config, argv){
        db_name = argv[3];
        param_file = argv[4];
        console.log('Preparing for loading testbed into ' + db_name);
        console.log('Using parameter file ' + param_file)
        
        // Prepare the parameter file
        param_list = new parameter.ParameterList(param_file);
        param_list = param_list.toVec();

        if(param_list.length > 1){
            throw new Error("The parameter file contains more than one combination");
        }

        sub_com.run(config, param_list[0], db_name, con_com.Action.loading, null);

        console.log('Loading testbed finished.')
    }
};