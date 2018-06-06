var report = function (db, request, callback) {
    var public = {
        result: {
            months: [],
            year: 0,
            yearsList: [],
            employees: [],
            sellers: []
        },
        reqQuery: tableFunction.getQuery(request),
        year: 0,
        documents: [],
        reqYearDocuments: []
    };
    if(isNaN(public.reqQuery.year)){
        var date = new Date();
        public.year = date.getFullYear();
    } else {
        public.year = parseInt(public.reqQuery.year);
        var date = new Date(public.year);
    }
    for(var i = 0; i < 12; i++){
        getDate.set(new Date(public.year, i));
        public.result.months.push(getDate.month("string"));
    }
    getDate.set(date);
    async.series([
        function (next) {
            db.tables.find({}, function(err, documents) {
                if(err) return next(err);
                var years = [],
                    monthsData = [],
                    employeesList = [],
                    sellersList = [];
                for(var i = 0; i < documents.length; i++){
                    var elem = documents[i];
                    if (years.indexOf(elem.year) == -1){
                        years.push(elem.year);
                    }
                    if(elem.year == public.year){
                        monthsData[elem.month] = elem;
                    }
                }
                for (var i = 0; i < monthsData.length; i++) {
                    if(monthsData[i]){
                        for (var j = 0; j < monthsData[i].revenue.length; j++) {
                            var name = monthsData[i].revenue[j].name;
                            if(employeesList.indexOf(name) == -1){
                                employeesList.push(name);
                            }
                        }
                        for (var j = 0; j < monthsData[i].sellers.length; j++) {
                            var name = monthsData[i].sellers[j].name;
                            if (sellersList.indexOf(name) == -1) {
                                sellersList.push(name);
                            }
                        }
                    }
                }
                var lList = Math.max(employeesList.length, sellersList.length);
                for(var i = 0; i < lList; i++){
                    if (employeesList[i]) public.result.employees[i] = { name: employeesList[i], monthRevenue: ["0 R$", "0 R$", "0 R$", "0 R$", "0 R$", "0 R$", "0 R$", "0 R$", "0 R$", "0 R$", "0 R$", "0 R$"] };
                    if (sellersList[i]) public.result.sellers[i] = { name: sellersList[i], monthRevenue: ["0 R$", "0 R$", "0 R$", "0 R$", "0 R$", "0 R$", "0 R$", "0 R$", "0 R$", "0 R$", "0 R$", "0 R$"] };
                }
                for(var i = 0; i < monthsData.length; i++){
                    for(var j = 0; j < public.result.employees.length; j++){
                        if(monthsData[i])
                        for(var k = 0; k < monthsData[i].revenue.length; k++){
                            if(monthsData[i].revenue[k].name == public.result.employees[j].name) {
                                public.result.employees[j].monthRevenue[i] = monthsData[i].revenue[k].total + " R$";
                                break;
                            }
                        }
                    }
                    for (var j = 0; j < public.result.sellers.length; j++) {
                        if (monthsData[i])
                            for (var k = 0; k < monthsData[i].sellers.length; k++) {
                                if (monthsData[i].sellers[k].name == public.result.sellers[j].name) {
                                    public.result.sellers[j].monthRevenue[i] = monthsData[i].sellers[k].total + " R$";
                                    break;
                                }
                            }
                    }
                }
                public.result.yearsList = years;
                public.documents = documents;
                next(null, documents);
            });
        }
    ], function (err, results) {
        getDate.unset();
        public.result.year = public.year;
        callback(null, public.result);
    });
}

module.exports = report;