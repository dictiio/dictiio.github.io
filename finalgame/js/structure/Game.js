export class Game {
    constructor(){
        this.world = new Game.World("#dd7272")
    }

    static World = class {
        constructor(bgColor) {
            this.bgColor = bgColor
        }
    }

    update(){

    }
}