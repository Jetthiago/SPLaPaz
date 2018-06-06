
var employeesManager = {
    makeAvaliable: function (db) {
        db.employees.find({}, function(err, employees) {
            if(err != null) return console.error("Failed loading employes from db.")
            global["employees"] = employees;
        })
    },
    resumEveryone: function (db, year, month) {
        var console = new myConsole();
        var public = {
            document: {},
            dates: []
        };
        if(year && month != undefined){
            year = parseInt(year);
            month = parseInt(month);
            async.series([
                function(callback) {
                    db.tables.findOne({year: year, month: month}, function(err, document) {
                        if(err) return callback(err);
                        else if(!document) return callback(month + "/" + year + " not found");
                        delete document._id;
                        public.document = document;
                        var numberOfDays = getDate.numberOfDays({year: year, month: month});
                        for(var i = 0; i < public.document.revenue.length; i++){
                            var sum = 0,
                                elem = public.document.revenue[i];
                            for(var j = 0; j < numberOfDays; j++){
                                sum += elem.day[j] ? elem.day[j] : 0;
                                sum += elem.night[j] ? elem.night[j] : 0;
                            }
                            public.document.revenue[i].total = sum;
                        }
                        for (var i = 0; i < public.document.sellers.length; i++) {
                            var sum = 0,
                                elem = public.document.sellers[i];
                            for (var j = 0; j < numberOfDays; j++) {
                                sum += elem.day[j] ? elem.day[j] : 0;
                            }
                            public.document.sellers[i].total = sum;
                        }
                        callback(null, document);
                    });
                },
                function(callback) {
                    db.tables.update({year: year, month: month}, public.document, callback);
                }
            ],
            function(err, results) {
                if (err) return console.error("[employeesManager] Error: " + err);
                console.server("Resumed everyone on year "+year+" month "+month+".");
            });
        }
        else if(!year && !month){
            async.series([
                function(callback) {
                    db.tables.find({}, function(err, documents) {
                        if (err){
                            return callback(err);
                        } else if (!documents){
                            return callback("documents not found");
                        }
                        for(var i = 0; i < documents.length; i++){
                            public.dates[public.dates.length] = {year: documents[i].year, month: documents[i].month};
                        }
                        callback(null, public.dates);
                    });
                },
                function(callback) {
                    for(var i = 0; i < public.dates.length; i++){
                        employeesManager.resumEveryone(db, public.dates[i].year, public.dates[i].month);
                    }
                }
            ],
            function (err, results) {
                if(err) console.error("[employeesManager] Error: "+err);
            });
        }
    }
}

module.exports = employeesManager;