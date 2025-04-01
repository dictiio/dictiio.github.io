export class Display {
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")

        this.canvas.width = 1280
        this.canvas.height = 720
    }

    render(){
        
        
    }

    renderColor(color){
        this.ctx.fillStyle = color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
}