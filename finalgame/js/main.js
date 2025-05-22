import { Controller } from "./structure/Controller.js";
import { Game } from "./structure/Game.js";
import { Display } from "./structure/Display.js";
import { Engine } from "./structure/Engine.js";

const controller = new Controller()
const game = new Game()
const display = new Display(document.getElementById("game"))

const render = () => {
    display.renderColor(game.world.bgColor)
    display.renderPlayer(game.world.player)
    display.renderPlatforms(game.world.platforms)
    display.render()
}

const update = () => {

    if(controller.keys.left.isPressed) game.world.player.moveLeft()
    if(controller.keys.right.isPressed) game.world.player.moveRight()
    if(controller.keys.space.isPressed) game.world.player.jump()

    game.update()
}

const engine = new Engine(1000/75, update, render)
engine.start()

controller.handleKeyDownUp()