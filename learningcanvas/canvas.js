var canvas = document.querySelector("canvas")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

var c = canvas.getContext("2d")

// c.fillStyle = "rgba(255, 0, 0, .5)"
// c.fillRect(100, 100, 100, 100)
// c.fillStyle = "rgba(0, 255, 0, .5)"
// c.fillRect(400, 100, 100, 100)
// c.fillStyle = "rgba(0, 0, 255, .5)"
// c.fillRect(150, 300, 100, 100)

// // Line

// c.beginPath()
// c.moveTo(50, 300)
// c.lineTo(300, 50)
// c.lineTo(400, 300)
// c.lineTo(50, 300)
// c.strokeStyle = "#fa34a3"
// c.stroke()

// // Arc / Circle

// c.strokeStyle = "chartreuse"
// for(let i = 0; i < 500; i++){
//     var x = Math.random() * window.innerWidth
//     var y = Math.random() * window.innerHeight
//     var red = Math.random() * 255
//     var green = Math.random() * 255
//     var blue = Math.random() * 255
//     c.strokeStyle = `rgb(${red}, ${green}, ${blue})`
//     c.beginPath()
//     c.arc(x, y, 35, 0, Math.PI * 2, false)
//     c.stroke()
// }

// c.beginPath()
// c.arc(200, 200, 30, 0, Math.PI * 2, false)
// c.strokeStyle = "blue"
// c.stroke()

var mouse = {
    x: undefined,
    y: undefined
}

var maxRadius = 40
//var minRadius = 2

var colorArray = [
    '#BABDBF',
    '#050B0D',
    '#5A6E73',
    '#112426',
    '#F2F2F2',
]

window.addEventListener("mousemove", 
    function(event){
        mouse.x = event.x
        mouse.y = event.y
    }
)

window.addEventListener("resize", 
    function(){
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        init()
})

window.addEventListener("keydown", 
    function(event){
        console.log(event)
        if(event.code == "a"){
            init()
        }
    })

function Circle(x, y, dx, dy, radius){
     this.x = x
     this.y = y
     this.dx = dx
     this.dy = dy
     this.radius = radius
     this.minRadius = radius
     this.color = colorArray[Math.floor(Math.random() * colorArray.length)]

     this.draw = function(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
     }

     this.update = function(){
        if(this.x + this.radius > innerWidth || this.x - this.radius < 0){
            this.dx = -this.dx
        }
    
        if(this.y + this.radius > innerHeight || this.y - radius < 0){
            this.dy = -this.dy
        }
    
        this.x += this.dx
        this.y += this.dy

        // interactivity
        if(Math.abs(mouse.x - this.x) < 75
            && Math.abs(mouse.y - this.y) < 75) {
                if(this.radius < maxRadius){
                    this.radius += getRadiusIncrement(radius)
                }
        } else if (this.radius > this.minRadius) {
            this.radius -= getRadiusIncrement(radius)
        }
        if(this.radius < this.minRadius) this.radius = this.minRadius

        this.draw()
     }
}


function getRadiusIncrement(radius){
    return Math.pow(Math.E, -0.115*radius)
}

var circleArray = []

function init(){
    circleArray = []
    for(let i = 0; i < 800; i++){
        var radius = Math.random() * 3 + 1
        var x = Math.random() * (innerWidth - radius * 2) + radius
        var y = Math.random() * (innerHeight - radius * 2) + radius
        var dx = (Math.random() - 0.5) * 2
        var dy = (Math.random() - 0.5) * 2
        
        
        circleArray.push(new Circle(x, y, dx, dy, radius))
    }
}


function animate(){
    requestAnimationFrame(animate)
    c.clearRect(0,0,innerWidth,innerHeight)
    circleArray.forEach(circle => {
        circle.update()
    });


}

init()
animate()