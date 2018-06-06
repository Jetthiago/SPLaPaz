var my_console = require("./my_console");
var console = new my_console();

var updateTableDb = function(db) {
    var date = new Date();
    createDbStructure(db, date, function (err, result) {
        if(err && err != 1) return console.error().server("Error on creating structure: "+err);
        var nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(0);
        nextDay.setMinutes(1);
        var timeout = nextDay.getTime() - date.getTime();
        setTimeout(() => {
            updateTableDb(db);
        }, timeout);

    });
}

module.exports = updateTableDb;