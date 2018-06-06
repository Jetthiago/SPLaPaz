var moloader = require("moloader");
moloader.verbose = false;
moloader.load("fs")
		.loadDir("./my_modules")
		.loadPack();

var db = mongojs("singlePageVanilla", ["login"]);
db.login.find({user: "Thiago", pass: 1457007465},function(err,doc){
	if(err) return console.error(err);
	console.log(doc);
});



/*var Sessionne = sessionne;
sessionne = new Sessionne(db);
var console = new my_console;

var user = {
	user: "thiago",
	ip: "192.168.1.14"
}
var request = {connection: {remoteAddress: "::ffff:192.168.1.14"}}
var response = {writeHead: function(){},write: function(){},end: function(){}}
var payload = {user: "thiago", pass: "192168"}*/

// adding a auth to user;
/*user.auth = sessionne.generateAuth(request, user.user).auth;
console.start("[test] receiving request: "+JSON.stringify(user));*/

// tring to add a user to the auth database;
/*sessionne.addUser(request, user, true, function(auth){
	console.log("[test] auth on fsdb created: "+JSON.stringify(auth));
	sessionne.checkUser(request, response, user.user, user.auth, function(authChecked){
		console.log("[test] authChecked: "+authChecked);
	})
});*/

/*for(var key in console){
	if(key != "dir" && key != "clear" && key != "trace" && key != "assert" && key != "time" && key != "timeEnd"){
		console[key]("testing with "+key+"\n");
	}
}
console.error().server("unknown error");
console.warn().server("you known what");
console.warn("sdf")

var fsdb = new nedb({filename: "dbs/runtime", autoload: true});

fsdb.remove({auth:000},{multi:true},function(err){
	if(err) console.error(err);
	else {
		console.log(JSON.stringify(arguments));
	}
})*/

1457007465