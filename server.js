/*
 *Names: Christopher Dancarlo Danan and Yuri Van Steenburg
 *Created: April 20, 2015
 *Modified: April 29, 2015
 *For: CPSC 473 Assignment 9
 *Purpose: Add socket.io to the project for real-time updates.
*/

// Server-side code
/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, strict: true, undef: true, unused: true */

"use strict";

var express = require("express"),
	app = express(),
	http = require("http"),
	server = http.createServer(app),
	socketIO = require("socket.io"),
	io = socketIO(server),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	port = 3000;

server.listen(port);
console.log("Listening on port " + port);

//Set up static directory.
app.use(express.static(__dirname + "/Client"));

//Connect to database.
mongoose.connect("mongodb://localhost/amazeriffic");

//Tell Express to parse incoming JSON objects.
app.use(bodyParser());

//Create a mongoose schema for new to-do items.
var ToDoSchema = mongoose.Schema({
	description: String,
	tags: [String]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

//This route takes the place of our todos.json file in our example from Chapter 5.
app.get("/todos.json", function(req, res){

	ToDo.find({}, function(err, toDos){
		if(err !== null){
			console.log(err);
			return;
		}

		res.json(toDos);
	});
});

//Post a new to-do on the app.
app.post("/todos", function(req, res){
	var newToDo = new ToDo({"description": req.body.description, "tags": req.body.tags});

	//Save the new to-do item in the database.
	newToDo.save(function(err){
		if(err !== null){
			console.log(err);
			res.send("ERROR");
		} else{
			//Client expects *all* todo items to be returned, so we do an additional request to maintain compatibility.
			ToDo.find({}, function(err, result){
				if(err !== null){
					//Element did not get saved!
					res.send("ERROR");
				}

				res.json(result);
			});
		}
	});
});

io.on("connection", function(socket){
	console.log("User connected");

	socket.on("add new todo", function(newToDo){
		console.log(newToDo);

		//Reference for broadcasting to all except sender:
		//http://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender-socket-io
		socket.broadcast.emit("updateToDos", newToDo);
	});

	socket.on("disconnect", function(){
		console.log("User disconnected");
	});
});