(function () {
    var RAF_Obj = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60)
    };
    var canvas_dom = null,
        ctx = null,
        points = [],
        width,
        height,
        tick = 0,
        opt = {
            count: 5,
            range: {
                x: 20,
                y: 80
            },
            duration: {
                min: 20,
                max: 40
            },
            thickness: 10,
            strokeColor: '#999',
            level: .35,
            curved: true
        },
        rand = function (min, max) {
            return Math.floor((Math.random() * (max - min + 1)) + min);
        };
    ease = function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    };

    /*坐标类*/
    function Point(config) {
        this.anchorX = config.x;
        this.anchorY = config.y;
        this.x = config.x;
        this.y = config.y;
        this.setTarget();
    }


    Point.prototype.setTarget = function () {
        this.initialX = this.x;
        this.initialY = this.y;
        this.targetX = this.anchorX + rand(0, opt.range.x * 2) - opt.range.x;
        this.targetY = this.anchorY + rand(0, opt.range.y * 2) - opt.range.y;
        this.tick = 0;
        this.duration = rand(opt.duration.min, opt.duration.max);
    };

    Point.prototype.update = function () {
        var dx = this.targetX - this.x;
        var dy = this.targetY - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (Math.abs(dist) <= 0) {
            this.setTarget();
        } else {
            var t = this.tick;
            var b = this.initialY;
            var c = this.targetY - this.initialY;
            var d = this.duration;
            this.y = ease(t, b, c, d);

            b = this.initialX;
            c = this.targetX - this.initialX;
            d = this.duration;
            this.x = ease(t, b, c, d);

            this.tick++;
        }
    };

    Point.prototype.render = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
        ctx.fillStyle = '#000';
        ctx.fill();
    };


    /*初始化*/
    function init() {
        canvas_dom = document.getElementById('canvas');
        width = window.innerWidth;
        height = window.innerHeight;
        if (!canvas_dom.getContext) {
            document.getElementById("notags").style.display = "block";
        } else {
            ctx = canvas_dom.getContext('2d');
            canvas_dom.width = width;
            canvas_dom.height = height;
            ctx.lineJoin = 'round';
            ctx.lineWidth = opt.thickness;
            ctx.strokeStyle = opt.strokeColor;
            var i = opt.count + 2,
                spacing = (width + (opt.range.x * 2)) / (opt.count - 1);
            while (i--) {
                points.push(new Point({
                    x: (spacing * (i - 1)) - opt.range.x,
                    y: height - (height * opt.level)
                }));
            }
        }
    }


    function updatePoints() {
        var i = points.length;
        while (i--) {
            points[i].update();
        }
    }

    function renderPoints() {
        var i = points.length;
        while (i--) {
            points[i].render();
        }
    }

    function renderShape() {
        ctx.beginPath();
        var pointCount = points.length;
        ctx.moveTo(points[0].x, points[0].y);
        var i;
        for (i = 0; i < pointCount - 1; i++) {
            var c = (points[i].x + points[i + 1].x) / 2;
            var d = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, c, d);
        }
        ctx.lineTo(-opt.range.x - opt.thickness, height + opt.thickness);
        ctx.lineTo(width + opt.range.x + opt.thickness, height + opt.thickness);
        ctx.closePath();
        ctx.fillStyle = 'hsl(' + (tick / 2) + ', 80%, 60%)';
        ctx.fill();
        ctx.stroke();
    }

    function clear() {
        ctx.clearRect(0, 0, width, height);
    }

    function loop() {
        RAF_Obj(loop, ctx);
        tick++;
        clear();
        updatePoints();
        renderShape();
        renderPoints();
    }
    /*初始化服务*/
    init();
    loop();
}());