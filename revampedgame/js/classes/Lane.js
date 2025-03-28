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
        let amount = Math.ceil(Math.random()*8)
        let randomSpeed = Math.random()*2+1
        if(Math.random() > 0.5){
            randomSpeed *= -1
        }
        let lastX = Math.random()*gameWidth
        let width;
        if(this.laneType == "road"){
            for(let i = 0; i < amount; i++){
                width = 96;
                this.vehicles.push(new Vehicle({lane: this, x: lastX, width: width, height: 48, vx: randomSpeed}))
                lastX += Math.random()*200+width
            }
        }

        if(this.laneType == "water"){
            for(let i = 0; i < amount; i++){
                width = Math.floor(96 + Math.ceil(Math.random()*3)*48)
                this.vehicles.push(new Vehicle({lane: this, x: lastX, width: width, height: 48, vx: randomSpeed}))
                lastX += Math.random()*200+width
            }
        }
    }

    draw(){

        if(this.laneType == "grass"){
            this.ctx.fillStyle = "#758e18"
        }
        if(this.laneType == "road"){
            this.ctx.fillStyle = "#515865"
        }
        if(this.laneType == "water"){
            this.ctx.fillStyle = "#81f4ff"
        }

        this.ctx.fillRect(0, this.y, gameWidth, this.height)
        
        // draw vehicles
        this.vehicles.forEach(vehicle => {
            vehicle.draw()
        })
    }


}

export {Lane}