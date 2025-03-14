import { laneHeight, gameWidth, gameHeight } from "../settings.js"


class Vehicle {
    constructor({
        lane,
        x,
        width,
        height,
        vx = -1
    }){
        this.lane = lane;
        this.x = x;
        this.vx = vx;
        this.width = width;
        this.height = height;
    }

    draw(){
        // update velocity
        this.x += this.vx;

        // check if vehicle is out of bounds
        // if so, reset vehicle position

        // vehicle goes left
        if(this.x+this.width < 0 && this.vx < 0){
            this.x = gameWidth
        }

        // vehicle goes right
        if(this.x > gameWidth && this.vx > 0){
            this.x = -this.width
        }

        // draw vehicle
        this.lane.ctx.fillStyle = "blue"
        this.lane.ctx.fillRect(this.x, this.lane.y, this.width, this.height)


    }

    checkCollision(player){
        if(player.position.x < this.x + this.width &&
            player.position.x + player.width > this.x &&
            player.position.y < this.lane.y + this.height &&
            player.position.y + player.height > this.lane.y
        ){
            return true
        }
        return false
    }
}

export {Vehicle}