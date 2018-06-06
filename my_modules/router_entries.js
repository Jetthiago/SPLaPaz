/*
Usage: ´routerEntries(router, hb, db, sessionne, console, config, serverError);´
├─router: my_modules/router_server already initialized with response, request and options;
├─hb: my_modules/handlebarsHB.standard;
├─db: mongojs initialized with collection called login or a init. nedb in a object: db={login:nedb};
├─sessionne: initialized with database already assingned;
├─console: custom new console my_modules/my_console;
├─config: file on root only for app name;
└─serverError: error handler to give a response to routerClient, use: sE(data,request,response), data as a ¨createResponse¨ object;
*/
/*
// these variable are already on global object thanks to ¨moloader¨;
var async = require("async");
var formidable = require("formidable");
var createResponse = require("./createResponse.js");
var isAuth = require("./isAuth.js");
var serverError = require("./serverError.js");
*/
/*var moloader = require("moloader");
moloader.load("async, formidable");*/

function routerEntries(router, hb, db, sessionne, console, config) {
    if (config) var appName = config.appName;
    else var appName = "";
    router.getClient("/table", function (request, response, options) {
        var public = {};
        async.series([
            function(callback) {
                sessionne.checkUser(request, response, function(err, auth, user){
                    if (err) return callback(err);
                    public.auth = auth;
                    public.user = user;
                    callback(null, public);
                });
            },
            function(callback) {
                if(public.auth == -1 || public.auth == 0){
                    tableData(request, db, new Date(), function (err, genData) {
                        if (err) return callback(err);
                        var data = new createResponse(request, response, {
                            title: appName + " - Balconistas - Planilha",
                            html: hb.table(genData)
                        });
                        response.writeHead(data.status, data.contentType);
                        response.write(data.string);
                        response.end();
                    });
                }
                else {
                    isAuth(null, public.auth, request, response, function(canContinue) {
                        tableData(request, db, new Date(), function (err, genData) {
                            if (err) return callback(err);
                            var data = new createResponse(request, response, {
                                title: appName + " - Balconistas - Planilha",
                                html: hb.table(genData) + "<script type=\"text/javascript\" src=\"/js/allowTable.js\"></script>"
                            });
                            response.writeHead(data.status, data.contentType);
                            response.write(data.string);
                            response.end();
                        });
                    });
                }
            }
        ], function (err, results) {
            if (err) {
                serverError(err, request, response);
            }
        })
        
    });

    router.getClient("/tablesellers", function (request, response, options) {
        var public = {
            auth: 0,
            user: ""
        };
        async.series([
            function (next) {
                sessionne.checkUser(request, response, (err, auth, user) => {
                    if(err) return next(err);
                    public.auth = auth;
                    public.user = user;
                    next(null, public.auth);
                });
            },
            function (next) {
                if(public.auth == -1 || public.auth == 0){
                    tableDataSellers(request, db, new Date(), (err, genData) => {
                        if (err) return next(err);
                        var data = new createResponse(request, response, {
                            title: appName + " - Vendedores - Planilha",
                            html: hb.tablesellers(genData)
                        });
                        response.writeHead(data.status, data.contentType);
                        response.end(data.string);
                    });
                }
                else {
                    isAuth(null, public.auth, request, response, (canContinue) => {
                        tableDataSellers(request, db, new Date(), (err, genData) => {
                            if (err) return next(err);
                            var data = new createResponse(request, response, {
                                title: appName + " - Vendedores - Planilha",
                                html: hb.tablesellers(genData) + "<script type=\"text/javascript\" src=\"/js/allowTable.js\"></script>"
                            });
                            response.writeHead(data.status, data.contentType);
                            response.end(data.string);
                        });
                    });
                }
            }
        ], function(err, results) {
            if (err) {
                serverError(err, request, response);
            }
        })
    });

    router.getClient("/options", function (request, response, options) {
        var itens = [
            { name: "Ver relatório", url: "#/report" },
            { name: "Ver planilha de mês anterior", url: "#/viewpastmonth" }, //ver planilha passada;
            { name: "Adicionar funcionario", url: "#/addemployee" },
            { name: "Remover funcionario", url: "#/removeemployee" }
        ]
        sessionne.checkUser(request, response, function (err, auth, user) {
            isAuth(err, auth, request, response, function (canContinue) {
                var data = new createResponse(request, response, {
                    title: appName + " - Menu de opções",
                    html: hb.options({ user: user, itens: itens })
                });
                response.writeHead(data.status, data.contentType);
                response.end(data.string);
            });
        });
    });

    router.getClient("/report", function (request, response, options) {
        async.waterfall([
            function (callback) {
                sessionne.checkUser(request, response, function (err, auth, user) {
                    callback(err, auth, user);
                });
            },
            function (auth, user, callback) {
                isAuth(null, auth, request, response, function (canContinue) {
                    callback(null, auth);
                });
            },
            function (auth, callback) {
                report(db, request, function (err, results) {
                    callback(null, results);
                });
            }
        ],
        function (err, results) {
            var data = new createResponse(request, response, {
                title: appName + " - Relatório",
                html: hb.report(results)
            });
            response.writeHead(data.status, data.contentType);
            response.end(data.string);
        });
    });

    router.getClient("/addemployee", function (request, response, options) {
        var public = {
            auth: -1,
            user: "",
            hbdata: {}
        };
        async.series([
            function (callback) {
                sessionne.checkUser(request, response, function (err, auth, user) {
                    public.auth = auth;
                    public.user = user;
                    callback(err, auth);
                });
            },
            function (callback) {
                isAuth(null, public.auth, request, response, function (canContinue) {
                    public.hbdata = { role: ["Balconista", "Vendedor"]};
                    callback(null, public.hbdata);
                });
            }
        ],
        function (err, results) {
            if (err) return serverError(err, request, response);
            var data = new createResponse(request, response, {
                title: appName + " - Adicionar funcionario",
                html: hb.addemployee(public.hbdata)
            });
            response.writeHead(data.status, data.contentType);
            response.end(data.string);
        });
    });

    router.getClient("/removeemployee", function (request, response, options) {
        var public = {
            auth: -1,
            user: "",
            hbdata: {},
            query: {},
            type: "request" // or redirect;
        };
        async.series([
            function (callback) {
                sessionne.checkUser(request, response, function (err, auth, user) {
                    public.auth = auth;
                    public.user = user;
                    callback(err, auth);
                });
            },
            function (callback) {
                isAuth(null, public.auth, request, response, function (canContinue) {
                    public.query = tableFunction.getQuery(request);
                    if(public.query.name && public.query.role){
                        public.type = "redirect";
                        removeemployeeFunction(db, public.query.name, public.query.role, callback);
                    } else{
                        removeemployeeData(db, function (err, hbdata) {
                            public.hbdata = hbdata;
                            callback(err, public.hbdata);
                        });
                    }
                });
            }
        ],
            function (err, results) {
                if (err) return serverError(err, request, response);
                if(public.type == "request"){
                    var data = new createResponse(request, response, {
                        title: appName + " - Adicionar funcionario",
                        html: hb.removeemployee(public.hbdata)
                    });
                } else if(public.type == "redirect"){
                    var data = new createResponse(request, response, {
                        newUrl: "removeemployee"
                    });
                }
                response.writeHead(data.status, data.contentType);
                response.end(data.string);
            });
    });

    router.getClient("/configurations", function (request, response, options) {
        var itens = [
            {name: "Change database mode", url: "#/changedb"}
        ]
        sessionne.checkUser(request, response, function(err, auth, user) {
            isAuth(err, auth, request, response, function (canContinue) {
                var data = new createResponse(request, response, {
                    title: appName + " - Configurações",
                    html: hb.options({ user: user, itens: itens })
                });
                response.writeHead(data.status, data.contentType);
                response.end(data.string);
            })
        });
    });

    router.getClient("/generate", function(request, response, options) {
        createDbStructure(db, new Date(), function() {})
        var data = new createResponse(request, response, {
            newUrl: "table"
        });
        response.writeHead(data.status, data.contentType);
        response.end(data.string);
    });

    router.postClient("/table", function(request, response, options) {
        var form = new formidable.IncomingForm(),
            date = new Date(),
            public = {
                fields: {},
                query: {},
                dbquery: {},
                month: date.getMonth(),
                year: date.getFullYear(),
                document: {}
            };
        async.series([
            function(callback) {
                sessionne.checkUser(request, response, function(err, auth, user) {
                    if(err) return callback(err);
                    /* else if(auth == -1) return callback(-1) // user shound't be able to modify anything whithout login; */
                    isAuth(err, auth, request, response, function (canContinue) {
                        callback(null, true);
                    });
                });
            },
            function(callback) {
                form.parse(request, function (err, formFields) {
                    console.info("Received table form");
                    public.fields = formFields;
                    public.query = tableFunction.getQuery(request);
                    if(public.query.month){
                        public.month = public.query.month;
                        if(public.query.year) public.year = public.query.year;
                    }
                    public.dbquery = { year: parseInt(public.year), month: parseInt(public.month)};
                    callback(err, formFields);
                });
            }, 
            function(callback) {
                db.tables.findOne(public.dbquery, function(err, document) {
                    if(err) return callback(err);
                    else if(document == null) return callback(1); // document not found;
                    delete document._id;
                    for(var i = 0; i < document.revenue.length; i++){
                        for(var j = 0; j < document.revenue[i].day.length; j++){
                            var resDay = public.fields[j + document.revenue[i].name + "day"],
                                resNight = public.fields[j + document.revenue[i].name + "night"];
                            document.revenue[i].day[j] = resDay ? parseFloat(resDay) : null;
                            document.revenue[i].night[j] = resNight ? parseFloat(resNight) : null;
                        }
                    }
                    public.document = document;
                    callback(null, document);
                });
            },
            function(callback) {
                db.tables.update(public.dbquery, public.document, callback);
            }
        ],
        function (err, results) {
            if(err == 1){
                var data = new createResponse(request, response, {
                    title: appName + " - Erro",
                    html: "Tabela não encontrada",
                    status: 515
                });
                response.writeHead(data.status, data.contentType);
                response.end(data.string);
                return console.error().server("Table document not found: month="+public.month+" year="+public.year);
            } else if (err){
                var data = new createResponse(request, response, {
                    title: appName + " - Erro",
                    html: "<big class=\"error jumbotron\">Server error: "+err+"</big>",
                    status: 500
                });
                response.writeHead(data.status, data.contentType);
                response.end(data.string);
                return console.error().server(err);
            }
            employeesManager.resumEveryone(db/* , public.year, public.month */);
            var data = new createResponse(request, response, {
                newUrl: "table?year=" + public.year + "&month=" + public.month
            });
            response.writeHead(data.status, data.contentType);
            response.end(data.string);
        })
    });

    router.postClient("/tablesellers", function (request, response, options) {
        var form = new formidable.IncomingForm(),
            date = new Date(),
            public = {
                fields: {},
                query: {},
                dbquery: {},
                month: date.getMonth(),
                year: date.getFullYear(),
                document: {}
            }
        async.series([
            function (next) {
                sessionne.checkUser(request, response, function (err, auth, user) {
                    isAuth(err, auth, request, response, function (canContinue) {
                        next(null, true);
                    });
                });
            },
            function (next) {
                form.parse(request, (err, formFields) => {
                    console.info("Received sellers\'s table form");
                    public.fields = formFields;
                    public.query = tableFunction.getQuery(request);
                    if(public.query.month){
                        public.month = public.query.month;
                        if(public.query.year) public.year = public.query.year;
                    }
                    public.dbquery = { year: parseInt(public.year), month: parseInt(public.month)};
                    next(err, formFields);
                });
            },
            function (next) {
                db.tables.findOne(public.dbquery, (err, document) => {
                    if(err) return next(err);
                    else if(document == null) return callback(1);
                    delete document._id;
                    for(var i = 0; i < document.sellers.length; i++){
                        for(var j = 0; j < document.sellers[i].day.length; j++){
                            var resDay = public.fields[j + document.sellers[i].name + "day"];
                            document.sellers[i].day[j] = resDay ? parseFloat(resDay) : null;
                        }
                    }
                    public.document = document;
                    next(null, document);
                });
            },
            function (next) {
                db.tables.update(public.dbquery, public.document, next);
            }
        ], function (err, results) {
            if(err == 1){
                var data = new createResponse(request, response, {
                    title: appName + " - Erro",
                    html: "Tabela não encontrada",
                    status: 515
                });
                console.error().sever("Table document not found: month=" + public.month + " year=" + public.year);
            } else if(err){
                var data = new createResponse(request, response, {
                    title: appName + " - Erro",
                    html: "<big class=\"error jumbotron\">Server error: " + err + "</big>",
                    status: 500
                });
                console.error().server(err);
            } else {
                employeesManager.resumEveryone(db/* , public.year, public.month */);
                var data = new createResponse(request, response, {
                    newUrl: "tablesellers?year=" + public.year + "&month=" + public.month
                });
            }
            response.writeHead(data.status, data.contentType);
            response.end(data.string);
        })
    });

    router.postClient("/addemployee", function (request, response, options) {
        var form = new formidable.IncomingForm(),
            date = new Date(),
            public = {
                fields: {},
                dbquery: {},
                collection: "",
                tableDocument: {},
                newStructure: {}
            };
        async.series([
            function (callback) {
                sessionne.checkUser(request, response, function (err, auth, user) {
                    if(err) return callback(err);
                    isAuth(err, auth, request, response, function (canContinue) {
                        callback(null, true);
                    });
                });
            },
            function (callback) {
                form.parse(request, function (err, formFields) {
                    if(err) return callback(err);
                    formFields.name = clearUpName(formFields.name);
                    console.info("Received new employee: \""+formFields.name+"\"");
                    public.fields = formFields;
                    public.dbquery = {name: public.fields.name};
                    if (public.fields.role == "Balconista"){
                        public.collection = "employees";
                    } else if(public.fields.role == "Vendedor") {
                        public.collection = "sellers";
                    }
                    callback(null, public.collection);
                });
            },
            function (callback) {
                db[public.collection].findOne(public.dbquery, function(err, document) {
                    if(err) return callback(err);
                    else if(document) return callback(1); // funcionario já existe;
                    callback(null, true);
                });
            },
            function (callback) {
                db[public.collection].insert({name: public.fields.name}, callback);
            },
            function (callback) {
                var dbqueryTable = { year: date.getFullYear(), month: date.getMonth() };
                public.dbqueryTable = dbqueryTable;
                db.tables.findOne(dbqueryTable, function (err, document) {
                    if(err) return callback(err);
                    else if(document == null) return callback(-1);
                    delete document._id;
                    var order = document.revenue.length+1;
                    var newStructure = { name: public.fields.name, order: order, day: [], night: [], total: 0 };
                    newStructure.day = normalizeArray.addNulls(false, getDate.numberOfDays(dbqueryTable));
                    newStructure.night = normalizeArray.addNulls(false, getDate.numberOfDays(dbqueryTable));
                    if(public.collection == "employees"){
                        document.revenue.push(newStructure);
                    } else if(public.collection == "sellers"){
                        document.sellers.push(newStructure);
                    }
                    public.tableDocument = document;
                    callback(null, newStructure);
                });
            },
            function (callback) {
                db.tables.update(public.dbqueryTable, public.tableDocument, callback);
            }
        ],
        function (err, results) {
            if(err == 1){
                var data = new createResponse(request, response, {
                    title: appName + " - Erro",
                    html: "Funcionario já existe: "+public.fields.name,
                    status: 409
                });
                console.error().server("Employee already exists: "+public.fields.name);
            }
            else if(err == -1){
                var data = new createResponse(request, response, {
                    title: appName + " - Erro",
                    html: "Não foi possivel atualizar o documento de tabela. Como consequência, o funcionario adicionado não aparecerá na planilha: " + public.fields.name,
                    status: 500
                });
            }
            else if (err) return serverError(err, request, response);
            else {
                var data = new createResponse(request, response, {
                    newUrl: "options"
                });
            }
            response.writeHead(data.status, data.contentType);
            response.end(data.string);
        });
    });

}

function clearUpName(str) {
    str = str.trim();
    str = str.toLowerCase();
    strArray = str.split(" ");
    var tempStr = "",
        tempArr = [];
    for (var i = 0; i < strArray.length; i++) {
        for (var j = 0; j < strArray[i].length; j++) {
            if (j == 0) tempStr += new String(strArray[i][j]).toUpperCase();
            else tempStr += strArray[i][j];
        }
        tempArr.push(tempStr);
        tempStr = "";
    }
    str = tempArr.join(" ");
    return str;
}

module.exports = routerEntries;