
class GameObject //anything in the game that can move
{
  constructor(context, xPos, yPos, zPos, xVel, yVel, zVel)
  {
    this.context = context;
    this.xPos = xPos;
    this.yPos = yPos; 
    this.zPos = zPos; 
    this.xVel = xVel;
    this.yVel = yVel;
    this.zVel = zVel;
  }
}


class Entity extends GameObject  //anything in the game that collides
{                                //expect for the player character
 
  constructor(context, xPos, yPos, zPos, xVel, yVel, zVel, scale, density)
  {
    super(context, xPos, yPos, zPos, xVel, yVel, zVel);
    this.scale = scale;
    this.density = density;
    this.isColliding = false;
  }

  draw()                         //determines where the object resides and draws it
  {                              //on the appropriate canvas at a corresponding color
    for(var i = 0; i < numCanvases; i++)
    {
      var num = (256/numCanvases)*i;
      var color = '#' + num.toString(16) + '0000';
      if(this.context==contextBag[numCanvases-1-i]){this.context.fillStyle = color;}
    }
    if(this.context==contextBag[numCanvases-1]){this.context.fillStyle = '#440033';}
    this.context.beginPath();    //draw circle                         
    this.context.arc(this.xPos, this.yPos, this.scale, 0, 2*Math.PI);
    this.context.fill();
  }

  update(seconds)
  {
    if(this.xVel != 0){this.xVel*=0.999;}  //friction
    if(this.yVel != 0){this.yVel*=0.999;}
    this.yVel += 0.1;                      //very weak simulated gravity 
    this.xPos += this.xVel*seconds;        //position updated by velocity
    this.yPos += this.yVel*seconds;        //in each spatial plane 
    this.zPos += this.zVel*seconds;
  }
}

class Weapon
{

  constructor(context, xPos, yPos, xVel, yVel, scale, density)
  {
    this.context=context
    this.xPos=xPos;
    this.yPos=yPos;
    this.xVel=xVel;
    this.yVel=yVel;
    this.scale=scale;
    this.density=density;
  }

  draw()
  {
    this.context.fillStyle = '#000000';                  
    this.context.beginPath();
    this.context.arc(this.xPos, this.yPos, this.scale, 0, 2*Math.PI);     
    this.context.fill();
  }

  update(seconds)
  {
    this.xPos += this.xVel*seconds;        
    this.yPos += this.yVel*seconds;
  }
}         
class Player                    //player character object
{

  constructor(context, xPos, yPos, xVel, yVel, scale, density, health)
  {
    this.context=context;
    this.xPos=xPos;
    this.yPos=yPos;
    this.xVel=xVel;
    this.yVel=yVel;
    this.xVec=0;                           //x and y component of the object's
    this.yVec=1;                           //normalized forward vector 
    this.firePointX=0;                     //point on the screen where the player
    this.firePointY=scale;                 //character's missiles originate
    this.scale=scale;
    this.density=density;
    this.health=health;
    this.isColliding=false;
    this.angle=0;                          //angle of the player's forward vector in relation to true north
    this.MAX_MAG=25; 
  }

  draw()                                                 //TO DO upgrade player appearance
  {
    this.context.save();
    this.context.translate(this.xPos, this.yPos);        //move player canvas to new position
    this.context.fillStyle = '#FFAA00';                  //draw player thruster graphic 
    this.context.beginPath();
    this.context.arc(this.firePointX/-2, this.firePointY/-2, 14, 0, 2*Math.PI);
    this.context.fill();
    this.context.fillStyle = '#0000FF';                  //draw player fire point graphic
    this.context.beginPath();
    this.context.arc(this.firePointX, this.firePointY, 4, 0, 2*Math.PI);
    this.context.fill();
    this.context.rotate(this.angle);                     //rotate canvas to the player's rotation 
    this.context.fillStyle = '#00FF00';                  //draw main body of player character
    this.context.beginPath();
    this.context.arc(0, 0, this.scale, 0, 2*Math.PI);     
    this.context.fill();
    if(this.isColliding)
    {
      this.context.fillStyle = '#FF0000';                  
      this.context.beginPath();
      this.context.arc(0, 0, this.scale, 0, 2*Math.PI);     
      this.context.fill();
      this.health--;
    }
    this.context.restore();          
  }

  update(seconds)
  {
    this.xVec = Math.sin(this.angle);                    //calculate forward vector based on
    this.yVec = Math.cos(this.angle);                    //player character object's rotation
    this.firePointX=this.xVec*this.scale;                //calculate position of fire point
    this.firePointY=this.yVec*this.scale*(-1);           //based on forward vector    
    if(this.xVel != 0){this.xVel*=0.99;}                 //friction
    if(this.yVel != 0){this.yVel*=0.99;}
    this.yVel += 0.003;
    var speedRatio = ((this.xVel*this.xVel)+(this.yVel*this.yVel))/this.MAX_MAG;
    if(speedRatio>1)                                     //cap forward speed to MAX_MAG
    {
      this.xVel/=speedRatio;
      this.yVel/=speedRatio;
    }
    this.xPos+=this.xVel;                                //position updated by velocity
    this.yPos+=this.yVel;
    if(this.xPos<this.scale)
    {
      this.xPos=this.scale;
      this.xVel*=-0.5;
    }
    if(this.xPos>1024-this.scale)
    {
      this.xPos=1024-this.scale;
      this.xVel*=-0.5;
    }
    if(this.yPos<this.scale)
    {
      this.yPos=this.scale;
      this.yVel*=-0.5;
    }
    if(this.yPos>768-this.scale)
    {
      this.yPos=768-this.scale;
      this.yVel*=-0.5;
    }
  }
}
