var controller = {

mouseDownHandler : function(){fire();}
,
keyUpHandler : function(e)                                    //manually tracks when certain keys are not pressed
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
,
keyDownHandler : function(e)                                  //manually tracks when certain keys are pressed
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
,
handleInput : function()                                    //consequences of several multiple-button-press scenarios
{
  if(pressedKeys["a"]&&pressedKeys["d"]&&pressedKeys["w"])  //forward no rotation when a,d,w pressed
  {
    player.yVel+=0.01*player.firePointY;                
    player.xVel+=0.01*player.firePointX;    
  }
  else if(pressedKeys["a"]&&pressedKeys["w"])             //forward and rotate left when a,w pressed
  {
    player.angle-=0.05;
    player.yVel+=0.01*player.firePointY;                  
    player.xVel+=0.01*player.firePointX;
  }                                 
  else if(pressedKeys["d"]&&pressedKeys["w"])             //forward and rotate right when d,w, pressed
  {
    player.angle+=0.05;
    player.yVel+=0.01*player.firePointY;                  
    player.xVel+=0.01*player.firePointX;
  }
  else if(pressedKeys["a"]&&pressedKeys["s"])             //backward and rotate left when a,s, pressed
  {
    player.angle-=0.02;
    player.yVel-=0.001*player.firePointY;                 
    player.xVel-=0.001*player.firePointX;
  }                                                       
  else if(pressedKeys["d"]&&pressedKeys["s"])             //backward and rotate right when d,s, pressed
  {
    player.angle+=0.02;
    player.yVel-=0.001*player.firePointY;                 
    player.xVel-=0.001*player.firePointX;
  }                                                       
  else if(pressedKeys["a"])                               //rotate left when a only pressed
  {
    player.angle-=0.1;
  }
  else if(pressedKeys["d"])                               //rotate right when d only pressed
  {
    player.angle+=0.1;
  }
  else if(pressedKeys["s"])                               //backward when s only pressed
  {
    player.yVel-=0.001*player.firePointY;                 
    player.xVel-=0.001*player.firePointX;               
  }
  else if(pressedKeys["w"])                               //forward when w only pressed
  {
    player.yVel+=0.01*player.firePointY;                  
    player.xVel+=0.01*player.firePointX;               
  }
}
};
