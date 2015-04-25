var express = require("express"),
	http = require("http"),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	app = express(),
	toDos = [
		{
			"description" : "Get groceries",
			"tags" : ["shopping", "chores"]
		},
		{
			"description" : "Make up some new ToDos",
			"tags" : ["writing", "work"]
		},
		{
			"description" : "Prep for Monday's class",
			"tags" : ["work", "teaching"]
		},
		{
			"description" : "Answer emails",
			"tags" : ["work"]
		},
		{
			"description" : "Take Vane to the park",
			"tags" : ["fun", "girlfriend"]
		},
		{
			"description" : "Finish writing this book",
			"tags" : ["writing", "work"]
		}
	];

app.use(express.static(__dirname + "/Client"));

mongoose.connect('mongodb://localhost/amazeriffic');

//Tell Express to parse incoming JSON objects.
app.use(bodyParser());

var ToDoSchema = mongoose.Schema({
	description: String,
	tags: [String]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

http.createServer(app).listen(3000);

//This route takes the place of our todos.json file in our example from Chapter 5.
app.get("/todos.json", function(req, res){
	//res.json(toDos);

	ToDo.find({}, function(err, toDos){
		if(err !== null){
			console.log(err);
			return;
		}

		res.json(toDos);
	});
});

app.post("/todos", function(req, res){
	console.log(req.body);
	var newToDo = new ToDo({"description": req.body.description, "tags": req.body.tags});

	newToDo.save(function(err, result){
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