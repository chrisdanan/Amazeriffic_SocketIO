/*
 *Name: Christopher Dancarlo Danan
 *Created: February 28, 2015
 *Modified: March 18, 2015
 *Purpose: Give functionality to tabs and to-do lists for main page of Amazeriffic.
*/

//The following comes from Professor Avery.  It configures JSHint.
// Client-side code
/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, strict: true, undef: true, unused: true */

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
	"use strict";

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
				$content = $("<ul>");
				for(i = (toDos.length - 1); i >= 0; i--)
				{
					$content.append($("<li>").text(toDos[i]));
				}
				$("Main .content").append($content);

				console.log("First tab clicked");
			//"Oldest" Tab
			} else if ($element.parent().is(":nth-child(2)")){
				$content = $("<ul>");
				toDos.forEach(function(todo){
					$content.append($("<li>").text(todo));
				});
				$("Main .content").append($content);

				console.log("Second tab clicked");
			//"Tags" Tab
			} else if ($element.parent().is(":nth-child(3)")){
				var organizedByTag = organizeByTag(toDoObjects);

				organizedByTag.forEach(function(tag){
					var $tagName = $("<h3>").text(tag.name),
						$content = $("<ul>");

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
				/*
				$button.on("click", function(){
					addComment();
				});

				$inputBox.on("keypress", function(event){
					if(event.keyCode === 13){
						addComment();
					}
				});

				//Add the input box and button to the third tab.
				$("Main .content").append($inputBox);
				$("Main .content").append($button);
				*/

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

					//toDoObjects.push({"description" : description, "tags" : tags});

					//Here we'll do a quick post to our todos route.
					$.post("/todos", newToDo, function(response){
						//This callback is called with the server responds.
						console.log("We posted and the server responded");
						console.log(response);
					
						toDoObjects.push(newToDo);

						//Update toDos.
						toDos = toDoObjects.map(function(toDo){
							return toDo.description;
						});

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
			/*
			//"Demonstration Tab"
			else if($element.parent().is(":nth-child(5)")){
				$("Main .content").append($("<h2>").text("Screenshots"));
				$("Main .content").append($("<p>").text("Click an image to start the slideshow."));
				$("Main .content").append($("<div class='gallery'>"));
				$("Main .content .gallery").append($("<p><a class = 'gal' href='images/Amazeriffic_Tabs_1.png' title='Amazeriffic app: default initial list'><img src='images/Amazeriffic_Tabs_1.png' alt='Screenshot 1 of Amazeriffic in action' width='2628' height='17781' class='screenshot'/></a></p>"));
				$("Main .content .gallery").append($("<p><a class = 'gal' href='images/Amazeriffic_Tabs_2.png' title='Amazeriffic app: inputting a new to-do list item'><img src='images/Amazeriffic_Tabs_2.png' alt='Screenshot 2 of Amazeriffic in action' width='2628' height='1778' class='screenshot'/></a></p>"));
				$("Main .content .gallery").append($("<p><a class = 'gal' href='images/Amazeriffic_Tabs_3.png' title='Amazeriffic app: newly created item successfully shows in the list'><img src='images/Amazeriffic_Tabs_3.png' alt='Screenshot 3 of Amazeriffic in action' width='2628' height='1778' class='screenshot'/></a></p>"));
				$("Main .content .gallery").append($("<p><a class = 'gal' href='images/Amazeriffic_Tabs_4.png' title='Amazeriffic app: newly created item also shows in 'Oldest' tab'><img src='images/Amazeriffic_Tabs_4.png' alt='Screenshot 4 of Amazeriffic in action' width='2628' height='1778' class='screenshot'/></a></p>"));
				$("Main .content").append($("</div>"));

				//Fire the slideshow when the Demonstration Tab is clicked.
				$("a.gal").colorbox({
					rel: "a.gal", //Make a slideshow of all <a> elements with the "gal" class.
					width: "75%", //Set the size of the slideshow.
					transition: "fade", //Use the fade animation.
					speed: 500, //Set speed of fade animation (in milliseconds).
					opacity: 0.5, //Set the opacity of the overlay.
					open: true,

					//Create a slideshow of the screenshots.
					slideshow: true,  //Add an automatic slideshow.
					slideshowSpeed: 5000, //Set speed of slideshow to 5000 milliseconds.
				});
				
				console.log("Fifth tab clicked");
			}*/
			//Make browser not follow the link.
			return false;
		});//End click handler.
	});//End forEach loop.

	$(".tabs a:first-child span").trigger("click");
};

$(document).ready(function(){
	$.getJSON("/todos.json", function(toDoObjects){
		//Call main with the to-dos as an argument.
		main(toDoObjects);
	});
});