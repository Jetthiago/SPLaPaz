var normalizeArray = {
    order: function (db, collection, callback) {
        var public = {
            newArr: [],
            newDocs: []
        }
        async.series([
            function (next) {
                db[collection].find({}, (err, dbReturn) => {
                    if (err) return next(err);
                    else if (dbReturn) {
                        var result = dbReturn;
                        for (var i = 0; i < result.length; i++) {
                            delete result[i]._id;
                            result[i].order = i;
                            public.newArr[i] = result[i].name;
                        }
                        public.newDocs = result;
                        next(null, public.newArr);
                    }
                    else next(collection);
                });
            },
            function (next) {
                var funcs = [],
                    funcsData = {
                        each: [],
                        index: 0
                    }
                for (var i = 0; i < public.newDocs.length; i++) {
                    funcsData.each[i] = public.newDocs[i];
                    funcs[i] = function (following) {
                        var index = funcsData.index++,
                            name = funcsData.each[index].name;
                        db[collection].update({ name: name }, { name: name, order: funcsData.each[index].order }, following);
                    }
                }
                async.series(funcs, function (err, results) {
                    if (err) return next(err);
                    next(null, results);
                });
            }
        ], function (err, results) {
            if (err) return callback(err);
            callback(null, public.newArr);
        });
    },
    addNulls: function(arr, max){
        if(!arr) arr = [];
        for(var i = 0; i < max; i++){
            if(!arr[i]){
                arr[i] = null;
            }
        }
        return arr;
    }
}

module.exports = normalizeArray;