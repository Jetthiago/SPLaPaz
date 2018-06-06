
var tableData = function(request, db, date, initalCallback) {
    employeesManager.resumEveryone(db);
    var query = tableFunction.getQuery(request),
        bolNaN = {
            year: isNaN(query.year),
            month: isNaN(query.month)
        }
    if(bolNaN.year && bolNaN.month){
        query = false;
    } else {
        date = new Date(query.year, query.month);
    }
    getDate.set(date);
    var genData = {
        yearsList: [],
        month: getDate.month("string"),
        year: getDate.year(),
        employees: [],
        daily: [],
        totals: [],
        tableLength: 1
    }
    var public = {
        year: date.getFullYear(),
        month: date.getMonth(),
        document: {}
    }
    async.series([
        function getMonthData(callback) {
            db.tables.findOne({year: public.year, month: public.month}, function(err, document) {
                if(document == null){
                    return callback("not found");
                }
                delete  document["_id"];
                public.document = document;
                callback(err, document);
            });
        },
        function getData(callback) {
            var revenue = public.document.revenue,
                numberOfDays = getDate.numberOfDays();
            for(var i = 0; i < revenue.length; i++){
                genData.employees[revenue[i].order] = revenue[i].name;
            }
            genData.tableLength = genData.employees.length + 2;
            for(var i = 0; i < numberOfDays; i++){
                var dayArray = [],
                    nightArray = [],
                    auxObj = { day: [], night: [], num: 0 };
                for(var j = 0; j < revenue.length; j++){
                    dayArray[j] = {};
                    nightArray[j] = {};
                    dayArray[j].value = revenue[j].day[i] ? revenue[j].day[i].toFixed(2): null;
                    dayArray[j].name = i + revenue[j].name + "day";
                    nightArray[j].value = revenue[j].night[i] ? revenue[j].night[i].toFixed(2) : null;
                    nightArray[j].name = i + revenue[j].name + "night";
                }
                auxObj.day = dayArray;
                auxObj.night = nightArray;
                auxObj.num = i+1;
                genData.daily[i] = auxObj;
            }
            for(var i = 0; i < revenue.length; i++){
                genData.totals[revenue[i].order] = revenue[i].total ? revenue[i].total.toFixed(2) : null;
            }
            callback(null, genData);
        },
        function listYears(callback) {
            db.tables.find({}, function (err, documents) {
                var years = [],
                    months = [];
                for(var i = 0; i < documents.length; i++){
                    var elem = documents[i];
                    if(years.indexOf(elem.year) == -1){
                        years.push(elem.year);
                    }
                }
                for(var i = 0; i < years.length; i++){
                    for(var j = 0; j < documents.length; j++){
                        if(documents[j].year == years[i]){
                            genData.yearsList.push({ year: years[i], monthReadable: documents[j].month + 1, month: documents[j].month});
                        }
                    }
                }
                callback(null, genData.yearsList);
            });
        }
    ], function(err, result) {
        if(err == "not found"){
            return initalCallback(null, genData);
        } else if(err) {
            console.error.sever(err);
            return initalCallback(err);
        }
        //console.log(JSON.stringify(genData, null, 2));
        getDate.unset();
        initalCallback(null, genData);
    });
}

module.exports = tableData;