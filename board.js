var bw = 440; // Board Width
var bh = 440; // Board Height

var p = 0; // Padding Around Board

var cw = bw + (p*2) + 1; // Canvas Width
var ch = bh + (p*2) + 1; // Canvas Height
var cellWidth = 40;
var cellHeight = 40;
var numHor = bw / cellWidth; // Number of horizontal tiles
var numVert = bh / cellHeight; // Number of vertical tiles

var canvas = $('<canvas/>').attr({width: cw, height: ch}).appendTo('aside');
// var button = $('<button/>').appendTo('body');
// var button2 = button.get(0).addEventListener("click", updateGame);
var context = canvas.get(0).getContext("2d");

canvas.get(0).onclick = function (e) 
{
	
	var rect = canvas.get(0).getBoundingClientRect();
	var x = e.clientX - rect.left;
	var y = e.clientY - rect.top;
	
	var jIndex = Math.floor(x / cellWidth);
	var iIndex = Math.floor(y / cellHeight);
	if (!(cells[iIndex][jIndex].infected))
	{ 
		cells[iIndex][jIndex].immune = true;
		cells[iIndex][jIndex].draw();
		var elementPos = nonImmuneBorderCells.map(function(x) {return x.id; }).indexOf(cells[iIndex][jIndex].id);
		if (elementPos >= 0) { nonImmuneBorderCells.splice(elementPos, 1); }
	}
	// console.log("Onclick nonImmuneBorderCells length : " + nonImmuneBorderCells.length);
	// console.log("You clicked on the canvas at relative position: ( " + iIndex + " , " + jIndex + " )");
	updateGame();
}

var red = "#FF0000";
var white = "#FFFFFF";
var blue = "#0000FF";


var cells;
var infectedCells;
var nonImmuneBorderCells;

function drawBoard() 
{	
	
	var cells = new Array(numHor);
	for (var i = 0; i < numHor; i++)
	{
		cells[i] = new Array(numVert);
	}

	for (var i = 0; i < numHor; i++)
	{
		for (var j = 0; j < numVert; j++)
		{
			cells[i][j] = new square(cellHeight, cellWidth, p + j*cellWidth, p + i*cellHeight, false, i, j, false, j + i * numHor);
			cells[i][j].draw();
		}
	}

	return cells;
}

function square(width, height, posx, posy, infected, iIndex, jIndex, immune, id)
{
	this.id = id;
	this.infected = infected;
	this.immune = immune;
	this.height = height;
	this.width = width;
	this.posx = posx; // Top left corner
	this.posy = posy; // Top left corner
	this.iIndex = iIndex;
	this.jIndex = jIndex;

	this.draw = function ()
	{

		context.strokeStyle = "black";
		if (this.infected) context.fillStyle = red;
		else if (this.immune) context.fillStyle = blue;
		else context.fillStyle = white;
		context.fillRect(posx, posy, width, height);
		context.rect(posx, posy, width, height);
		context.stroke();
	}

	// this.setInfected = function (bool) {infected = bool;}

}



function gameDriver()
{
	cells = drawBoard();
	var midX = Math.floor(numHor/2);
	var midY = Math.floor(numVert/2);
	infectedCells = [];
	nonImmuneBorderCells = [];
	addAndDraw(midX,midY);
}


// Precondition: infection can be spread from tile at (i,j)
function spreadInfection(i, j)
{

	if (i > 0 && i < numHor - 1 && j > 0 && j < numVert - 1)
	{
		var choices = checkIndex(i,j);
		if (choices.length > 0)
		{
			var index = Math.floor(Math.random() * choices.length);
			var x = choices[index].iIndex;
			var y = choices[index].jIndex;
			addAndDraw(x,y);
		}
	}
	return; 
}

function updateGame()
{
	if (nonImmuneBorderCells.length != 0)
	do 
	{
		var index = Math.floor(Math.random() * infectedCells.length);
		var x = infectedCells[index].iIndex;
		var y = infectedCells[index].jIndex;
		choices = checkIndex(x,y);
	} while (choices.length == 0);
	else { console.log("No border cells available, game over!");}

	spreadInfection(x,y);
	// console.log("updateGame nonImmuneBorderCells length : " + nonImmuneBorderCells.length);
}

// Only for internal tiles at the moment
// Returns an array with the non-infected nearest neighbors of (i,j)
function checkIndex(i, j)
{
	var choices = [];
	if (!(cells[i-1][j].infected) && !(cells[i-1][j].immune)) {
		choices.push(cells[i-1][j]);
	}
	if (!(cells[i+1][j].infected) && !(cells[i+1][j].immune)){
		choices.push(cells[i+1][j]);
	}
	if (!(cells[i][j-1].infected) && !(cells[i][j-1].immune)){
		choices.push(cells[i][j-1]);
	}
	if (!(cells[i][j+1].infected) && !(cells[i][j+1].immune)){
		choices.push(cells[i][j+1]);
	}

	return choices;
}

// "===" 'safer' than "=="? Stackoverflow.
function addAndDraw(i,j)
{
	var result;
	infectedCells.push(cells[i][j]);
	infectedCells[infectedCells.length - 1].infected = true;
	cells[i][j].infected = true;
	infectedCells[infectedCells.length - 1].draw();

	var elementPos = nonImmuneBorderCells.map(function(x) {return x.id; }).indexOf(cells[i][j].id);
	if (elementPos >= 0) { nonImmuneBorderCells.splice(elementPos, 1); }

	var border = checkIndex(i,j);
	for (var i = 0; i < border.length; i++)
	{
		result = $.grep(nonImmuneBorderCells, function(e){ return e.id === border[i].id});
		if (result.length == 0)
			nonImmuneBorderCells.push(border[i]);
		if (result.length > 1)
			console.log("Multiple of the same id cells inside nonImmuneBorderCells");
	}

}