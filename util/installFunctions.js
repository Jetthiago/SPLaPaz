
var installFunctions = {}; // Object returned;


function scanHidden(query, callback) {
    var stdin = process.openStdin(),
        i = 0,
        hiderFunc = function (char) {
            char = char + "";
            switch (char) {
                case "\n":
                case "\r":
                case "\u0004":
                    stdin.pause();
                    break;
                default:
                    process.stdout.write("\033[2K\033[200D" + query + "[" + ((i % 2 == 1) ? "=-" : "-=") + "]");
                    //process.stdout.write("\033[2K\033[200D" + query + Array(hiddenRl.line.length + 1).join("*"));
                    i++;
                    break
            }
        }
    process.stdin.on("data", hiderFunc);
    var hiddenRl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    hiddenRl.question(query, function (value) {
        hiddenRl.history = hiddenRl.history.slice(1);
        hiddenRl.close();
        process.stdin.removeListener("data", hiderFunc);
        callback(value, hiddenRl);
    });
}


function createAdmin(db, callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    var createAdminDbFunc = {
        tryFind: function (createdAdmin, callback) {
            var that = this;
            db.login.findOne({ user: createdAdmin.user, admin: true }, function (err, admin) {
                assert(err == null, "Error on db, tring to find intial admin user: " + err);
                if (admin) {
                    console.log("Admin user already created. Name: " + admin.user);
                    callback(null, true);
                } else {
                    that.createOne(createdAdmin, callback);
                }
            });
        },
        createOne: function (createdAdmin, callback) {
            db.login.insert(createdAdmin, function (err, newAdmin) {
                assert(err == null, "Error on db, tring to insert intial admin user: " + err);
                console.info("Admin created: " + newAdmin.user);
                callback(null, true);
            });
        }
    }

    var createdAdmin = { user: "", pass: 0, admin: true };
    rl.question("Admin name: ", function (answer) {
        createdAdmin.user = answer;
        rl.close();
        scanHidden("Admin password: ", function (answerPass) {
            createdAdmin.pass = new String(answerPass).hashCode();
            createAdminDbFunc.tryFind(createdAdmin, callback);
        });
    });
}

function createEmployee(db, callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    var createEmployeeFunc = {
        tryFind: function (createdEmployee, callback) {
            var that = this;
            db.employees.findOne({ user: createdEmployee.name }, function (err, employee) {
                assert(err == null, "Error on db, tring to find intial employee: " + err);
                if (employee) {
                    console.log("Employee already created. Name: " + employee.user);
                    callback(null, true);
                } else {
                    that.createOne(createdEmployee, callback);
                }
            });
        },
        createOne: function (createdEmployee, callback) {
            db.employees.insert(createdEmployee, function (err, newEmployee) {
                assert(err == null, "Error on db, tring to insert intial employee: " + err);
                console.info("Employee created: " + newEmployee.name);
                callback(null, true);
            });
        }
    }

    var createdEmployee = { name: ""};
    rl.question("Employee name: ", function (answer) {
        createdEmployee.name = answer;
        rl.close();
        createEmployeeFunc.tryFind(createdEmployee, callback);
    });
}

function testDb(db, callback) {
    db.test.insert({ user: "user", pass: 0, admin: false }, function (err, doc) {
        if (err) console.warn("Error on mongodb, fallback should be called now: " + err);
        callback(null, true);
    })
}


installFunctions.createAdmin = createAdmin;
installFunctions.scanHidden = scanHidden;
installFunctions.testDb = testDb;
installFunctions.createEmployee = createEmployee;
module.exports = installFunctions;

String.prototype.hashCode = function() {
	var hash = 0, i, chr, len;
	if(this.length === 0) return hash;
	if(this.toString() == "undefined") return hash;
	for(i = 0, len = this.length; i < len; i++){
		chr = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0;
	}
	return hash;
};