var moloader = require("moloader");
moloader.loadPack()
    .load("./../../config.json, ./../../my_modules/returnNewDb.js");
var db = returnNewDb(config);

async.series([
    function(callback) {
        
    }
])