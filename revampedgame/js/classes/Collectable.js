import { laneHeight, gameWidth, gameHeight } from "../settings.js"
import { images } from "../main.js"


class Collectable {
    constructor({
        lane,
        x,
        width,
        height,
        type,
    }){
        this.lane = lane;
        this.x = x;
        this.width = width;
        this.height = height;
        this.image = null;
        this.type = type;
        this.collected = false

        if(this.type == "coin"){
            this.image = images.collectables.coin
        }

        if(this.type == "powerup"){
            this.image = images.collectables.powerup
        }
    }

    draw(){
        if(this.collected) return false
        if(this.image != null){
            this.lane.ctx.drawImage(this.image, this.x, this.lane.y, 48, 48);
        } else {
            this.lane.ctx.fillStyle = "blue"
            this.lane.ctx.fillRect(this.x, this.lane.y, 48, 48)
        }
        
    }

    checkCollision(player){
        if(this.collected) return false
        if(player.position.x < this.x + this.width &&
            player.position.x + player.width > this.x &&
            player.position.y < this.lane.y + this.height &&
            player.position.y + player.height > this.lane.y
        ){
            if(this.type == "coin"){
                player.game.addCoin(1)
            } else if (this.type == "powerup"){
                player.game.activateRandomPowerUp()
            }
            
            this.collected = true
            return true
        }

        
        return false
    }
}

export {Collectable}