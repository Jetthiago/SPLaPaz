
module.exports = function tableDataSellers(request, db, date, initalCallback) {
    employeesManager.resumEveryone(db);
    var pageWidth = config.pageWidth;
    var query = tableFunction.getQuery(request),
        bolNaN = {
            year: isNaN(query.year),
            month: isNaN(query.month)
        }
    if (!bolNaN.year && !bolNaN.month) {
        date = new Date(query.year, query.month);
    }
    getDate.set(date);
    var genData = {
        yearsList: [],
        month: getDate.month("string"),
        year: getDate.year(),
        sellers: [],
        pagesList: [],
        daily: [],
        totals: [],
        tableLength: 1
    }
    var public = {
        year: date.getFullYear(),
        month: date.getMonth(),
        document: {},
        page: parseInt(query.page) || 1
    }
    async.series([
        function getMonthData(callback) {
            db.tables.findOne({ year: public.year, month: public.month }, function (err, document) {
                if (document == null) {
                    return callback("not found");
                }
                delete document["_id"];
                public.document = document;
                callback(err, document);
            });
        },
        function getData(callback) {
            var sellersRevenue = public.document.sellers,
                numberOfDays = getDate.numberOfDays();
            sellersRevenue = sellersRevenue.slice((pageWidth * (public.page - 1)), (pageWidth * public.page));
            for (var i = 0; i < sellersRevenue.length; i++) {
                genData.sellers[i] = sellersRevenue[i].name;
            }
            // Define a lista de paginas;
            var nPages = public.document.sellers.length / pageWidth,
                actual = public.page,
                strActual = "";
            for (var i = 0; i < nPages; i++) {
                if (actual == i + 1) {
                    strActual = "actual";
                }
                genData.pagesList[i] = {
                    href: "year=" + date.getFullYear() + "&month=" + date.getMonth() + "&page=" + (i + 1),
                    n: i + 1,
                    actual: strActual
                };
                strActual = "";
            }
            if (!genData.pagesList[0]) genData.pagesList[0] = 1;
            genData.tableLength = pageWidth + 1;
            for (var i = 0; i < numberOfDays; i++) {
                var dayArray = [],
                    auxObj = { day: [], num: 0 };
                for (var j = 0; j < sellersRevenue.length; j++) {
                    dayArray[j] = {};
                    dayArray[j].value = sellersRevenue[j].day[i] ? sellersRevenue[j].day[i].toFixed(2) : null;
                    dayArray[j].name = i + sellersRevenue[j].name + "day";
                }
                auxObj.day = dayArray;
                auxObj.num = i + 1;
                genData.daily[i] = auxObj;
            }
            for (var i = 0; i < sellersRevenue.length; i++) {
                genData.totals[i] = sellersRevenue[i].total ? sellersRevenue[i].total.toFixed(2) : null;
            }
            callback(null, genData);
        },
        function listYears(callback) {
            db.tables.find({}, function (err, documents) {
                var years = [],
                    months = [];
                for (var i = 0; i < documents.length; i++) {
                    var elem = documents[i];
                    if (years.indexOf(elem.year) == -1) {
                        years.push(elem.year);
                    }
                }
                for (var i = 0; i < years.length; i++) {
                    for (var j = 0; j < documents.length; j++) {
                        if (documents[j].year == years[i]) {
                            genData.yearsList.push({ year: years[i], monthReadable: documents[j].month + 1, month: documents[j].month });
                        }
                    }
                }
                callback(null, genData.yearsList);
            });
        }
    ], function (err, result) {
        if (err == "not found") {
            return initalCallback(null, genData);
        } else if (err) {
            console.error.sever(err);
            return initalCallback(err);
        }
        //console.log(JSON.stringify(genData, null, 2));
        getDate.unset();
        initalCallback(null, genData);
    });
}