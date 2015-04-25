/*
 *Name: Christopher Dancarlo Danan
 *Created: March 1, 2015
 *Modified: March 1, 2015
 *Purpose: Create and control a colorbox slideshow of the screenshots taken for Amazeriffic.
 *References:
 	-Colorbox samples
	http://www.jacklmoore.com/colorbox/example1/
*/

//The following comes from Professor Avery.  It configures JSHint.
// Client-side code
/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, strict: true, undef: true, unused: true */

var main = function(){
	"use strict";

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
};

$(document).ready(main);