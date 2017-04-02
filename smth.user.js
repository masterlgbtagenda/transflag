// ==UserScript==
// @name         flag over-draw
// @namespace    transes
// @version      0.3
// @author       transes ellie<3
// @match        https://www.reddit.com/place?webview=true
// @grant        unsafeWindow
// @require      https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.io.js
// @require 	 http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==

var socket;
var socketserverurl = "https://plebbit.ga:8080";
var modhash;

async function randomWholeNum() {
	return Math.floor(Math.random() * 15);
}

async function chooseColor(y) {
	var color;
	
	switch(y) {
		case 579:
			color = 12;
			break;
		case 580:
			color = 12;
			break;
		case 581:
			color = 4;
			break;
		case 582:
			color = 4;
			break;
		case 583:
			color = 0;
			break;
		case 584:
			color = 0;
			break;
		case 585:
			color = 4;
			break;
		case 586:
			color = 4;
			break;
		case 587:
			color = 12;
			break;
		case 588:
			color = 12;
			break;
		default:
			color = 15;
			break;
	}
	
	return color;
}

function sleep (delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

async function drawWhenReady() {

    while (document.getElementById("place-timer").style.display != "none") {
        console.log("Not allowed to draw, waiting 15 sec...");
        await sleep(15000);
    }
    console.log("We can draw now!");
  	socket.emit("get_work");
}

async function drawPixel(x,y,c) {
    var color = await getPixelColorAtCoords(x, y);
	
	t = choseColor(y);
    if (color != c) { // Try again if color is not black
        console.log("Color matches.. Trying again");
       drawWhenReady();
    } else {
        $.ajax({
          url: "https://www.reddit.com/api/place/draw.json",
          type: "POST",
          headers: {
              "x-requested-with" : "XMLHttpRequest",
              "x-modhash"        : modhash,
          },
          data: {
              x: x,
              y: y,
              color: t
          }
    		});
    	console.log("Drew pixel: " + x + "/" + y);
      setTimeout(function(){ location.reload(); }, 5*1000);
    }
}

function getPixelColorAtCoords(x,y) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: "https://www.reddit.com/api/place/pixel.json",
            type: "GET",
            headers: {
                "x-requested-with" : "XMLHttpRequest",
                "x-modhash"        : modhash,
            },
            data: {
                x: x,
                y: y,
            },
            success: function(response) {
                resolve(response.color)
            },
        });
    });
}

function init() {
    console.log("le reddit pixel drawer loaded.");
    modhash = document.getElementById("config").innerHTML.match(/"modhash": "(\w+)"/)[1];
  
    var proto = document.createElement('script');
    proto.type = 'text/javascript';
    proto.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.io.js';
    var dhead = document.getElementsByTagName('head')[0] || document.documentElement;
    dhead.insertBefore(proto, dhead.firstChild);

    socket = io.connect(socketserverurl);
      socket.on('work', function (data) {
          console.log("Got work index " + data['index']);
        var pixelData = data['pixel_data'];
        drawPixel(pixelData.x, pixelData.y, pixelData.color);
    });

    drawWhenReady();
}

setTimeout(init, 1500);