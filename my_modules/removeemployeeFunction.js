function removeemployeeFunction(db, name, role, callback) {
    async.series([
        function (next) {
            db[role].remove({name: name}, next);
        }
    ],
    function (err, results) {
        if(err) return callback(err);
        callback(null, results[0]);
    });
}

module.exports = removeemployeeFunction;