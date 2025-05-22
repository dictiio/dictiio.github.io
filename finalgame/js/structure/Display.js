export class Display {
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")

        this.canvas.width = 1280
        this.canvas.height = 720
    }

    render(){
        
        
    }

    renderPlayer(player){
        this.ctx.fillStyle = player.color
        this.ctx.fillRect(player.x, player.y, player.w, player.h)
    }

    renderColor(color){
        this.ctx.fillStyle = color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    renderPlatforms(platforms){
        platforms.forEach(platform => {
            if(platform.y < 0 || platform.y > 720) return;

            this.ctx.fillStyle = platform.color
            this.ctx.fillRect(platform.x, platform.y, platform.w, platform.h)


        });
    }
}