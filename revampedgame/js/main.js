// inclure un moyen de revoir le jeu (lien, vidéo...)
// texte descriptif des modifications et du jeu (3 lignes environ)
import { gameWidth, gameHeight } from "./settings.js"
import { Player } from "./classes/Player.js"
import { Lane } from "./classes/Lane.js"
import { Vehicle } from "./classes/Vehicle.js"
import { SceneManager } from "./sceneManager.js"

const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

canvas.width = gameWidth
canvas.height = gameHeight

const fps = 60
const msPerFrame = 1000/fps
let msPrev = window.performance.now()

export const sceneManager = new SceneManager();

export const keysDown = []

export const images = {
    vehicles: {
        log: {
            left: new Image(),
            middle: new Image(),
            right: new Image()
        },
        car: {
            one: new Image(),
            two: new Image(),
        }
    },
    player: new Image()
}

images.vehicles.log.left.src = "assets/images/vehicles/log/left_log.png"
images.vehicles.log.middle.src = "assets/images/vehicles/log/middle_log.png"
images.vehicles.log.right.src = "assets/images/vehicles/log/right_log.png"

images.vehicles.car.one.src = "assets/images/vehicles/car/car1.png"
images.vehicles.car.two.src = "assets/images/vehicles/car/car2.png"

images.player.src = "assets/images/player/chicken.png"

const game = {
    player: null,
    lanes: [],
    currentLane: 0,
    frames: 0,
    active: false,
    init: function(){
        sceneManager.display("active")
        this.player = new Player({ctx: ctx, skin: images.player})
        

        this.lanes.push(new Lane({laneType: "grass", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "grass", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "grass", ctx: ctx}))
        this.generateLanes(10000)

        this.lanes.forEach((lane, index) => {
            lane.y = gameHeight-48*(index+1)
        })

        this.loop()

    },
    generateLanes: function(n) {
        const minClusterSize = 2;     // Minimum consecutive lanes of the same type
        const maxClusterSize = 4;     // Maximum consecutive lanes of the same type
        const laneTypes = ["grass", "road", "water"];
        
        let currentType = null;
        let clusterSize = 0;
        let lastType = null;
    
        for (let i = 0; i < n; i++) {
            // Start a new cluster if the current one is finished or too long
            if (clusterSize === 0 || clusterSize > maxClusterSize) {
                let newType;
    
                // Ensure variety by avoiding too many consecutive lanes of the same type
                do {
                    newType = laneTypes[Math.floor(Math.random() * laneTypes.length)];
                } while (newType === lastType);  // Prevent repeating clusters directly
    
                currentType = newType;
    
                // Randomize cluster size within min and max bounds
                clusterSize = Math.floor(Math.random() * (maxClusterSize - minClusterSize + 1)) + minClusterSize;
    
                lastType = currentType;  // Store the last type to avoid direct repeats
            }
    
            // Add the current lane
            this.lanes.push(new Lane({ laneType: currentType, ctx: ctx }));
    
            clusterSize--;  // Decrease the remaining lanes in the cluster
        }
    },
    draw: function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if(this.lanes[this.player.currentLane].y <= canvas.height - 96){
            this.player.position.y += 1
            this.lanes.forEach((lane, index) => {
                lane.y += 1
            })
        }

        this.lanes.forEach((lane, index) => {
            if(index >= this.currentLane-20 && index <= this.currentLane+40){
                lane.draw()
            }        
        })

        this.player.draw()

        
    },
    loop: function(){
        this.active = true;
        this.player.vx = 0;
        this.player.safeTile = false;
        // check collisions
        if(this.lanes[this.player.currentLane].vehicles != null) {
            this.lanes[this.player.currentLane].vehicles.forEach(vehicle => {
                if(vehicle.checkCollision(this.player)){
                    console.log("collision")
                }
            })
        }

        if(!this.player.safeTile){
            let lane = this.lanes[this.player.currentLane]
            if(lane.laneType == "water"){
                console.log("game lost")
            }
        }

        if(this.player.currentLane - this.currentLane > 10){
            this.currentLane = this.player.currentLane
        }

        // display lane
        this.draw()

        requestAnimationFrame(() => {
            if(this.active){
                this.loop()
            }
            
        })

        const msNow = window.performance.now()
        const msPassed = msNow - msPrev

        if (msPassed < msPerFrame) return

        const excessTime = msPassed % msPerFrame
        msPrev = msNow - excessTime

        game.frames++
    },

    endGame: function(){
        this.active = false;
        sceneManager.display("ended")
    },

    pause: function(){
        this.active = false;
        sceneManager.display("pause")
    }
}

setInterval(() => {
    console.log(game.frames)
  }, 1000)

document.addEventListener("keydown", (e) => {
    keysDown[e.keyCode] = true;
    console.log(e.keyCode)
    if(e.keyCode == 27){
        if(game.active){
            game.pause()
        } else {
            sceneManager.display("active")
            game.loop()
        }
        
    }
})

document.addEventListener("keyup", (e) => {
    delete keysDown[e.keyCode];
})


game.init()
