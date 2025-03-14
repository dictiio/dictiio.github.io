// inclure un moyen de revoir le jeu (lien, vidéo...)
// texte descriptif des modifications et du jeu (3 lignes environ)
import { gameWidth, gameHeight } from "./settings.js"
import { Player } from "./classes/Player.js"
import { Lane } from "./classes/Lane.js"
import { Vehicle } from "./classes/Vehicle.js"

const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

canvas.width = gameWidth
canvas.height = gameHeight

export const keysDown = []

const game = {
    player: null,
    lanes: [],
    init: function(){
        this.player = new Player({ctx: ctx})
        

        this.lanes.push(new Lane({laneType: "grass", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "grass", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "grass", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "road", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "road", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "grass", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "grass", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "water", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "water", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "grass", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "grass", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "grass", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "road", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "road", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "road", ctx: ctx}))
        this.lanes.push(new Lane({laneType: "road", ctx: ctx}))

        this.loop()

    },
    draw: function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        this.lanes.forEach((lane, index) => {
            lane.y = gameHeight-48*(index+1)
            lane.draw()
        })
        this.player.draw()

        
    },
    loop: function(){
        this.draw()

        // check collisions
        if(this.lanes[this.player.currentLane].vehicles != null) {
            this.lanes[this.player.currentLane].vehicles.forEach(vehicle => {
                if(vehicle.checkCollision(this.player)){
                    console.log("collision")
                }
            })
        }
        

        requestAnimationFrame(() => {
            this.loop()
        })
    }
}

document.addEventListener("keydown", (e) => {
    console.log(e.keyCode)
    keysDown[e.keyCode] = true;
})

document.addEventListener("keyup", (e) => {
    delete keysDown[e.keyCode];
})



game.init()
