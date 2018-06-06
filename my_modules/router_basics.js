/*
Provides basic methods to router: 
├─login
├─logout
├─singup
├─custom code table
└─first acess

Usage: ´routerBasics(router, hb, db, sessionne, console, config, serverError);´
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

function routerBasics(router, hb, db, sessionne, console, config){
	if(config) var appName = config.appName;
	else var appName = "";
	
	router.get("/", function (request, response, options){
		landingData(db, function(err, hbData) {
			if(err) return console.error.server(err);
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write(hb.main({ body: hb.landing(hbData), appName: appName }));
			response.end();
		})
		//return {request: request, response: response, options: options};
	});

	router.getClient("/landing", function(request, response, options) {
		landingData(db, function(err, hbData) {
			if (err) {
				var data = new createResponse(request, response, {
					status: 500,
					html: err
				});
				return serverError(data, request, response);
			}
			var data = new createResponse(request, response, {
				title: appName + " - ...",
				html: hb.landing(hbData)
			});
			response.writeHead(data.status, data.contentType);
			response.end(data.string);
		})
	});

	router.getClient("/codetable", function(request,response,options){
		staticfyExtended.codeTable(request,response);
	});
	
	router.getClient("/login", function(request,response){
		sessionne.checkUser(request,response,function(err,auth,user){
			isAuth(err, auth, request, response,
				{title: appName+" - login", html: hb.login({})
			});
		});
	});
	
	router.getClient("/singup", function(request,response){
		sessionne.checkUser(request,response,function(err,auth,user){
			isAuth(err, auth, request, response,
				{title: appName+" - sing up", html: hb.singup({})
			});
		})
	});
	
	router.getClient("/logout", function(request,response,options){
		sessionne.removeUser(request,response, function(err, endedSession){
			if(err){
				var data = new createResponse(request,response,{
					status: 500,
					html: err
				});
				serverError(data,request,response);
			} else {
				console.server("ended session, cookies removed: "+JSON.stringify(endedSession));
				var data = new createResponse(request,response, {
					newUrl: "table",
					auth: 0,
					user: ""
				});
				response.writeHead(data.status, data.contentType);
				response.end(data.string);
			}
			
		});
	});

	router.postClient("/landing", landingPost);
	function landingPost(request, response, options) {
		var form = new formidable.IncomingForm(),
			date = new Date(),
			public = {
				query: { year: date.getFullYear(), month: date.getMonth() },
				fields: {},
				document: {},
				status: 0,
				employeeIndex: 0,
				role: "employees", // or sellers
				_id: 0
			}
		async.series([
			function (callback) {
				form.parse(request, function (err, formFields) {
					console.log("> received: " + JSON.stringify(formFields));
					public.fields = formFields;
					callback(err, formFields);
				});
			},
			function (callback) {
				db.tables.find(public.query, function (err, document) {
					if (err) {
						console.error.server(err);
						return callback(err);
					}
					document = document[0];
					public._id = document._id;
					delete document["_id"];
					public.document = document;
					if((public.fields.value && public.fields.name) && !(public.fields.valueSellers && public.fields.nameSellers)){
						var status = 0;
						var revenue = document.revenue;
						for (var i = 0; i < revenue.length; i++) {
							if (revenue[i].name == public.fields.name) {
								public.employeeIndex = i;
								var hours = date.getHours();
								if (hours >= 5 && hours < 14) {
									revenue[i].day[date.getDate() - 1] = parseFloat(public.fields.value);
									status = 1;
								} else if (hours >= 14 && hours < 22) {
									revenue[i].night[date.getDate() - 1] = parseFloat(public.fields.value);
									status = 2;
								}
								public.status = status;
								break;
							}
						}
					} else if (!(public.fields.value && public.fields.name) && (public.fields.valueSellers && public.fields.nameSellers)) {
						var revenue = document.sellers;
						public.role = "sellers"
						for (var i = 0; i < revenue.length; i++) {
							if (revenue[i].name == public.fields.nameSellers) {
								public.employeeIndex = i;
								revenue[i].day[date.getDate() - 1] = parseFloat(public.fields.valueSellers);
								status = 1;
								public.status = status;
								break;
							}
						}
					} else if ((public.fields.value && public.fields.name) && (public.fields.valueSellers && public.fields.nameSellers)){
						return callback("not acepted");
					}
					var sum = 0,
						employee = revenue[public.employeeIndex];
					for (var i = 0; i < employee.day.length; i++) {
						sum += employee.day[i];
						if(public.role == "employees") sum += employee.night[i];
					}
					revenue[public.employeeIndex].total = sum;
					if(public.role == "employees") public.document.revenue = revenue;
					else if(public.role == "sellers") public.document.sellers = revenue;
					if (status == 0) {
						callback(true);
					} else {
						callback(null, status);
					}
				});
			},
			function (callback) {
				db.tables.update(public.query, public.document, callback);
			}
		], function (err, results) {
			if (err === true) return console.error().server("Unacepted value, out of working time");
			else if(err == "not acepted"){
				var data = new createResponse(request, response, {
					html: "Volte para a pagina anterior ou atualize essa pagina e digite valores apenas em um dos campos de vendas antes de confirmar.",// add codestatus to promp;
					status: 500
				});
				return serverError(data, request, response);
			}
			if(public.role == "employees"){
				var data = new createResponse(request, response, {
					newUrl: "table"// add codestatus to promp;
				});
			} else if(public.role == "sellers"){
				var data = new createResponse(request, response, {
					newUrl: "tablesellers"
				});
			}
			response.writeHead(data.status, data.contentType);
			response.end(data.string);
		})
	}
	
	router.postClient("/login", function(request,response,options){
		var form = new formidable.IncomingForm();
		sessionne.addUser(request,response, function(err,results){
			if(results.auth == 0 || results.auth == -1){
				//var body = hb.login({title: "Single page vanilla"});
				var data = new createResponse(request,response,{
					status: 403
				});
				response.writeHead(data.status, data.contentType);
				response.write(data.string);
				response.end();
			} else {
				var data = new createResponse(request,response,{
					auth: results.auth,
					user: results.user,
					newUrl: "options"
				});
				response.writeHead(data.status, data.contentType);
				response.write(data.string);
				response.end();
				console.server("sended auth to client: "+data.auth);
			}
		});
	});
	
	router.postClient("/singup", function(request,response,options){
		form = new formidable.IncomingForm();
		form.parse(request, function(err, fields){
			function codeHasher(input){
				var out = new String(input).hashCode();
				console.server("code hashed: "+out);
				return out;
			}
			fields.pass = codeHasher(fields.pass);
			fields.adminpass = codeHasher(fields.adminpass);
			function validate(input){var keys = Object.keys(fields);for(var i = 0; i < keys.length; i++){if(!fields[keys[i]]){return false;}}return true;}
			function createUser(input,callback){
				db.login.findOne({"user": input.adminuser, "pass": input.adminpass, "admin": true},function(err,admin){
					if(err) callback(err);
					else if(admin != null){
						db.login.update({"user": input.user}, {"user":input.user, "pass": input.pass}, {upsert: true}, function(err,newUser){
							console.server("stringifing db response about new user: "+JSON.stringify(arguments));
							if(err) {
								callback(err);
							} else if(newUser.ok) {
								callback(null,input);
							} else{ 
								callback(null,input);
							}
						});
					} else {
						if(callback) callback(null,"wrong admin");
					}
				});
			}
			if(validate(fields)){
				async.series([
					function(callback){
						createUser(fields,function(err,created){
							if(err){
								callback(err);
							} else if(created == "wrong admin"){
								callback({status: 403,html: created});
							} else if(created) {
								callback(null,created);
							}
						});
					}
					],
					function(err,results){
						if(err){
							var data = new createResponse(request,response,{
								title: appName+" - error",
								html: "<h2>Error</h2>"+err,
								status: 500
							});
							serverError(data,request,response);
						} else {
							console.server("results from singup operation: "+JSON.stringify(results));
							//var body = hb.singup({});
							var data = new createResponse(request,response,{
								//title: appName+" - singedup",
								//html: body,
								newUrl: "login"
							});
							response.writeHead(data.status, data.contentType);
							response.write(data.string);
							response.end();
							console.server("processed: "+JSON.stringify(fields, undefined, 2));
						}
					}
				);
			}
		});
	});
}

module.exports = routerBasics;