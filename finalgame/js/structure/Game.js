export class Game {
    constructor(){
        this.world = new Game.World("#dd7272")
    }

    static World = class {
        constructor(bgColor) {
            this.bgColor = bgColor
            this.player = new Game.Player(100, 100, 100, 100, 0, 0, "#000000")
            console.log(this.player)
        }
    }

    static Player = class {
        constructor(x, y, w, h, vx, vy, color) {
            this.x = x
            this.y = y
            this.w = w
            this.h = h
            this.vx = vx
            this.vy = vy
            this.color = color
        }

        update(){
            this.x += this.vx
            this.y += this.vy

            if(this.x < 0){
                this.x = 0
            }else if(this.x + this.w > 1280){
                this.x = 1280 - this.w
            }

            if(this.y < 0){
                this.y = 0
            }else if(this.y + this.h > 720){
                this.y = 720 - this.h
            }
        }
    }

    update(){
        this.world.player.update()
    }
}