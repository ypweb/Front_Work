(function () {

    var RAF_Obj = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        }/*兼容动画处理*/,
        Un_FAF_Obj = window.cancelAnimationFrame || window.mozcancelAnimationFrame || window.webkitcancelAnimationFrame || window.mscancelAnimationFrame || function (id) {
            window.clearTimeout(id);
        },
        scene_dom = null/*舞台节点dom*/,
        sceneCtx = null/*发布对象*/,
        entities = []/*星星对象*/,
        points = [],
        flashcolor = ['#f1f1f1', '#f6f6f6', '#f9f9f9', '#fcfcfc', '#ffffff', '#e1e1e1', '#e5e5e5', '#e9e9e9', '#ececec', '#eeeeee'],
        scene_timer = null,
        width = 900/*舞台宽度*/,
        height = 500/*舞台高度*/;


    /*背景星星类*/
    function Star(opt) {
        this.size = Math.random() * 2/*大小*/;
        this.speed = Math.random() * 0.1/*速度*/;
        this.x = opt.x/*x坐标*/;
        this.y = opt.y/*y坐标*/;
        this.flash = parseInt(Math.random() * 100, 10) >= 80/*是否闪烁*/;
    }

    /*重置背景星星*/
    Star.prototype.reset = function () {
        this.size = Math.random() * 2;
        this.speed = Math.random() * 0.1;
        this.x = width;
        this.y = Math.random() * height;
    };
    /*更新背景星星*/
    Star.prototype.update = function (count) {
        this.x -= this.speed;
        if (this.x < 0) {
            this.reset();
        } else {
            if (this.flash) {
                var flashflag=parseInt(count * 10000,10);
                if (flashflag >= 9900) {
                    var tempcolor = flashcolor[parseInt(count * 10,10)];
                    sceneCtx.fillStyle = tempcolor;
                    sceneCtx.strokeStyle = tempcolor;
                }
            }
            sceneCtx.fillRect(this.x, this.y, this.size, this.size);
        }
    };

    /*流星类*/
    function ShootingStar() {
        this.reset();
    }

    /*生成流星*/
    ShootingStar.prototype.reset = function () {
        this.x = Math.random() * width;
        this.y = 0;
        this.len = (Math.random() * 100) + 10;
        this.speed = (Math.random() * 20) + 5;
        this.size = (Math.random() * 1.2) + 0.1;
        this.waitTime = new Date().getTime() + (Math.random() * 200) + 10;
        this.active = false;
    };
    /*更新流星*/
    ShootingStar.prototype.update = function () {
        if (this.active) {
            this.x -= this.speed;
            this.y += this.speed;
            if (this.x < 0 || this.y >= height) {
                this.reset();
            } else {
                sceneCtx.lineWidth = this.size;
                sceneCtx.beginPath();
                sceneCtx.moveTo(this.x, this.y);
                sceneCtx.lineTo(this.x + this.len, this.y - this.len);
                sceneCtx.stroke();
            }
        } else {
            if (this.waitTime < new Date().getTime()) {
                this.active = true;
            }
        }
    };

    /*设置舞台*/
    setScene();
    /*渲染山峰*/
    initHill();
    /*初始化星星和流星*/
    initStar();
    /*初始化绘制渲染*/
    init();

    /*设置舞台*/
    function setScene() {
        scene_dom = document.getElementById("canvas");
        if (!scene_dom) {
            document.getElementById("notags").style.display = "block";
        } else {
            sceneCtx = scene_dom.getContext("2d");
            scene_dom.width = width;
            scene_dom.height = height;
        }
    }

    function initHill() {
        /*设置天空*/
        sceneCtx.fillStyle = '#0c034c';
        sceneCtx.fillRect(0, 0, width, height);
        /*定义山峰*/
        var displacement = 200/*山峰落差基数*/,
            power = Math.pow(2, Math.ceil(Math.log(width) / (Math.log(2))))/*点*/,
            hill = height - (Math.random() * (height / 4)) - displacement;

        /*设置上山峰起点终点*/
        points[0] = hill/*起点*/;
        points[power] = hill/*终点*/;

        /*填充落差点*/
        var i = 1;
        for (i; i < power; i *= 2) {
            for (var j = (power / i) / 2; j < power; j += power / i) {
                points[j] = ((points[j - (power / i) / 2] + points[j + (power / i) / 2]) / 2) + Math.floor(Math.random() * (-displacement) + displacement);
            }
            displacement *= 0.6;
        }
        /*绘制山峰*/
        renderHill();
    }

    /*渲染山峰*/
    function renderHill() {
        /*开始渲染山峰*/
        sceneCtx.fillStyle = '#000';
        sceneCtx.beginPath();
        var k = 0;
        for (k; k <= width; k++) {
            if (k === 0) {
                sceneCtx.moveTo(0, points[0]);
            } else if (points[k] !== undefined) {
                sceneCtx.lineTo(k, points[k]);
            }
        }
        sceneCtx.lineTo(width, height);
        sceneCtx.lineTo(0, height);
        sceneCtx.lineTo(0, points[0]);
        sceneCtx.fill();
    }

    /*初始化星星和流星*/
    function initStar() {
        /*生成背景星星*/
        var new_start,
            len = height / 2;

        for (var i = 0; i < len; i++) {
            new_start = new Star({
                x: Math.random() * width,
                y: Math.random() * height
            });
            entities.push(new_start);
        }
        entities.push(new ShootingStar());
        entities.push(new ShootingStar());
    }


    /*动画*/
    function init() {
        /*重绘星空*/
        var count = Math.random();
        sceneCtx.fillStyle = '#05004c';
        sceneCtx.fillRect(0, 0, width, height);
        /*重绘星星和流星*/
        sceneCtx.fillStyle = '#ffffff';
        sceneCtx.strokeStyle = '#ffffff';
        var entLen = entities.length;
        /*循环更新星星*/
        while (entLen--) {
            entities[entLen].update(count);
        }
        /*重绘山峰*/
        renderHill();
        /*清除定时器*/
        if (scene_timer !== null) {
            Un_FAF_Obj(scene_timer);
            scene_timer = null;
        }
        /*启动定时器*/
        scene_timer = RAF_Obj(init);
    }
})();