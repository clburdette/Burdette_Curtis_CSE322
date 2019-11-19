//TO DO add UI layer, player score, player health, weapons loadout

//declaration
var numCanvases = 16;      //defines amount of layers among play area objects
var canvasBag = [];        //holds canvas documents
var contextBag = [];       //holds canvas contexts
var startTime;             //for determining time elapsed during a frame
var spawnClock = 0;        //temp variables to keep objects from spawning
var spawnRate = 10;        //every frame, also increase difficulty
var player;                //player character object
var playerObjects = [];    //array that hold player and all player-fired objects
var patientHealth = 1000;  //health score metric for display
var randomizer;            //variable for randomizing various processes
var pressedKeys = {"a":false,"d":false,"s":false, "w":false};                            //array that holds information about certain key presses
var canvasObjects = [];  //holds the arrays that hold the objects for each canvas layer

//TODO add new weapons, weapons loadout?, weapon switching
//TODO data security, reduce global variables
//TODO add screen-clear weapon
//TODO add powerups
//TODO refactor scoring
//TODO add sound
//TODO add visual effects
//TODO add animation

function init() //game intro screen
{
  var introTxt = "";
  introTxt += "<div style='text-align: center; width: 100%'>";
  introTxt += "<br><br><u>STORY</u><br><br>";
  introTxt += "Your patient is infected with a deadly blood disease!<br>";
  introTxt += "The only way to stop the spread of infection is inserting<br>";
  introTxt += "a remotely controlled micro-device that you control in<br>";
  introTxt += " to clean the infected cells from the blood directly<br><br>";
  introTxt += "<u>RULES</u><br><br>";
  introTxt += "1) infections bubble up toward the camera. Black blood cells<br>";
  introTxt += "are about to become infected.  Purple blood cells are infected!<br>";
  introTxt += "Shoot purple cells with your anti-body weapons. Watch out for<br>";
  introTxt += "black cells that may turn into purple cells.<br><br>";
  introTxt += "2) If infected cells float past the bottom of your view, they<br>";
  introTxt += "spread to the rest of the bloodstream and hurt the health of<br>";
  introTxt += "your patient.  The bigger the infection, the bigger the hurt.<br>";
  introTxt += "If your patient's health reaches zero, they die!<br><br>";
  introTxt += "3) Your micro-device is coated in anti-bodies.  You can ram<br>";
  introTxt += "infected cells with your micro-device to destroy them.  However,<br>";
  introTxt += "each collision weakens your micro-device's hull integrity.  If it<br>";
  introTxt += "reaches zero, your micro-device is destroyed and your patient dies!<br><br>";
  introTxt += "<u>CONTROLS</u><br><br>";
  introTxt += "W - Move Forward<br>";
  introTxt += "S - Move Back<br>";
  introTxt += "A - Rotate Left<br>";
  introTxt += "D - Rotate Right<br>";
  introTxt += "Left Click - fire<br>";
  introTxt += "keep your mouse in the play area!<br><br>";
  introTxt += "</div><br>";
  introTxt += "<div id='tempStart' style='text-align: center; width: 15%; background-color: red; margin: auto;'>click here to start</div>";
  document.getElementById("parent").innerHTML = introTxt;
  document.getElementById("tempStart").addEventListener('click', initGame, false);
}
  
function initGame()                                         //creates conditions necessary for building the game
{                                                              
  playArea.makeCanvasTags(numCanvases);                              //makes all the canvases and arrays to hold canvas drawn  
  playArea.makeCanvases(numCanvases);                                //objects based on an amount which is a power of 2
  playArea.makeContexts(numCanvases);                                //due to the way color transitions are handled
  playArea.linkContexts(numCanvases);                                
  playArea.makeLayers(numCanvases);                                  //TODO refactor player, weapons, ui canvas creation
  playArea.makePlayerLayer();
  playArea.makeWeaponsLayer();
  view.makeUILayer();
  player = new Player(playArea.playerContext, playArea.playerCanvas.width/2, playArea.playerCanvas.height/2, 0, 0, 20, 10000, 100);
  playerObjects.push(player);
  document.getElementById("parent").removeEventListener('click', initGame, false);
  document.getElementById("parent").style.cursor = "none";
  document.getElementById("parent").addEventListener('mousedown', controller.mouseDownHandler, false);
  document.addEventListener('keydown', controller.keyDownHandler, false);                            //control input listeners
  document.addEventListener('keyup', controller.keyUpHandler, false);
  window.requestAnimationFrame(gameLoop);                                                      //initiate recursive game loop
}

function fire()                                           //dynamically create missile at player's fire point in the direction of player's forward vector
{                                                                                 
  var spawn = new Projectile(playArea.weaponsContext, player.xPos+player.firePointX, player.yPos+player.firePointY, player.firePointX*25, player.firePointY*25, 10, 2);
  playerObjects.push(spawn);
}

function gameLoop(currentTime)                            //everything that occurs in the game during a given frame
{
  randomizer = Math.random() - 0.5;                       //creates a random number between -0.5 and 0.5 to randomize various processes
                                                          //TODO refactor into function    
  cleanUpLoop();                                          //removes non-player objects from their arrays for gabage collection when off screen 

  spawnClock++                                            //temporary spawner delay that decreases the long the game is played to increase difficulty
  if(spawnClock==spawnRate)                               
  {
    spawnerLoop();                                        //loop that creates various game objects that are not the player
    spawnClock = 0;                                       //nor a player missile
  }
  controller.handleInput();                               //process various buttons presses occuring during the frame

  updateLoop(getTime(currentTime));                       //update of all game objects
                                                          //TODO refactor collision process        
  collisionLoop();                                        //collision calculations among all collidable game objects that arent player or player weapons

  moveInZLoop();                                          //moves objects between canvas layers based on their z value

  playArea.clearCanvases();                                        //removes last frame's information from the various canvases

  drawLoop();                                             //draws this frame's information to the various canvases

  view.updateUI();                                             //calculates UI information and displays it in the UI canvas layer
 
  window.requestAnimationFrame(gameLoop);                 //game loop function recursion
}

function getTime(currentTime)
{
  var seconds = (currentTime - startTime)/1000;           //calculates the amount of time that has elapsed during a frame               
  startTime = currentTime;
  return seconds;
}                                //TODO refactor into function

function spawnToCollide(spawnXPos,spawnYPos,sizeToSpawn,objects)  //checks to see if new object will collide with existing objects in a given canvas layer
{
  var obj1;
  var obj2;
  var willCollide = false;
        
  for(i=0; i < objects.length;i++)
  {
    obj1 = objects[i];
    if(Math.abs(spawnXPos-obj1.xPos)<=(sizeToSpawn + obj1.scale))
    {
      var diffX = spawnXPos-obj1.xPos;
      var diffY = spawnYPos-obj1.yPos;
      var sqDistance= Math.pow(diffX,2) + Math.pow(diffY,2);

      if(sqDistance <= Math.pow(obj1.scale + sizeToSpawn,2)){willCollide = true;}
    }
  }

  return willCollide;
} 

function spawner(objects)                               //dynamically spawns objects using various random parameters within set ranges.
{                                                       //input parameter is an array of objects in a given layer, to which the spawned
  var randomX = Math.floor(Math.random() * 1024);       //object is added
  var randomY = Math.floor((Math.random() * 768)-10);
  var ranSize = Math.floor(Math.random() * 90) + 10;

  if(!spawnToCollide(randomX, randomY, ranSize, objects))
  {
    var randomZ;
    var ranXVel = Math.floor(Math.random() * 300)-150;
    var ranYVel = Math.floor(Math.random() * 200)-110;
    var ranZVel = Math.random() * 5;
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
      if((obj.yPos-obj.scale)>canvasBag[0].height && objects==canvasObjects[numCanvases-1])
      {
        patientHealth -= obj.scale;
        view.resetMultiplier();
      }
      objects.splice(i,1);
    }
  }
}

function cleanUpWeapons()                              
{                                                      
  for(i=1; i < playerObjects.length; i++)                    
  {
    var obj = playerObjects[i];
    if((obj.xPos-100)>playArea.weaponsCanvas.width||
       (obj.xPos+100)<0||
       (obj.yPos-100)>playArea.weaponsCanvas.height||
       (obj.yPos+100)<0)
    {
      playerObjects.splice(i,1);
      view.resetMultiplier();
    }
  }
}

function cleanUpLoop()                                 //sends each canvas layer object array into the clean up function
{
  cleanUpWeapons();

  for(var i=0;i<canvasObjects.length;i++)
  { 
    cleanUpOffScreen(canvasObjects[i]);
  } 
}

function updateLoop(delta)                             //input parameter is amount of time which has passed during a given frame
{                                                      //which is then passed into the update function of each object in the game
  for(var i=0; i < playerObjects.length; i++)         //TODO update comments for this section
  {
    playerObjects[i].update(delta);
  }  

  for(var i=0; i < canvasObjects.length; i++)          
  {
    var group = canvasObjects[i];
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
                                                                                                         
  for(i=0; i < objects.length;i++)                    //resets each object's variable that indicates if the object is colliding with something else during a given frame
  {
    objects[i].isColliding = false;
  }

  for(i=0; i < objects.length;i++)                    //compares each object with every other object in the canvas layer object array
  {

    for(j=i+1; j < objects.length;j++)
    {
      if((Math.abs(objects[i].xPos-objects[j].xPos)) <= (objects[i].scale + objects[j].scale))
      {
        collisionReaction(objects,i,j);
      }
    }
  }
}

function playerCollision(objects)                      //detects collision between player and player projectiles with top layer objects
{
  var obj1;
  var obj2;
                                            
  for(i=0; i < playerObjects.length;i++)               //resets each object's variable that indicates if the object is colliding with something else during a given frame
  {
    playerObjects[i].isColliding = false;
  }
                                                   
  for(i=0; i < objects.length;i++)                     
  {
    objects[i].isColliding = false;
  }

  for(i=0; i < playerObjects.length; i++)
  {
    obj1 = playerObjects[i];
    for(j=0; j < objects.length;j++)                   //compares each object with player and/or player projectiles
    {
      obj2 = objects[j];
      if((Math.abs(obj1.xPos-obj2.xPos)) <= (obj1.scale + obj2.scale))
      {
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
          if (speed < 0){speed = 0;}
          var impulse = 2* speed / ((obj1.scale*obj1.density) + (obj2.scale*obj2.density));
          obj1.xVel -= (impulse*obj2.scale*obj2.density*vNorm.x);
          obj1.yVel -= (impulse*obj2.scale*obj2.density*vNorm.y);
          obj2.xVel += (impulse*obj1.scale*obj1.density*vNorm.x);
          obj2.yVel += (impulse*obj1.scale*obj1.density*vNorm.y);
          if(!endGame()){view.playerScore += Math.ceil(1000/obj2.scale) * view.multiplier;}
          obj2.scale-=obj1.scale;
          if(sqDistance/(Math.pow(obj1.scale + obj2.scale,2)) < 0.9)
          {
            var midPoint = {x: (obj2.xPos+obj1.xPos)/2, y: (obj2.yPos+obj1.yPos)/2};
            var distOne = Math.pow((midPoint.x - obj1.xPos),2) + Math.pow((midPoint.y - obj1.yPos),2);
            var distTwo = Math.pow((midPoint.x - obj2.xPos),2) + Math.pow((midPoint.y - obj2.yPos),2);
            var vecOne = {x: (obj1.xPos - midPoint.x)/distOne, y: (obj1.yPos - midPoint.y)/distOne};
            var vecTwo = {x: (obj2.xPos - midPoint.x)/distOne, y: (obj2.yPos - midPoint.y)/distOne};
            obj1.xVel += (vecOne.x/obj1.scale)*1000;
            obj1.yVel += (vecOne.y/obj1.scale)*1000;
            obj2.xVel += (vecTwo.x/obj2.scale)*1000;
            obj2.yVel += (vecTwo.y/obj2.scale)*1000;
          }
          if(i>0)
          {
            view.multiplier++;
            playerObjects.splice(i,1);
            if(obj2.scale > 60)
            {
              var randomizeXPos = ((Math.random() * obj2.scale * Math.sqrt(2)) - obj2.scale/Math.sqrt(2)) * randomizer;
              var randomizeYPos = ((Math.random() * obj2.scale * Math.sqrt(2)) - obj2.scale/Math.sqrt(2)) * randomizer;
              var randomizeXVel = ((Math.random() * obj2.scale * Math.sqrt(2)) - obj2.scale/Math.sqrt(2)) * randomizer;
              var randomizeYVel = ((Math.random() * obj2.scale * Math.sqrt(2)) - obj2.scale/Math.sqrt(2)) * randomizer;
              var spawn = new Entity(obj2.context, (obj2.xPos)+randomizeXPos, (obj2.yPos)+randomizeYPos, obj2.zPos, (obj2.xVel)+randomizeXVel, (obj2.yVel)+randomizeYVel, obj2.zVel, Math.ceil((obj2.scale)/Math.sqrt(2)), obj2.density);
              obj2.scale = Math.ceil(obj2.scale/Math.sqrt(2));
              objects.push(spawn);
            }
          }
          else{view.resetMultiplier()};        
          if(obj2.scale<10){objects.splice(j,1);}
        }
      }
    }
  }
}
function collisionReaction(objs,i,j) //TODO update comments
{
      var obj1 = objs[i];
      var obj2 = objs[j];
      var deltaX = obj2.xPos-obj1.xPos;
      if(deltaX <= obj1.scale + obj2.scale)
      var deltaY = obj2.yPos-obj1.yPos;
      var sqDistance= Math.pow(deltaX,2) + Math.pow(deltaY,2);
      var overlap = sqDistance/(Math.pow(obj1.scale + obj2.scale,2));
      if(overlap <= 1)    //checks to see if the distance between two objects is less than equal to their combined radii
      {                                                          //thereby indicating a collision.
        obj1.isColliding=true;                                   //makes various physics calculations based on the parameters on the two objects in the collision
        obj2.isColliding=true;                                   //TO DO move into a function
        var midPoint = {x: (obj2.xPos+obj1.xPos)/2, y: (obj2.yPos+obj1.yPos)/2};
        if((obj1.scale + obj2.scale) < 70 && overlap < 0.98)
        {
          var obj1Mass = obj1.scale*obj1.scale*obj1.density;
          var obj2Mass = obj2.scale*obj2.scale*obj2.density;
          var obj1Momen = {x: obj1.xVel*obj1Mass, y: obj1.yVel*obj1Mass};
          var obj2Momen = {x: obj2.xVel*obj2Mass, y: obj2.yVel*obj2Mass};
          var obj3Vel = {x: (obj1Momen.x + obj2Momen.x)/(obj1Mass + obj2Mass), y: (obj1Momen.y + obj2Momen.y)/(obj1Mass + obj2Mass)}; 
          var spawn = new Entity(obj1.context, midPoint.x, midPoint.y, (obj1.zPos + obj2.zPos)/2, obj3Vel.x, obj3Vel.y, (obj1.zVel + obj2.zVel)/2, Math.ceil((obj1.scale + obj2.scale)/Math.sqrt(2)),
                                ((((Math.pow(obj1.scale,2) * obj1.density) + (Math.pow(obj2.scale,2) * obj2.density))) / (Math.pow(obj1.scale + obj2.scale,2))));
          if(i<j)
          {
            objs.splice(j,1);
            objs.splice(i,1);
          }
          else
          {
            objs.splice(i,1);
            objs.splice(j,1);
          }
          objs.push(spawn);
        }
        else
        {
          if(overlap > 0.95)
          {
            collisionPhys(deltaX, deltaY, sqDistance, obj1, obj2); 
          }
          else if(overlap <=0.95)
          {
            var distOne = Math.pow((midPoint.x - obj1.xPos),2) + Math.pow((midPoint.y - obj1.yPos),2);
            var distTwo = Math.pow((midPoint.x - obj2.xPos),2) + Math.pow((midPoint.y - obj2.yPos),2);
            var vecOne = {x: (obj1.xPos - midPoint.x)/distOne, y: (obj1.yPos - midPoint.y)/distOne};
            var vecTwo = {x: (obj2.xPos - midPoint.x)/distOne, y: (obj2.yPos - midPoint.y)/distOne};
            obj1.xVel += (vecOne.x/obj1.scale)*1000;
            obj1.yVel += (vecOne.y/obj1.scale)*1000;
            obj2.xVel += (vecTwo.x/obj2.scale)*1000;
            obj2.yVel += (vecTwo.y/obj2.scale)*1000;
          }        
        }
      }
}

function collisionPhys(dX,dY,sqDist,o1,o2)
{
          var vNorm = {x: dX/Math.sqrt(sqDist), y: dY/Math.sqrt(sqDist)};
          var vRelVel = {x: o1.xVel-o2.xVel, y: o1.yVel-o2.yVel};
          var speed = (vRelVel.x * vNorm.x) + (vRelVel.y * vNorm.y);
          if(speed < 0){speed = 0;}
          var impulse = 2* speed / ((o1.scale*o1.density) + (o2.scale*o2.density));
          o1.xVel -= (impulse*o2.scale*o2.density*vNorm.x);
          o1.yVel -= (impulse*o2.scale*o2.density*vNorm.y);
          o2.xVel += (impulse*o1.scale*o1.density*vNorm.x);
          o2.yVel += (impulse*o1.scale*o1.density*vNorm.y);
}
function collisionLoop()                                         //sends each canvas layer object array into the collision detection function
{
  playerCollision(canvasObjects[numCanvases-1]);

  for(var i=0; i < canvasObjects.length;i++)
  {
    detectCollision(canvasObjects[i]);
  }
}

function drawLoop()                                             //draws every object in the game
{
  for(var i=0; i < playerObjects.length; i++)                   
  {
    playerObjects[i].draw();
  } 

  for(var i=0; i < canvasObjects.length; i++)
  {
    var group = canvasObjects[i];
    for(var j=0; j < group.length; j++)
    {
      group[j].draw();
    }  
  }
}

function endGame()
{
  var gameOver;

  if(player.health <= 0)
  {
    player.health = 0;
    gameOver = true;
  }
  else if(patientHealth <= 0)
  {
    patientHealth = 0;
    gameOver = true;
  }
  else
  { 
    gameOver = false;
  }

  return gameOver;
}
  
