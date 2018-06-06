var moloader = require("moloader");
moloader.loadPack()
    .load("./../../config.json, ./../../my_modules/returnNewDb.js, ./../../my_modules/normalizeArray.js");

var db = returnNewDb(config);
var public = {
    tables: [],
    i: 0
}

function updateDb(tables, callback) {
    var funcs = [];
    for(var i = 0; i < tables.length; i++){
        var funcAux = function (next) {
            db.tables.update({year: public.tables[public.i].year, month: public.tables[public.i].month}, public.tables[public.i], next);
            public.i++;
        }
        funcs.push(funcAux);
    }
    async.series(funcs, callback);
}

async.series([
    function getTables(next) {
        db.tables.find({}, (err, tables) => {
            if(err) return next(err);
            else if (!tables) next("getTables notfound");
            public.tables = tables;
            next(err, tables);
        })
    },
    function genStructure(next) {
        var expStructure = {
            year: 0,
            month: 0,
            revenue: [],
            sellers: [],
            total: 0
        }, tables = public.tables;
        for(var i = 0; i < tables.length; i++){
            delete tables[i]._id;
            tables[i]["sellers"] = [];
        }
        public.tables = tables;
        next(null, tables);
    },
    function saveAlterations(next) {
        updateDb(public.tables, next);
    }
], function end(err, results) {
    console.log(results);
    if(err) console.log(err);
});