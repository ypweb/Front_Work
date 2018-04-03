window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

var RandomGen = {
  
  randomize : function(a, b) {
    return Math.random() * (b - a) + a;
  },
  
   randomInt : function(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
  },
  
  getDirVec : function(x,y){
    var angle = this.randomize(0,(2 * Math.PI));
    return new Vector(Math.sin(angle) * x, - Math.cos(angle) * y);
  },
} 
    
var Vector = function(x,y){
  
  this.x = x || 0;
  this.y = y || 0;
  
  this.add = function(v){
    this.x += v.x;
    this.y += v.y;
    return this;
  };
  
  this.mult = function(v){
    this.x *= v.x;
    this.y *= v.y;
  };  
}

var App = {
  init : function(){
    this.canvas = document.getElementById('canvas');
		if(!this.canvas.getContext){
		document.getElementById("notags").style.display="block";
		return;
	}
    this.context = this.canvas.getContext('2d');
    this.particles = [];
    this.WIDTH  = 900;
    this.HEIGHT = 500;
    
    this.canvas.width = this.WIDTH;
    this.canvas.height = this.HEIGHT;
    this.bindHandlers();
    this.draw();
  },
  
  bindHandlers : function(){
    this.canvas.addEventListener(
    'click', this.fireParticles,false);
     this.canvas.addEventListener(
    'mousemove', this.fireSmallParticles,false);
    this.createParticles(this.WIDTH / 2, this.HEIGHT / 2, false);
    window.onresize = App.resize;
  },
  
  fireParticles : function(e){
    var xPos = e.pageX;
    var yPos = e.pageY;
    App.createParticles(xPos,yPos,false);
  },
  
  fireSmallParticles : function(e){
    var xPos = e.pageX;
    var yPos = e.pageY;
    App.createParticles(xPos,yPos,true);
  },
  
  createParticles : function(x,y,isSmall){
    var amount = isSmall ? RandomGen.randomInt(10,25) :  RandomGen.randomInt(150,350);
     
    for (var i = 0; i < amount; i++){
      var particle =  new Particle(x,y,isSmall);
      this.particles.push(particle);
    }
  },
  
  draw : function(){
    for (var i = 0; i < App.particles.length; i++){
      App.particles[i].update(); 
      if(App.particles[i].lifetime < 0){
        App.particles.splice(i,1);
      }
    }
   App.context.fillStyle = "rgba(0,0,0,0.25)";
    App.context.fillRect(0, 0, App.canvas.width,    App.canvas.height); 
    window.requestAnimFrame(App.draw);
  },
  
  resize : function(){
     App.canvas.width =  900;
    App.canvas.height =  500;
  }

}

var Particle = function(x,y,isSmall){
  
  this.pos = new Vector(x,y);
  this.size = isSmall ? RandomGen.randomize(1,1) :
    RandomGen.randomize(1,8);
  var acc = RandomGen.randomize(0,this.size);
  this.dir = RandomGen.getDirVec(acc,acc);
  this.lifetime = RandomGen.randomize(20,60);
}
  
  Particle.prototype.draw = function(){
    
    App.context.fillStyle = "#fff";
    App.context.beginPath();
    App.context.rect(
      this.pos.x,this.pos.y,this.size,this.size);
    App.context.closePath();
    App.context.stroke();
    
    App.context.fill();
  };
  
  Particle.prototype.update = function(){ 
    this.lifetime--;
    this.dir.mult(new Vector(.97,.97));
    this.pos.add(this.dir);    
    this.draw();
  }
  
App.init();    