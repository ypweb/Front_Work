(function(){
  var MAX_ACTORS = 5;/*球数量*/
  var WIDTH = 900;
  var HEIGHT =500;
	var FPS = 30;/*球移动速度*/
	
	var actors = [];
	var stage = {};
	var context = null;
	var spring = 0.1;
	var friction = 0.8;
	var gravity = 5;
	var targetX = 0;
	var targetY = 0;

	// STAGE Object
	function Stage() {
		this.c = "#000000"; // color
	    this.l = 0; // left
	    this.r = WIDTH; // right
		this.t = 0; // top
		this.b = HEIGHT; // bottom
	}
	
	Stage.prototype = {

	    render: function() {

			this.clear();
			
			actors[0].move(targetX, targetY);
			actors[0].draw();
			
	        // draw each actor
	        for (var i=1; i<actors.length; i++) {
				var actorA = actors[i-1];
				var actorB = actors[i];
				actorB.move(actorA.x, actorA.y);
	            actors[i].draw();
	        }
	    },

	    clear: function() {
			context.fillStyle = this.c;
			context.fillRect(0, 0, WIDTH, HEIGHT);
	    }
	};

	// ACTOR Object
	function Actor() {
		this.c = "#FFFFFF"; // color
	    this.x = WIDTH / 2 * Math.random();
	    this.y = HEIGHT / 2 * Math.random();
		this.vx = 0; // velocity x
		this.vy = 0; // velocity y
	}
	
	Actor.prototype = {

	    move: function(tx, ty) {
			// movement with spring, friction and gravity
			var dx = tx - this.x;
			var dy = ty - this.y;
			var ax = dx * spring;
			var ay = dy * spring;
			
			this.vx += ax;
			this.vy += ay;
			
			this.vy += gravity;
			
			this.vx *= friction;
			this.vy *= friction;
			
			this.x += this.vx;
			this.y += this.vy;
	    },

	    draw: function() {
		
			// ball
			context.save();
			context.translate(this.x, this.y);
			context.fillStyle = this.c; 
			context.beginPath();
	        context.arc(0, 0, this.r, 0, Math.PI * 2, true);
			context.closePath();
	        context.fill();
			context.restore();
	    }
	};

	function init(){
	    var canvas = document.getElementById('canvas');
		if(!canvas.getContext){
			document.getElementById("notags").style.display="block";
			return;
		}
		// add event handler
		canvas.addEventListener("click", function(e){
			
			targetX = e.clientX - canvas.offsetLeft;
			targetY = e.clientY - canvas.offsetTop;
		
		}, false);
		
		//set target point
		targetX = WIDTH / 2;
		targetY = HEIGHT / 2;
	
		stage = new Stage();
		
	    canvas.width = WIDTH;
	    canvas.height = HEIGHT;
	    context = canvas.getContext("2d");

	    // create set of actors
	    for (var i = 0; i < MAX_ACTORS; i++) {
	        var actor = new Actor();
			actor.r = 20 - (i*3) ;
			actors.push(actor);
	    }

	    function tick(){
			stage.render();
		}

        setInterval(tick, 1000 / FPS);
	}

	window.onload = init;	
	
}());
