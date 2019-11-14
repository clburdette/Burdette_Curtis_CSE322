
function makeCanvasTags(amount)                          //create string containing all HTML canvas tags for placement in parent div tag
{
  var temp = '';                                         //first canvas tag is a plain red background and no game objects are drawn onto it  
  temp += '<canvas id="canvas0" width="1024" height="768" style="border:1px solid lightgrey; background-color:red; position:absolute; left:0px; top:0px; z-index:1;"></canvas>';

  for(var i=0; i < amount; i++)                          //loop to create various layers that the game objects are drawn onto 
  {
    temp += '<canvas id="' + 'canvas' + (i+1).toString() + '" width="1024" height="768" style="border:1px solid lightgrey; background-color:transparent; position:absolute; left:0px; top:0px; z-index:' + (i+2).toString() + ';"></canvas>"';
  }
  temp += '<canvas id="weapons" width="1024" height="768" style="background-color:transparent; position:absolute; left:0px; top:0px; z-index:' + (amount+2).toString() +';"></canvas>"';
  temp += '<canvas id="player" width="1024" height="768" style="background-color:transparent; position:absolute; left:0px; top:0px; z-index:' + (amount+3).toString() +';"></canvas>"';
  temp += '<canvas id="UI" width="1024" height="768" style="background-color:transparent; position:absolute; left:0px; top:0px; z-index:' + (amount+4).toString() +';"></canvas>"';

  document.getElementById("parent").innerHTML = temp;    //last canvas tag is for drawing the player character. After it is added, the string is placed into the parent div
} 
      
function makeCanvases(amount)                            //fills the array, that will hold the canvas documents, with temp variables
{
  for(var i=0; i < amount; i++)
  {
    var temp;
    canvasBag[i] = temp;
  }
}

function makeContexts(amount)                            //fills the array, that will hold the canvas contexts, with temp variables
{
  for(var i=0; i < amount; i++)
  {
    var temp;
    contextBag[i] = temp;
  }
}

function linkContexts(amount)                            //places canvas documents into the canvasBag array
{                                                        //so they can be accessed later, gets contexts from
  for(var i=0; i < amount; i++)                          //the canvas documents, and places them into the
  {                                                      //contextBag array so they can be accessed later 
    var temp = "canvas" + (i+1).toString();
    canvasBag[i] = document.getElementById(temp);
    contextBag[i] = canvasBag[i].getContext('2d');
  }
}

function makeLayers(amount)                              //fills the array with empty arrays that will be
{                                                        //used to hold dynamically created game objects
  for(var i=0; i < amount; i++)
  {
    var temp = [];
    canvasObjects.push(temp);
  }
}

function clearCanvases()                                         //clears last frame's information from each canvas context 
{
  for(i=0; i < contextBag.length; i++)
  {
    contextBag[i].clearRect(0,0,canvasBag[i].width,canvasBag[i].height);
  }
  weaponsContext.clearRect(0,0,weaponsCanvas.width,weaponsCanvas.height);
  playerContext.clearRect(0,0,playerCanvas.width,playerCanvas.height);
  uiContext.clearRect(0,0,uiCanvas.width,uiCanvas.height);
}