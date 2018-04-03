// general vars
var c = document.getElementById( 'c' ),
    ctx = c.getContext( '2d' ),
    w = c.width = 800,
    h = c.height = 500;

// random range helper
function rand( min, max ) {
    return Math.random() * ( max - min ) + min;
}

// left side base color
ctx.fillStyle = 'hsl(220, 100%, 95%)';
ctx.fillRect( 0, 0, w / 2, h );

// right side base color
ctx.fillStyle = 'hsl(220, 60%, 50%)';
ctx.fillRect( w / 2, 0, w / 2, h );

// four stripes
ctx.fillStyle = 'hsla(0, 0%, 0%, 0.1)';
ctx.fillRect( 0, 0, w / 6, h );
ctx.fillRect( ( w / 6 ) * 2, 0, w / 6, h );
ctx.fillRect( ( w / 6 ) * 3, 0, w / 6, h );
ctx.fillRect( ( w / 6 ) * 5, 0, w / 6, h );

// noise
// cache and draw as image for better performance
// very expensive to do this each frame
for( var x = 0; x < w; x++ ) {
    for( var y = 0; y < h; y++ ) {
        ctx.fillStyle = 'hsla(0, 0%, '+ rand( 0, 100 ) + '%, 0.02)';
        ctx.fillRect( x, y, 1, 1 );
    }
}

// scan lines
// cache and draw as image for better performance
// very expensive to do this each frame
for( var y = 0; y < h; y += 1 ) {
    if( y % 2 === 0 ) {
        ctx.fillStyle = 'hsla(0, 0%, 0%, 0.1)';
    } else {
        ctx.fillStyle = 'hsla(0, 0%, 100%, 0.05)';
    }
    ctx.fillRect( 0, y, w, 1 );
}

// overlay vignette gradient
// only create gradient once at start of program
// then use as fill style from then on
var grad1 = ctx.createRadialGradient(
    w / 2,
    h / 2,
    0,
    w / 2,
    h / 2,
    h
);
grad1.addColorStop( 0, 'hsl(0, 0%, 100%)' );
grad1.addColorStop( 1, 'hsl(0, 0%, 0%)' );
ctx.globalCompositeOperation = 'overlay';
ctx.fillStyle = grad1;
ctx.fillRect( 0, 0, w, h );

// color splash gradient
// only create gradient once at start of program
// then use as fill style from then on
var grad2 = ctx.createRadialGradient(
    w,
    h / 2,
    0,
    w,
    h / 2,
    w * 0.8
);
grad2.addColorStop( 0, 'hsla(340, 80%, 50%, 1)' );
grad2.addColorStop( 1, 'hsla(340, 0%, 0%, 0)' );
ctx.globalCompositeOperation = 'color';
ctx.fillStyle = grad2;
ctx.fillRect( 0, 0, w, h );