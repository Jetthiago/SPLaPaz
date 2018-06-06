function removeemployeeData(db, callback) {
    var public = {
        employees: [],
        sellers: [],
        result: {
            employees: [],
            sellers: []
        }
    };
    async.series([
        function (next) {
            db.employees.find({}, function (err, employees) {
                if(err) return next(err);
                public.employees = employees;
                next(null, employees);
            });
        },
        function (next) {
            db.sellers.find({}, function (err, sellers) {
                if(err) return next(err);
                public.sellers = sellers;
                next(null, sellers);
            });
        },
        function (next) {
            var maxLength = Math.max(public.employees.length, public.sellers.length);
            for(var i = 0; i < maxLength; i++){
                if(public.employees[i]) public.result.employees[i] = {name: public.employees[i].name};
                if(public.sellers[i]) public.result.sellers[i] = {name: public.sellers[i].name};
            }
            next(null, public.result);
        }
    ],
    function (err, results) {
        callback(err, public.result);
    });
}

module.exports = removeemployeeData;