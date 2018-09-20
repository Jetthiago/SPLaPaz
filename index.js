// Coded by Thiago Marques <jetthiago@hotmail.com>
/*
_-_-
continue from here:
	- documentation ¨urgent¨
	+-- routerBasics
	- write form control and functions
	- do some code optimization
	- status code handler for routerClient
	+-- scratch done, start doing method to understand status code and add custom codes
	- easier 
 _-_-
*/
// https://unicode-table.com/en/blocks/box-drawing/

// loading dependencies;
var moloader = require("moloader");
moloader.verbose = false;
moloader.loadPack()
	.load("http, url, fs, os, dns, querystring")
	.loadDir("./my_modules");

// assining variables;
var config = require("./config.json");
var Staticfy = staticfy;
	staticfy = new Staticfy("./static");
var Cookies = cookies;
var Router = routerServer;
var hb = handlebarsHb;
// assining database;
var db = returnNewDb(config);
// loading employees list;
employeesManager.makeAvaliable(db);
var Sessionne = sessionne;
sessionne = new Sessionne(db);
var console = new myConsole(config.debug);

// loading configuration;
var port = process.env.PORT || config.port;
var keygrip = config.keygrip;
var appName = config.appName;
global["codeTable"] = require("./codeTable.json");

// handling functions;
function dberror(err,callback){
	if(new String(err.message).search("first connection")){
		db = {};
		db.login = new nedb({filename: "dbs/login", autoload: true});
		sessionne.db = db;
	}
	if(callback) callback();
	console.warn().server("error on mongodb, changing to nedb...");
}

updateTableDb(db);

// starting server;
var server = http.createServer(function(request, response){
	var router = new Router(request,response,{static: "./static", db: db});
	routerBasics(router, hb, db, sessionne, console, config);
	routerEntries(router, hb, db, sessionne, console, config);

	router.end();
});

dns.lookup(os.hostname(), {all:true, family: 4}, function(err, add, fam){
	server.listen(port,function(){console.start("Single-Page-Vanilla serving locally at http://"+add[add.length - 1].address+":"+port+"/")});
});

/*var exceptionOccured = false;
process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    exceptionOccured = true;
    process.exit();
});
process.on('exit', function(code) {
    if(exceptionOccured) console.log('Exception occured');
    else console.log('Kill signal received');
    process.exit();
});
process.on("SIGINT", function(code){
	console.log("Possible Ctrl+C received");
	process.exit();
});
process.on("SIGTERM", function(code){
	console.log("Termination requeried");
	process.exit();
});*/

function convertCircular(key, value) {
	var cache = [];
	if (typeof value === 'object' && value !== null) {
		if (cache.indexOf(value) !== -1) {
		    // Circular reference found, discard key
		    return;
		}
		// Store value in our collection
		cache.push(value);
	}
	return value;
}

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


/* process.on("SIGUSR1", function() {
	process.exit();
});
process.on("SIGUSR2", function() {
	process.exit();
});
process.on("SIGINT", function() {
	process.exit();
}); 
process.on("SIGTERM", function(code) {
	process.exit();
});
process.on("SIGHUP", function() {
	fs.writeFileSync("test", "mili:" + new Date().getMilliseconds());
	process.exit();
});
process.on("SIGQUIT", function () {
	fs.writeFileSync("test", "mili:" + new Date().getMilliseconds());
	process.exit();
});
process.on("SIGKILL", function() {
	fs.writeFileSync("test", "mili:" + new Date().getMilliseconds());
});
process.on("exit", function(params) {
	fs.writeFileSync("test", "mili:" + new Date().getMilliseconds());
}); */
// https://github.com/jtlapp/node-cleanup