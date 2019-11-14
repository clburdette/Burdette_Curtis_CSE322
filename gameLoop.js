//TO DO add UI layer, player score, player health, weapons loadout

//declaration
var numCanvases = 32;    //defines amount of layers
var canvasBag = [];      //holds canvas documents
var contextBag = [];     //holds canvas contexts
var startTime;           //for determining time elapsed during a frame
var spawnClock = 0;      //temp variables to keep events
var spawnRate = 10;
var fireTimer = 10;      //triggering each frame
var playerCanvas;        //canvas for player character
var playerContext;       //context for player canvas 
var player;              //player character object
var weaponsCanvas;
var weaponsContext;
var weaponsObjects = [];
var uiCanvas;
var uiContext;
var patientHealth = 1000;
var ticks = 0;
var secs = 0;
var secsDisplay;
var mins = 0;
var gameOver = false;
var pressedKeys = {"a":false,"d":false,"s":false, "w":false};
var canvasObjects = [];  //holds the arrays that hold the objects for each canvas layer

//TODO player scoring system and multiplier
//TODO add new weapons, weapons loadout?, weapon switching
//TODO data security, reduce global variables

function init()                                             //creates conditions necessary for building the game
{                                                              
  makeCanvasTags(numCanvases);                              //makes all the canvases and arrays to hold canvas drawn  
  makeCanvases(numCanvases);                                //objects based on an amount which is a power of 2
  makeContexts(numCanvases);                                //wip, currently only works when this amount is 16
  linkContexts(numCanvases);                                //due to some hard coding and magic numbers
  makeLayers(numCanvases);
  playerCanvas = document.getElementById("player");         //creates player canvas, context, and object
  playerContext = playerCanvas.getContext('2d');
  player = new Player(playerContext, playerCanvas.width/2, playerCanvas.height/2, 0, 0, 20, 10000, 1000);
  weaponsCanvas = document.getElementById("weapons");       //creates player canvas, context, and object
  weaponsContext = weaponsCanvas.getContext('2d');
  uiCanvas = document.getElementById("UI");                 //creates player canvas, context, and object
  uiContext = uiCanvas.getContext('2d');
  document.addEventListener('mousedown', mouseDownHandler, false);
  document.addEventListener('keydown', keyDownHandler, false);                               //control input listeners
  document.addEventListener('keyup', keyUpHandler, false);
  window.requestAnimationFrame(gameLoop);                   //initiate recursive game loop
}

function keyUpHandler(e)                                 //manually tracks when certain keys are not pressed
{                                                        
  if(e.key == "a")
  {
    pressedKeys["a"] = false;
  }
  else if(e.key == "d")
  {
    pressedKeys["d"] = false;
  }
  else if(e.key == "s")
  {
    pressedKeys["s"] = false;
  }
  else if(e.key == "w")
  {
    pressedKeys["w"] = false;
  }
}

function keyDownHandler(e)                               //manually tracks when special keys are pressed
{                                                        
  if(e.key == "a")
  {
    pressedKeys["a"] = true;
  }
  else if(e.key == "d")
  {
    pressedKeys["d"] = true;
  }
  else if(e.key == "s")
  {
    pressedKeys["s"] = true;
  }
  else if(e.key == "w")
  {
    pressedKeys["w"] = true;
  }                                                    
}

function handleInput()
{
  if(pressedKeys["a"]&&pressedKeys["d"]&&pressedKeys["w"])
  {
      player.yVel+=0.01*player.firePointY;              //forward vector with w button
      player.xVel+=0.01*player.firePointX;    
  }
  else if(pressedKeys["a"]&&pressedKeys["w"])           //rotate player character left relative to player's
  {
    player.angle-=0.05;
    player.yVel+=0.01*player.firePointY;                //forward vector with w button
    player.xVel+=0.01*player.firePointX;
  }                                 //forward vector with a button
  else if(pressedKeys["d"]&&pressedKeys["w"])           //rotate player character left relative to player's
  {
    player.angle+=0.05;
    player.yVel+=0.01*player.firePointY;                //forward vector with w button
    player.xVel+=0.01*player.firePointX;
  }
  else if(pressedKeys["a"]&&pressedKeys["s"])           //rotate player character left relative to player's
  {
    player.angle-=0.02;
    player.yVel-=0.001*player.firePointY;                //forward vector with w button
    player.xVel-=0.001*player.firePointX;
  }                                 //forward vector with a button
  else if(pressedKeys["d"]&&pressedKeys["s"])           //rotate player character left relative to player's
  {
    player.angle+=0.02;
    player.yVel-=0.001*player.firePointY;                //forward vector with w button
    player.xVel-=0.001*player.firePointX;
  }                                                       //move player character in direction of player's
  else if(pressedKeys["a"])
  {
    player.angle-=0.1;
  }
  else if(pressedKeys["d"])
  {
    player.angle+=0.1;
  }
  else if(pressedKeys["s"])
  {
    player.yVel-=0.001*player.firePointY;                //forward vector with w button
    player.xVel-=0.001*player.firePointX;               
  }
  else if(pressedKeys["w"])
  {
    player.yVel+=0.01*player.firePointY;                //forward vector with w button
    player.xVel+=0.01*player.firePointX;               
  }
}

function mouseDownHandler(){fire();}

function fire()                                         //dynamically create missile at player's fire point in the direction of player's forward vector
{                                                       //when fire timer delay has successfully loop                        
   
  var spawn = new Weapon(weaponsContext, player.xPos+player.firePointX, player.yPos+player.firePointY, player.firePointX*25, player.firePointY*25, 10, 200);
  weaponsObjects.push(spawn);

}

function gameLoop(currentTime)                          //everything that occurs in the game during a given frame
{
  var seconds = (currentTime - startTime)/1000;         //calculates the amount of time that has elapsed during a frame
  var framesPerSec = Math.round(1/seconds);
  startTime = currentTime;

  cleanUpWeapons();
        
  cleanUpLoop();

  spawnClock++                                          //temporary spawner delay
  if(spawnClock==spawnRate)                              
  {
    spawnerLoop();                                      //loop that creates various game objects that are not the player
    spawnClock = 0;                                     //nor a player missile
  }
  handleInput();

  updateLoop(seconds);                                  //update of all other game objects

  playerCollision(canvasObjects[numCanvases-1]);        //TODO refactor into collision loop function

  weaponsCollision(canvasObjects[numCanvases-1]);       //TODO refactor collision process
         
  collisionLoop();                                      //collision calculations among all collidable game objects that arent player or player weapons

  moveInZLoop();                                        //moves objects between canvas layers

  clearCanvases();                                      //removes last frame's information from the various canvases

  drawLoop();                                           //draws this frame's non-player information to the various other canvases

  checkEndGame();

  updateUI();
 
  window.requestAnimationFrame(gameLoop);               //game loop function recursion
}

function spawnToCollide(spawnXPos,spawnYPos,sizeToSpawn,objects)  //checks to see if new object will collide with existing objects in a given canvas layer
{
  var obj1;
  var obj2;
  var willCollide = false;
        
  for(i=0; i < objects.length;i++)
  {
    obj1 = objects[i];
    var diffX = spawnXPos-obj1.xPos;
    var diffY = spawnYPos-obj1.yPos;
    var sqDistance= Math.pow(diffX,2) + Math.pow(diffY,2);

    if(sqDistance <= Math.pow(obj1.scale + sizeToSpawn,2)){willCollide = true;}
  }

  return willCollide;
} 

function spawner(objects)                               //dynamically spawns objects using various random parameters within set ranges.
{                                                       //input parameter is an array of objects in a given layer, to which the spawned
  var randomX = Math.floor(Math.random() * 1024);       //object is added
  var randomY = Math.floor((Math.random() * 768)-10);
  var randomZ;
  var ranXVel = Math.floor(Math.random() * 250)-125;
  var ranYVel = Math.floor(Math.random() * 200)-110;
  var ranZVel = Math.random() * 4;
  var ranSize = Math.floor(Math.random() * 90) + 10;
  var ranDensity = Math.floor(Math.random() * 50) + 1;
  var currentContext;

  if(objects==canvasObjects[numCanvases-1])             //assigns a Z position based on the context of the objects in the input parameter array
  {
    currentContext = contextBag[numCanvases-1]; randomZ = Math.floor(Math.random() * 5 + 100);
  }
  else
  {
    for(var i=0; i < canvasObjects.length-1;i++)
    {
      if(objects==canvasObjects[i])
      {
        currentContext = contextBag[i]; 
        randomZ = Math.floor(Math.random() * (80/numCanvases)) + ((i+1)*(80/numCanvases));
      }
    }
  }
  if(!spawnToCollide(randomX, randomY, ranSize, objects))
  {
    var spawn = new Entity(currentContext, randomX, randomY, randomZ, ranXVel, ranYVel, ranZVel, ranSize, ranDensity);
    objects.push(spawn);
  }
}

function spawnerLoop()                                 //randomly chooses an array of objects from the "bottom" 6 game layers
{                                                      //and passes it into the spawner function
  var ranCanvas = Math.floor(Math.random() * 5);
  spawner(canvasObjects[ranCanvas]);
}

function cleanUpOffScreen(objects)                     //checks if objects have strayed too far off screen and removes them
{                                                      //from the appropriate object array, eliminating update of the given
  for(i=0; i < objects.length; i++)                    //object and allowing it to be garbage collected
  {
    var obj = objects[i];
    if((obj.xPos-obj.scale)>canvasBag[0].width||
       (obj.xPos+obj.scale)<0||
       (obj.yPos-obj.scale)>canvasBag[0].height||
       (obj.yPos+obj.scale*10)<0)
    {
      if((obj.yPos-obj.scale)>canvasBag[0].height&&objects==canvasObjects[numCanvases-1])
      {
        patientHealth -= obj.scale;
      }
      objects.splice(i,1);
    }
  }
}

function cleanUpWeapons()                              
{                                                      
  for(i=0; i < weaponsObjects.length; i++)                    
  {
    var obj = weaponsObjects[i];
    if((obj.xPos-100)>weaponsCanvas.width||
       (obj.xPos+100)<0||
       (obj.yPos-100)>weaponsCanvas.height||
       (obj.yPos+100)<0)
    {weaponsObjects.splice(i,1);}
  }
}

function cleanUpLoop()                                 //sends each canvas layer object array into the clean up function
{
  for(var i=0;i<canvasObjects.length;i++)
  { 
    cleanUpOffScreen(canvasObjects[i]);
  } 
}

function updateLoop(delta)                             //input parameter is amount of time which has passed during a given frame
{                                                      //which is then passed into the update function of each object in the game
  player.update(delta);

  for(var i=0; i < weaponsObjects.length; i++)         //TODO update comments for this section
  {
    weaponsObjects[i].update(delta);
  }  

  for(var i=0; i < canvasObjects.length; i++)          
  {
    group = canvasObjects[i];
    for(var j=0; j < group.length; j++)
    {
      group[j].update(delta);
    }  
  }
}

function moveInZ(objects)                              //moves objects between the various canvas layer object arrays based on their Z position value
{
  for(var i = 0; i < objects.length; i++)
  {               
    for(var j = 0; j < canvasObjects.length; j++)
    {
      if(objects[i].zPos < (j+1)*(80/numCanvases) && (j+1)*(80/numCanvases) < 80)
      {
        objects[i].context = contextBag[j];
        canvasObjects[j].push(objects[i]);
        objects.splice(i,1);
        j = canvasObjects.length;
      }
      else if(objects[i].zPos >= (80 - (80/numCanvases)))
      {
        if(objects[i].yPos < 600)                     //keeps objects from pushing into the top layer at the bottom of the screen
        {
          objects[i].context = contextBag[numCanvases-1];
          canvasObjects[numCanvases-1].push(objects[i]);
          objects.splice(i,1);
          j = canvasObjects.length;
        }
      }
    }
  }              
}

function moveInZLoop()                                //sends all of the canvas layer object arrays into the moveInZ function to be checked
{
  for(var i=0; i < canvasObjects.length;i++)
  {
    moveInZ(canvasObjects[i]);
  }
}

function detectCollision(objects)                     //detects collision between all collidable objects in a given canvas layer object array
{                                                     //input parameter is a canvas layer object array
  var obj1;
  var obj2;                                           //TO DO handle overlapping objects, merging objects, splintering objects, and destroyed objects.
                                                      
  for(i=0; i < objects.length;i++)                    //resets each object's variable that indicates if the object is colliding with something else during a given frame
  {
    objects[i].isColliding = false;
  }

  for(i=0; i < objects.length;i++)                    //compares each object with every other object in the canvas layer object array
  {
    obj1 = objects[i];
    for(j=i+1; j < objects.length;j++)
    {
      obj2 = objects[j];
      var deltaX = obj2.xPos-obj1.xPos;
      var deltaY = obj2.yPos-obj1.yPos;
      var sqDistance= Math.pow(deltaX,2) + Math.pow(deltaY,2);
      if(sqDistance <= (Math.pow(obj1.scale + obj2.scale,2)))    //checks to see if the distance between two objects is less than equal to their combined radii
      {                                                          //thereby indicating a collision.
        obj1.isColliding=true;                                   //makes various physics calculations based on the parameters on the two objects in the collision
        obj2.isColliding=true;                                   //TO DO move into a function  
        var vNorm = {x: deltaX/Math.sqrt(sqDistance), y: deltaY/Math.sqrt(sqDistance)};
        var vRelVel = {x: obj1.xVel-obj2.xVel, y: obj1.yVel-obj2.yVel};
        var speed = (vRelVel.x * vNorm.x) + (vRelVel.y * vNorm.y);
        if (speed < 0){break;}
        var impulse = 2* speed / ((obj1.scale*obj1.density) + (obj2.scale*obj2.density));
        obj1.xVel -= (impulse*obj2.scale*obj2.density*vNorm.x);
        obj1.yVel -= (impulse*obj2.scale*obj2.density*vNorm.y);
        obj2.xVel += (impulse*obj1.scale*obj1.density*vNorm.x);
        obj2.yVel += (impulse*obj1.scale*obj1.density*vNorm.y);
      }
    }
  }
}

function playerCollision(objects)                     //detects collision between player and top layer objects
{
  var obj1;                                            
  player.isColliding = false                          //TO DO handle overlapping objects, merging objects, splintering objects, and destroyed objects.
                                                      
  for(i=0; i < objects.length;i++)                    //resets each object's variable that indicates if the object is colliding with something else during a given frame
  {
    objects[i].isColliding = false;
  }

  for(i=0; i < objects.length;i++)                    //compares each object with player
  {
    obj1 = objects[i];
    var deltaX = player.xPos-obj1.xPos;
    var deltaY = player.yPos-obj1.yPos;
    var sqDistance= Math.pow(deltaX,2) + Math.pow(deltaY,2);
    if(sqDistance <= (Math.pow(obj1.scale + player.scale,2)))  //checks to see if the distance between two objects is less than equal to their combined radii
    {                                                          //thereby indicating a collision.
      obj1.isColliding=true;                                   //makes various physics calculations based on the parameters on the two objects in the collision
      player.isColliding=true;
      if(player.health>0){player.health-=1;}                   //TO DO move into a function  
      var vNorm = {x: deltaX/Math.sqrt(sqDistance), y: deltaY/Math.sqrt(sqDistance)};
      var vRelVel = {x: obj1.xVel-player.xVel, y: obj1.yVel-player.yVel};
      var speed = (vRelVel.x * vNorm.x) + (vRelVel.y * vNorm.y);
      if (speed < 0){break;}
      var impulse = 2* speed / ((obj1.scale*obj1.density) + (player.scale*player.density));
      obj1.xVel -= (impulse*player.scale*player.density*vNorm.x);
      obj1.yVel -= (impulse*player.scale*player.density*vNorm.y);
      player.xVel += (impulse*obj1.scale*obj1.density*vNorm.x);
      player.yVel += (impulse*obj1.scale*obj1.density*vNorm.y);
    }
  }
}

function weaponsCollision(objects)                     //detects collision between player and top layer objects
{
  var obj1;
  var obj2;
                                            
  for(i=0; i < weaponsObjects.length;i++)              //resets each object's variable that indicates if the object is colliding with something else during a given frame
  {
    weaponsObjects[i].isColliding = false;
  }
                                                   
  for(i=0; i < objects.length;i++)                     //resets each object's variable that indicates if the object is colliding with something else during a given frame
  {
    objects[i].isColliding = false;
  }

  for(i=0; i < weaponsObjects.length; i++)
  {
    obj1 = weaponsObjects[i];
    for(j=0; j < objects.length;j++)                   //compares each object with player
    {
      obj2 = objects[j];
      var deltaX = obj2.xPos-obj1.xPos;
      var deltaY = obj2.yPos-obj1.yPos;
      var sqDistance= Math.pow(deltaX,2) + Math.pow(deltaY,2);
      if(sqDistance <= (Math.pow(obj1.scale + obj2.scale,2)))    //checks to see if the distance between two objects is less than equal to their combined radii
      {                                                          //thereby indicating a collision.
        obj1.isColliding=true;                                   //makes various physics calculations based on the parameters on the two objects in the collision
        obj2.isColliding=true;                                   //TO DO move into a function  
        var vNorm = {x: deltaX/Math.sqrt(sqDistance), y: deltaY/Math.sqrt(sqDistance)};
        var vRelVel = {x: obj1.xVel-obj2.xVel, y: obj1.yVel-obj2.yVel};
        var speed = (vRelVel.x * vNorm.x) + (vRelVel.y * vNorm.y);
        if (speed < 0){break;}
        var impulse = 2* speed / ((obj1.scale*obj1.density) + (obj2.scale*obj2.density));
        obj1.xVel -= (impulse*obj2.scale*obj2.density*vNorm.x);
        obj1.yVel -= (impulse*obj2.scale*obj2.density*vNorm.y);
        obj2.xVel += (impulse*obj1.scale*obj1.density*vNorm.x);
        obj2.yVel += (impulse*obj1.scale*obj1.density*vNorm.y);
      }
    }
  }
}

function collisionLoop()                                         //sends each canvas layer object array into the collision detection function
{
  for(var i=0; i < canvasObjects.length;i++)
  {
    detectCollision(canvasObjects[i]);
  }
}

function drawLoop()                                              //draws every object in the game that is not the player
{
  player.draw();

  for(var i=0; i < weaponsObjects.length; i++)                   //TODO update comments for this section
  {
    weaponsObjects[i].draw();
  } 

  for(var i=0; i < canvasObjects.length; i++)
  {
    group = canvasObjects[i];
    for(var j=0; j < group.length; j++)
    {
      group[j].draw();
    }  
  }
}

function updateUI()
{
  if(!gameOver){updateTimer();}

  updateUIElements();
}

function updateTimer()
{
  ticks++;                                               //ticks each frame at 60fps
  if(ticks >= 60)
  {
    secs++;
    ticks = 0;
  }
  if(secs >= 60)                                         //TODO stop timer at game lost
  {
    mins++;
    if(spawnRate > 1){spawnRate--;}
    secs=0;
  }
  if(secs >= 10)
  {
    secsDisplay = secs.toString();
  }
  else
  {
    secsDisplay = "0" + secs.toString();
  }
}

function checkEndGame()
{
  if(player.health <= 0)
  {
    player.health = 0;
    gameOver = true;
  }
  if(patientHealth <= 0)
  {
    patientHealth = 0;
    gameOver = true;
  }
}

function updateUIElements()
{
  displayUIElement('25px Arial','black','hull: ' + player.health.toString(),10,30);                //hull display
  displayUIElement('25px Arial','black','time: ' + mins.toString() + ':' + secsDisplay, 450, 30);  //timer display 
  displayUIElement('25px Arial','black','health: ' + patientHealth.toString(), 875, 30);           //health display
  if(gameOver)                                                                                     //display game over
  {
    displayUIElement('144px Impact','red','YOU LOSE', 256, 400);
  }
}

function displayUIElement(font,color,statement,xPos,yPos)
{
  uiContext.font = font;        
  uiContext.fillStyle = color;
  uiContext.fillText(statement, xPos, yPos);
}