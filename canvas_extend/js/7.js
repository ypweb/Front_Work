var c = document.createElement("canvas"),
    $ = c.getContext("2d");

var w = window.innerWidth,
    h = window.innerHeight;

c.width = w;
c.height = h;

c.addEventListener("mousedown", mouseDown, true);

document.body.appendChild(c);

var part;  //particle
var meshW = 100;  //mesh width
var dispX = -50;  //x disposition
var dispY = -100;  //y disposition
var partX = 0;  //particle x
var partY = 0;  //particle y
var partIndX = 0;  //particle index x
var partIndY = 0;  //particle index y

var col0 = "rgb(74, 1, ";  //shading color-starts
var col1 = "rgb(0, 3, ";

var partList = [];  //particle array
var gridW = w + meshW;   //grid width
var gridH = h + meshW * 2;  //grid height

while(partY < gridH)
{
    while(partX < gridW)
    {
        part = new Object(partX, partY, partIndX, partIndY);
        partList.push(part);

        partX += meshW;
        partIndX++;
    }

    partX = 0;
    partIndX = 0;
    partY += meshW;
    partIndY++;
}


var partArrayL= partList.length;
var rowCt = Math.ceil( gridW / meshW );  //row count
var colCt = Math.ceil( gridH / meshW );  //column count

$.clearRect(0, 0, w, h);

for(var i = 0; i < partArrayL; ++i)
{
    part = partList[i];
    part.next = partList[i + 1];

    if(part.indX % rowCt != rowCt - 1 && part.indY != colCt - 1)
    {
        part.connectAll.push(partList[i + 1]);
        part.connectAll.push(partList[i + rowCt + 1]);
        part.connectAll.push(partList[i + rowCt]);
        part.ready();
    }
}

var int = setInterval(intHandler, 1000 / 30);

function mouseDown()
{
    if(int != undefined)
    {
        clearInterval(int);
        int = undefined;
    }
    else
    {
        int = setInterval(intHandler, 1000 / 30);
    }
}

part = partList[0];

function intHandler()
{
    $.clearRect(0, 0, w, h);

    while(part != undefined)
    {
        part.draw();
        part = part.next;
    }

    part = partList[0];

    while(part != undefined)
    {
        part.fill();
        part = part.next;
    }

    part = partList[0];
}

function Object(pX, pY, pIndX, pIndY)
{
    this.distort = 50;

    this.x = dispX + pX + ( Math.random() - Math.random() ) * this.distort;
    this.y = dispY + pY + ( Math.random() - Math.random() ) * this.distort;
    this.indX = pIndX;
    this.indY = pIndY;
    this.color = "hsla(261, 55%, 5%, 1)";  //part border color

    this.size = 2;
    this.next = undefined;

    this.tracker = (Math.PI / 2) + this.indX * .5;
    this.diffX = Math.random();
    this.diffY = Math.random();
    this.speed = .1;
    this.vol = 30;  //volume  (higher #, more movement)

    this.colRngDiff = 70;  //shading variation
    //color range > changing the 225 to vals between 0 and 255, as well as the color range difference # above,  will change base color
    this.colRng = (225 - this.colRngDiff) + Math.floor(Math.random() * this.colRngDiff);

    this.draw = function()
    {
        this.tracker += this.speed;
        this.tracker = this.tracker == 1 ? 0 : this.tracker;

        this.x += (Math.sin( this.tracker ) * this.speed) * this.vol;
        this.y += (Math.cos( this.tracker ) * this.speed) * this.vol;

    }

    this.readyW = 0;  //start point
    this.readyW1 = 0;

    this.ready = function()
    {
        this.readyW = Math.abs(this.connectAll[0].x - this.x);
        this.readyW1 = Math.abs(this.connectAll[1].x - this.connectAll[2].x);
    }


    this.connectAll = [];

    this.connect = function()
    {
        if(this.connectAll.length > 0)
        {
            $.beginPath();
            $.strokeStyle = this.color;
            $.moveTo(this.x, this.y);

            for(var j = 0; j < this.connectAll.length; ++j)
                $.lineTo(this.connectAll[j].x, this.connectAll[j].y);

            $.lineTo(this.x, this.y);
            $.lineTo(this.connectAll[1].x, this.connectAll[1].y);
            $.stroke();
        }
    }

    this.calcW = 0;
    this.calcW1 = 0;

    this.fill = function()
    {
        if(this.connectAll.length > 0)
        {
            this.calcW = Math.abs(this.connectAll[0].x - this.x);
            this.calcW1 = Math.abs(this.connectAll[1].x - this.connectAll[2].x);

            $.beginPath();
            $.fillStyle = col0 + (Math.floor((this.readyW / this.calcW) * this.colRng)).toString() + ")";

            $.moveTo(this.x, this.y);
            $.lineTo(this.connectAll[2].x, this.connectAll[2].y);
            $.lineTo(this.connectAll[1].x, this.connectAll[1].y);
            $.lineTo(this.x, this.y);

            $.fill();


            $.beginPath();
            $.fillStyle = col1 + (Math.floor((this.readyW1 / this.calcW1) * this.colRng)).toString() + ")";

            $.moveTo(this.x, this.y);
            $.lineTo(this.connectAll[1].x, this.connectAll[1].y);
            $.lineTo(this.connectAll[0].x, this.connectAll[0].y);
            $.lineTo(this.x, this.y);

            $.fill();
        }
    }

}