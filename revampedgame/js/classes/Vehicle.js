import { laneHeight, gameWidth, gameHeight } from "../settings.js"
import { images } from "../main.js"
import { soundManager } from "../main.js";


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
        this.image = null;

        if(this.lane.laneType == "road"){
            this.image = images.vehicles.car[Math.random() > 0.5 ? "one" : "two"]
        }
    }

    draw(){
        // update velocity
        if(this.lane.laneType == "road" && this.lane.game.powerups.traffic){
            this.x += this.vx/2;
        } else {
            this.x += this.vx;
        }

        

        // check if vehicle is out of bounds
        // if so, reset vehicle position

        // vehicle goes left
        if(this.x+this.width < 0-gameWidth && this.vx < 0){
            this.x = gameWidth
        }

        // vehicle goes right
        if(this.x > gameWidth*2 && this.vx > 0){
            this.x = -this.width
        }

        // draw vehicle
        if(this.lane.laneType == "water"){
            let tiles = Math.floor(this.width/48)
            for(let i = 0; i < tiles; i++){
                let image;
                if(i == 0){
                    image = images.vehicles.log.left
                } else if (i == tiles-1){
                    image = images.vehicles.log.right
                } else {
                    image = images.vehicles.log.middle
                }
                this.lane.ctx.drawImage(image, this.x + (i*48), this.lane.y, 48, 48)
            }

        } else if (this.lane.laneType == "road"){
            this.lane.ctx.save();

    if (this.vx < 0) {
        // Flip horizontally
        this.lane.ctx.scale(-1, 1);

        // Adjust the position for flipped drawing
        this.lane.ctx.drawImage(this.image, -this.x - 96, this.lane.y, 96, 48);
    } else {
        this.lane.ctx.drawImage(this.image, this.x, this.lane.y, 96, 48);
    }

    this.lane.ctx.restore();
            
        } else {
            this.lane.ctx.fillStyle = "blue"
            this.lane.ctx.fillRect(this.x, this.lane.y, this.width, this.height)
        }
        


    }

    checkCollision(player){
        if(this.lane.laneType == "water"){
            let middleX = player.position.x + player.width/2
            let middleY = player.position.y + player.height/2
            if(middleX > this.x && middleX < this.x + this.width &&
                middleY > this.lane.y && middleY < this.lane.y + this.height){
                player.vx = this.vx
                player.safeTile = true;
                return true
            }
        } else {
            if(player.position.x < this.x + this.width &&
                player.position.x + player.width > this.x &&
                player.position.y < this.lane.y + this.height &&
                player.position.y + player.height > this.lane.y
            ){
                if(this.lane.game.powerups.shield){
                    return false
                }
                player.game.endGame()
                soundManager.play("hit")
                return true
            }
        }
        
        return false
    }
}

export {Vehicle}