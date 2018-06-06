var my_console = require("./my_console");
var console = new my_console();

var createDbStructure = function (db, date, initalCallback) {
    var public = {
        year: date.getFullYear(),
        month: date.getMonth(),
        employees: [],
        sellers: []
    };
    getDate.set(date);
    async.series([
        function verifyExistence(callback) {
            db.tables.findOne({ year: public.year, month: public.month }, function (err, dbReturn) {
                if (err) return callback(err);
                if (dbReturn == null) callback(null, true);
                else callback(1, true);
            });
        },
        function getEmployees(callback) {
            normalizeArray.order(db, "employees", (err, newArr) => {
                public.employees = newArr
                callback(err, public.employees);
            });
        },
        function getSellers(callback) {
            normalizeArray.order(db, "sellers", (err, newArr) => {
                public.sellers = newArr;
                callback(err, public.sellers);
            });
        },
        function createStrut(callback) {
            var structure = {
                year: public.year,
                month: public.month,
                revenue: [],
                sellers: [],
                total: 0
            }
            for (var i = 0; i < public.employees.length; i++) {
                structure.revenue[i] = { name: public.employees[i], order: i, day: [], night: [], total: 0 };
                structure.revenue[i].day = normalizeArray.addNulls(structure.revenue.day, getDate.numberOfDays());
                structure.revenue[i].night = normalizeArray.addNulls(structure.revenue.night, getDate.numberOfDays());
            }
            for (var i = 0; i < public.sellers.length; i++) {
                structure.sellers[i] = { name: public.sellers[i], order: i, day: [], total: 0 };
                structure.sellers[i].day = normalizeArray.addNulls(structure.sellers.day, getDate.numberOfDays());
            }
            db.tables.insert(structure, callback);
        }
    ], function (err, result) {
        if (err == 1) {
            initalCallback(err);
            return console.db("DB structure already created: year=" + public.year + ", month=" + public.month);
        }
        else if(err == "sellers" || err == "employees"){
            initalCallback(err);
            return console.error().db(err + " db empty")
        }
        else if (err) {
            initalCallback(err);
            return console.error().db(err);
        }
        initalCallback(null, result);
        console.db("DB structure created: " + JSON.stringify(public.employees) + " and " + JSON.stringify(public.sellers));
    })
}

module.exports = createDbStructure;