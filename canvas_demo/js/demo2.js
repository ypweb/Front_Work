(function () {
    var max_actors = 5/*演员数量*/,
        width = 900/*舞台宽度*/,
        height = 500/*舞台高度*/,
        fps = 30/*球移动速度*/,
        actor_timer = null,
        actors = [],
        stage = {},
        context = null,
        spring = 0.1,
        friction = 0.8,
        gravity = 5,
        targetX = 0,
        targetY = 0;

    /*舞台类*/
    function Stage() {
        this.c = "#000000"/*舞台背景*/;
        this.l = 0/*舞台左侧*/;
        this.r = width/*舞台右侧*/;
        this.t = 0/*舞台上侧*/;
        this.b = height/*舞台下侧*/;
    }

    /*舞台渲染*/
    Stage.prototype.render = function () {

        this.clear();

        actors[0].move(targetX, targetY);
        actors[0].draw();

        // draw each actor
        for (var i = 1; i < actors.length; i++) {
            var actorA = actors[i - 1];
            var actorB = actors[i];
            actorB.move(actorA.x, actorA.y);
            actors[i].draw();
        }
    };
    /*舞台清除*/
    Stage.prototype.clear = function () {
        context.fillStyle = this.c;
        context.fillRect(0, 0, width, height);
    };


    /*演员类*/
    function Actor() {
        this.c = "#ffffff";
        this.x = (width / 2) * Math.random();
        this.y = (height / 2) * Math.random();
        this.vx = 0;
        this.vy = 0;
    }

    /*演员移动类*/
    Actor.prototype.move = function (tx, ty) {
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
    };
    /*演员绘制*/
    Actor.prototype.draw = function () {

        // ball
        context.save();
        context.translate(this.x, this.y);
        context.fillStyle = this.c;
        context.beginPath();
        context.arc(0, 0, this.r, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
        context.restore();
    };

    function init() {
        var canvas = document.getElementById('canvas');
        if (!canvas.getContext) {
            document.getElementById("notags").style.display = "block";
            return;
        }
        // add event handler
        canvas.addEventListener("click", function (e) {

            targetX = e.clientX - canvas.offsetLeft;
            targetY = e.clientY - canvas.offsetTop;

        }, false);

        //set target point
        targetX = width / 2;
        targetY = height / 8;

        stage = new Stage();

        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext("2d");

        // create set of actors
        for (var i = 0; i < max_actors; i++) {
            var actor = new Actor();
            actor.r = 20 - (i * 3);
            actors.push(actor);
        }

        actor_timer = setInterval(function () {
            /*if (actor_timer !== null) {
                clearInterval(actor_timer);
                actor_timer = null;
            }*/
            stage.render();
        }, 1000 / fps);
    }

    /*初始化*/
    init();

}());
