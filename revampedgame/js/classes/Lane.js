import { laneHeight, gameWidth, gameHeight } from "../settings.js"
import { Vehicle } from "./Vehicle.js"
import { Collectable } from "./Collectable.js"

class Lane {
    constructor({
        height = laneHeight,
        y = gameHeight-48,
        laneType,
        vehicles = [],
        collectables = [],
        ctx,
        game,
    }){
        this.height = height;
        this.laneType = laneType;
        this.y = y;
        this.vehicles = vehicles;
        this.collectables = collectables;
        this.ctx = ctx;
        this.game = game;
        this.id = game.lanes.length;

        this.spawnVehicles()
        this.spawnCoins()
        this.spawnPowerups()
        
    }

    spawnVehicles(){
        let amount = Math.ceil(Math.random()*8)+1
        let randomSpeed;
        if(document.getElementById("difficulty").checked){
           randomSpeed = (Math.random()*1+1)*(1+this.id/50)
        } else {
            randomSpeed = (Math.random()*1+1)
        }
        
        if(Math.random() > 0.5){
            randomSpeed *= -1
        }
        let lastX = Math.random()*gameWidth
        let width;
        if(this.laneType == "road"){
            for(let i = 0; i < amount; i++){
                width = 96;
                this.vehicles.push(new Vehicle({lane: this, x: lastX, width: width, height: 48, vx: randomSpeed}))
                lastX += (Math.random()*400+400)/amount+width
            }
        }

        if(this.laneType == "water"){
            for(let i = 0; i < amount; i++){
                width = Math.floor(96 + Math.ceil(Math.random()*3)*48)
                this.vehicles.push(new Vehicle({lane: this, x: lastX, width: width, height: 48, vx: randomSpeed}))
                lastX += (Math.random()*400+400)/amount+width
            }
        }
    }

    spawnCoins(){
        if(Math.random() < 0.2){
            let x = 48*Math.ceil((Math.random()*gameWidth/48))
            let width = 48
            this.collectables.push(new Collectable({lane: this, x: x, width: width, height: 48, type: "coin"}))
        }
    }

    spawnPowerups(){
        if(Math.random() < 0.05){
            let x = 48*Math.ceil((Math.random()*gameWidth/48))
            let width = 48
            this.collectables.push(new Collectable({lane: this, x: x, width: width, height: 48, type: "powerup"}))
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

        // draw collectables
        this.collectables.forEach(collectable => {
            collectable.draw()
        })
    }


}

export {Lane}