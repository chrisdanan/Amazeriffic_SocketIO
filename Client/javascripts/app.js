/*
 *Names: Christopher Dancarlo Danan and Yuri Van Steenburg
 *Created: April 20, 2015
 *Modified: April 29, 2015
 *For: CPSC 473 Assignment 9
 *Purpose: Add socket.io to the project for real-time updates.
*/

// Client-side code
/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, strict: true, undef: true, unused: true */

var socket = io();  //Socket.IO
var tabClicked = "1";  	//Used to update the DOM when a new to-do item is emitted from the server.
						//Default tab open is "newest" tab.

//Purpose: Return objects that have the to-do item descriptions organized by tag.
var organizeByTag = function(toDoObjects){

	"use strict";

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

	"use strict";

	var toDos = toDoObjects.map(function(toDo){
		//We'll just return the description of this toDoObject.
		return toDo.description;
	});

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

				console.log("Third tab clicked");
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

	//Receive and handle new to-do items emitted from the server.
	socket.on("updateToDos", function(data){
		toDoObjects.push(data);
		toDos = toDoObjects.map(function(toDo){
			return toDo.description;
		});

		if(tabClicked === 1){  //If on new tab, prepend the new to-do to the list (since newest items appear on top of list).
			$(".toDoList").prepend($("<li>").text(data.description));
			window.alert("New to-do item added!");  //Alert the user there is a new to-do item.
													//Note: If more time, find a better way to do this - this is ugly and annoys the user!
		}
		else if(tabClicked === 2){  //If on oldest tab, append the new to-do to the list (since newest items appear on bottom of list).
			$(".toDoList").append($("<li>").text(data.description));
			window.alert("New to-do item added!");
		} else if(tabClicked === 3){  //If on tags tab, find the appropriate list to append the new to-do item.
			var tags = [];  //Holds the tags of the new to-do item.

			//Get the tags of the new to-do item and store them in tags.
			data.tags.forEach(function(tag){
				tags.push(tag);
			});

			//Go through each tag of the new to-do item and append the new to-do item description to the appropriate spot.
			tags.forEach(function(tag){
				if($("." + tag).length > 0){  //If the tag already exists in the list, simply append the new to-do description to that list.
					$("." + tag).append($("<li>").text(data.description));
				} else{  //If the tag does not exist, create the tag and make a new list, then append that list to the list of tags.
					var $tagName = $("<h3>").text(tag),
						$content = $("<ul class='toDoList " + tag + "'>");

					$content.append($("<li>").text(data.description));

					$("main .content").append($tagName);
					$("main .content").append($content);
				}
			});

			window.alert("New to-do item added!");
		}
	});
};


$(document).ready(function(){
	"use strict";

	$.getJSON("/todos.json", function(toDoObjects){
		//Call main with the to-dos as an argument.
		main(toDoObjects);
	});
});