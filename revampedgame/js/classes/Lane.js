import { laneHeight, gameWidth, gameHeight } from "../settings.js"
import { Vehicle } from "./Vehicle.js"

class Lane {
    constructor({
        height = laneHeight,
        y = gameHeight-48,
        laneType,
        vehicles = [],
        ctx,
    }){
        this.height = height;
        this.laneType = laneType;
        this.y = y;
        this.vehicles = vehicles;
        this.ctx = ctx;

        this.spawnVehicles()
        
    }

    spawnVehicles(){
        if(this.laneType == "road"){
            this.vehicles.push(new Vehicle({lane: this, x: gameWidth+Math.random()*100, width: 48, height: 48, vx: Math.random()*-10+5}))
        }
    }

    draw(){

        if(this.laneType == "grass"){
            this.ctx.fillStyle = "green"
        }
        if(this.laneType == "road"){
            this.ctx.fillStyle = "gray"
        }
        if(this.laneType == "water"){
            this.ctx.fillStyle = "cyan"
        }

        this.ctx.fillRect(0, this.y, gameWidth, this.height)
        
        // draw vehicles
        this.vehicles.forEach(vehicle => {
            vehicle.draw()
        })
    }


}

export {Lane}