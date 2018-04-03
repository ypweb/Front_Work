const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const modesSwitcher = document.querySelector('#blendModes');
const clearButton = document.querySelector('#clear');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.strokeStyle = 'orange';
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let hue = 0;
let lineWidth = 1;
ctx.globalCompositeOperation = 'difference';

function draw(e) {
    if (!isDrawing) {
        return;
    }

    ctx.strokeStyle = getColor();
    ctx.lineWidth = getlineWidth();

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function getColor() {
    hue++;
    if ( hue == 360 ) {
        hue = 0;
    }
    return 'hsl(' + hue +', 100%, 50%)';
}

function getlineWidth() {
    lineWidth++;
    if (lineWidth > 100) {
        lineWidth = 1;
    }
    return lineWidth;
}

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
[lastX, lastY] = [e.offsetX, e.offsetY];
});
canvas.addEventListener('mouseup', () => isDrawing = false );
canvas.addEventListener('mouseout', () => isDrawing = false );

function changeMode() {
    ctx.globalCompositeOperation = this.value;
}

modesSwitcher.addEventListener('change', changeMode);

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

clearButton.addEventListener('click', clear);