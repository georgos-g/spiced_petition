const canvas = document.querySelector("#signature-canvas");
const ctx = canvas.getContext("2d");

let mouseDown = false;
let currentX = 0;
let currentY = 0;


//draw line with mouse on canvas field

function drawTo(newX, newY){
    if (mouseDown) {

    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(newX, newY);
    ctx.closePath();
    ctx.stroke();
    }

    currentX = newX;
    currentY = newY;
    
}

$("#signature-canvas").on('mousemove', (e) => {

    const canvasPosition = $("#signature-canvas").position();

    const newMouseX =  e.clientX - canvasPosition.left;
    const newMouseY = e.clientY - canvasPosition.top + $(document).scrollTop();


    drawTo(newMouseX, newMouseY);
});


//listener für mousedown
$("#signature-canvas").on('mousedown', (e) => {
    mouseDown = true;
    
    });
    
//listener für mouseup
$("#signature-canvas").on('mouseup', (e) => {
mouseDown = false;

});

//  code from canvas to hidden field
$("#signature-canvas").on('mouseleave', e => {
    console.log("Copying code from canvas to hidden field");

    $("#signature-code").val(canvas.toDataURL());

});