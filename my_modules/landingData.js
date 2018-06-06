
var landingData = function(db, callback, overwrite) {
    var date = new Date();
    if(overwrite) date = new Date(overwrite);
    getDate.set(date);
    var dateInfo = getDate.day() + " de " + getDate.month("string") + " de " + getDate.year();
    var data = {
        date: dateInfo,
        names: [],
        namesSellers: [],
        status: 0 //0: inativo, 1: dia, 2: noite
    }
    var hours = date.getHours();
    if(hours >= 5 && hours < 14){
        data.date += " - Dia";
        data.status = 1;
    } else if(hours >= 14 && hours < 22){
        data.date += " - Noite";
        data.status = 2;
    } else {
        data.date += " - Inativo";
    }
    async.series([
        function (next) {
            db.employees.find({}, (err, dbNames) => {
                for(var i = 0; i < dbNames.length; i++){
                    data.names[i] = {name: dbNames[i].name};
                }
                next(err, dbNames);
            });
        },
        function (next) {
            db.sellers.find({}, (err, dbSellers) => {
                for(var i = 0; i < dbSellers.length; i++){
                    data.namesSellers[i] = {name: dbSellers[i].name};
                }
                next(err, dbSellers);
            });
        }
    ], function (err, results) {
        callback(err, data);
    });
}

module.exports = landingData;