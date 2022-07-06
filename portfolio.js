let health = 100;

window.onload = function() {
    var canvas = document.getElementById('canvas-one');
    var context = canvas.getContext("2d");

    context.beginPath();
    context.rect(0, 0, 200, 150);
    context.lineWidth = 10;
    context.strokeStyle = "green";
    context.fillStyle = "lime";
    context.fill();
    context.stroke();

    context.beginPath();
    context.fillStyle = "white";
    context.font = "24px Tahoma";
    context.fillText("HELLO WORLD", 75, 125);

};

function hit() {
    var canvas = document.getElementById('canvas-one');
    var context = canvas.getContext("2d");
    health = health/2
    if(health <= 1) {
        alert("Game Over!");
    }
    else {
        context.fillText(health, 75, 125);
    }
};

