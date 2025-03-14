import { playerWidth, playerHeight, gameHeight } from "../settings.js"
import { keysDown } from "../main.js"

class Player {
    constructor({
        position = {x: 624, y: gameHeight-96},
        skin = "chicken",
        width = playerWidth,
        height = playerHeight,
        ctx,
    }){
        this.position = position;
        this.skin = skin;
        this.width = width;
        this.height = height;
        this.currentLane = 1;
        this.ctx = ctx;

        this.cooldown = 0;
    }

    draw(){
        // 38 up, 37 left, 40 down, 39 right
        if(Date.now() - this.cooldown > 150){
            console.log("a")
            if(38 in keysDown){
                this.position.y -= playerHeight
                this.currentLane += 1
                this.cooldown = Date.now()
            }
            if(40 in keysDown){
                this.position.y += playerHeight
                this.currentLane -= 1
                this.cooldown = Date.now()
            }
            if(37 in keysDown){
                this.position.x -= playerWidth
                this.cooldown = Date.now()
            }
            if(39 in keysDown){
                this.position.x += playerWidth
                this.cooldown = Date.now()
            }
            
        }
        
        this.ctx.fillStyle = "red" // temporary
        this.ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

export { Player }