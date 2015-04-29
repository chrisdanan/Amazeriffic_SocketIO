
// Client-side code
/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, strict: true, undef: true, unused: true */

"use strict";

var socket = io();  //Socket.IO
var tabClicked = "1";

var organizeByTag = function(toDoObjects){
	//Create an empty tags array.
	var tags = [];

	//Iterate over all toDos.
	toDoObjects.forEach(function(toDo){
		//Iterate over each tag in this toDo.
		toDo.tags.forEach(function(tag){
			//Make sure the tag is not already in the tag array.
			if(tags.indexOf(tag) === -1){
				tags.push(tag);
			}
		});
	});	

	var tagObjects = tags.map(function(tag){
		//Here we find all the to-do objects that contain that tag.
		var toDosWithTag = [];

		toDoObjects.forEach(function(toDo){
			//Check to make sure the result of indexOf is *not* equal to -1.
			if(toDo.tags.indexOf(tag) !== -1){
				toDosWithTag.push(toDo.description);
			}
		});

		//We map each tag to an object that contains the name of the tag and an array.
		return {"name" : tag, "toDos": toDosWithTag};
	});
	
	return tagObjects;
};

var main = function(toDoObjects){

	var toDos = toDoObjects.map(function(toDo){
		//We'll just return the description of this toDoObject.
		return toDo.description;
	});

	/*
	$inputBox = $("<input type='text' class='inputCommentBox'>"), //Text box to enter new to-do items.
	$button = $("<button class='inputCommentBtn'>Submit To-Do Item</button>"); //Button to submit new to-do items.

	//Purpose: Add a comment to the to-do list.
	var addComment = function(){
		if($inputBox.val() !== ""){
			toDos.push($inputBox.val());
			$inputBox.val("");
		}
	};
	*/

	//Array = [span.active, span, span].
	$(".tabs a span").toArray().forEach(function(element){
		//Create a click handler for this element.
		$(element).on("click", function(){
			var $element = $(element),/*Since we're using the jQuery version of element,
										we'll go ahead and create a temporary variable
										so we don't need to keep recreating it.
										*/
				$content, //Hold to-do lists.
				i; //Loop increment.
				
			//Remove "active" class from all tags.
			$(".tabs a span").removeClass("active");
			//Make element have "active" class.
			$element.addClass("active");
			//Delete all content from tabs.
			$("main .content").empty();

			//Find out which tab was clicked by identifying the
			///child number of the parent of element.

			//"Newest" Tab
			if ($element.parent().is(":nth-child(1)")){
				tabClicked = 1;

				$content = $("<ul class='toDoList'>");

				for(i = (toDos.length - 1); i >= 0; i--)
				{
					$content.append($("<li>").text(toDos[i]));
				}
				$("Main .content").append($content);

				console.log("First tab clicked");
			//"Oldest" Tab
			} else if ($element.parent().is(":nth-child(2)")){
				tabClicked = 2;

				$content = $("<ul class='toDoList'>");
				toDos.forEach(function(todo){
					$content.append($("<li>").text(todo));
				});
				$("Main .content").append($content);

				console.log("Second tab clicked");
			//"Tags" Tab
			} else if ($element.parent().is(":nth-child(3)")){
				tabClicked = 3;

				var organizedByTag = organizeByTag(toDoObjects);

				organizedByTag.forEach(function(tag){
					var $tagName = $("<h3>").text(tag.name),
						$content = $("<ul class='toDoList " + tag.name + "'>");

					tag.toDos.forEach(function(description){
						var $li = $("<li>").text(description);
						$content.append($li);
					});

					$("main .content").append($tagName);
					$("main .content").append($content);
				});

				console.log("Third tab clicked")
			//"Add" Tab
			} else if ($element.parent().is(":nth-child(4)")){
				var $input = $("<input>").addClass("description"),
					$inputLabel = $("<p>").text("Description: ").addClass("label"),
					$tagInput = $("<input>").addClass("tags"),
					$tagLabel = $("<p>").text("Tags: ").addClass("label"),
					$button = $("<button>").text("Submit");

				$button.on("click", function(){
					var description = $input.val();

					//Split on the comma.
					var tags = $tagInput.val().split(",");

					var newToDo = {"description": description, "tags": tags};

					//Send the new to-do item to everyone else on the server.
					socket.emit("add new todo", newToDo);

					//Here we'll do a quick post to our todos route.
					$.post("/todos", newToDo, function(allToDos){
						//This callback is called with the server responds.
						console.log("We posted and the server responded");
						
						toDoObjects = allToDos;

						//Update toDos.
						toDos = toDoObjects.map(function(toDo){
							return toDo.description;
						});

						//Empty the input text fields after the user submits his/her input.
						$input.val("");
						$tagInput.val("");
					});
				});

				$("main .content").append($inputLabel);
				$("main .content").append($input);
				$("main .content").append($tagLabel);
				$("main .content").append($tagInput);
				$("main .content").append($button);

				console.log("Fourth tab clicked");
			}
			//Make browser not follow the link.
			return false;
		});//End click handler.
	});//End forEach loop.

	$(".tabs a:first-child span").trigger("click");

	socket.on("updateToDos", function(data){
		toDoObjects.push(data);
		toDos = toDoObjects.map(function(toDo){
			return toDo.description;
		});

		if(tabClicked === 1){
			$(".toDoList").prepend($("<li>").text(data.description));
		}
		else if(tabClicked === 2){  //Tab is on Oldest
			$(".toDoList").append($("<li>").text(data.description));
		} else if(tabClicked === 3){
			var tags = [];

			data.tags.forEach(function(tag){
				tags.push(tag);
			});


			tags.forEach(function(tag){
				if($("." + tag).length > 0){
					$("." + tag).append($("<li>").text(data.description));
				} else{
					var $tagName = $("<h3>").text(tag),
						$content = $("<ul class='toDoList " + tag + "'>");

					$content.append($("<li>").text(data.description));

					$("main .content").append($tagName);
					$("main .content").append($content);
				}
			});
		}
	});
};


$(document).ready(function(){
	$.getJSON("/todos.json", function(toDoObjects){
		//Call main with the to-dos as an argument.
		main(toDoObjects);
	});
});